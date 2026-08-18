import React from 'react';
import {
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  BarChart3,
  Globe,
  Factory,
  ShieldCheck,
  Zap,
  TrendingUp,
  Box,
  Truck,
  Lightbulb,
  ChevronRight,
  Database,
  Lock,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';
import { ApiKeyActivationSection } from './ApiKeyActivationSection';
import { useApiKey } from '../context/ApiKeyContext';

interface LandingPageViewProps {
  onNavigateTab: (tab: 'wizard' | 'fastpath' | 'grid' | 'dashboard') => void;
  onSelectPreset: (presetId: string) => void;
  onOpenExportModal: () => void;
  onOpenAiAdvisorModal?: () => void;
  onRequireAuth?: (featureName: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onNavigateTab,
  onSelectPreset,
  onOpenExportModal,
  onOpenAiAdvisorModal,
  onRequireAuth,
}) => {
  const { isKeyVerified } = useApiKey();

  const scrollToKeySection = () => {
    const card = document.getElementById('gemini-key-activation-card');
    const input = document.getElementById('gemini-api-key-input');
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card?.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2');
    setTimeout(() => {
      card?.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2');
      input?.focus();
    }, 1200);
  };

  const handleProtectedNavigate = (tab: 'wizard' | 'fastpath' | 'grid' | 'dashboard', featureName: string) => {
    if (!isKeyVerified) {
      if (onRequireAuth) {
        onRequireAuth(featureName);
      } else {
        scrollToKeySection();
      }
      return;
    }
    onNavigateTab(tab);
  };

  const handleProtectedAction = (action: () => void, featureName: string) => {
    if (!isKeyVerified) {
      if (onRequireAuth) {
        onRequireAuth(featureName);
      } else {
        scrollToKeySection();
      }
      return;
    }
    action();
  };

  return (
    <div className="space-y-12">

      {/* Global Status Banner regarding API Key Approval */}
      {!isKeyVerified ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>Gemini API Key 승인이 필요합니다</span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-md font-bold uppercase">
                  Locked
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                모든 반도체 MRP 검사 시작, 대시보드 및 AI 공급망 자문 메뉴를 이용하시려면 먼저 API Key를 등록하고 유효성 승인을 완료해 주세요.
              </p>
            </div>
          </div>
          <button
            onClick={scrollToKeySection}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-xs whitespace-nowrap"
          >
            <Key className="w-3.5 h-3.5" />
            <span>API Key 등록창으로 이동</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">
              Gemini API Key 승인 완료: 모든 반도체 검사 시작, MRP 대시보드 및 AI 자문 기능이 정상 활성화되었습니다.
            </span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono">
            Active
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO BANNER (Your Global Semiconductor Production & MRP Partner) */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-[#0A1626] border border-slate-800 shadow-2xl text-white">
        {/* Subtle grid and radial glow backdrops */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071321] via-[#0C1E34] to-[#0A182A] opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

        <div className="relative z-10 p-8 sm:p-14 flex flex-col justify-between min-h-[440px]">
          
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Semiconductor MRP & SCM Risk Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Your Global Semiconductor <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">
                Production & MRP Risk Optimization
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl pt-1">
              불확실한 글로벌 공급망 환경에서 생산계획, BOM 수율, 가용재고 및 긴급 우선순위를 투명하게 연산하고 실행 가능한 조달·배분 액션 플랜을 제시합니다.
            </p>
          </div>

          {/* Hero Action CTA Buttons */}
          <div className="pt-8 mt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3.5">
            <button
              onClick={() => handleProtectedNavigate('dashboard', '실행 대시보드')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition ${
                !isKeyVerified
                  ? 'bg-blue-600/80 hover:bg-blue-600 text-white shadow-blue-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/50'
              }`}
            >
              {!isKeyVerified ? <Lock className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
              <span>실행 대시보드 바로가기</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => handleProtectedNavigate('wizard', '4단계 가이드 데이터 수집')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#112238] hover:bg-[#162c4a] border border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition"
            >
              {!isKeyVerified ? <Lock className="w-4 h-4 text-slate-400" /> : <Layers className="w-4 h-4 text-blue-400" />}
              <span>4단계 가이드 데이터 수집</span>
            </button>

            <button
              onClick={() => handleProtectedNavigate('fastpath', 'Fast-Path 일괄 입력')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm transition"
            >
              {!isKeyVerified ? <Lock className="w-4 h-4 text-slate-400" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
              <span>Fast-Path 일괄 입력</span>
            </button>
          </div>

          {/* Quick Stats Bar in Hero */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 mt-4 border-t border-slate-800/60 text-xs font-mono">
            <div>
              <div className="text-slate-400">데이터 수집 체계</div>
              <div className="text-sm font-bold text-white mt-0.5">4단계 표준 프로토콜</div>
            </div>
            <div>
              <div className="text-slate-400">MRP 연산 정밀도</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">수율·스크랩 연동 보정</div>
            </div>
            <div>
              <div className="text-slate-400">우선순위 배분</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">P1 전략 고객 선배정</div>
            </div>
            <div>
              <div className="text-slate-400">포터블 내보내기</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">Zero-Dependency HTML</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. GEMINI API KEY ACTIVATION & VERIFICATION SECTION (User Requested) */}
      {/* ========================================================================= */}
      <section id="gemini-key-activation">
        <ApiKeyActivationSection
          onSuccessNavigate={() => onNavigateTab('dashboard')}
          onOpenAiAdvisor={onOpenAiAdvisorModal}
        />
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE CAPABILITIES (4대 핵심 강점) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Core Capabilities & Strengths
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            반도체 SCM 리스크 최적화를 위한 4대 핵심 강점
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            복잡한 반도체 다중 품목 생산과 자재 제약 문제를 명확하고 투명하게 해결합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                4단계 가이드 데이터 수집
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                생산계획(Q1), BOM 소요량(Q2), 가용재고(Q3), 우선순위(Q4)의 표준화된 질문을 통해 누락 없이 완벽한 기초 데이터를 구조화합니다.
              </p>
            </div>
            <button
              onClick={() => handleProtectedNavigate('wizard', '4단계 가이드 데이터 수집')}
              className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 text-left"
            >
              <span>가이드 수집 시작하기</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                정밀 MRP 및 수율 연동 연산
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                공정 수율(Yield)과 스크랩(Scrap) 손실을 보정한 실소요량 및 안전재고 차감 순가용재고(Net Avail)를 실시간 산출합니다.
              </p>
            </div>
            <button
              onClick={() => handleProtectedNavigate('dashboard', 'MRP 연산 대시보드')}
              className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 text-left"
            >
              <span>투명한 수학적 산출식 명시</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                우선순위 기반 순차 배분
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                공유 자재 부족 시 전략 고객(P1)과 긴급 납기 제품에 가용량을 우선 선배정하여 공장 매출 보전과 위약금 리스크를 방어합니다.
              </p>
            </div>
            <button
              onClick={() => handleProtectedNavigate('dashboard', '우선순위 배분 분석')}
              className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 text-left"
            >
              <span>병목 자재(Bottleneck) 추적</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                실행 액션 플랜 자동 제안
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                결손 자재별 긴급 항공 특송 조달, 승인된 대체재 즉시 전환, 팹 패키징 수율 개선 등 부서별 구체적 실행 지침을 즉각 생성합니다.
              </p>
            </div>
            <button
              onClick={() => handleProtectedNavigate('dashboard', '실행 액션 플랜')}
              className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 text-left"
            >
              <span>의사결정 리드타임 최소화</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. OPERATING PRINCIPLES (무조작 원칙 & 단일 HTML 포터블) */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>핵심 설계 원칙 (Core Principles)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              데이터가 없으면 만들어내지 않는다.<br />
              <span className="text-emerald-400">모든 계산은 100% 투명하게 명시됩니다.</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              임의의 가공 데이터나 환각 없이 실제 입력된 생산계획, BOM, 재고를 기반으로 계산됩니다. 수율이나 안전재고가 누락된 경우 기본값(수율 100%, 스크랩 0%)을 투명하게 고지하고 보정 로직을 명확히 제시합니다.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Gross Req = Target Qty × BOM Usage</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Adjusted = Gross / (Yield × (1 - Scrap))</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Net Avail = (OnHand + Receipt) - Safety</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Priority Order = Level 1 → Urgent → Due</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-cyan-300">
              <Download className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">포터블 단일 HTML 내보내기</h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              분석된 대시보드와 자재 분석 결과를 외부 서버나 네트워크 의존 없이 완벽히 동작하는 단일 오프라인 HTML 파일로 즉시 다운로드할 수 있습니다.
            </p>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
              <div>✓ 독립 실행형 JS/CSS 인라인 번들링</div>
              <div>✓ 사내 보안망 및 임원 보고용 오프라인 열람</div>
              <div>✓ 필터링, 정렬, 행 상세 토글 100% 보존</div>
            </div>

            <button
              onClick={() => handleProtectedAction(onOpenExportModal, '단일 HTML 내보내기')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {!isKeyVerified ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>단일 HTML 내보내기 미리보기</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INDUSTRY PRESETS & BENCHMARKS (검증된 반도체 라인 시나리오) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Industry Ready Scenarios
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              검증된 반도체 라인 프리셋 시뮬레이션
            </h2>
            <p className="text-xs text-slate-500">
              원클릭으로 산업별 표준 벤치마크 데이터를 로드하여 즉시 분석 결과를 체험할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SAMPLE_DATASETS.map((dataset) => (
            <div
              key={dataset.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                    {dataset.productionPlans.length} Products • {dataset.boms.length} BOMs
                  </span>
                  <Cpu className="w-4 h-4 text-slate-400" />
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {dataset.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {dataset.description}
                </p>

                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600 font-mono">
                  <div>• 계획: {dataset.productionPlans.map((p) => p.productId).join(', ')}</div>
                  <div>• 자재: {dataset.inventory.map((i) => i.materialId).slice(0, 3).join(', ')} 등</div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleProtectedAction(() => {
                    onSelectPreset(dataset.id);
                    onNavigateTab('dashboard');
                  }, `${dataset.name} 시뮬레이션`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition flex items-center justify-center gap-2"
              >
                {!isKeyVerified ? <Lock className="w-3.5 h-3.5" /> : null}
                <span>이 시나리오로 대시보드 실행</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PROCESS WORKFLOW (데이터 수집에서 의사결정까지의 워크플로우) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            End-to-End Workflow
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            데이터 수집부터 의사결정까지의 실행 프로세스
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">4단계 데이터 수집</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Q1 목표생산량, Q2 BOM 소요량, Q3 가용재고, Q4 우선순위 입력 및 자동 검증.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">실시간 MRP 엔진 연산</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              소요량 보정, 순가용재고 차감, Shortage 결손량 및 위험도(Critical 등급) 산출.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">우선순위 순차 배분</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              P1 전략 고객 우선 배정 및 후순위 일정 조정(Rescheduling) 시뮬레이션.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
              04
            </div>
            <h4 className="text-sm font-bold text-slate-900">전략 액션 플랜 & 배포</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              긴급 조달·대체재 전환 지침 확인 및 오프라인 단일 HTML 파일 즉시 내보내기.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. BOTTOM CTA PANEL (Building the Future of Global Production) */}
      {/* ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden bg-[#071321] border border-slate-800 p-8 sm:p-12 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Building the Future of Global Semiconductor Production.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              지금 바로 반도체 생산 데이터 수집과 자재 수급 리스크 분석을 시작해보세요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleProtectedNavigate('wizard', '4단계 데이터 수집')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-900/50 flex items-center gap-2"
            >
              {!isKeyVerified ? <Lock className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
              <span>4단계 데이터 수집 시작하기</span>
            </button>

            <button
              onClick={() => handleProtectedNavigate('dashboard', '실행 대시보드')}
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-2"
            >
              {!isKeyVerified ? <Lock className="w-3.5 h-3.5" /> : null}
              <span>실행 대시보드 열기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

