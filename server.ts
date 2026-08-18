import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-level default client (lazy initialized)
let serverAiClient: GoogleGenAI | null = null;
function getServerGeminiClient(): GoogleGenAI | null {
  if (!serverAiClient && process.env.GEMINI_API_KEY) {
    serverAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return serverAiClient;
}

// Request-scoped client resolver (supports User API Key with fallback to server key)
function getClientForRequest(req: express.Request): { client: GoogleGenAI | null; isUserKey: boolean } {
  let userKey: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    userKey = authHeader.substring(7).trim();
  } else if (req.body && typeof req.body.apiKey === "string" && req.body.apiKey.trim()) {
    userKey = req.body.apiKey.trim();
  }

  if (userKey) {
    const client = new GoogleGenAI({
      apiKey: userKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return { client, isUserKey: true };
  }

  return { client: getServerGeminiClient(), isUserKey: false };
}

// 1. Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. API Key Verification Endpoint (Server-to-Server validation, In-Memory only)
app.post("/api/verify-key", async (req, res) => {
  try {
    let keyToTest: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      keyToTest = authHeader.substring(7).trim();
    } else if (req.body && typeof req.body.apiKey === "string") {
      keyToTest = req.body.apiKey.trim();
    }

    if (!keyToTest) {
      return res.status(400).json({
        valid: false,
        error: "API Key가 전달되지 않았습니다. 올바른 키를 입력해 주세요.",
      });
    }

    // Ephemeral client for validation test only
    const testClient = new GoogleGenAI({
      apiKey: keyToTest,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Lightweight verification call
    await testClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "ping",
    });

    return res.json({
      valid: true,
      model: "gemini-2.5-flash",
      message: "Gemini API Key가 성공적으로 검증 및 승인되었습니다.",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    // Note: Do NOT log the raw API key for privacy/security
    const errorMsg = error?.message || "";
    const status = error?.status || 400;

    let userFriendlyMessage = "API Key 승인에 실패했습니다. 키를 다시 확인해 주세요.";

    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("API key not valid") || status === 400 || status === 403) {
      userFriendlyMessage = "제공해주신 Gemini API Key가 유효하지 않거나 비활성화되었습니다. Google AI Studio에서 키 상태를 확인해 주세요.";
    } else if (errorMsg.includes("RESOURCE_EXHAUSTED") || errorMsg.includes("429") || status === 429) {
      userFriendlyMessage = "Gemini API 호출 한도(Quota)를 초과하였습니다. 잠시 후 다시 시도하거나 계정 한도를 확인해 주세요.";
    } else if (errorMsg.includes("PERMISSION_DENIED")) {
      userFriendlyMessage = "API 키의 접근 권한이 없거나 지정된 모델에 접근할 수 없습니다.";
    } else if (errorMsg.includes("ETIMEDOUT") || errorMsg.includes("network") || errorMsg.includes("fetch failed")) {
      userFriendlyMessage = "Google API 서버와 통신 중 네트워크 시간 초과가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return res.status(400).json({
      valid: false,
      error: userFriendlyMessage,
    });
  }
});

// 3. AI natural language parsing / data structuring endpoint
app.post("/api/gemini/parse-input", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText parameter is required." });
    }

    const { client } = getClientForRequest(req);
    if (!client) {
      return res.status(503).json({
        error: "활성화된 Gemini API Key가 없습니다. 랜딩 페이지에서 API Key를 입력하거나 서버 환경변수를 설정해 주세요.",
      });
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
      "period": "string (선택)",
      "dueDate": "YYYY-MM-DD or string (선택)",
      "line": "string (선택)",
      "customer": "string (선택)"
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

규칙:
1. 텍스트에 없는 공급업체나 리드타임 등은 날조하지 말고 빈값/기본값으로 두십시오.
2. 수량 단위(EA, g, kg 등)를 통일성 있게 감지하십시오.
3. 데이터가 전혀 없는 그룹은 missingGroups에 추가하십시오.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `다음 사용자 입력 텍스트를 구조화하여 JSON으로 파싱하십시오:\n\n${rawText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to parse data." });
  }
});

// 4. AI Supply Chain Strategic Advisory Endpoint
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    const { mrpSummary, criticalMaterials, allocations, userQuestion } = req.body;
    const { client } = getClientForRequest(req);
    if (!client) {
      return res.status(503).json({
        error: "활성화된 Gemini API Key가 없습니다. 랜딩 페이지에서 API Key를 입력하거나 서버 환경변수를 설정해 주세요.",
      });
    }

    const systemInstruction = `당신은 반도체 파운드리/패키징/IDM 공급망 최적화 수석 자문관입니다.
제공된 MRP 계산 결과 및 제약조건을 토대로, 반도체 생산라인 관리자와 조달팀이 즉시 실행할 수 있는 전략적 대응 권고사항을 간결하고 전문적인 한국어로 작성하십시오.
절대 근거 없는 가상의 가격/공급사명을 만들어내지 말고, 계산된 부족 수량과 우선순위, 납기일 제약에 기반하여 작성하십시오.`;

    const payloadContext = {
      summary: mrpSummary,
      criticalShortages: criticalMaterials,
      productionAllocations: allocations,
    };

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `MRP 분석 데이터:\n${JSON.stringify(payloadContext, null, 2)}\n\n사용자 질의/요청:\n${userQuestion || "전체 반도체 공급망 리스크에 대한 종합 최적화 및 조달 대응 방안을 제시해주세요."}`,
      config: {
        systemInstruction,
      },
    });

    res.json({ advice: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate advice." });
  }
});

// Vite Middleware and Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Semiconductor MRP Server running on http://localhost:${PORT}`);
  });
}

startServer();
