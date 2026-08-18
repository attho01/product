import React, { useState } from 'react';
import {
  ProductionPlanItem,
  BomItem,
  InventoryItem,
  PriorityItem,
} from '../types';
import { Plus, Trash2, Layers, Cpu, Package, AlertCircle } from 'lucide-react';

interface DataStudioGridProps {
  productionPlans: ProductionPlanItem[];
  setProductionPlans: React.Dispatch<React.SetStateAction<ProductionPlanItem[]>>;
  boms: BomItem[];
  setBoms: React.Dispatch<React.SetStateAction<BomItem[]>>;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  priorities: PriorityItem[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityItem[]>>;
}

export const DataStudioGrid: React.FC<DataStudioGridProps> = ({
  productionPlans,
  setProductionPlans,
  boms,
  setBoms,
  inventory,
  setInventory,
  priorities,
  setPriorities,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'q1' | 'q2' | 'q3' | 'q4'>('q1');

  return (
    <div className="space-y-4">
      {/* Tab Switcher for the 4 Data Groups */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveSubTab('q1')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'q1'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Q1. 생산계획 ({productionPlans.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('q2')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'q2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Q2. BOM 소요량 ({boms.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('q3')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'q3'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Q3. 재고/입고 ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('q4')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeSubTab === 'q4'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Q4. 우선순위 ({priorities.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500">
          모든 변경사항은 MRP 계산 및 대시보드에 실시간 즉시 반영됩니다.
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Q1 TABLE */}
        {activeSubTab === 'q1' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Q1. 목표 생산량 / 생산계획 편집</h3>
              <button
                onClick={() =>
                  setProductionPlans([
                    ...productionPlans,
                    {
                      id: `plan-${Date.now()}`,
                      productId: `New_Product_${productionPlans.length + 1}`,
                      targetQty: 5000,
                      unit: 'EA',
                      dueDate: '2026-09-30',
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>행 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">제품명 (Product ID)</th>
                    <th className="p-3">목표 생산량 (Target Qty)</th>
                    <th className="p-3">단위 (Unit)</th>
                    <th className="p-3">납기일 (Due Date)</th>
                    <th className="p-3">고객사 / 라인</th>
                    <th className="p-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {productionPlans.map((plan, idx) => (
                    <tr key={plan.id || idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={plan.productId}
                          onChange={(e) => {
                            const updated = [...productionPlans];
                            updated[idx].productId = e.target.value;
                            setProductionPlans(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={plan.targetQty}
                          onChange={(e) => {
                            const updated = [...productionPlans];
                            updated[idx].targetQty = Number(e.target.value);
                            setProductionPlans(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={plan.unit || 'EA'}
                          onChange={(e) => {
                            const updated = [...productionPlans];
                            updated[idx].unit = e.target.value;
                            setProductionPlans(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={plan.dueDate || ''}
                          onChange={(e) => {
                            const updated = [...productionPlans];
                            updated[idx].dueDate = e.target.value;
                            setProductionPlans(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={plan.customer || ''}
                          onChange={(e) => {
                            const updated = [...productionPlans];
                            updated[idx].customer = e.target.value;
                            setProductionPlans(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setProductionPlans(productionPlans.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Q2 TABLE */}
        {activeSubTab === 'q2' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Q2. BOM / 자재 소요량 편집</h3>
              <button
                onClick={() =>
                  setBoms([
                    ...boms,
                    {
                      id: `bom-${Date.now()}`,
                      productId: productionPlans[0]?.productId || 'Product_A',
                      materialId: `New_Material_${boms.length + 1}`,
                      unitUsage: 1.0,
                      unit: 'EA',
                      yield: 100,
                      scrapRate: 0,
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>BOM 행 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">대상 제품 (Product)</th>
                    <th className="p-3">자재명 (Material ID)</th>
                    <th className="p-3">단위소요량 (Unit Usage)</th>
                    <th className="p-3">단위 (Unit)</th>
                    <th className="p-3">수율 (Yield %)</th>
                    <th className="p-3">스크랩 (Scrap %)</th>
                    <th className="p-3">대체재 여부</th>
                    <th className="p-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {boms.map((bom, idx) => (
                    <tr key={bom.id || idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={bom.productId}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].productId = e.target.value;
                            setBoms(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={bom.materialId}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].materialId = e.target.value;
                            setBoms(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={bom.unitUsage}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].unitUsage = Number(e.target.value);
                            setBoms(updated);
                          }}
                          className="w-24 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={bom.unit || 'EA'}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].unit = e.target.value;
                            setBoms(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={bom.yield ?? 100}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].yield = Number(e.target.value);
                            setBoms(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={bom.scrapRate ?? 0}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].scrapRate = Number(e.target.value);
                            setBoms(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={bom.alternativeAvailable || false}
                          onChange={(e) => {
                            const updated = [...boms];
                            updated[idx].alternativeAvailable = e.target.checked;
                            setBoms(updated);
                          }}
                          className="rounded bg-slate-50 border-slate-300 text-blue-600"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setBoms(boms.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Q3 TABLE */}
        {activeSubTab === 'q3' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Q3. 현재 재고 / 입고 예정 편집</h3>
              <button
                onClick={() =>
                  setInventory([
                    ...inventory,
                    {
                      id: `inv-${Date.now()}`,
                      materialId: `New_Material_${inventory.length + 1}`,
                      onHand: 10000,
                      unit: 'EA',
                      scheduledReceipt: 0,
                      safetyStock: 0,
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>재고 행 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">자재명 (Material ID)</th>
                    <th className="p-3">현재고 (On-hand)</th>
                    <th className="p-3">단위 (Unit)</th>
                    <th className="p-3">입고예정 (Scheduled)</th>
                    <th className="p-3">안전재고 (Safety Stock)</th>
                    <th className="p-3">리드타임 (일)</th>
                    <th className="p-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {inventory.map((inv, idx) => (
                    <tr key={inv.id || idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={inv.materialId}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].materialId = e.target.value;
                            setInventory(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={inv.onHand}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].onHand = Number(e.target.value);
                            setInventory(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={inv.unit || 'EA'}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].unit = e.target.value;
                            setInventory(updated);
                          }}
                          className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={inv.scheduledReceipt ?? 0}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].scheduledReceipt = Number(e.target.value);
                            setInventory(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={inv.safetyStock ?? 0}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].safetyStock = Number(e.target.value);
                            setInventory(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={inv.leadTimeDays ?? ''}
                          onChange={(e) => {
                            const updated = [...inventory];
                            updated[idx].leadTimeDays = e.target.value ? Number(e.target.value) : undefined;
                            setInventory(updated);
                          }}
                          placeholder="N/A"
                          className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 text-center focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setInventory(inventory.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Q4 TABLE */}
        {activeSubTab === 'q4' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Q4. 생산 우선순위 및 운영 제약조건 편집</h3>
              <button
                onClick={() =>
                  setPriorities([
                    ...priorities,
                    {
                      id: `prio-${Date.now()}`,
                      productId: productionPlans[0]?.productId || 'Product_A',
                      priorityLevel: 2,
                      isUrgent: false,
                    },
                  ])
                }
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>우선순위 행 추가</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-3">대상 제품 (Product)</th>
                    <th className="p-3">우선순위 등급 (1~4)</th>
                    <th className="p-3 text-center">긴급 납기 (Urgent)</th>
                    <th className="p-3 text-center">고정 계획 (Fixed)</th>
                    <th className="p-3">사유 및 제약조건</th>
                    <th className="p-3 text-center">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {priorities.map((prio, idx) => (
                    <tr key={prio.id || idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <input
                          type="text"
                          value={prio.productId}
                          onChange={(e) => {
                            const updated = [...priorities];
                            updated[idx].productId = e.target.value;
                            setPriorities(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={prio.priorityLevel}
                          onChange={(e) => {
                            const updated = [...priorities];
                            updated[idx].priorityLevel = Number(e.target.value);
                            setPriorities(updated);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                        >
                          <option value="1">1순위 (최우선 P1)</option>
                          <option value="2">2순위 (높음 P2)</option>
                          <option value="3">3순위 (일반 P3)</option>
                          <option value="4">4순위 (낮음 P4)</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={prio.isUrgent || false}
                          onChange={(e) => {
                            const updated = [...priorities];
                            updated[idx].isUrgent = e.target.checked;
                            setPriorities(updated);
                          }}
                          className="rounded bg-slate-50 border-slate-300 text-red-600"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={prio.fixedPlan || false}
                          onChange={(e) => {
                            const updated = [...priorities];
                            updated[idx].fixedPlan = e.target.checked;
                            setPriorities(updated);
                          }}
                          className="rounded bg-slate-50 border-slate-300 text-blue-600"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={prio.reason || ''}
                          onChange={(e) => {
                            const updated = [...priorities];
                            updated[idx].reason = e.target.value;
                            setPriorities(updated);
                          }}
                          placeholder="제약 사유"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-900 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => setPriorities(priorities.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
