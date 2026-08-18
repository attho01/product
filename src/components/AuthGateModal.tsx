import React from 'react';
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  X,
  Key,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface AuthGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetFeatureName?: string;
  onProceedToActivation: () => void;
}

export const AuthGateModal: React.FC<AuthGateModalProps> = ({
  isOpen,
  onClose,
  targetFeatureName = '해당 기능',
  onProceedToActivation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0A1626] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white">
        
        {/* Top Header Background Glow */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-blue-600/20 to-transparent pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-700 transition z-10"
          title="닫기"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6 relative z-10">
          
          {/* Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>API Key Authorization Required</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Gemini API Key 승인이 필요합니다
              </h3>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-[#112238] border border-slate-700/70 space-y-2 text-xs sm:text-sm text-slate-300">
            <p className="leading-relaxed">
              <strong className="text-blue-300">[{targetFeatureName}]</strong> 및 반도체 MRP 연산 엔진, 4단계 데이터 수집 검사, 대시보드 리포트를 사용하시려면 <strong>Google Gemini API Key 승인</strong>이 먼저 완료되어야 합니다.
            </p>
            <ul className="space-y-1.5 text-slate-400 text-xs pt-1 border-t border-slate-700/60">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>AI 자연어 파싱 (Fast-Path) 활성화</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>실시간 반도체 MRP 리스크 연산 & 대시보드 접근</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>AI 공급망 전략 자문 & 조달 플랜 시뮬레이션</span>
              </li>
            </ul>
          </div>

          {/* Security Notice */}
          <div className="text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
            <Key className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              🔒 <strong>In-Memory 보안 원칙:</strong> 입력하신 API Key는 서버 DB에 저장되지 않으며, 현재 브라우저 탭 세션 종료 시 즉시 파기됩니다.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={onProceedToActivation}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-900/40 transition flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>API Key 입력 및 승인받기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl bg-[#112238] hover:bg-[#162c4a] border border-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              닫기
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
