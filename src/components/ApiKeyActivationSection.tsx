import React, { useState } from 'react';
import {
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

interface ApiKeyActivationSectionProps {
  onSuccessNavigate?: () => void;
  onOpenAiAdvisor?: () => void;
}

export const ApiKeyActivationSection: React.FC<ApiKeyActivationSectionProps> = ({
  onSuccessNavigate,
  onOpenAiAdvisor,
}) => {
  const {
    apiKey,
    isKeyVerified,
    isValidating,
    verificationError,
    verifiedModel,
    verifyAndSetApiKey,
    clearApiKey,
  } = useApiKey();

  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim()) return;
    const success = await verifyAndSetApiKey(inputKey);
    if (success && onSuccessNavigate) {
      // Optional callback
    }
  };

  return (
    <div id="gemini-key-activation-card" className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 transition-all duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-sans">
                Gemini API Key 활성화 및 승인
              </h3>
              {isKeyVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                  Ready to activate
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              AI 자연어 일괄 파싱 및 실시간 공급망 전략 자문 기능을 위한 Google Gemini API Key를 등록합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
        >
          <span>API Key 발급 방법</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Help accordion */}
      {showHelp && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Google AI Studio에서 무료 API Key 발급받기</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600">
            <li>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-semibold underline hover:text-blue-800"
              >
                Google AI Studio API Key 관리 페이지
              </a>
              에 접속하여 Google 계정으로 로그인합니다.
            </li>
            <li><strong>Create API key</strong> 버튼을 클릭하여 새 키를 생성합니다.</li>
            <li>생성된 키(<code>AIzaSy...</code> 형식)를 복사하여 아래 입력창에 붙여넣고 <strong>[유효성 확인 및 승인]</strong>을 누릅니다.</li>
          </ol>
        </div>
      )}

      {/* Verification / Active State Display */}
      {isKeyVerified ? (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Gemini API Key가 성공적으로 검증 및 승인되었습니다.
                </h4>
                <p className="text-xs text-emerald-700 font-medium">
                  현재 세션에서 AI 자연어 파싱 및 공급망 전략 자문 기능이 활성화되었습니다. (엔진: {verifiedModel || 'gemini-2.5-flash'})
                </p>
              </div>
            </div>

            <button
              onClick={clearApiKey}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>키 연결 해제 / 재설정</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-emerald-200/60">
            {onSuccessNavigate && (
              <button
                onClick={onSuccessNavigate}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <span>실행 대시보드로 이동</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            {onOpenAiAdvisor && (
              <button
                onClick={onOpenAiAdvisor}
                className="px-4 py-2 bg-white hover:bg-emerald-100/50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI 공급망 자문 열기</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Input Form */
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Google Gemini API Key 입력
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="gemini-api-key-input"
                type={showPassword ? 'text' : 'password'}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy로 시작하는 Gemini API Key를 입력하세요..."
                disabled={isValidating}
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {verificationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-red-900">API Key 승인 실패</div>
                <div className="text-red-700 leading-relaxed">{verificationError}</div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isValidating || !inputKey.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-900/30 transition flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>유효성 확인 및 통신 중...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>유효성 확인 및 승인</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Security & Memory Protection Notice */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>보안 및 메모리 보호 정책</span>
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 font-mono">
              In-Memory Only
            </span>
          </div>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            🔒 입력하신 API Key는 서버 데이터베이스나 브라우저 영구 저장소(localStorage/sessionStorage)에 일절 저장되지 않으며, 오직 현재 브라우저 탭의 메모리 상태로만 일회성 관리되어 <strong>세션 종료(탭 닫기) 시 즉시 파기</strong>됩니다.
          </p>
        </div>
      </div>

    </div>
  );
};
