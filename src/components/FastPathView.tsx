import React, { useState } from 'react';
import {
  ProductionPlanItem,
  BomItem,
  InventoryItem,
  PriorityItem,
} from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardPaste,
  FileText,
  Loader2,
  Zap,
} from 'lucide-react';
import { useApiKey } from '../context/ApiKeyContext';

interface FastPathViewProps {
  productionPlans: ProductionPlanItem[];
  setProductionPlans: React.Dispatch<React.SetStateAction<ProductionPlanItem[]>>;
  boms: BomItem[];
  setBoms: React.Dispatch<React.SetStateAction<BomItem[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  priorities: PriorityItem[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityItem[]>>;
  onGoToDashboard: () => void;
  onGoToWizardStep: (step: 1 | 2 | 3 | 4) => void;
}

export const FastPathView: React.FC<FastPathViewProps> = ({
  productionPlans,
  setProductionPlans,
  boms,
  setBoms,
  inventory,
  setInventory,
  priorities,
  setPriorities,
  onGoToDashboard,
  onGoToWizardStep,
}) => {
  const { getAuthHeaders } = useApiKey();
  const [rawText, setRawText] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [parsedSummary, setParsedSummary] = useState<string | null>(null);
  const [missingGroups, setMissingGroups] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Default Fast-Path Benchmark Text template
  const sampleBatchText = `[Q1. 목표 생산량 / 생산계획]
Product_AI_GPU | 12000 EA | 2026-09-15 | 글로벌 빅테크 C
Product_Edge_NPU | 8000 EA | 2026-09-30 | 오토모티브 A
Product_Server_MCU | 5000 EA | 2026-10-15 | 서버제조사 S

[Q2. BOM / 자재 소요량]
Product_AI_GPU | HBM3e_Stack_Die | 4.0 | EA | 수율 98% | 스크랩 1.5%
Product_AI_GPU | CoWoS_Interposer_Wafer | 1.0 | EA | 수율 96% | 스크랩 2.0%
Product_AI_GPU | High_Thermal_EMC | 5.5 | g | 수율 100% | 스크랩 3.0%
Product_Edge_NPU | CoWoS_Interposer_Wafer | 0.5 | EA | 수율 98% | 스크랩 1.0%
Product_Edge_NPU | High_Thermal_EMC | 3.2 | g | 수율 100% | 스크랩 2.0%
Product_Server_MCU | High_Thermal_EMC | 2.5 | g | 수율 100% | 스크랩 1.0%

[Q3. 현재 재고 / 입고 예정]
HBM3e_Stack_Die | 재고 32000 | 입고예정 12000 | 2026-09-05 | 안전재고 3000
CoWoS_Interposer_Wafer | 재고 9000 | 입고예정 3000 | 2026-09-10 | 안전재고 800
High_Thermal_EMC | 재고 85000 g | 입고예정 20000 g | 2026-08-30 | 안전재고 5000 g

[Q4. 생산 우선순위 / 제약조건]
Product_AI_GPU — 1순위 (최우선) / 고객 긴급 납기 위약금 제약
Product_Edge_NPU — 2순위 (높음) / 자율주행 공급
Product_Server_MCU — 3순위 (일반) / 통신 장비`;

  const handlePasteSample = () => {
    setRawText(sampleBatchText);
  };

  // Rule-based Local Parser (Robust fallback)
  const parseLocally = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    const newPlans: ProductionPlanItem[] = [];
    const newBoms: BomItem[] = [];
    const newInv: InventoryItem[] = [];
    const newPrio: PriorityItem[] = [];

    let currentSection: 'Q1' | 'Q2' | 'Q3' | 'Q4' | null = null;

    lines.forEach((line) => {
      if (line.includes('Q1') || line.includes('생산계획') || line.includes('목표 생산량')) {
        currentSection = 'Q1';
        return;
      }
      if (line.includes('Q2') || line.includes('BOM') || line.includes('자재 소요량')) {
        currentSection = 'Q2';
        return;
      }
      if (line.includes('Q3') || line.includes('재고') || line.includes('입고')) {
        currentSection = 'Q3';
        return;
      }
      if (line.includes('Q4') || line.includes('우선순위') || line.includes('제약조건')) {
        currentSection = 'Q4';
        return;
      }

      if (line.startsWith('[') || line.startsWith('#') || line.startsWith('---')) return;

      const tokens = line.split(/[|,\t—\-]/).map((t) => t.trim()).filter(Boolean);

      if (tokens.length >= 2) {
        if (currentSection === 'Q1') {
          const productId = tokens[0];
          const qtyMatch = tokens[1].replace(/[^0-9.]/g, '');
          const targetQty = Number(qtyMatch) || 5000;
          const unit = tokens[1].includes('EA') ? 'EA' : 'EA';
          const dueDate = tokens[2] && tokens[2].match(/\d{4}-\d{2}-\d{2}/) ? tokens[2] : '2026-09-30';
          const customer = tokens[3] || '';
          newPlans.push({
            id: `plan-${Date.now()}-${Math.random()}`,
            productId,
            targetQty,
            unit,
            dueDate,
            customer,
          });
        } else if (currentSection === 'Q2') {
          const productId = tokens[0];
          const materialId = tokens[1];
          const usageMatch = tokens[2] ? tokens[2].replace(/[^0-9.]/g, '') : '1';
          const unitUsage = Number(usageMatch) || 1.0;
          const unit = tokens[3] || 'EA';
          newBoms.push({
            id: `bom-${Date.now()}-${Math.random()}`,
            productId,
            materialId,
            unitUsage,
            unit,
            yield: 100,
            scrapRate: 0,
            alternativeAvailable: line.includes('대체') || line.includes('Yes'),
          });
        } else if (currentSection === 'Q3') {
          const materialId = tokens[0];
          let onHand = 0;
          let scheduledReceipt = 0;
          let safetyStock = 0;

          tokens.forEach((tok) => {
            if (tok.includes('재고') || tok.includes('onhand')) {
              onHand = Number(tok.replace(/[^0-9.]/g, '')) || 0;
            } else if (tok.includes('입고') || tok.includes('receipt')) {
              scheduledReceipt = Number(tok.replace(/[^0-9.]/g, '')) || 0;
            } else if (tok.includes('안전') || tok.includes('safety')) {
              safetyStock = Number(tok.replace(/[^0-9.]/g, '')) || 0;
            }
          });

          if (onHand === 0 && tokens[1]) {
            onHand = Number(tokens[1].replace(/[^0-9.]/g, '')) || 10000;
          }

          newInv.push({
            id: `inv-${Date.now()}-${Math.random()}`,
            materialId,
            onHand,
            unit: tokens[0].includes('EMC') ? 'g' : 'EA',
            scheduledReceipt,
            safetyStock,
            leadTimeDays: 45,
          });
        } else if (currentSection === 'Q4') {
          const productId = tokens[0];
          let priorityLevel = 2;
          if (line.includes('1순위') || line.includes('최우선') || line.includes('P1')) priorityLevel = 1;
          else if (line.includes('3순위') || line.includes('P3')) priorityLevel = 3;
          else if (line.includes('4순위') || line.includes('낮음') || line.includes('P4')) priorityLevel = 4;

          const isUrgent = line.includes('긴급') || line.includes('urgent');
          const reason = tokens.slice(1).join(' ');

          newPrio.push({
            id: `prio-${Date.now()}-${Math.random()}`,
            productId,
            priorityLevel,
            isUrgent,
            reason,
          });
        }
      }
    });

    return {
      productionPlans: newPlans,
      boms: newBoms,
      inventory: newInv,
      priorities: newPrio,
    };
  };

  const handleProcessBatchInput = async () => {
    if (!rawText.trim()) return;

    setIsAiLoading(true);
    setParsedSummary(null);
    setMissingGroups([]);
    setIsSuccess(false);

    try {
      const res = await fetch('/api/gemini/parse-input', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rawText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.productionPlans && data.productionPlans.length > 0) {
          setProductionPlans(
            data.productionPlans.map((p: any, i: number) => ({
              id: `plan-ai-${i}`,
              productId: p.productId,
              targetQty: Number(p.targetQty) || 5000,
              unit: p.unit || 'EA',
              dueDate: p.dueDate || '2026-09-30',
              customer: p.customer || '',
            }))
          );
        }
        if (data.boms && data.boms.length > 0) {
          setBoms(
            data.boms.map((b: any, i: number) => ({
              id: `bom-ai-${i}`,
              productId: b.productId,
              materialId: b.materialId,
              unitUsage: Number(b.unitUsage) || 1.0,
              unit: b.unit || 'EA',
              yield: Number(b.yield) || 100,
              scrapRate: Number(b.scrapRate) || 0,
              alternativeAvailable: Boolean(b.alternativeAvailable),
            }))
          );
        }
        if (data.inventory && data.inventory.length > 0) {
          setInventory(
            data.inventory.map((inv: any, i: number) => ({
              id: `inv-ai-${i}`,
              materialId: inv.materialId,
              onHand: Number(inv.onHand) || 0,
              unit: inv.unit || 'EA',
              scheduledReceipt: Number(inv.scheduledReceipt) || 0,
              safetyStock: Number(inv.safetyStock) || 0,
            }))
          );
        }
        if (data.priorities && data.priorities.length > 0) {
          setPriorities(
            data.priorities.map((p: any, i: number) => ({
              id: `prio-ai-${i}`,
              productId: p.productId,
              priorityLevel: Number(p.priorityLevel) || 2,
              isUrgent: Boolean(p.isUrgent),
              reason: p.reason || '',
            }))
          );
        }

        setParsedSummary(data.summary || '일괄 텍스트 데이터의 구조화가 완료되었습니다.');
        setMissingGroups(data.missingGroups || []);
        setIsSuccess(true);
        setIsAiLoading(false);
        return;
      }
    } catch (err) {
      console.warn('AI Parser endpoint not reachable, running deterministic local parser:', err);
    }

    // Fallback to local deterministic parser
    const localResult = parseLocally(rawText);
    if (localResult.productionPlans.length > 0) setProductionPlans(localResult.productionPlans);
    if (localResult.boms.length > 0) setBoms(localResult.boms);
    if (localResult.inventory.length > 0) setInventory(localResult.inventory);
    if (localResult.priorities.length > 0) setPriorities(localResult.priorities);

    const missing: string[] = [];
    if (localResult.productionPlans.length === 0) missing.push('Q1 (목표 생산량)');
    if (localResult.boms.length === 0) missing.push('Q2 (BOM 소요량)');
    if (localResult.inventory.length === 0) missing.push('Q3 (재고/입고)');
    if (localResult.priorities.length === 0) missing.push('Q4 (우선순위)');

    setMissingGroups(missing);
    setParsedSummary(
      `로컬 파서 분석 완료: 생산계획 ${localResult.productionPlans.length}건, BOM ${localResult.boms.length}건, 재고 ${localResult.inventory.length}건, 우선순위 ${localResult.priorities.length}건 구조화 완료`
    );
    setIsSuccess(true);
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-6">

      {/* Protocol Header (Clean Minimalism) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Fast-Path 일괄 입력 프로토콜</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          스프레드시트 · 표 · 다중 그룹 일괄 입력 (Fast-Path)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          생산계획, BOM, 재고, 우선순위 데이터를 한 번에 붙여넣으면 자동으로 4개 그룹으로 분류하고 "이렇게 이해했습니다" 형태로 요약 확인합니다.
        </p>
      </div>

      {/* Input & Output Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Input Box */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">데이터 붙여넣기 (Paste Area)</h3>
            </div>
            <button
              onClick={handlePasteSample}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
            >
              예시 텍스트 불러오기
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={15}
            placeholder="여기에 스프레드시트 복사 내용이나 텍스트를 붙여넣으세요...&#10;&#10;예시:&#10;Product_A | 10000 EA&#10;Product_A | Wafer_A | 1.0&#10;Wafer_A | 재고 8000 | 입고 3000&#10;Product_A — 최우선"
            className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              구분자(|, 탭, 쉼표, 줄바꿈) 자동 인식 및 정규화
            </span>
            <button
              onClick={handleProcessBatchInput}
              disabled={isAiLoading || !rawText.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-xs transition"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>데이터 구조화 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>일괄 분류 및 구조화 실행</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output & Classification Summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">데이터 분류 및 이해 요약</h3>
          </div>

          {!isSuccess ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-lg text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300" />
              <p>왼쪽에 데이터를 붙여넣고 [일괄 분류 및 구조화 실행]을 누르면<br />4개 그룹 데이터가 실시간으로 분류됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              
              {/* "이렇게 이해했습니다" Confirmation Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>"이렇게 이해했습니다" — 추출 데이터 요약</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed">
                  {parsedSummary}
                </p>
              </div>

              {/* Group Classification Status Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">Q1. 목표 생산량</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {productionPlans.length}개 제품
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {productionPlans.map((p) => p.productId).join(', ') || '누락됨'}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">Q2. BOM 소요량</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {boms.length}개 BOM 항목
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {Array.from(new Set(boms.map((b) => b.materialId))).length}개 소요 자재
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">Q3. 재고 및 입고예정</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {inventory.length}개 재고 자재
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    총 On-hand {inventory.reduce((sum, i) => sum + i.onHand, 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <div className="text-[11px] text-slate-500 font-medium">Q4. 우선순위 및 제약</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {priorities.length}개 우선순위
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    긴급 제품 {priorities.filter((p) => p.isUrgent).length}개
                  </div>
                </div>
              </div>

              {/* Missing Group Pinpoint Warning */}
              {missingGroups.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>누락된 그룹 확인:</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    다음 그룹 데이터가 비어 있습니다: <strong>{missingGroups.join(', ')}</strong>.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                {missingGroups.length > 0 ? (
                  <button
                    onClick={() => {
                      if (missingGroups[0]?.includes('Q1')) onGoToWizardStep(1);
                      else if (missingGroups[0]?.includes('Q2')) onGoToWizardStep(2);
                      else if (missingGroups[0]?.includes('Q3')) onGoToWizardStep(3);
                      else onGoToWizardStep(4);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition"
                  >
                    <span>누락된 항목 이어서 입력하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onGoToDashboard}
                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>실행 대시보드 및 액션 플랜 확인하기</span>
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
