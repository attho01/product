import React, { useState } from 'react';
import {
  ProductionPlanItem,
  BomItem,
  InventoryItem,
  PriorityItem,
  ValidationIssue,
} from '../types';
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Cpu,
  Layers,
  Package,
  ShieldAlert,
  BarChart3,
  FileCheck2,
} from 'lucide-react';

interface WizardDataCollectionProps {
  productionPlans: ProductionPlanItem[];
  setProductionPlans: React.Dispatch<React.SetStateAction<ProductionPlanItem[]>>;
  boms: BomItem[];
  setBoms: React.Dispatch<React.SetStateAction<BomItem[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  priorities: PriorityItem[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityItem[]>>;
  validationIssues: ValidationIssue[];
  onCompleteToDashboard: () => void;
}

export const WizardDataCollection: React.FC<WizardDataCollectionProps> = ({
  productionPlans,
  setProductionPlans,
  boms,
  setBoms,
  inventory,
  setInventory,
  priorities,
  setPriorities,
  validationIssues,
  onCompleteToDashboard,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [copiedExample, setCopiedExample] = useState<string | null>(null);

  // Helper copy text
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExample(label);
    setTimeout(() => setCopiedExample(null), 2000);
  };

  // Group specific issues
  const stepIssues = validationIssues.filter((issue) => {
    if (currentStep === 1) return issue.group === 'Q1';
    if (currentStep === 2) return issue.group === 'Q2';
    if (currentStep === 3) return issue.group === 'Q3';
    if (currentStep === 4) return issue.group === 'Q4';
    if (currentStep === 5) return true;
    return false;
  });

  // Cross check issues
  const crossIssues = validationIssues.filter((i) => i.group === 'CROSS_CHECK');

  // Add Row handlers
  const handleAddPlan = () => {
    const newId = `plan-${Date.now()}`;
    setProductionPlans([
      ...productionPlans,
      {
        id: newId,
        productId: `Product_${String.fromCharCode(65 + productionPlans.length)}`,
        targetQty: 5000,
        unit: 'EA',
        dueDate: '2026-09-30',
        customer: '',
      },
    ]);
  };

  const handleAddBom = () => {
    const newId = `bom-${Date.now()}`;
    const defaultProduct = productionPlans[0]?.productId || 'Product_A';
    setBoms([
      ...boms,
      {
        id: newId,
        productId: defaultProduct,
        materialId: `Material_${boms.length + 1}`,
        unitUsage: 1.0,
        unit: 'EA',
        yield: 100,
        scrapRate: 0,
        alternativeAvailable: false,
      },
    ]);
  };

  const handleAddInventory = () => {
    const newId = `inv-${Date.now()}`;
    setInventory([
      ...inventory,
      {
        id: newId,
        materialId: `Material_${inventory.length + 1}`,
        onHand: 10000,
        unit: 'EA',
        scheduledReceipt: 0,
        safetyStock: 0,
      },
    ]);
  };

  const handleAddPriority = () => {
    const newId = `prio-${Date.now()}`;
    const unprioritizedProduct =
      productionPlans.find((p) => !priorities.some((pr) => pr.productId === p.productId))
        ?.productId || `Product_${productionPlans.length + 1}`;
    setPriorities([
      ...priorities,
      {
        id: newId,
        productId: unprioritizedProduct,
        priorityLevel: 2,
        isUrgent: false,
        reason: '정규 생산 계획',
      },
    ]);
  };

  // Quick apply example presets
  const handleApplyQ1Preset = () => {
    setProductionPlans([
      { id: 'p-1', productId: 'AI_GPU_Module_Ultra', targetQty: 10000, unit: 'EA', dueDate: '2026-09-15', customer: 'Cloud Corp A' },
      { id: 'p-2', productId: 'AI_NPU_Edge_Core', targetQty: 6000, unit: 'EA', dueDate: '2026-09-30', customer: 'Auto OEM B' },
      { id: 'p-3', productId: 'Server_DDR5_Module', targetQty: 4000, unit: 'EA', dueDate: '2026-10-15', customer: 'Telecom C' },
    ]);
  };

  const handleApplyQ2Preset = () => {
    setBoms([
      { id: 'b-1', productId: 'AI_GPU_Module_Ultra', materialId: 'HBM3e_Stack_Die', unitUsage: 4.0, unit: 'EA', yield: 98, scrapRate: 1.5, alternativeAvailable: false },
      { id: 'b-2', productId: 'AI_GPU_Module_Ultra', materialId: 'CoWoS_Interposer', unitUsage: 1.0, unit: 'EA', yield: 96, scrapRate: 2.0, alternativeAvailable: false },
      { id: 'b-3', productId: 'AI_GPU_Module_Ultra', materialId: 'High_Thermal_EMC', unitUsage: 5.0, unit: 'g', yield: 100, scrapRate: 2.0, alternativeAvailable: true },
      { id: 'b-4', productId: 'AI_NPU_Edge_Core', materialId: 'CoWoS_Interposer', unitUsage: 0.5, unit: 'EA', yield: 98, scrapRate: 1.0, alternativeAvailable: false },
      { id: 'b-5', productId: 'AI_NPU_Edge_Core', materialId: 'High_Thermal_EMC', unitUsage: 3.0, unit: 'g', yield: 100, scrapRate: 1.5, alternativeAvailable: true },
      { id: 'b-6', productId: 'Server_DDR5_Module', materialId: 'High_Thermal_EMC', unitUsage: 2.0, unit: 'g', yield: 100, scrapRate: 1.0, alternativeAvailable: true },
    ]);
  };

  const handleApplyQ3Preset = () => {
    setInventory([
      { id: 'i-1', materialId: 'HBM3e_Stack_Die', onHand: 28000, unit: 'EA', scheduledReceipt: 8000, safetyStock: 2000, leadTimeDays: 60 },
      { id: 'i-2', materialId: 'CoWoS_Interposer', onHand: 7500, unit: 'EA', scheduledReceipt: 2000, safetyStock: 500, leadTimeDays: 45 },
      { id: 'i-3', materialId: 'High_Thermal_EMC', onHand: 60000, unit: 'g', scheduledReceipt: 25000, safetyStock: 5000, leadTimeDays: 20 },
    ]);
  };

  const handleApplyQ4Preset = () => {
    setPriorities([
      { id: 'pr-1', productId: 'AI_GPU_Module_Ultra', priorityLevel: 1, isUrgent: true, reason: '긴급 전략 고객 납품 (위약금 조항)' },
      { id: 'pr-2', productId: 'AI_NPU_Edge_Core', priorityLevel: 2, isUrgent: false, reason: '자율주행 엣지향 공급' },
      { id: 'pr-3', productId: 'Server_DDR5_Module', priorityLevel: 3, isUrgent: false, reason: '표준 통신향 공급' },
    ]);
  };

  // Quick stats calculation for Step 5 summary
  const totalTargetQty = productionPlans.reduce((sum, p) => sum + (Number(p.targetQty) || 0), 0);
  const distinctMaterials = Array.from(new Set(boms.map((b) => b.materialId).filter(Boolean)));
  const onHandCount = inventory.filter((i) => i.onHand > 0).length;
  const urgentCount = priorities.filter((p) => p.isUrgent || p.priorityLevel === 1).length;

  return (
    <div className="space-y-6">

      {/* Step Indicator Header (Clean Minimalism) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
              <span>반도체 생산·자재 데이터 수집 프로토콜</span>
              <span className="text-slate-300">•</span>
              <span>{currentStep <= 4 ? `Step ${currentStep} of 4` : '수집 완료 & 대시보드 생성'}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {currentStep === 1 && 'Q1. 목표 생산량 / 생산계획 (Production Plan)'}
              {currentStep === 2 && 'Q2. BOM / 제품별 자재 소요량 (Bill of Materials)'}
              {currentStep === 3 && 'Q3. 현재 재고 / 입고 예정 (Inventory & Receipts)'}
              {currentStep === 4 && 'Q4. 생산 우선순위 / 제약조건 (Priority & Constraints)'}
              {currentStep === 5 && '데이터 수집 완료 & 대시보드화 및 액션 플랜 제안'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {currentStep === 1 && '생산 목표 수량 및 납기일을 설정하여 자재 소요 계산의 기준선을 정의합니다.'}
              {currentStep === 2 && '제품 1개당 소요되는 자재(Unit Usage)와 수율/스크랩 보정률을 구조화합니다.'}
              {currentStep === 3 && '현재 팹 보유 재고(On-hand)와 확정 입고예정량을 통해 순가용재고를 산출합니다.'}
              {currentStep === 4 && '공유 자재 부족 시 제품 간 배분 순서를 결정하는 우선순위 및 납기 제약을 지정합니다.'}
              {currentStep === 5 && '4단계 데이터를 검증하고 7개 섹션 인터랙티브 대시보드 및 맞춤형 액션 플랜을 생성합니다.'}
            </p>
          </div>

          {/* Step Navigation Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { num: 1, label: 'Q1. 생산계획', count: productionPlans.length },
              { num: 2, label: 'Q2. BOM', count: boms.length },
              { num: 3, label: 'Q3. 재고/입고', count: inventory.length },
              { num: 4, label: 'Q4. 우선순위', count: priorities.length },
              { num: 5, label: '대시보드 생성', count: null },
            ].map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isPast
                      ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                      : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : step.num}
                  </span>
                  <span>{step.label}</span>
                  {step.count !== null && (
                    <span className="text-[10px] opacity-75">({step.count})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Alert Box if any errors in current step */}
        {stepIssues.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>입력 검증 알림:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
              {stepIssues.map((issue, idx) => (
                <li key={idx}>
                  {issue.message}{' '}
                  {issue.suggestedAction && (
                    <span className="text-blue-700 font-semibold">({issue.suggestedAction})</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Step Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Cols: Interactive Form Editor OR Step 5 Summary */}
        <div className="lg:col-span-2 space-y-4">

          {/* =================================================== */}
          {/* STEP 1: PRODUCTION PLAN (Q1) */}
          {/* =================================================== */}
          {currentStep === 1 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">목표 생산 계획 목록 (Production Plan)</h3>
                  <p className="text-xs text-slate-500">필수: 제품명, 목표 수량 | 선택: 납기일, 고객사, 라인</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyQ1Preset}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>예시 채우기</span>
                  </button>
                  <button
                    onClick={handleAddPlan}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>제품 추가</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {productionPlans.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    등록된 생산 계획이 없습니다. 상단의 [제품 추가] 또는 [예시 채우기]를 클릭하세요.
                  </div>
                ) : (
                  productionPlans.map((plan, idx) => (
                    <div
                      key={plan.id || idx}
                      className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 space-y-2.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">Product #{idx + 1}</span>
                        <button
                          onClick={() => setProductionPlans(productionPlans.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">제품명 (Product ID) *</label>
                          <input
                            type="text"
                            value={plan.productId}
                            onChange={(e) => {
                              const updated = [...productionPlans];
                              updated[idx].productId = e.target.value;
                              setProductionPlans(updated);
                            }}
                            placeholder="예: AI_GPU_Ultra"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">목표 생산량 (Qty) *</label>
                          <input
                            type="number"
                            min="1"
                            value={plan.targetQty}
                            onChange={(e) => {
                              const updated = [...productionPlans];
                              updated[idx].targetQty = Number(e.target.value);
                              setProductionPlans(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">납기일 (Due Date)</label>
                          <input
                            type="date"
                            value={plan.dueDate || ''}
                            onChange={(e) => {
                              const updated = [...productionPlans];
                              updated[idx].dueDate = e.target.value;
                              setProductionPlans(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">고객/라인 (선택)</label>
                          <input
                            type="text"
                            value={plan.customer || ''}
                            onChange={(e) => {
                              const updated = [...productionPlans];
                              updated[idx].customer = e.target.value;
                              setProductionPlans(updated);
                            }}
                            placeholder="예: 글로벌 고객사"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* STEP 2: BOM (Q2) */}
          {/* =================================================== */}
          {currentStep === 2 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">제품별 BOM 소요량 목록 (Bill of Materials)</h3>
                  <p className="text-xs text-slate-500">필수: 제품명, 자재명, 단위소요량(Unit Usage) | 선택: 수율(Yield), 스크랩(Scrap)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyQ2Preset}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>예시 채우기</span>
                  </button>
                  <button
                    onClick={handleAddBom}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>BOM 자재 추가</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {boms.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    등록된 BOM 데이터가 없습니다. 상단의 [BOM 자재 추가] 또는 [예시 채우기]를 클릭하세요.
                  </div>
                ) : (
                  boms.map((bom, idx) => (
                    <div
                      key={bom.id || idx}
                      className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 space-y-2.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">BOM Item #{idx + 1}</span>
                        <button
                          onClick={() => setBoms(boms.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">대상 제품 (Product) *</label>
                          <select
                            value={bom.productId}
                            onChange={(e) => {
                              const updated = [...boms];
                              updated[idx].productId = e.target.value;
                              setBoms(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          >
                            {productionPlans.map((p) => (
                              <option key={p.productId} value={p.productId}>
                                {p.productId}
                              </option>
                            ))}
                            {!productionPlans.some((p) => p.productId === bom.productId) && (
                              <option value={bom.productId}>{bom.productId}</option>
                            )}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">자재명 (Material ID) *</label>
                          <input
                            type="text"
                            value={bom.materialId}
                            onChange={(e) => {
                              const updated = [...boms];
                              updated[idx].materialId = e.target.value;
                              setBoms(updated);
                            }}
                            placeholder="예: HBM3e_Stack"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">소요량 & 단위 *</label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              step="0.1"
                              min="0.001"
                              value={bom.unitUsage}
                              onChange={(e) => {
                                const updated = [...boms];
                                updated[idx].unitUsage = Number(e.target.value);
                                setBoms(updated);
                              }}
                              className="w-2/3 bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-blue-500 font-mono"
                            />
                            <input
                              type="text"
                              value={bom.unit || 'EA'}
                              onChange={(e) => {
                                const updated = [...boms];
                                updated[idx].unit = e.target.value;
                                setBoms(updated);
                              }}
                              className="w-1/3 bg-white border border-slate-200 rounded px-1.5 py-1.5 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">수율(%) / 스크랩(%)</label>
                          <div className="flex gap-1 items-center">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={bom.yield ?? 100}
                              onChange={(e) => {
                                const updated = [...boms];
                                updated[idx].yield = Number(e.target.value);
                                setBoms(updated);
                              }}
                              placeholder="수율 100"
                              className="w-1/2 bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                              title="팹 공정 수율 (%)"
                            />
                            <input
                              type="number"
                              min="0"
                              max="99"
                              step="0.5"
                              value={bom.scrapRate ?? 0}
                              onChange={(e) => {
                                const updated = [...boms];
                                updated[idx].scrapRate = Number(e.target.value);
                                setBoms(updated);
                              }}
                              placeholder="스크랩 0"
                              className="w-1/2 bg-white border border-slate-200 rounded px-2 py-1.5 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                              title="자재 손실 스크랩율 (%)"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-end">
                          <label className="flex items-center gap-1.5 text-[11px] text-slate-700 pb-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={bom.alternativeAvailable || false}
                              onChange={(e) => {
                                const updated = [...boms];
                                updated[idx].alternativeAvailable = e.target.checked;
                                setBoms(updated);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-0"
                            />
                            <span>대체재 가능</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* STEP 3: INVENTORY (Q3) */}
          {/* =================================================== */}
          {currentStep === 3 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">자재별 현재 재고 및 입고 예정 목록 (Inventory)</h3>
                  <p className="text-xs text-slate-500">필수: 자재명, 현재고(On-hand) | 선택: 입고예정(Scheduled), 안전재고(Safety Stock), 리드타임</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyQ3Preset}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>예시 채우기</span>
                  </button>
                  <button
                    onClick={handleAddInventory}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>재고 자재 추가</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {inventory.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    등록된 재고 데이터가 없습니다. 상단의 [재고 자재 추가] 또는 [예시 채우기]를 클릭하세요.
                  </div>
                ) : (
                  inventory.map((inv, idx) => (
                    <div
                      key={inv.id || idx}
                      className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 space-y-2.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono font-bold text-blue-600">Inventory Item #{idx + 1}</span>
                        <button
                          onClick={() => setInventory(inventory.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">자재명 (Material ID) *</label>
                          <input
                            type="text"
                            value={inv.materialId}
                            onChange={(e) => {
                              const updated = [...inventory];
                              updated[idx].materialId = e.target.value;
                              setInventory(updated);
                            }}
                            placeholder="예: HBM3e_Stack_Die"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">현재고 (On-hand) *</label>
                          <input
                            type="number"
                            min="0"
                            value={inv.onHand}
                            onChange={(e) => {
                              const updated = [...inventory];
                              updated[idx].onHand = Number(e.target.value);
                              setInventory(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">입고 예정 (Scheduled)</label>
                          <input
                            type="number"
                            min="0"
                            value={inv.scheduledReceipt ?? 0}
                            onChange={(e) => {
                              const updated = [...inventory];
                              updated[idx].scheduledReceipt = Number(e.target.value);
                              setInventory(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">안전재고 (Safety Stock)</label>
                          <input
                            type="number"
                            min="0"
                            value={inv.safetyStock ?? 0}
                            onChange={(e) => {
                              const updated = [...inventory];
                              updated[idx].safetyStock = Number(e.target.value);
                              setInventory(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">리드타임 (일)</label>
                          <input
                            type="number"
                            min="0"
                            value={inv.leadTimeDays ?? ''}
                            onChange={(e) => {
                              const updated = [...inventory];
                              updated[idx].leadTimeDays = e.target.value ? Number(e.target.value) : undefined;
                              setInventory(updated);
                            }}
                            placeholder="예: 45"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* STEP 4: PRIORITIES & CONSTRAINTS (Q4) */}
          {/* =================================================== */}
          {currentStep === 4 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">생산 우선순위 및 운영 제약조건 (Priority & Constraints)</h3>
                  <p className="text-xs text-slate-500">자재 부족 시 1순위(최우선) → 긴급 납기 → 납기일 빠른 순으로 자동 배분됩니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyQ4Preset}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600" />
                    <span>예시 채우기</span>
                  </button>
                  <button
                    onClick={handleAddPriority}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>우선순위 추가</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {priorities.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
                    등록된 우선순위 데이터가 없습니다. 상단의 [우선순위 추가] 또는 [예시 채우기]를 클릭하세요.
                  </div>
                ) : (
                  priorities.map((prio, idx) => (
                    <div
                      key={prio.id || idx}
                      className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 space-y-2.5 transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-blue-600">우선순위 Item #{idx + 1}</span>
                          {prio.isUrgent && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                              긴급 납기 (Urgent)
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => setPriorities(priorities.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">대상 제품 (Product ID) *</label>
                          <select
                            value={prio.productId}
                            onChange={(e) => {
                              const updated = [...priorities];
                              updated[idx].productId = e.target.value;
                              setPriorities(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                          >
                            {productionPlans.map((p) => (
                              <option key={p.productId} value={p.productId}>
                                {p.productId}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">우선순위 등급 (1~4) *</label>
                          <select
                            value={prio.priorityLevel}
                            onChange={(e) => {
                              const updated = [...priorities];
                              updated[idx].priorityLevel = Number(e.target.value);
                              setPriorities(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                          >
                            <option value="1">1순위 - 최우선 배분 (P1)</option>
                            <option value="2">2순위 - 높음 (P2)</option>
                            <option value="3">3순위 - 일반 (P3)</option>
                            <option value="4">4순위 - 낮음 (P4)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">긴급 여부 / 고정</label>
                          <div className="flex items-center gap-3 pt-1 text-slate-800">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prio.isUrgent || false}
                                onChange={(e) => {
                                  const updated = [...priorities];
                                  updated[idx].isUrgent = e.target.checked;
                                  setPriorities(updated);
                                }}
                                className="rounded border-slate-300 text-red-600 focus:ring-0"
                              />
                              <span className="text-xs font-medium">긴급</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prio.fixedPlan || false}
                                onChange={(e) => {
                                  const updated = [...priorities];
                                  updated[idx].fixedPlan = e.target.checked;
                                  setPriorities(updated);
                                }}
                                className="rounded border-slate-300 text-blue-600 focus:ring-0"
                              />
                              <span className="text-xs font-medium">고정</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-600 mb-1 font-medium">배분 사유 / 제약</label>
                          <input
                            type="text"
                            value={prio.reason || ''}
                            onChange={(e) => {
                              const updated = [...priorities];
                              updated[idx].reason = e.target.value;
                              setPriorities(updated);
                            }}
                            placeholder="예: 전략 고객사 긴급 납품"
                            className="w-full bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* =================================================== */}
          {/* STEP 5: COLLECTION COMPLETED & DASHBOARD / ACTION PLAN PROPOSALS */}
          {/* =================================================== */}
          {currentStep === 5 && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    4단계 데이터 수집 완료 — 대시보드 및 액션 플랜 준비 완료
                  </h3>
                  <p className="text-xs text-slate-500">
                    모든 생산계획, BOM, 가용재고 및 우선순위 검증이 완료되었습니다.
                  </p>
                </div>
              </div>

              {/* 4-Step Verification Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-blue-600" /> Q1 생산계획</span>
                    <span className="text-emerald-600 font-mono">OK</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">{productionPlans.length}건</div>
                  <div className="text-[10px] text-slate-500">총 {totalTargetQty.toLocaleString()} EA</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-blue-600" /> Q2 BOM</span>
                    <span className="text-emerald-600 font-mono">OK</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">{boms.length}건</div>
                  <div className="text-[10px] text-slate-500">{distinctMaterials.length}개 고유 자재</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-blue-600" /> Q3 재고/입고</span>
                    <span className="text-emerald-600 font-mono">OK</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">{inventory.length}건</div>
                  <div className="text-[10px] text-slate-500">{onHandCount}개 가용 항목</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-blue-600" /> Q4 우선순위</span>
                    <span className="text-emerald-600 font-mono">OK</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 font-mono">{priorities.length}건</div>
                  <div className="text-[10px] text-slate-500">긴급 {urgentCount}개 지정</div>
                </div>
              </div>

              {/* Action Plan Preview Highlight Box */}
              <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      자동 도출되는 4대 핵심 액션 플랜
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Action Plan Engine</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                    <div className="font-bold text-red-300">1. 긴급 조달 대응안 (Expedite Procurement)</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      결손 자재별 필요 납기일과 긴급 발주량, 공급사 안전버퍼 전용 전략 제안
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                    <div className="font-bold text-emerald-300">2. 공유 자재 최적 배분 (Priority Allocation)</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      1순위(P1) 전략 고객 제품에 우선 배분하여 공장 가동률 및 매출 극대화
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                    <div className="font-bold text-blue-300">3. 대체재 즉시 전환안 (Alternative Activation)</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      대체재 승인 품목에 대해 2차 공급망 즉시 스위칭 및 리드타임 단축안
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                    <div className="font-bold text-amber-300">4. 팹 수율·스크랩 개선 (Yield Recovery)</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      공정 수율 +1.5% 개선 및 스크랩 최소화를 통한 자재 결손 회복 시뮬레이션
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Open Dashboard Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Q4 데이터 수정하기</span>
                </button>

                <button
                  onClick={onCompleteToDashboard}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>📊 대시보드화 및 액션 플랜 제안 확인하기</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls between Steps 1-4 */}
          {currentStep <= 4 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1) as any)}
                disabled={currentStep === 1}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
                  currentStep === 1
                    ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed bg-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>이전 질문 (Q{currentStep - 1})</span>
              </button>

              <button
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1) as any)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
              >
                <span>{currentStep === 4 ? '수집 완료 및 요약 확인' : `다음 질문 (Q${currentStep + 1})`}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* Right Col: Protocol Guidelines & Examples (Clean Minimalism) */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <HelpCircle className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900">실무 가이드 & 입력 형식 예시</h3>
            </div>

            {currentStep === 1 && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>권장 입력 형식 (스프레드시트)</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          'Product_A | 10,000 EA\nProduct_B | 6,000 EA\nProduct_C | 3,000 EA',
                          'q1-format'
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedExample === 'q1-format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
{`Product_A | 10,000 EA
Product_B | 6,000 EA
Product_C | 3,000 EA`}
                  </pre>
                </div>

                <div className="text-slate-500 space-y-1 text-[11px]">
                  <p>• <strong>필수 항목:</strong> 제품명(Product ID), 목표 생산량</p>
                  <p>• <strong>선택 항목:</strong> 생산기간, 납기일, 생산라인, 고객명</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>권장 BOM 입력 형식</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          'Product_A | Wafer_A | 1.0\nProduct_A | LeadFrame_X | 1.0\nProduct_A | EMC_01 | 2.5 g\nProduct_B | Wafer_B | 1.0',
                          'q2-format'
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedExample === 'q2-format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
{`Product_A | Wafer_A | 1.0
Product_A | LeadFrame_X | 1.0
Product_A | EMC_01 | 2.5 g
Product_B | Wafer_B | 1.0`}
                  </pre>
                </div>

                <div className="text-slate-500 space-y-1 text-[11px]">
                  <p>• <strong>필수 항목:</strong> 제품명, 자재명, 단위소요량(Unit Usage)</p>
                  <p>• <strong>계산 보정:</strong> 수율(Yield), 스크랩(Scrap) 미입력 시 각각 100%, 0% 기본값이 적용됩니다.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>권장 재고 입력 형식</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          'Wafer_A | 재고 8,000 | 입고예정 3,000\nLeadFrame_X | 재고 12,000 | 입고예정 0\nEMC_01 | 재고 18,000 g | 입고예정 5,000 g',
                          'q3-format'
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedExample === 'q3-format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
{`Wafer_A | 재고 8,000 | 입고예정 3,000
LeadFrame_X | 재고 12,000 | 입고예정 0
EMC_01 | 재고 18,000 g | 입고예정 5,000 g`}
                  </pre>
                </div>

                <div className="text-slate-500 space-y-1 text-[11px]">
                  <p>• <strong>순가용재고 공식:</strong> (현재고 + 유효 입고예정) - 안전재고</p>
                  <p>• <strong>안전재고:</strong> 라인 비상 버퍼로 차감 후 순수 가용량 산출</p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-900 flex items-center justify-between">
                    <span>권장 우선순위 입력 형식</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          'Product_A — 최우선 / 고객 긴급 납기\nProduct_B — 일반\nProduct_C — 낮음',
                          'q4-format'
                        )
                      }
                      className="text-slate-400 hover:text-slate-700"
                    >
                      {copiedExample === 'q4-format' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
{`Product_A — 최우선 / 고객 긴급 납기
Product_B — 일반
Product_C — 낮음`}
                  </pre>
                </div>

                <div className="text-slate-500 space-y-1 text-[11px]">
                  <p>• <strong>배분 4단계 규칙:</strong> 1.최우선(P1) → 2.긴급 납기 → 3.납기 빠른 순 → 4.입력 순서</p>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-1.5 text-blue-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    <span>대시보드 주요 구성 (Section 1~7)</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800">
                    <li>Sec 1: 총괄 KPI 카드</li>
                    <li>Sec 2: 자재별 결손 리스크 테이블</li>
                    <li>Sec 3: 소요량 대비 재고 차트</li>
                    <li>Sec 4: 제품별 독립 생산 가능성</li>
                    <li>Sec 5: 우선순위 기반 자재 배분안</li>
                    <li>Sec 6: 조달 대응 및 실행 플랜</li>
                    <li>Sec 7: 산출 가정 및 데이터 원칙</li>
                  </ul>
                </div>
              </div>
            )}

          </div>

          {/* Cross Check Issues Notice */}
          {crossIssues.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-2 shadow-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>데이터 간 교차 검증 상태</span>
              </div>
              <ul className="space-y-1 text-slate-600 pl-1 text-[11px]">
                {crossIssues.map((ci, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-amber-500">•</span>
                    <span>{ci.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
