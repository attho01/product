import React, { useState, useMemo } from 'react';
import {
  MrpCalculationOutput,
  RiskLevel,
} from '../types';
import {
  AlertTriangle,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Info,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Truck,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Zap,
  Target,
  ShieldAlert,
  Cpu,
  Globe,
  Factory,
  Lightbulb,
  Box,
  ChevronLeft,
  Menu,
} from 'lucide-react';

interface DashboardViewProps {
  mrpData: MrpCalculationOutput;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ mrpData }) => {
  const {
    summary,
    materialAnalysis,
    productFeasibility,
    productionAllocation,
    procurementPlan,
    assumptions,
  } = mrpData;

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [selectedActionFilter, setSelectedActionFilter] = useState<'ALL' | 'CRITICAL' | 'ALLOCATION' | 'ALTERNATIVE' | 'YIELD'>('ALL');
  const [sortField, setSortField] = useState<'materialId' | 'shortage' | 'shortageRate' | 'netAvailable'>('shortageRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeHeroSlide, setActiveHeroSlide] = useState(1);
  const [activeProductSlide, setActiveProductSlide] = useState(1);

  // Sorting Handler
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filtered & Sorted Material Rows
  const filteredMaterials = useMemo(() => {
    return materialAnalysis
      .filter((mat) => {
        const matchesSearch =
          mat.materialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mat.affectedProducts.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRisk =
          selectedRiskFilter === 'ALL' || mat.riskLevel === selectedRiskFilter;
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        let valA: number | string = a[sortField];
        let valB: number | string = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }
        return sortOrder === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [materialAnalysis, searchTerm, selectedRiskFilter, sortField, sortOrder]);

  // Chart Data: Top 15 Scale Guardrail
  const chartMaterials = useMemo(() => {
    const list = [...materialAnalysis];
    if (list.length > 15) {
      return list.sort((a, b) => b.shortageRate - a.shortageRate).slice(0, 15);
    }
    return list;
  }, [materialAnalysis]);

  // Max value for chart normalization
  const chartMaxVal = useMemo(() => {
    let max = 1;
    chartMaterials.forEach((m) => {
      const req = m.adjustedRequirement || m.grossRequirement;
      if (req > max) max = req;
      if (m.netAvailable > max) max = m.netAvailable;
    });
    return max;
  }, [chartMaterials]);

  // Strategic Action Plans
  const strategicActionPlans = useMemo(() => {
    const plans = [];

    const criticalShortages = materialAnalysis.filter((m) => m.shortage > 0 && (m.riskLevel === 'Critical' || m.riskLevel === 'High'));
    criticalShortages.forEach((mat) => {
      plans.push({
        id: `act-proc-${mat.materialId}`,
        category: 'CRITICAL' as const,
        categoryLabel: '긴급 조달 (Procurement)',
        title: `${mat.materialId} 긴급 물량 확보 및 납기 Crash 대응`,
        badgeColor: 'bg-red-50 text-red-600 border-red-200',
        materialId: mat.materialId,
        impact: `결손량 -${mat.shortage.toLocaleString()} ${mat.unit} 조기 해소 및 주력 라인 정체 방지`,
        owner: 'SCM 조달/구매팀',
        steps: [
          `공급사(${mat.supplier || '주요 벤더'})에 Fast-Track 긴급 분할 입고(Split Delivery) 요청`,
          `항공 특송 운송 전환으로 기존 리드타임(${mat.leadTimeDays || 45}일) 대비 최소 40% 단축 추진`,
          `공급사 안전 버퍼(Safety Buffer) 우선 할당 협상`,
        ],
      });
    });

    if (productionAllocation.length > 1 && summary.overallAchievementRate < 100) {
      const p1Alloc = productionAllocation.filter((p) => p.priorityRank === 1);
      const p2Alloc = productionAllocation.filter((p) => p.priorityRank > 1 && p.allocatedQty < p.targetQty);
      
      plans.push({
        id: 'act-alloc-optimal',
        category: 'ALLOCATION' as const,
        categoryLabel: '우선순위 배분 (Allocation)',
        title: '전략 고객(P1) 100% 충족 및 비핵심 품목 일정 순연(Rescheduling)',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        materialId: '공유 핵심 자재',
        impact: '전략 고객사 납품 위약금 방지 및 공장 매출 보전 극대화',
        owner: '생산관리(PC) & 영업기획팀',
        steps: [
          `1순위 제품(${p1Alloc.map((p) => p.productId).join(', ') || 'P1'})에 가용 자재 100% 우선 확정 배정`,
          `잔여 자재에 따라 후순위 제품(${p2Alloc.map((p) => p.productId).join(', ') || 'P2/P3'})은 다음 주차로 롤링(Rolling) 조정`,
          `고객사 사전 통지 및 분할 출하(Partial Shipment) 승인 획득`,
        ],
      });
    }

    const altMaterials = materialAnalysis.filter((m) => m.alternativeAvailable && m.shortage > 0);
    if (altMaterials.length > 0) {
      plans.push({
        id: 'act-alt-switch',
        category: 'ALTERNATIVE' as const,
        categoryLabel: '대체재 전환 (Alternative)',
        title: `승인된 대체 자재(${altMaterials.map((m) => m.materialId).join(', ')}) 즉시 라인 투입`,
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        materialId: altMaterials.map((m) => m.materialId).join(', '),
        impact: '추가 수급 대기 없이 즉각적인 생산 착공 가능 (리드타임 0일 효과)',
        owner: '품질관리(QA) & 팹 기술팀',
        steps: [
          '대체 자재 사양 승인원(PCN) 검토 및 라인 투입 승인 즉시 발송',
          '공정 셋업 파라미터 미세 조정 후 파일럿 런(Pilot Run) 1개 로트 선행',
          '대체 자재 재고 즉시 생산 라인 이송 및 불출 처리',
        ],
      });
    }

    const lowYieldMats = materialAnalysis.filter((m) => m.adjustedRequirement > m.grossRequirement * 1.05);
    if (lowYieldMats.length > 0) {
      plans.push({
        id: 'act-yield-recovery',
        category: 'YIELD' as const,
        categoryLabel: '수율 개선 (Yield & Scrap)',
        title: '팹 패키징 공정 수율 +1.5% 개선을 통한 자재 손실 최소화',
        badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        materialId: lowYieldMats.map((m) => m.materialId).join(', '),
        impact: '수율 개선 시 추가 자재 발주 없이 완제품 생산량 약 3~5% 증가',
        owner: '패키징(Packaging) 공정기술팀',
        steps: [
          '다이 어태치 및 몰딩 공정 온도/압력 프로파일 최적화로 스크랩율 감축',
          '웨이퍼 소잉(Sawing) 파손율 실시간 모니터링 강화',
          '수율 1.5% 회복 시 예상 소요량 실시간 재계산',
        ],
      });
    }

    return plans;
  }, [materialAnalysis, productionAllocation, summary]);

  const filteredActionPlans = useMemo(() => {
    if (selectedActionFilter === 'ALL') return strategicActionPlans;
    return strategicActionPlans.filter((p) => p.category === selectedActionFilter);
  }, [strategicActionPlans, selectedActionFilter]);

  return (
    <div className="space-y-10">

      {/* ========================================================================= */}
      {/* 1. HERO BANNER: "Your Global Manufacturing Partner" Style Industrial Hero */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden bg-[#0A1626] border border-slate-800 shadow-xl text-white">
        {/* Background glow and subtle industrial grid lines */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071321] via-[#0C1E34] to-[#0A182A] opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        
        <div className="relative z-10 p-6 sm:p-10 flex flex-col justify-between min-h-[300px]">
          
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Manufacturing & SCM Optimization</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              Your Global Manufacturing Partner
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
              첨단 기술과 정밀 자재 지식을 바탕으로 고객의 생산 목표를 충족시키고 더 나은 제조 생태계를 위해 노력합니다.
            </p>
          </div>

          {/* Hero Bottom Bar with Carousel Navigation & Quick Status */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Carousel Controls (as in image) */}
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => setActiveHeroSlide(activeHeroSlide === 1 ? 3 : activeHeroSlide - 1)}
                className="w-8 h-8 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-mono text-slate-400 text-xs tracking-wider">
                {activeHeroSlide} / 3
              </span>

              <button
                onClick={() => setActiveHeroSlide(activeHeroSlide === 3 ? 1 : activeHeroSlide + 1)}
                className="w-8 h-8 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/60 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick SCM Metrics Tag */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">생산 달성률:</span>
                <span className="text-emerald-400 font-bold text-sm">{summary.overallAchievementRate}%</span>
              </div>
              <div className="h-3 w-px bg-slate-700"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Critical Items:</span>
                <span className="text-red-400 font-bold text-sm">{summary.criticalMaterialsCount} SKUs</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1. Executive Summary (총괄 성과 지표) */}
      {/* ========================================================================= */}
      <section id="section-1" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded uppercase">
              Section 1
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">
              Executive Summary (총괄 성과 지표)
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Card 1: Target Qty */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">목표 생산량</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono truncate">
              {Object.entries(summary.targetQtyByUnit)
                .map(([u, q]) => `${q.toLocaleString()} ${u}`)
                .join(', ') || '0 EA'}
            </div>
            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 w-[100%]"></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              총 {summary.totalProductsCount}개 계획 품목
            </div>
          </div>

          {/* Card 2: Feasible / Allocated Qty */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">예상 생산 가능량</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono truncate">
              {Object.entries(summary.allocatedQtyByUnit)
                .map(([u, q]) => `${q.toLocaleString()} ${u}`)
                .join(', ') || '0 EA'}
            </div>
            <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(100, summary.overallAchievementRate)}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              공유 자재 순차 우선 배분 반영
            </div>
          </div>

          {/* Card 3: Achievement Rate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">생산 달성률</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 font-mono">
              {summary.overallAchievementRate}<span className="text-sm font-normal">%</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              {summary.overallAchievementRate >= 100 ? '전량 완제 가능' : '자재 제약 기반 분석'}
            </div>
          </div>

          {/* Card 4: Critical Risks */}
          <div className="bg-white p-4 rounded-xl border border-red-100 shadow-xs ring-1 ring-red-500/20 space-y-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-tight italic">Critical Risks</span>
            <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1 font-mono">
              {String(summary.criticalMaterialsCount).padStart(2, '0')}{' '}
              <span className="text-xs font-normal text-slate-400 italic">Items</span>
            </div>
            <div className="text-[10px] text-red-500 mt-1 font-medium uppercase tracking-wider">
              Immediate Action Required
            </div>
          </div>

          {/* Card 5: Shortage Total */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">Shortage 품목</span>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 font-mono">
              {String(summary.totalShortageItemsCount).padStart(2, '0')}{' '}
              <span className="text-xs font-normal text-slate-400">SKUs</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-medium">
              전체 {summary.totalMaterialsCount}개 관리 자재 중 {summary.sufficientMaterialsCount}개 충족
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. "OUR PRODUCTS" STYLE PRODUCT SHOWCASE CARDS (From Reference Image) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Our Products & Core Materials
            </h2>
            <p className="text-xs text-slate-500">
              핵심 완제품 품목 및 핵심 공정 자재(BOM) 생산 가능성 카드
            </p>
          </div>
        </div>

        {/* 3-Column Product Cards as in Reference Image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {productFeasibility.map((prod, index) => {
            const isAchieved = prod.achievementRate >= 100;
            return (
              <div
                key={prod.productId}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                {/* Visual Thumbnail Frame */}
                <div className="w-full h-36 bg-gradient-to-b from-slate-50 to-slate-100 rounded-lg flex items-center justify-center border border-slate-100 relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 group-hover:scale-105 transition">
                    <Cpu className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    isAchieved ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    달성률 {prod.achievementRate}%
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition font-sans">
                    {prod.productId}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    목표 수량 {prod.targetQty.toLocaleString()} {prod.unit} 중 {prod.feasibleQty.toLocaleString()} {prod.unit} 생산 가능.
                  </p>
                </div>

                {/* Card Bottom Button (As in reference image: circle arrow or rounded pill) */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {prod.targetQty.toLocaleString()} {prod.unit}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-blue-600 transition shadow-xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination indicator underneath (As in image: ← 1 / 6 →) */}
        <div className="flex items-center justify-center gap-3 pt-2 text-xs text-slate-500">
          <button
            onClick={() => setActiveProductSlide(activeProductSlide === 1 ? 6 : activeProductSlide - 1)}
            className="p-1 hover:text-slate-900 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono font-medium">{activeProductSlide} / {Math.max(1, productFeasibility.length)}</span>
          <button
            onClick={() => setActiveProductSlide(activeProductSlide >= productFeasibility.length ? 1 : activeProductSlide + 1)}
            className="p-1 hover:text-slate-900 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INDUSTRIAL OPERATIONS STRIP (From Reference Image Mid-Banner) */}
      {/* ========================================================================= */}
      <section className="bg-[#0A1626] rounded-xl p-5 sm:p-6 text-white shadow-md border border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          
          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">자재·부품 소요</div>
              <div className="text-[10px] text-slate-400">{summary.totalMaterialsCount}개 SKU 관리</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">글로벌 SCM 네트워크</div>
              <div className="text-[10px] text-slate-400">조달 리드타임 최적화</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">팹·패키징 라인</div>
              <div className="text-[10px] text-slate-400">{summary.totalProductsCount}개 라인 가동</div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100">R&D 수율 최적화</div>
              <div className="text-[10px] text-slate-400">수율·스크랩 연동 보정</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "LATEST NEWS / STRATEGIC ACTION PLANS" (From Reference Image) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Latest Insights & Strategic Action Plans
              </h2>
            </div>
            <div className="h-0.5 w-12 bg-blue-600 mt-1"></div>
          </div>

          {/* Action Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'ALL', label: '전체 제안' },
              { id: 'CRITICAL', label: '🔴 긴급 조달' },
              { id: 'ALLOCATION', label: '🟢 우선 배분' },
              { id: 'ALTERNATIVE', label: '🔵 대체재 전환' },
              { id: 'YIELD', label: '🟡 수율 최적화' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedActionFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedActionFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Structured News Cards (As in reference image) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredActionPlans.slice(0, 3).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-slate-200 border-t-2 border-t-blue-600 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {plan.categoryLabel}
                </span>

                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {plan.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {plan.impact}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>담당: {plan.owner}</span>
                <span>2026.08.18</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2 & 3: Main Grid (Material Risk Overview & Inventory Chart) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Column (8 cols): Material Risk Overview & Production Feasibility */}
        <div className="lg:col-span-8 space-y-6">

          {/* SECTION 2. Material Risk Overview */}
          <section id="section-2" className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase">
                  Section 2
                </span>
                <h2 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-2">
                  Material Risk Overview (자재별 수급 리스크 종합 평가)
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1.5 text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">
                    Critical: {summary.criticalMaterialsCount}
                  </span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                    부족: {summary.totalShortageItemsCount}
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="자재/제품 검색..."
                    className="pl-7 pr-2 py-1 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded text-xs focus:outline-none focus:border-blue-500 w-32 sm:w-40"
                  />
                </div>

                <select
                  aria-label="위험도 필터"
                  value={selectedRiskFilter}
                  onChange={(e) => setSelectedRiskFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 text-xs px-2 py-1 rounded focus:outline-none cursor-pointer"
                >
                  <option value="ALL">전체 위험도</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                  <option value="데이터 부족">데이터 부족</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 shadow-2xs">
                  <tr className="text-[10px] uppercase text-slate-500 font-bold border-b border-slate-200">
                    <th onClick={() => handleSort('materialId')} className="px-3.5 py-2.5 cursor-pointer hover:text-slate-900">
                      <div className="flex items-center gap-1">
                        <span>Material</span>
                        <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-right">Req.</th>
                    <th onClick={() => handleSort('netAvailable')} className="px-3 py-2.5 text-right cursor-pointer hover:text-slate-900 text-blue-600">
                      <div className="flex items-center justify-end gap-1">
                        <span>Net Avail.</span>
                        <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('shortage')} className="px-3 py-2.5 text-right cursor-pointer hover:text-slate-900 text-red-600">
                      <div className="flex items-center justify-end gap-1">
                        <span>Shortage</span>
                        <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSort('shortageRate')} className="px-3 py-2.5 text-right cursor-pointer hover:text-slate-900 text-red-600">
                      <div className="flex items-center justify-end gap-1">
                        <span>부족률</span>
                        <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-center">Risk Level</th>
                    <th className="px-3 py-2.5">Affected Products</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 text-slate-700 font-mono">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-sans">
                        검색 조건에 일치하는 자재가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((mat) => {
                      const isExpanded = expandedRow === mat.materialId;
                      const isShortage = mat.shortage > 0;

                      return (
                        <React.Fragment key={mat.materialId}>
                          <tr
                            onClick={() => setExpandedRow(isExpanded ? null : mat.materialId)}
                            className="hover:bg-slate-50/80 transition cursor-pointer"
                          >
                            <td className="px-3.5 py-2.5 font-bold text-slate-900">
                              <div className="flex items-center gap-1.5">
                                {isExpanded ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                                <span>{mat.materialId}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({mat.unit})</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-right text-slate-800">
                              {(mat.adjustedRequirement || mat.grossRequirement).toLocaleString()}
                            </td>
                            <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                              {mat.netAvailable.toLocaleString()}
                            </td>
                            <td className={`px-3 py-2.5 text-right font-bold ${isShortage ? 'text-red-600' : 'text-slate-400'}`}>
                              {isShortage ? `-${mat.shortage.toLocaleString()}` : '0'}
                            </td>
                            <td className={`px-3 py-2.5 text-right font-bold ${isShortage ? 'text-red-600' : 'text-slate-400'}`}>
                              {mat.shortageRate}%
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {mat.riskLevel === 'Critical' && (
                                <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold tracking-tight">CRITICAL</span>
                              )}
                              {mat.riskLevel === 'High' && (
                                <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold tracking-tight">HIGH</span>
                              )}
                              {mat.riskLevel === 'Medium' && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold border border-amber-200">MEDIUM</span>
                              )}
                              {mat.riskLevel === 'Low' && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">SECURE</span>
                              )}
                              {mat.riskLevel === '데이터 부족' && (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">DATA GAP</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-slate-500 text-[11px] font-sans truncate max-w-xs" title={mat.affectedProducts.join(', ')}>
                              {mat.affectedProducts.join(', ') || 'N/A'}
                            </td>
                          </tr>

                          {/* Expanded Detail */}
                          {isExpanded && (
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <td colSpan={7} className="px-4 py-3 text-xs font-sans text-slate-600">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                    <div className="text-blue-600 font-bold">소요량 상세 보정</div>
                                    <div>원소요량(Gross): {mat.grossRequirement.toLocaleString()} {mat.unit}</div>
                                    <div>보정소요량(Adjusted): {mat.adjustedRequirement.toLocaleString()} {mat.unit}</div>
                                    <div>안전재고(Safety Stock): {mat.safetyStock.toLocaleString()} {mat.unit}</div>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                    <div className="text-blue-600 font-bold">공급망 & 대체재 속성</div>
                                    <div>공급사: {mat.supplier || '미입력 (N/A)'}</div>
                                    <div>리드타임: {mat.leadTimeDays ? `${mat.leadTimeDays}일` : '미입력 (N/A)'}</div>
                                    <div>대체 자재 존재: {mat.alternativeAvailable ? '예 (대체 가능)' : '아니오 (단독 소스)'}</div>
                                  </div>
                                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
                                    <div className="text-blue-600 font-bold">영향 받는 완제품 목록</div>
                                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                                      {mat.affectedProducts.map((p) => (
                                        <li key={p}>{p}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3. Inventory vs Requirement Visual Chart */}
          <section id="section-3" className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase">
                  Section 3
                </span>
                <h2 className="text-sm font-bold text-slate-800 uppercase">
                  Inventory vs Requirement Chart (소요량 대비 가용재고 시각화)
                </h2>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-red-500"></div>
                  <span className="text-slate-600 font-medium">총 소요량 (Req)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-xs bg-blue-500"></div>
                  <span className="text-slate-600 font-medium">순 가용재고 (Net Avail)</span>
                </div>
                {assumptions.scaleGuardrailActive && (
                  <span className="text-amber-600 text-[11px] font-semibold">
                    ※ 상위 15개 자재 집중
                  </span>
                )}
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-3 pt-1">
              {chartMaterials.map((mat) => {
                const req = mat.adjustedRequirement || mat.grossRequirement;
                const reqPct = Math.min(100, Math.max(3, (req / chartMaxVal) * 100));
                const availPct = Math.min(100, Math.max(3, (mat.netAvailable / chartMaxVal) * 100));
                const isShortage = mat.shortage > 0;

                return (
                  <div key={mat.materialId} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900">{mat.materialId}</span>
                        <span className="text-slate-400">({mat.unit})</span>
                        {isShortage && (
                          <span className="px-1.5 py-0.2 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded">
                            결손 -{mat.shortage.toLocaleString()} ({mat.shortageRate}%)
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">
                        Req: {req.toLocaleString()} | Avail: {mat.netAvailable.toLocaleString()}
                      </div>
                    </div>

                    {/* Dual Bars */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex items-center">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-300"
                          style={{ width: `${reqPct}%` }}
                        />
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex items-center">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isShortage ? 'bg-blue-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${availPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 4 & 5: Feasibility & Production Allocation Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Section 4: Feasibility */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase">
                  Section 4
                </span>
                <h2 className="text-xs font-bold text-slate-800 uppercase">
                  Production Feasibility (독립 생산 가능성)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-100">
                      <th className="py-2">제품명</th>
                      <th className="py-2 text-right">목표</th>
                      <th className="py-2 text-right text-blue-600">가능량</th>
                      <th className="py-2 text-right">달성률</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {productFeasibility.map((feass) => (
                      <tr key={feass.productId} className="hover:bg-slate-50/80">
                        <td className="py-2 font-bold text-slate-900">{feass.productId}</td>
                        <td className="py-2 text-right">{feass.targetQty.toLocaleString()}</td>
                        <td className="py-2 text-right font-bold text-blue-600">{feass.feasibleQty.toLocaleString()}</td>
                        <td className="py-2 text-right font-bold text-emerald-600">{feass.achievementRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Allocation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded uppercase">
                  Section 5
                </span>
                <h2 className="text-xs font-bold text-slate-800 uppercase">
                  Production Allocation (자재 순차 배분안)
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-100">
                      <th className="py-2">제품명</th>
                      <th className="py-2 text-right">요청</th>
                      <th className="py-2 text-right text-emerald-600">권고배분</th>
                      <th className="py-2 text-center">순위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {productionAllocation.map((alloc) => (
                      <tr key={alloc.productId} className="hover:bg-slate-50/80">
                        <td className="py-2 font-bold text-slate-900">{alloc.productId}</td>
                        <td className="py-2 text-right">{alloc.targetQty.toLocaleString()}</td>
                        <td className="py-2 text-right font-bold text-emerald-600">{alloc.allocatedQty.toLocaleString()}</td>
                        <td className="py-2 text-center">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded">
                            #{alloc.priorityRank}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): Procurement Action Plan (Dark Navy Card) & Assumptions */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* SECTION 6. Procurement Action Plan */}
          <section id="section-6" className="bg-[#0A1626] rounded-xl p-5 text-white flex flex-col shadow-md ring-1 ring-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded uppercase">
                  Section 6
                </span>
                <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Procurement Action Plan
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {procurementPlan.length} Actions
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-auto max-h-[480px] pr-1">
              {procurementPlan.length === 0 ? (
                <div className="p-6 text-center text-xs text-emerald-400 font-medium bg-white/5 rounded-lg border border-white/10">
                  모든 자재 수급이 완벽히 충족되었습니다.
                </div>
              ) : (
                procurementPlan.map((proc) => {
                  const isCritical = proc.priority.includes('긴급') || proc.priority.includes('1순위');
                  return (
                    <div
                      key={proc.id}
                      className="bg-white/5 border border-white/10 p-3.5 rounded-lg space-y-2 hover:bg-white/8 transition"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-[11px] font-bold uppercase tracking-tight ${isCritical ? 'text-red-400' : 'text-amber-400'}`}>
                          {proc.priority}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          납기: {proc.requiredByDate}
                        </span>
                      </div>
                      
                      <h3 className="text-sm font-bold text-white flex items-center justify-between">
                        <span>{proc.materialId} 조달 대응</span>
                        <span className="text-xs font-mono text-red-300">
                          -{proc.shortageQty.toLocaleString()} {proc.unit}
                        </span>
                      </h3>

                      <p className="text-[11px] text-white/70 leading-relaxed font-sans">
                        {proc.recommendedAction}
                      </p>

                      <div className="text-[10px] text-white/50 flex items-center justify-between pt-1 border-t border-white/10">
                        <span>리드타임: {proc.leadTime}</span>
                        <span>대체재: {proc.alternativeAvailable}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* SECTION 7. Assumptions & System Logic */}
          <section id="section-7" className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 rounded uppercase">
                Section 7
              </span>
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                System Logic & Assumptions
              </h2>
            </div>
            
            <div className="space-y-1.5 text-[11px] text-slate-600 leading-snug">
              <p>• <strong>Gross Req:</strong> Target Qty × BOM Usage</p>
              <p>• <strong>Adjusted Req:</strong> Gross Req / (Yield × (1 - Scrap))</p>
              <p>• <strong>Net Available:</strong> (On-hand + Scheduled) - Safety Stock</p>
              <p>• <strong>Allocation:</strong> Priority Level (P1) → Urgent → Due Date</p>
              <p>• <strong>Data Principle:</strong> Zero fabricated data. Transparency first.</p>
            </div>
          </section>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM FUTURISTIC TECH PANEL: "Building the Future of Global Production" */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden bg-[#071321] border border-slate-800 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Building the Future of Global Production.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
              신뢰할 수 있는 데이터 기반의 정밀 MRP 알고리즘과 투명한 자재 조달 분석으로 안정적인 공급망을 완성합니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#section-1"
              className="px-5 py-2.5 rounded-lg border border-slate-600 hover:border-slate-400 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>TOP OF DASHBOARD</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
