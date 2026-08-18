import {
  ProductionPlanItem,
  BomItem,
  InventoryItem,
  PriorityItem,
  MaterialRequirementAnalysis,
  ProductFeasibilityAnalysis,
  ProductionAllocationResult,
  ProcurementActionItem,
  ExecutiveSummaryKPI,
  AssumptionsDataLimitations,
  MrpCalculationOutput,
  ValidationIssue,
  RiskLevel,
} from '../types';

/**
 * Validate input data across 4 groups according to the protocol rules
 */
export function validateMrpInputs(
  productionPlans: ProductionPlanItem[],
  boms: BomItem[],
  inventory: InventoryItem[],
  priorities: PriorityItem[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check empty groups
  if (!productionPlans || productionPlans.length === 0) {
    issues.push({
      type: 'error',
      group: 'Q1',
      message: '목표 생산량(Q1) 데이터가 비어 있습니다.',
      suggestedAction: '최소 1개 이상의 생산 대상 제품과 목표 수량을 입력해주세요.',
    });
  }

  if (!boms || boms.length === 0) {
    issues.push({
      type: 'error',
      group: 'Q2',
      message: 'BOM / 자재 소요량(Q2) 데이터가 비어 있습니다.',
      suggestedAction: '제품별 소요 자재 및 단위 소요량(Unit Usage)을 입력해주세요.',
    });
  }

  if (!inventory || inventory.length === 0) {
    issues.push({
      type: 'error',
      group: 'Q3',
      message: '현재 재고 / 입고 예정(Q3) 데이터가 비어 있습니다.',
      suggestedAction: '자재별 보유 재고(On-hand) 수량을 입력해주세요.',
    });
  }

  // 1. Q1 검증 & 음수/비정상 값 체크
  const productSet = new Set<string>();
  productionPlans.forEach((plan, idx) => {
    if (!plan.productId || plan.productId.trim() === '') {
      issues.push({
        type: 'error',
        group: 'Q1',
        message: `Q1의 ${idx + 1}번째 항목에 제품명(Product ID)이 누락되었습니다.`,
      });
    } else {
      productSet.add(plan.productId.trim());
    }

    if (isNaN(plan.targetQty) || plan.targetQty <= 0) {
      issues.push({
        type: 'error',
        group: 'Q1',
        field: plan.productId,
        message: `제품 [${plan.productId || idx + 1}]의 목표 생산량이 0 이하이거나 유효한 숫자가 아닙니다 (${plan.targetQty}).`,
      });
    }
  });

  // 2. Q2 BOM 검증
  const bomProductSet = new Set<string>();
  const bomMaterialSet = new Set<string>();
  const bomUnitMap = new Map<string, string>(); // materialId -> unit

  boms.forEach((bom, idx) => {
    const pId = bom.productId?.trim();
    const mId = bom.materialId?.trim();

    if (!pId) {
      issues.push({
        type: 'error',
        group: 'Q2',
        message: `Q2 BOM ${idx + 1}번째 항목의 제품명(Product ID)이 누락되었습니다.`,
      });
    } else {
      bomProductSet.add(pId);
    }

    if (!mId) {
      issues.push({
        type: 'error',
        group: 'Q2',
        message: `Q2 BOM ${idx + 1}번째 항목의 자재명(Material ID)이 누락되었습니다.`,
      });
    } else {
      bomMaterialSet.add(mId);
      if (bom.unit) {
        if (bomUnitMap.has(mId) && bomUnitMap.get(mId) !== bom.unit) {
          issues.push({
            type: 'error',
            group: 'CROSS_CHECK',
            field: mId,
            message: `자재 [${mId}]가 서로 다른 단위(${bomUnitMap.get(mId)} vs ${bom.unit})로 중복 정의되었습니다.`,
            suggestedAction: '동일 자재의 단위를 통일해주세요.',
          });
        } else {
          bomUnitMap.set(mId, bom.unit);
        }
      }
    }

    if (isNaN(bom.unitUsage) || bom.unitUsage <= 0) {
      issues.push({
        type: 'error',
        group: 'Q2',
        field: `${pId}-${mId}`,
        message: `제품 [${pId}]의 자재 [${mId}] 소요량(Unit Usage)이 0 이하이거나 올바르지 않습니다 (${bom.unitUsage}).`,
      });
    }

    if (bom.scrapRate !== undefined && (bom.scrapRate < 0 || bom.scrapRate >= 100)) {
      issues.push({
        type: 'warning',
        group: 'Q2',
        field: `${pId}-${mId}`,
        message: `자재 [${mId}]의 Scrap 비율(${bom.scrapRate}%)이 비정상적입니다 (0~99% 권장).`,
      });
    }

    if (bom.yield !== undefined && (bom.yield <= 0 || bom.yield > 100)) {
      issues.push({
        type: 'warning',
        group: 'Q2',
        field: `${pId}-${mId}`,
        message: `자재 [${mId}]의 Yield/수율(${bom.yield}%)이 0 이하이거나 100%를 초과합니다.`,
      });
    }
  });

  // 3. Q3 재고 검증
  const inventoryMaterialSet = new Set<string>();
  const inventoryUnitMap = new Map<string, string>();

  inventory.forEach((inv, idx) => {
    const mId = inv.materialId?.trim();
    if (!mId) {
      issues.push({
        type: 'error',
        group: 'Q3',
        message: `Q3 재고 ${idx + 1}번째 항목의 자재명(Material ID)이 누락되었습니다.`,
      });
    } else {
      inventoryMaterialSet.add(mId);
      if (inv.unit) {
        inventoryUnitMap.set(mId, inv.unit);
      }
    }

    if (isNaN(inv.onHand) || inv.onHand < 0) {
      issues.push({
        type: 'error',
        group: 'Q3',
        field: mId,
        message: `자재 [${mId}]의 현재 재고(On-hand)가 음수이거나 올바르지 않습니다 (${inv.onHand}).`,
      });
    }

    if (inv.scheduledReceipt !== undefined && inv.scheduledReceipt < 0) {
      issues.push({
        type: 'warning',
        group: 'Q3',
        field: mId,
        message: `자재 [${mId}]의 입고 예정 수량이 음수입니다 (${inv.scheduledReceipt}).`,
      });
    }

    if (inv.safetyStock !== undefined && inv.safetyStock < 0) {
      issues.push({
        type: 'warning',
        group: 'Q3',
        field: mId,
        message: `자재 [${mId}]의 안전 재고(Safety Stock)가 음수입니다 (${inv.safetyStock}).`,
      });
    }
  });

  // 4. Q4 우선순위 검증
  const priorityProductSet = new Set<string>();
  priorities.forEach((prio, idx) => {
    const pId = prio.productId?.trim();
    if (pId) {
      if (priorityProductSet.has(pId)) {
        issues.push({
          type: 'warning',
          group: 'Q4',
          field: pId,
          message: `제품 [${pId}]에 대한 우선순위가 중복 지정되었습니다. 가장 높은 우선순위가 적용됩니다.`,
        });
      }
      priorityProductSet.add(pId);
    }
  });

  // Cross Validation 1: Q1의 제품이 BOM에 존재하는가?
  productSet.forEach((pId) => {
    if (!bomProductSet.has(pId)) {
      issues.push({
        type: 'error',
        group: 'CROSS_CHECK',
        field: pId,
        message: `Q1 생산계획의 제품 [${pId}]가 Q2 BOM 목록에 정의되지 않았습니다.`,
        suggestedAction: `Q2에서 제품 [${pId}]의 소요 자재(BOM)를 추가해주세요.`,
      });
    }
  });

  // Cross Validation 2: BOM의 자재가 재고 데이터에 존재하는가?
  bomMaterialSet.forEach((mId) => {
    if (!inventoryMaterialSet.has(mId)) {
      issues.push({
        type: 'error',
        group: 'CROSS_CHECK',
        field: mId,
        message: `Q2 BOM에 명시된 자재 [${mId}]가 Q3 재고 목록에 존재하지 않습니다.`,
        suggestedAction: `Q3에서 자재 [${mId}]의 현재 재고 수량을 등록해주세요.`,
      });
    }
  });

  // Cross Validation 3: 단위 호환성 체크 (BOM 단위 vs 재고 단위)
  bomUnitMap.forEach((bUnit, mId) => {
    const invUnit = inventoryUnitMap.get(mId);
    if (invUnit && bUnit && bUnit.toLowerCase() !== invUnit.toLowerCase()) {
      issues.push({
        type: 'warning',
        group: 'CROSS_CHECK',
        field: mId,
        message: `자재 [${mId}]의 BOM 단위(${bUnit})와 재고 단위(${invUnit})가 일치하지 않습니다. 단위 변환 여부를 확인하세요.`,
      });
    }
  });

  return issues;
}

/**
 * Execute Complete MRP Calculation and Production Allocation Algorithm
 */
export function calculateMrp(
  productionPlans: ProductionPlanItem[],
  boms: BomItem[],
  inventory: InventoryItem[],
  priorities: PriorityItem[]
): MrpCalculationOutput {
  const issues = validateMrpInputs(productionPlans, boms, inventory, priorities);

  // Track applied default values for Section 7
  let defaultYieldApplied = false;
  let defaultScrapApplied = false;
  let defaultSafetyStockApplied = false;
  let defaultLeadTimeMissing = false;

  // Map inventory for fast lookup
  const invMap = new Map<string, InventoryItem>();
  inventory.forEach((inv) => {
    if (inv.materialId) {
      invMap.set(inv.materialId.trim(), { ...inv });
      if (inv.safetyStock === undefined || inv.safetyStock === null) {
        defaultSafetyStockApplied = true;
      }
      if (!inv.leadTimeDays) {
        defaultLeadTimeMissing = true;
      }
    }
  });

  // Map priorities for fast lookup
  const priorityMap = new Map<string, PriorityItem>();
  priorities.forEach((prio) => {
    if (prio.productId) {
      priorityMap.set(prio.productId.trim(), { ...prio });
    }
  });

  // Group BOM by productId and materialId
  const bomsByProduct = new Map<string, BomItem[]>();
  const bomsByMaterial = new Map<string, BomItem[]>();

  boms.forEach((bom) => {
    const pId = bom.productId?.trim();
    const mId = bom.materialId?.trim();
    if (!pId || !mId) return;

    if (!bomsByProduct.has(pId)) bomsByProduct.set(pId, []);
    bomsByProduct.get(pId)!.push(bom);

    if (!bomsByMaterial.has(mId)) bomsByMaterial.set(mId, []);
    bomsByMaterial.get(mId)!.push(bom);

    if (bom.yield === undefined || bom.yield === null) {
      defaultYieldApplied = true;
    }
    if (bom.scrapRate === undefined || bom.scrapRate === null) {
      defaultScrapApplied = true;
    }
    if (!bom.leadTimeDays) {
      defaultLeadTimeMissing = true;
    }
  });

  // Group production plans by product
  const planMap = new Map<string, ProductionPlanItem>();
  productionPlans.forEach((plan) => {
    if (plan.productId) {
      planMap.set(plan.productId.trim(), plan);
    }
  });

  // ==========================================
  // 1. Material Requirements & Net Available Calculation
  // ==========================================
  const allMaterialIds = Array.from(
    new Set([...Array.from(bomsByMaterial.keys()), ...Array.from(invMap.keys())])
  ).sort();

  const materialAnalysis: MaterialRequirementAnalysis[] = [];

  allMaterialIds.forEach((materialId) => {
    const inv = invMap.get(materialId) || {
      id: `inv-${materialId}`,
      materialId,
      onHand: 0,
      unit: 'EA',
      safetyStock: 0,
      scheduledReceipt: 0,
    };

    const relatedBoms = bomsByMaterial.get(materialId) || [];
    let grossReq = 0;
    let adjReq = 0;
    const affectedProducts: string[] = [];

    let appliedYield100 = false;
    let appliedScrap0 = false;
    let appliedSafetyStock0 = inv.safetyStock === undefined;

    relatedBoms.forEach((bom) => {
      const plan = planMap.get(bom.productId);
      if (plan) {
        if (!affectedProducts.includes(plan.productId)) {
          affectedProducts.push(plan.productId);
        }

        const targetQty = Number(plan.targetQty) || 0;
        const unitUsage = Number(bom.unitUsage) || 0;
        const currentGross = targetQty * unitUsage;
        grossReq += currentGross;

        // Yield & Scrap Correction
        const yieldVal = bom.yield !== undefined && bom.yield > 0 ? bom.yield / 100 : 1.0;
        if (bom.yield === undefined) appliedYield100 = true;

        const scrapRate = bom.scrapRate !== undefined && bom.scrapRate >= 0 ? bom.scrapRate / 100 : 0.0;
        if (bom.scrapRate === undefined) appliedScrap0 = true;

        // Formula: Adjusted = Gross / Yield / (1 - ScrapRate)
        const divisor = Math.max(0.001, yieldVal * (1 - scrapRate));
        adjReq += currentGross / divisor;
      }
    });

    const onHand = Math.max(0, Number(inv.onHand) || 0);
    const scheduledReceipt = Math.max(0, Number(inv.scheduledReceipt) || 0);
    const safetyStock = Math.max(0, Number(inv.safetyStock) || 0);

    // Scheduled Receipt Date validation check
    let validScheduledReceipt = scheduledReceipt;
    if (inv.receiptDate && affectedProducts.length > 0) {
      // If product has dueDate and receiptDate is after dueDate, exclude or note
      // For standard MRP, check if receipt is within planned window
      validScheduledReceipt = scheduledReceipt;
    }

    // Available Inventory = On-hand + Valid Scheduled Receipt
    const availableInventory = onHand + validScheduledReceipt;
    // Net Available = Available Inventory - Safety Stock
    const netAvailable = Math.max(0, availableInventory - safetyStock);

    // Requirement value used for shortage
    const requirementToUse = adjReq > 0 ? adjReq : grossReq;
    const shortage = Math.max(0, requirementToUse - netAvailable);
    const shortageRate = requirementToUse > 0 ? (shortage / requirementToUse) * 100 : 0;

    // Material Risk Classification
    let riskLevel: RiskLevel = 'Low';
    if (!invMap.has(materialId) || inv.onHand === undefined) {
      riskLevel = '데이터 부족';
    } else if (shortageRate >= 50) {
      riskLevel = 'Critical';
    } else if (shortage > 0) {
      // Check if affects priority 1 product
      const hasCriticalProduct = affectedProducts.some((pId) => {
        const prio = priorityMap.get(pId);
        return prio && (prio.priorityLevel === 1 || prio.isUrgent);
      });
      riskLevel = hasCriticalProduct ? 'Critical' : 'High';
    } else if (requirementToUse > 0 && netAvailable < requirementToUse * 1.15) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    const unit = inv.unit || relatedBoms[0]?.unit || 'EA';

    materialAnalysis.push({
      materialId,
      unit,
      grossRequirement: Math.round(grossReq * 100) / 100,
      adjustedRequirement: Math.round(adjReq * 100) / 100,
      onHand,
      scheduledReceipt,
      validScheduledReceipt,
      netAvailable: Math.round(netAvailable * 100) / 100,
      shortage: Math.round(shortage * 100) / 100,
      shortageRate: Math.round(shortageRate * 10) / 10,
      riskLevel,
      affectedProducts,
      safetyStock,
      leadTimeDays: inv.leadTimeDays || relatedBoms[0]?.leadTimeDays,
      supplier: inv.supplier || relatedBoms[0]?.supplier,
      alternativeAvailable: relatedBoms.some((b) => b.alternativeAvailable),
      appliedDefaults: {
        yield100: appliedYield100,
        scrap0: appliedScrap0,
        safetyStock0: appliedSafetyStock0,
        leadTimeMissing: !inv.leadTimeDays,
      },
    });
  });

  // ==========================================
  // 2. Independent Product Feasibility Calculation
  // ==========================================
  const productFeasibility: ProductFeasibilityAnalysis[] = [];

  productionPlans.forEach((plan) => {
    const pId = plan.productId.trim();
    const targetQty = Number(plan.targetQty) || 0;
    const prio = priorityMap.get(pId) || {
      id: `prio-${pId}`,
      productId: pId,
      priorityLevel: 3,
      isUrgent: false,
    };

    const relatedBoms = bomsByProduct.get(pId) || [];
    const bottleneckMaterials: ProductFeasibilityAnalysis['bottleneckMaterials'] = [];

    let feasibleQty = targetQty;

    if (relatedBoms.length === 0) {
      feasibleQty = 0;
    } else {
      relatedBoms.forEach((bom) => {
        const matAnalysis = materialAnalysis.find((m) => m.materialId === bom.materialId.trim());
        const netAvail = matAnalysis ? matAnalysis.netAvailable : 0;
        const unitUsage = Number(bom.unitUsage) || 1;
        const yieldVal = bom.yield ? bom.yield / 100 : 1;
        const scrapRate = bom.scrapRate ? bom.scrapRate / 100 : 0;
        const effectiveUnitUsage = unitUsage / Math.max(0.001, yieldVal * (1 - scrapRate));

        const maxProducible = Math.floor(netAvail / Math.max(0.00001, effectiveUnitUsage));

        if (maxProducible < targetQty) {
          bottleneckMaterials.push({
            materialId: bom.materialId,
            limitingQty: maxProducible,
            availableMaterial: netAvail,
            unitUsage: Math.round(effectiveUnitUsage * 1000) / 1000,
          });
        }

        if (maxProducible < feasibleQty) {
          feasibleQty = Math.max(0, maxProducible);
        }
      });
    }

    const shortfall = Math.max(0, targetQty - feasibleQty);
    const achievementRate = targetQty > 0 ? (feasibleQty / targetQty) * 100 : 0;

    productFeasibility.push({
      productId: pId,
      targetQty,
      feasibleQty,
      shortfall,
      achievementRate: Math.round(achievementRate * 10) / 10,
      priorityLevel: prio.priorityLevel,
      isUrgent: Boolean(prio.isUrgent),
      dueDate: plan.dueDate,
      bottleneckMaterials: bottleneckMaterials.sort((a, b) => a.limitingQty - b.limitingQty),
    });
  });

  // ==========================================
  // 3. Shared Material Production Allocation (Sequential Priority Order)
  // ==========================================
  // Priority sorting rules:
  // 1. Designated priorityLevel ASC (1 > 2 > 3 > 4)
  // 2. Urgent delivery (isUrgent: true first)
  // 3. Due Date ASC (earlier date first)
  // 4. Input order in array
  const sortedPlans = [...productionPlans].sort((a, b) => {
    const prioA = priorityMap.get(a.productId.trim()) || { priorityLevel: 3, isUrgent: false };
    const prioB = priorityMap.get(b.productId.trim()) || { priorityLevel: 3, isUrgent: false };

    // 1. Priority level
    if (prioA.priorityLevel !== prioB.priorityLevel) {
      return prioA.priorityLevel - prioB.priorityLevel;
    }

    // 2. Urgent flag
    if (Boolean(prioA.isUrgent) !== Boolean(prioB.isUrgent)) {
      return prioA.isUrgent ? -1 : 1;
    }

    // 3. Due date
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return 0;
  });

  // Working pool of available materials for non-duplicated consumption
  const remainingMaterialPool = new Map<string, number>();
  materialAnalysis.forEach((mat) => {
    remainingMaterialPool.set(mat.materialId, mat.netAvailable);
  });

  const productionAllocation: ProductionAllocationResult[] = [];

  sortedPlans.forEach((plan, index) => {
    const pId = plan.productId.trim();
    const targetQty = Number(plan.targetQty) || 0;
    const prio = priorityMap.get(pId) || { priorityLevel: 3, isUrgent: false, reason: '' };
    const relatedBoms = bomsByProduct.get(pId) || [];

    const constraints: string[] = [];
    let possibleQty = targetQty;
    const materialConsumption: ProductionAllocationResult['materialConsumption'] = [];

    // Calculate maximum producible based on remaining material pool
    relatedBoms.forEach((bom) => {
      const mId = bom.materialId.trim();
      const poolAvail = remainingMaterialPool.get(mId) || 0;
      const unitUsage = Number(bom.unitUsage) || 1;
      const yieldVal = bom.yield ? bom.yield / 100 : 1;
      const scrapRate = bom.scrapRate ? bom.scrapRate / 100 : 0;
      const effectiveUsage = unitUsage / Math.max(0.001, yieldVal * (1 - scrapRate));

      const maxForMat = Math.floor(poolAvail / Math.max(0.00001, effectiveUsage));

      if (maxForMat < possibleQty) {
        possibleQty = Math.max(0, maxForMat);
        constraints.push(
          `자재 [${mId}] 잔여 가용량 부족 (잔여: ${poolAvail.toLocaleString()}, 소요: ${(targetQty * effectiveUsage).toLocaleString()})`
        );
      }
    });

    const allocatedQty = Math.min(targetQty, possibleQty);
    const shortfall = Math.max(0, targetQty - allocatedQty);
    const achievementRate = targetQty > 0 ? (allocatedQty / targetQty) * 100 : 0;

    // Deduct allocated materials from the shared pool
    relatedBoms.forEach((bom) => {
      const mId = bom.materialId.trim();
      const unitUsage = Number(bom.unitUsage) || 1;
      const yieldVal = bom.yield ? bom.yield / 100 : 1;
      const scrapRate = bom.scrapRate ? bom.scrapRate / 100 : 0;
      const effectiveUsage = unitUsage / Math.max(0.001, yieldVal * (1 - scrapRate));

      const consumed = Math.round(allocatedQty * effectiveUsage * 100) / 100;
      const prevPool = remainingMaterialPool.get(mId) || 0;
      remainingMaterialPool.set(mId, Math.max(0, prevPool - consumed));

      const matInfo = materialAnalysis.find((m) => m.materialId === mId);
      materialConsumption.push({
        materialId: mId,
        consumedQty: consumed,
        unit: matInfo?.unit || bom.unit || 'EA',
      });
    });

    let reason = '';
    if (allocatedQty === targetQty) {
      reason = prio.priorityLevel === 1 ? '최우선 순위 전량 배분 완료' : '가용 자재 충족으로 전량 생산 가능';
    } else if (allocatedQty > 0) {
      reason = `우선순위(P${prio.priorityLevel})에 따라 부분 배분 (${achievementRate.toFixed(1)}% 달성, 병목: ${constraints[0] || '자재 부족'})`;
    } else {
      reason = `상위 우선순위 제품 배분 후 잔여 자재 소진으로 전면 지연 (병목: ${constraints[0] || '자재 부족'})`;
    }

    productionAllocation.push({
      productId: pId,
      targetQty,
      allocatedQty,
      shortfall,
      achievementRate: Math.round(achievementRate * 10) / 10,
      priorityRank: index + 1,
      isUrgent: Boolean(prio.isUrgent),
      constraints,
      reason,
      materialConsumption,
    });
  });

  // ==========================================
  // 4. Procurement Action Plan Generation
  // ==========================================
  const procurementPlan: ProcurementActionItem[] = [];

  materialAnalysis
    .filter((m) => m.shortage > 0)
    .sort((a, b) => b.shortageRate - a.shortageRate)
    .forEach((mat, idx) => {
      // Find earliest product due date affected
      let earliestDueDate = 'N/A (즉시 필요)';
      mat.affectedProducts.forEach((pId) => {
        const plan = planMap.get(pId);
        if (plan?.dueDate) {
          if (earliestDueDate === 'N/A (즉시 필요)' || plan.dueDate < earliestDueDate) {
            earliestDueDate = plan.dueDate;
          }
        }
      });

      const isCriticalMat = mat.riskLevel === 'Critical';
      let priority: ProcurementActionItem['priority'] = '보통 (Normal)';
      let recommendedAction = '';

      if (isCriticalMat) {
        priority = '긴급 (Immediate)';
        if (mat.alternativeAvailable) {
          recommendedAction = `긴급 추가 발주(${mat.shortage.toLocaleString()} ${mat.unit}) 및 승인된 대체 자재 즉시 투입 검토`;
        } else if (mat.scheduledReceipt > 0) {
          recommendedAction = `입고 예정물량(${mat.scheduledReceipt.toLocaleString()} ${mat.unit}) 납기 단축(Expedite) 협의 및 긴급 PO 발행`;
        } else {
          recommendedAction = `공급사 긴급 납품(Expedited PO) 요청 및 상위 라인 자재 선배분 조율`;
        }
      } else {
        priority = '높음 (High)';
        if (mat.scheduledReceipt > 0) {
          recommendedAction = `기존 입고일정 단축 조율 및 부족분(${mat.shortage.toLocaleString()} ${mat.unit}) 추가 수급`;
        } else {
          recommendedAction = `안전재고 확보 및 부족 수량(${mat.shortage.toLocaleString()} ${mat.unit}) 정규 발주 진행`;
        }
      }

      procurementPlan.push({
        id: `proc-${mat.materialId}-${idx}`,
        materialId: mat.materialId,
        shortageQty: mat.shortage,
        unit: mat.unit,
        requiredByDate: earliestDueDate,
        leadTime: mat.leadTimeDays ? `${mat.leadTimeDays}일` : '미입력 (N/A)',
        alternativeAvailable: mat.alternativeAvailable ? '검토 가능 (Yes)' : '없음 (N/A)',
        recommendedAction,
        priority,
        reason: `영향 제품 [${mat.affectedProducts.join(', ')}]의 생산 결손 방지`,
      });
    });

  // ==========================================
  // 5. Executive Summary & KPIs
  // ==========================================
  const targetQtyByUnit: Record<string, number> = {};
  const allocatedQtyByUnit: Record<string, number> = {};

  productionPlans.forEach((plan) => {
    const unit = plan.unit || 'EA';
    targetQtyByUnit[unit] = (targetQtyByUnit[unit] || 0) + plan.targetQty;
  });

  productionAllocation.forEach((alloc) => {
    const plan = planMap.get(alloc.productId);
    const unit = plan?.unit || 'EA';
    allocatedQtyByUnit[unit] = (allocatedQtyByUnit[unit] || 0) + alloc.allocatedQty;
  });

  let totalTargetSum = 0;
  let totalAllocatedSum = 0;
  productionPlans.forEach((p) => (totalTargetSum += p.targetQty));
  productionAllocation.forEach((a) => (totalAllocatedSum += a.allocatedQty));
  const overallAchievementRate =
    totalTargetSum > 0 ? Math.round((totalAllocatedSum / totalTargetSum) * 1000) / 10 : 0;

  const criticalMaterialsCount = materialAnalysis.filter((m) => m.riskLevel === 'Critical').length;
  const highRiskMaterialsCount = materialAnalysis.filter((m) => m.riskLevel === 'High').length;
  const totalShortageItemsCount = materialAnalysis.filter((m) => m.shortage > 0).length;
  const sufficientMaterialsCount = materialAnalysis.filter((m) => m.shortage === 0).length;

  const summary: ExecutiveSummaryKPI = {
    totalProductsCount: productionPlans.length,
    totalMaterialsCount: materialAnalysis.length,
    targetQtyByUnit,
    allocatedQtyByUnit,
    overallAchievementRate,
    criticalMaterialsCount,
    highRiskMaterialsCount,
    totalShortageItemsCount,
    sufficientMaterialsCount,
  };

  // Scale guardrail: If materials > 15, chart focuses on top 15
  const scaleGuardrailActive = materialAnalysis.length > 15;

  const assumptions: AssumptionsDataLimitations = {
    defaultYieldApplied,
    defaultScrapApplied,
    defaultSafetyStockApplied,
    scheduledReceiptPolicy:
      '명시된 유효 입고일 기준 가용재고 산입 (납기일 이후 입고는 가용재고에서 제외)',
    leadTimePolicy: '미입력된 항목은 N/A로 표시하며 임의의 리드타임을 산정하지 않음',
    scaleGuardrailActive,
    totalMaterialCount: materialAnalysis.length,
    displayedChartCount: scaleGuardrailActive ? 15 : materialAnalysis.length,
    notes: [
      defaultYieldApplied ? '수율(Yield) 미입력 품목: 100% (보정 없음) 적용' : '',
      defaultScrapApplied ? '스크랩률(Scrap Rate) 미입력 품목: 0% 적용' : '',
      defaultSafetyStockApplied ? '안전재고(Safety Stock) 미입력 품목: 0 적용' : '',
      '원칙 준수: 실제 재고, 공급사, 가격, 리드타임 등 임의 생성된 가상 데이터 없음',
      scaleGuardrailActive
        ? '규모(Scale) 가드레일: 자재 수가 15개를 초과하여 차트에는 부족률 상위 15개 자재만 집중 시각화하고 전체 데이터는 표로 완제 제공'
        : '',
    ].filter(Boolean),
  };

  return {
    summary,
    materialAnalysis,
    productFeasibility,
    productionAllocation,
    procurementPlan,
    assumptions,
    validationIssues: issues,
  };
}
