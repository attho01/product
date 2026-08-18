import React from 'react';
import {
  Cpu,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Home,
  Key,
  Lock,
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { useApiKey } from '../context/ApiKeyContext';

interface HeaderProps {
  currentTab: 'landing' | 'wizard' | 'fastpath' | 'grid' | 'dashboard';
  setCurrentTab: (tab: 'landing' | 'wizard' | 'fastpath' | 'grid' | 'dashboard') => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenExportModal: () => void;
  onOpenQualityModal: () => void;
  onOpenAiAdvisorModal: () => void;
  onResetData: () => void;
  hasErrors: boolean;
  onRequireAuth?: (featureName: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  selectedPresetId,
  onSelectPreset,
  onOpenExportModal,
  onOpenQualityModal,
  onOpenAiAdvisorModal,
  onResetData,
  hasErrors,
  onRequireAuth,
}) => {
  const { isKeyVerified } = useApiKey();

  const handleProtectedAction = (action: () => void, featureName: string) => {
    if (!isKeyVerified) {
      if (onRequireAuth) {
        onRequireAuth(featureName);
      } else {
        setCurrentTab('landing');
      }
      return;
    }
    action();
  };

  const handleProtectedTab = (tab: 'landing' | 'wizard' | 'fastpath' | 'grid' | 'dashboard', featureName: string) => {
    if (tab === 'landing') {
      setCurrentTab('landing');
      return;
    }
    if (!isKeyVerified) {
      if (onRequireAuth) {
        onRequireAuth(featureName);
      } else {
        setCurrentTab('landing');
      }
      return;
    }
    setCurrentTab(tab);
  };

  return (
    <header className="bg-[#0A1626] border-b border-slate-800/80 sticky top-0 z-40 shadow-lg">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
          
          {/* Brand Logo & Title (Industrial Global Theme) */}
          <div 
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-3.5 cursor-pointer group"
            title="랜딩 페이지로 이동"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md flex items-center justify-center border border-blue-400/30 group-hover:scale-105 transition">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white font-sans group-hover:text-blue-300 transition">
                  SCM Risk Insight Dashboard
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {isKeyVerified ? 'Key Verified' : 'Auth Required'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                반도체 생산계획 및 자재 수급 최적화 분석 (MRP Engine)
              </p>
            </div>
          </div>

          {/* Action Tools & Preset Selector */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Gemini API Key Status Pill */}
            <button
              onClick={() => {
                setCurrentTab('landing');
                setTimeout(() => {
                  const card = document.getElementById('gemini-key-activation-card');
                  const input = document.getElementById('gemini-api-key-input');
                  card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  input?.focus();
                }, 100);
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                isKeyVerified
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
              }`}
              title="Gemini API Key 설정 및 상태 관리"
            >
              <Key className={`w-3.5 h-3.5 ${isKeyVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isKeyVerified ? 'Gemini Key: Active' : 'Gemini Key 등록 (필수)'}</span>
            </button>

            {/* Preset Selector */}
            <div className="relative">
              <select
                aria-label="반도체 라인 프리셋 선택"
                value={selectedPresetId}
                onChange={(e) => {
                  if (!isKeyVerified) {
                    onRequireAuth?.('반도체 라인 프리셋 데이터');
                    return;
                  }
                  onSelectPreset(e.target.value);
                }}
                className="text-xs bg-[#112238] border border-slate-700/80 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400 hover:bg-[#162c4a] transition font-medium"
              >
                <option value="" disabled>
                  반도체 라인 프리셋 선택
                </option>
                {SAMPLE_DATASETS.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name}
                  </option>
                ))}
                <option value="custom">직접 신규 입력 (빈 템플릿)</option>
              </select>
            </div>

            {/* Quality Check Button */}
            <button
              onClick={() => handleProtectedAction(onOpenQualityModal, '품질 검증')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition font-medium ${
                !isKeyVerified
                  ? 'bg-[#112238]/60 border-slate-800 text-slate-400 hover:bg-[#162c4a] hover:text-slate-200'
                  : hasErrors
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-[#112238] border-slate-700/80 text-slate-300 hover:bg-[#162c4a] hover:text-white'
              }`}
              title={!isKeyVerified ? 'API Key 승인 후 사용 가능' : '품질 검증'}
            >
              {!isKeyVerified ? (
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <CheckCircle2 className={`w-3.5 h-3.5 ${hasErrors ? 'text-amber-400' : 'text-emerald-400'}`} />
              )}
              <span>품질 검증</span>
            </button>

            {/* AI Advisor Button */}
            <button
              onClick={() => handleProtectedAction(onOpenAiAdvisorModal, 'AI 공급망 전략 자문')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                !isKeyVerified
                  ? 'bg-[#112238]/60 border border-slate-800 text-slate-400 hover:bg-[#162c4a]'
                  : 'bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 hover:text-white'
              }`}
              title={!isKeyVerified ? 'API Key 승인 후 사용 가능' : 'AI 공급망 자문'}
            >
              {!isKeyVerified ? (
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              )}
              <span>AI 공급망 자문</span>
            </button>

            {/* HTML Export Button */}
            <button
              onClick={() => handleProtectedAction(onOpenExportModal, '단일 HTML 다운로드')}
              className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg font-semibold shadow-md transition ${
                !isKeyVerified
                  ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
              }`}
              title={!isKeyVerified ? 'API Key 승인 후 사용 가능' : '단일 HTML 다운로드'}
            >
              {!isKeyVerified ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>단일 HTML 다운로드</span>
            </button>

            {/* Reset Data */}
            <button
              onClick={onResetData}
              title="데이터 초기화"
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#112238] border border-slate-700/80 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {/* View Navigation Tabs with Clean Accent Lines */}
        <div className="flex items-center gap-1.5 pt-1 pb-3 border-t border-slate-800/80 overflow-x-auto text-xs">
          
          <button
            onClick={() => handleProtectedTab('landing', '플랫폼 소개')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              currentTab === 'landing'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#112238]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>플랫폼 소개 (Landing)</span>
          </button>

          <button
            onClick={() => handleProtectedTab('dashboard', '실행 대시보드')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#112238]'
            }`}
          >
            {!isKeyVerified ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <BarChart3 className="w-3.5 h-3.5" />
            )}
            <span>실행 대시보드 (7 Sections)</span>
          </button>

          <button
            onClick={() => handleProtectedTab('wizard', '4단계 가이드 데이터 수집')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              currentTab === 'wizard'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#112238]'
            }`}
          >
            {!isKeyVerified ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
            <span>단계별 가이드 수집 (Q1~Q4)</span>
          </button>

          <button
            onClick={() => handleProtectedTab('fastpath', '일괄 입력 / Fast-Path')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              currentTab === 'fastpath'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#112238]'
            }`}
          >
            {!isKeyVerified ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>일괄 입력 / Fast-Path</span>
          </button>

          <button
            onClick={() => handleProtectedTab('grid', '데이터 스튜디오 편집기')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
              currentTab === 'grid'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#112238]'
            }`}
          >
            {!isKeyVerified ? (
              <Lock className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5" />
            )}
            <span>데이터 스튜디오 편집기</span>
          </button>
        </div>

      </div>
    </header>
  );
};

