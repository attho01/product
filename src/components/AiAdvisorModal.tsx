import React, { useState } from 'react';
import { MrpCalculationOutput } from '../types';
import { Sparkles, X, Loader2, Bot, Send } from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mrpData: MrpCalculationOutput;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  mrpData,
}) => {
  const { getAuthHeaders, isKeyVerified } = useApiKey();
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGetAdvice = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    setIsLoading(true);
    setAdvice(null);

    try {
      const response = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          mrpSummary: mrpData.summary,
          criticalMaterials: mrpData.materialAnalysis.filter((m) => m.riskLevel === 'Critical' || m.riskLevel === 'High'),
          allocations: mrpData.productionAllocation,
          userQuestion: activeQuery || '전체 반도체 공급망 리스크에 대한 종합 최적화 및 조달 대응 방안을 제시해주세요.',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdvice(data.advice || '분석 결과를 도출하지 못했습니다.');
      } else {
        const errData = await response.json().catch(() => ({}));
        setAdvice(
          errData.error ||
          'AI 분석 자문 생성 중 응답 지연이 발생하였습니다. 시스템 내장 조달 계획(Section 6)을 참고하여 Critical 자재에 대해 즉시 긴급 발주(Expedite) 및 공급사 할당(Allocation) 협상을 추진하십시오.'
        );
      }
    } catch (err) {
      console.error(err);
      setAdvice(
        '서버 연결 상태를 확인해주십시오. Critical 자재에 대해 1순위 제품 우선 배분 및 안전재고 일시 전용 전략을 검토하십시오.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI 반도체 공급망 전략 자문 (SCM Advisor)</h2>
              <p className="text-xs text-slate-500">
                Gemini 2.5 기반 결손 자재 조달, 라인 스케줄링 및 리스크 헤징 전략
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Question Prompts */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button
            onClick={() => {
              setQuery('Critical 결손 자재 조달을 위한 긴급 협상 및 대체재 전략은?');
              handleGetAdvice('Critical 결손 자재 조달을 위한 긴급 협상 및 대체재 전략은?');
            }}
            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-slate-700 transition"
          >
            Critical 자재 긴급 대응
          </button>
          <button
            onClick={() => {
              setQuery('수익성 및 고객 신뢰 유지를 위한 최적 생산 배분 전략은?');
              handleGetAdvice('수익성 및 고객 신뢰 유지를 위한 최적 생산 배분 전략은?');
            }}
            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-slate-700 transition"
          >
            공유 자재 최적 배분
          </button>
          <button
            onClick={() => {
              setQuery('팹 수율(Yield) 및 스크랩 개선 시 예상 생산량 변동은?');
              handleGetAdvice('팹 수율(Yield) 및 스크랩 개선 시 예상 생산량 변동은?');
            }}
            className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 rounded-lg text-slate-700 transition"
          >
            수율 민감도 분석
          </button>
        </div>

        {/* Advice Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[220px] bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-800">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <p>반도체 생산 및 자재 소요량 데이터를 분석하여 전략적 조언을 생성 중입니다...</p>
            </div>
          ) : advice ? (
            <div className="space-y-3 whitespace-pre-line font-sans">
              <div className="flex items-center gap-2 text-blue-600 font-bold">
                <Bot className="w-4 h-4" />
                <span>AI 반도체 SCM 전략 리포트</span>
              </div>
              <div className="text-slate-700 text-xs leading-relaxed">
                {advice}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
              <Bot className="w-8 h-8 text-slate-300" />
              <p>상단의 빠른 질문을 선택하거나 아래에 질문을 입력하여 AI 자문을 받아보세요.</p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGetAdvice();
            }}
            placeholder="자재 조달 협상 방안, 생산 우선순위 조정 등에 대해 질문하세요..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <button
            onClick={() => handleGetAdvice()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>분석 요청</span>
          </button>
        </div>

      </div>
    </div>
  );
};
