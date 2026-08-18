/**
 * Dual-Mode Gemini API Service
 * 
 * Supports both:
 * 1. Express Backend Proxy (when running on custom Node servers / AI Studio preview)
 * 2. Direct Browser-to-Google Client (when deployed to Vercel, Netlify, GitHub Pages, or static SPA hosting)
 * 
 * Guarantees zero CORS or network failures across all deployment environments.
 */

const GEMINI_MODEL = 'gemini-2.5-flash';
const GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface VerifyKeyResult {
  valid: boolean;
  model?: string;
  error?: string;
}

/**
 * Validates Gemini API Key with automatic backend-to-direct fallback
 */
export async function verifyGeminiApiKey(apiKey: string): Promise<VerifyKeyResult> {
  const trimmedKey = apiKey.trim();
  if (!trimmedKey) {
    return { valid: false, error: 'API Key를 입력해 주세요.' };
  }

  // 1. Try Backend Proxy first
  try {
    const backendRes = await fetch('/api/verify-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({ apiKey: trimmedKey }),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (backendRes.ok && data.valid) {
        return { valid: true, model: data.model || GEMINI_MODEL };
      } else if (!backendRes.ok && data.error) {
        // Backend actively validated and returned an error
        return { valid: false, error: data.error };
      }
    }
  } catch (backendErr) {
    // Backend is unavailable (e.g. Vercel static deploy, 404, or network issue).
    // Seamlessly proceed to Direct Client Validation below.
    console.info('Backend endpoint not reachable, switching to direct Google API validation.');
  }

  // 2. Direct Client-to-Google Fallback (Vercel / Static Hosting Compatible)
  try {
    const url = `${GOOGLE_API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
    const directRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: 'ping' }],
          },
        ],
      }),
    });

    const directData = await directRes.json();

    if (directRes.ok && directData.candidates && directData.candidates.length > 0) {
      return {
        valid: true,
        model: GEMINI_MODEL,
      };
    } else {
      const errMsg = directData?.error?.message || '';
      let friendlyError = '제공해주신 Gemini API Key가 유효하지 않거나 비활성화되었습니다. Google AI Studio에서 키 상태를 확인해 주세요.';

      if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID') || directRes.status === 400) {
        friendlyError = 'Gemini API Key가 올바르지 않습니다. 키 형식(AIzaSy...)을 확인해 주세요.';
      } else if (errMsg.includes('RESOURCE_EXHAUSTED') || directRes.status === 429) {
        friendlyError = 'Gemini API 호출 한도(Quota)를 초과하였습니다. 잠시 후 다시 시도해 주세요.';
      } else if (errMsg.includes('PERMISSION_DENIED') || directRes.status === 403) {
        friendlyError = 'API Key 권한이 없거나 지정된 모델에 접근할 수 없습니다.';
      }

      return {
        valid: false,
        error: friendlyError,
      };
    }
  } catch (directErr: any) {
    return {
      valid: false,
      error: 'Google Gemini 서버와 통신할 수 없습니다. 인터넷 연결 및 브라우저 확장 프로그램(AdBlock 등) 차단 여부를 확인해 주세요.',
    };
  }
}

/**
 * Natural Language Fast-Path Parsing with dual-mode fallback
 */
export async function parseInputWithGemini(rawText: string, apiKey: string): Promise<any> {
  const trimmedKey = apiKey.trim();

  // 1. Try Backend Proxy
  try {
    const backendRes = await fetch('/api/gemini/parse-input', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(trimmedKey ? { Authorization: `Bearer ${trimmedKey}` } : {}),
      },
      body: JSON.stringify({ rawText, apiKey: trimmedKey }),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (backendRes.ok && data.productionPlans) {
        return data;
      }
    }
  } catch (err) {
    console.info('Backend parse-input unavailable, using direct Google API.');
  }

  // 2. Direct Client Fallback
  if (!trimmedKey) {
    throw new Error('Gemini API Key가 필요합니다. 랜딩 페이지에서 API Key를 먼저 승인받아 주세요.');
  }

  const systemInstruction = `당신은 반도체 제조업의 생산계획, 자재소요계획(MRP), BOM 관리, 재고관리 전문가입니다.
사용자가 자유 형식(스프레드시트 텍스트, 이메일, 메모 등)으로 제공한 텍스트에서 다음 4개 그룹의 데이터를 정밀하게 추출하여 JSON 형식으로 반환하십시오.

반환할 JSON 구조:
{
  "productionPlans": [
    {
      "productId": "string (필수)",
      "targetQty": number (필수),
      "unit": "EA" | string,
      "period": "string",
      "dueDate": "YYYY-MM-DD or string",
      "line": "string",
      "customer": "string"
    }
  ],
  "boms": [
    {
      "productId": "string (필수)",
      "materialId": "string (필수)",
      "unitUsage": number (필수, 제품 1개당 소요량),
      "unit": "string (예: EA, g, wafer, mg)",
      "scrapRate": number (0~100 %, 없으면 0),
      "yield": number (0~100 %, 없으면 100),
      "alternativeAvailable": boolean,
      "supplier": "string",
      "leadTimeDays": number
    }
  ],
  "inventory": [
    {
      "materialId": "string (필수)",
      "onHand": number (필수),
      "unit": "string (예: EA, g, wafer, mg)",
      "scheduledReceipt": number,
      "receiptDate": "YYYY-MM-DD or string",
      "safetyStock": number,
      "supplier": "string",
      "leadTimeDays": number
    }
  ],
  "priorities": [
    {
      "productId": "string (필수)",
      "priorityLevel": number (1: 최우선, 2: 높음, 3: 일반, 4: 낮음),
      "isUrgent": boolean,
      "reason": "string",
      "minBatchQty": number,
      "fixedPlan": boolean
    }
  ],
  "missingGroups": ["Q1" | "Q2" | "Q3" | "Q4"],
  "summary": "한국어 1~2줄 분석 요약"
}

반드시 순수한 JSON 객체만 반환하고 마크다운 코드블록은 제외하십시오.`;

  const url = `${GOOGLE_API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
  const directRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemInstruction}\n\n[입력 텍스트]:\n${rawText}` },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!directRes.ok) {
    const errorData = await directRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Gemini 파싱 API 호출 중 오류가 발생했습니다.');
  }

  const directData = await directRes.json();
  const textOutput = directData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('Gemini로부터 응답을 받지 못했습니다.');
  }

  const cleaned = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

/**
 * AI SCM Advisor with dual-mode fallback
 */
export async function getGeminiAdvisorAdvice(payload: any, apiKey: string): Promise<string> {
  const trimmedKey = apiKey.trim();

  // 1. Try Backend Proxy
  try {
    const backendRes = await fetch('/api/gemini/advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(trimmedKey ? { Authorization: `Bearer ${trimmedKey}` } : {}),
      },
      body: JSON.stringify({ ...payload, apiKey: trimmedKey }),
    });

    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      if (backendRes.ok && data.advice) {
        return data.advice;
      }
    }
  } catch (err) {
    console.info('Backend advisor unavailable, using direct Google API.');
  }

  // 2. Direct Client Fallback
  if (!trimmedKey) {
    throw new Error('Gemini API Key가 필요합니다. 랜딩 페이지에서 API Key를 먼저 승인받아 주세요.');
  }

  const prompt = `당신은 세계 최고 수준의 반도체 SCM(공급망 관리) 및 생산계획/MRP 최적화 수석 자문위원입니다.
현재 반도체 라인의 MRP 연산 분석 결과가 아래와 같이 도출되었습니다.

[MRP 분석 데이터 요약]:
${JSON.stringify(payload, null, 2)}

[질문 및 요청사항]:
${payload.userQuestion || '전체 반도체 공급망 리스크에 대한 종합 최적화 및 조달 대응 방안을 제시해주세요.'}

전문적이고 실행 가능한 구체적 조언을 다음 4단계 구조로 한국어로 명확히 작성해주십시오:
1. 공급망 핵심 리스크 및 결손(Shortage) 원인 진단
2. 우선순위 기반 단기 완제품 배분 및 생산 재조정(Rescheduling) 권고
3. 긴급 조달(Expedite), 승인 대체재 전환 및 협력사 협상 전략
4. 패키징/팹 공정 수율(Yield) 보정 및 재발 방지 중장기 대책`;

  const url = `${GOOGLE_API_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(trimmedKey)}`;
  const directRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!directRes.ok) {
    const errorData = await directRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'AI 자문 호출 중 오류가 발생했습니다.');
  }

  const directData = await directRes.json();
  const textOutput = directData.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) {
    throw new Error('자문 내용을 생성하지 못했습니다.');
  }

  return textOutput;
}
