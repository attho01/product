/**
 * Semiconductor Production & MRP Risk Analyzer Types
 */

export interface ProductionPlanItem {
  id: string;
  productId: string;
  targetQty: number;
  unit: string;
  period?: string;
  dueDate?: string;
  line?: string;
  customer?: string;
}

export interface BomItem {
  id: string;
  productId: string;
  materialId: string;
  unitUsage: number; // Unit usage per 1 finished product
  unit: string;
  scrapRate?: number; // % (default 0)
  yield?: number; // % (default 100)
  alternativeAvailable?: boolean;
  supplier?: string;
  leadTimeDays?: number;
}

export interface InventoryItem {
  id: string;
  materialId: string;
  onHand: number;
  unit: string;
  scheduledReceipt?: number;
  receiptDate?: string;
  safetyStock?: number; // default 0
  supplier?: string;
  leadTimeDays?: number;
}

export interface PriorityItem {
  id: string;
  productId: string;
  priorityLevel: number; // 1: 최우선, 2: 높음, 3: 일반, 4: 낮음
  isUrgent?: boolean;
  reason?: string;
  minBatchQty?: number;
  fixedPlan?: boolean;
}

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | '데이터 부족';

export interface MaterialRequirementAnalysis {
  materialId: string;
  unit: string;
  grossRequirement: number;
  adjustedRequirement: number;
  onHand: number;
  scheduledReceipt: number;
  validScheduledReceipt: number;
  netAvailable: number; // (OnHand + ValidScheduledReceipt) - SafetyStock
  shortage: number;
  shortageRate: number; // %
  riskLevel: RiskLevel;
  affectedProducts: string[];
  safetyStock: number;
  leadTimeDays?: number;
  supplier?: string;
  alternativeAvailable?: boolean;
  appliedDefaults: {
    yield100: boolean;
    scrap0: boolean;
    safetyStock0: boolean;
    leadTimeMissing: boolean;
  };
}

export interface ProductFeasibilityAnalysis {
  productId: string;
  targetQty: number;
  feasibleQty: number;
  shortfall: number;
  achievementRate: number; // %
  priorityLevel: number;
  isUrgent: boolean;
  dueDate?: string;
  bottleneckMaterials: {
    materialId: string;
    limitingQty: number;
    availableMaterial: number;
    unitUsage: number;
  }[];
}

export interface ProductionAllocationResult {
  productId: string;
  targetQty: number;
  allocatedQty: number;
  shortfall: number;
  achievementRate: number;
  priorityRank: number;
  isUrgent: boolean;
  constraints: string[];
  reason: string;
  materialConsumption: {
    materialId: string;
    consumedQty: number;
    unit: string;
  }[];
}

export interface ProcurementActionItem {
  id: string;
  materialId: string;
  shortageQty: number;
  unit: string;
  requiredByDate: string;
  leadTime: string;
  alternativeAvailable: string;
  recommendedAction: string;
  priority: '긴급 (Immediate)' | '높음 (High)' | '보통 (Normal)';
  reason: string;
}

export interface ExecutiveSummaryKPI {
  totalProductsCount: number;
  totalMaterialsCount: number;
  targetQtyByUnit: Record<string, number>;
  allocatedQtyByUnit: Record<string, number>;
  overallAchievementRate: number;
  criticalMaterialsCount: number;
  highRiskMaterialsCount: number;
  totalShortageItemsCount: number;
  sufficientMaterialsCount: number;
}

export interface AssumptionsDataLimitations {
  defaultYieldApplied: boolean;
  defaultScrapApplied: boolean;
  defaultSafetyStockApplied: boolean;
  scheduledReceiptPolicy: string;
  leadTimePolicy: string;
  scaleGuardrailActive: boolean;
  totalMaterialCount: number;
  displayedChartCount: number;
  notes: string[];
}

export interface MrpCalculationOutput {
  summary: ExecutiveSummaryKPI;
  materialAnalysis: MaterialRequirementAnalysis[];
  productFeasibility: ProductFeasibilityAnalysis[];
  productionAllocation: ProductionAllocationResult[];
  procurementPlan: ProcurementActionItem[];
  assumptions: AssumptionsDataLimitations;
  validationIssues: ValidationIssue[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  group: 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'CROSS_CHECK';
  field?: string;
  message: string;
  details?: string;
  suggestedAction?: string;
}
