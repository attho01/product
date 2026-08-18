import { MrpCalculationOutput } from '../types';

/**
 * Escape HTML special characters for XSS prevention
 */
function escapeHtml(str: string | number | undefined | null): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate complete, standalone single-file HTML report
 */
export function generateSingleFileHtmlDashboard(
  mrpData: MrpCalculationOutput,
  reportTitle: string = '반도체 생산·자재(MRP) 리스크 분석 대시보드'
): string {
  const jsonDataString = JSON.stringify(mrpData).replace(/</g, '\\u003c');
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(reportTitle)}</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Chart.js CDN -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    * { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif; }
    .badge-critical { background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .badge-high { background-color: #ffedd5; color: #9a3412; border: 1px solid #fb923c; }
    .badge-medium { background-color: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge-low { background-color: #dcfce7; color: #166534; border: 1px solid #86efac; }
    .badge-missing { background-color: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }
    .table-container { overflow-x: auto; max-width: 100%; }
    th { position: sticky; top: 0; background: #f8fafc; z-index: 10; }
  </style>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
  <!-- Top Navigation & Header -->
  <header class="bg-slate-950 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-lg">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-cyan-600 rounded-lg text-white shadow-cyan-900/50 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-bold text-slate-50 tracking-tight">${escapeHtml(reportTitle)}</h1>
          <p class="text-xs text-slate-400">반도체 생산계획 · BOM 소요량 · 가용재고 및 공급망 리스크 최적화 리포트</p>
        </div>
      </div>
      <div class="flex items-center gap-3 text-xs text-slate-400">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          분석 완료: <span class="text-slate-200 font-mono">${escapeHtml(now)}</span>
        </span>
        <button onclick="window.print()" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition">
          인쇄 / PDF 저장
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">

    <!-- Section 1. Executive Summary (KPIs) -->
    <section id="section-1" class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 1</span>
          <h2 class="text-lg font-bold text-slate-100">Executive Summary (총괄 성과 지표)</h2>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-container">
        <!-- KPI Cards will be injected by JavaScript -->
      </div>
    </section>

    <!-- Section 3. Inventory vs Requirement Chart (Placed visually near top for executive overview) -->
    <section id="section-3" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 3</span>
          <h2 class="text-base font-bold text-slate-100">Inventory vs Requirement (소요량 대비 가용재고 분석)</h2>
        </div>
        <div class="text-xs text-slate-400" id="chart-guardrail-notice"></div>
      </div>
      <div class="relative h-72 md:h-80 w-full">
        <canvas id="inventoryRequirementChart"></canvas>
      </div>
    </section>

    <!-- Section 2. Material Risk Overview -->
    <section id="section-2" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 2</span>
          <h2 class="text-base font-bold text-slate-100">Material Risk Overview (자재별 수급 리스크 상세)</h2>
        </div>
        <!-- Search and Filter Controls -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <input type="text" id="mat-search-input" placeholder="자재명 검색..." class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500">
          <select id="risk-filter-select" class="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500">
            <option value="ALL">전체 위험도 보기</option>
            <option value="Critical">Critical (심각 결손)</option>
            <option value="High">High (부족 발생)</option>
            <option value="Medium">Medium (버퍼 주의)</option>
            <option value="Low">Low (충족)</option>
          </select>
        </div>
      </div>

      <div class="table-container border border-slate-800 rounded-lg">
        <table class="w-full text-left text-xs border-collapse" id="material-risk-table">
          <thead>
            <tr class="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
              <th class="p-3">자재명 (Material ID)</th>
              <th class="p-3 text-right">총 소요량 (Req)</th>
              <th class="p-3 text-right">현재고 (On-hand)</th>
              <th class="p-3 text-right">입고예정 (Scheduled)</th>
              <th class="p-3 text-right">순가용재고 (Net Avail)</th>
              <th class="p-3 text-right">부족량 (Shortage)</th>
              <th class="p-3 text-right">부족률 (%)</th>
              <th class="p-3 text-center">위험도 (Risk Level)</th>
              <th class="p-3">영향 제품 (Affected Products)</th>
            </tr>
          </thead>
          <tbody id="material-risk-tbody" class="divide-y divide-slate-800/60 font-mono text-slate-300">
            <!-- Table rows injected by JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- Grid: Section 4 & Section 5 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Section 4. Production Feasibility -->
      <section id="section-4" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 4</span>
          <h2 class="text-base font-bold text-slate-100">Production Feasibility (독립 생산 가능성 평가)</h2>
        </div>
        <div class="table-container border border-slate-800 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                <th class="p-3">제품명 (Product ID)</th>
                <th class="p-3 text-right">목표 (Target)</th>
                <th class="p-3 text-right">가능량 (Feasible)</th>
                <th class="p-3 text-right">결손 (Shortfall)</th>
                <th class="p-3 text-right">달성률 (%)</th>
                <th class="p-3 text-center">우선순위</th>
              </tr>
            </thead>
            <tbody id="feasibility-tbody" class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <!-- Rows injected by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- Section 5. Production Allocation Recommendation -->
      <section id="section-5" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 5</span>
          <h2 class="text-base font-bold text-slate-100">Production Allocation (우선순위 기반 자재 배분안)</h2>
        </div>
        <div class="table-container border border-slate-800 rounded-lg">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                <th class="p-3">제품명</th>
                <th class="p-3 text-right">요청량</th>
                <th class="p-3 text-right">권고 배분량</th>
                <th class="p-3 text-center">순위</th>
                <th class="p-3">배분 사유 및 제약조건 (Constraint)</th>
              </tr>
            </thead>
            <tbody id="allocation-tbody" class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <!-- Rows injected by JS -->
            </tbody>
          </table>
        </div>
      </section>

    </div>

    <!-- Section 6. Procurement Action Plan -->
    <section id="section-6" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 6</span>
        <h2 class="text-base font-bold text-slate-100">Procurement Action Plan (조달 및 긴급 대응 계획)</h2>
      </div>

      <div class="table-container border border-slate-800 rounded-lg">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
              <th class="p-3">자재명 (Material ID)</th>
              <th class="p-3 text-right">부족 수량 (Shortage)</th>
              <th class="p-3">필요 납기 (Required-by)</th>
              <th class="p-3">리드타임 (Lead Time)</th>
              <th class="p-3 text-center">대체재 여부</th>
              <th class="p-3">권장 대응 조치 (Action Plan)</th>
              <th class="p-3 text-center">조달 우선순위</th>
            </tr>
          </thead>
          <tbody id="procurement-tbody" class="divide-y divide-slate-800/60 text-slate-300">
            <!-- Rows injected by JS -->
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 7. Assumptions & Data Limitations -->
    <section id="section-7" class="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div class="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span class="px-2 py-0.5 text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800 rounded">Section 7</span>
        <h2 class="text-base font-bold text-slate-100">Assumptions & Data Limitations (분석 가정 및 데이터 한계)</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300" id="assumptions-container">
        <!-- Assumptions list injected by JS -->
      </div>
    </section>

  </main>

  <footer class="bg-slate-950 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
    반도체 생산계획 · MRP 리스크 분석 엔진 © 2026. Data-Driven Supply Chain Intelligence.
  </footer>

  <!-- Embedded MRP Data & Execution Engine -->
  <script>
    const MRP_DATA = ${jsonDataString};

    function escapeStr(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function formatNumber(num) {
      if (isNaN(num) || num === null || num === undefined) return '0';
      return new Intl.NumberFormat('ko-KR').format(num);
    }

    document.addEventListener('DOMContentLoaded', () => {
      renderDashboard();
    });

    function renderDashboard() {
      renderExecutiveSummary();
      renderInventoryChart();
      renderMaterialRiskTable();
      renderFeasibilityTable();
      renderAllocationTable();
      renderProcurementTable();
      renderAssumptions();

      // Search & Filter event listeners
      document.getElementById('mat-search-input')?.addEventListener('input', () => filterMaterialTable());
      document.getElementById('risk-filter-select')?.addEventListener('change', () => filterMaterialTable());
    }

    // Render KPI Cards
    function renderExecutiveSummary() {
      const summary = MRP_DATA.summary || {};
      const container = document.getElementById('kpi-cards-container');
      if (!container) return;

      const targetUnits = Object.entries(summary.targetQtyByUnit || {})
        .map(([u, q]) => formatNumber(q) + ' ' + u).join(', ') || '0 EA';

      const allocUnits = Object.entries(summary.allocatedQtyByUnit || {})
        .map(([u, q]) => formatNumber(q) + ' ' + u).join(', ') || '0 EA';

      container.innerHTML = \`
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div class="text-xs text-slate-400 font-medium">목표 총 생산량</div>
          <div class="text-xl font-bold text-slate-100 mt-1 font-mono">\${escapeStr(targetUnits)}</div>
          <div class="text-xs text-slate-500 mt-1">총 \${summary.totalProductsCount || 0}개 제품 품목</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div class="text-xs text-slate-400 font-medium">예상 생산 가능량</div>
          <div class="text-xl font-bold text-cyan-400 mt-1 font-mono">\${escapeStr(allocUnits)}</div>
          <div class="text-xs text-slate-500 mt-1">우선순위 배분 반영</div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div class="text-xs text-slate-400 font-medium">생산 계획 달성률</div>
          <div class="text-xl font-bold mt-1 font-mono \${(summary.overallAchievementRate || 0) >= 90 ? 'text-emerald-400' : 'text-amber-400'}">
            \${summary.overallAchievementRate || 0}%
          </div>
          <div class="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div class="h-full bg-cyan-500 rounded-full" style="width: \${Math.min(100, summary.overallAchievementRate || 0)}%"></div>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div class="text-xs text-slate-400 font-medium">자재 수급 리스크</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xl font-bold text-red-400 font-mono">\${summary.criticalMaterialsCount || 0}</span>
            <span class="text-xs text-slate-400">Critical / 총 \${summary.totalShortageItemsCount || 0}개 부족</span>
          </div>
          <div class="text-xs text-slate-500 mt-1">전체 \${summary.totalMaterialsCount || 0}개 관리 자재</div>
        </div>
      \`;
    }

    // Render Chart.js
    let chartInstance = null;
    function renderInventoryChart() {
      const canvas = document.getElementById('inventoryRequirementChart');
      if (!canvas) return;

      const materials = (MRP_DATA.materialAnalysis || []);
      const guardrailNotice = document.getElementById('chart-guardrail-notice');

      // Scale guardrail: Top 15 materials
      let chartMaterials = [...materials];
      if (chartMaterials.length > 15) {
        chartMaterials.sort((a, b) => b.shortageRate - a.shortageRate);
        chartMaterials = chartMaterials.slice(0, 15);
        if (guardrailNotice) {
          guardrailNotice.textContent = '※ 규모 가드레일: 부족률 상위 15개 자재 집중 시각화';
        }
      } else {
        if (guardrailNotice) {
          guardrailNotice.textContent = \`전체 \${chartMaterials.length}개 자재 시각화\`;
        }
      }

      const labels = chartMaterials.map(m => m.materialId);
      const reqData = chartMaterials.map(m => m.adjustedRequirement || m.grossRequirement || 0);
      const availData = chartMaterials.map(m => m.netAvailable || 0);

      if (chartInstance) {
        chartInstance.destroy();
      }

      const ctx = canvas.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: '총 소요량 (Requirement)',
              data: reqData,
              backgroundColor: 'rgba(239, 68, 68, 0.75)',
              borderColor: '#ef4444',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: '순 가용재고 (Net Available)',
              data: availData,
              backgroundColor: 'rgba(6, 182, 212, 0.75)',
              borderColor: '#06b6d4',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { family: 'Pretendard', size: 11 } }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': ' + formatNumber(context.raw);
                }
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Pretendard', size: 10 },
                maxRotation: 45,
                minRotation: 0,
                autoSkip: false
              },
              grid: { color: 'rgba(51, 65, 85, 0.4)' }
            },
            y: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Pretendard', size: 10 },
                callback: function(val) { return formatNumber(val); }
              },
              grid: { color: 'rgba(51, 65, 85, 0.4)' }
            }
          }
        }
      });
    }

    // Render Material Risk Table
    function renderMaterialRiskTable() {
      const tbody = document.getElementById('material-risk-tbody');
      if (!tbody) return;

      const materials = MRP_DATA.materialAnalysis || [];
      if (materials.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="p-6 text-center text-slate-500">분석된 자재 데이터가 없습니다.</td></tr>';
        return;
      }

      tbody.innerHTML = materials.map(m => {
        let badgeClass = 'badge-low';
        if (m.riskLevel === 'Critical') badgeClass = 'badge-critical';
        else if (m.riskLevel === 'High') badgeClass = 'badge-high';
        else if (m.riskLevel === 'Medium') badgeClass = 'badge-medium';
        else if (m.riskLevel === '데이터 부족') badgeClass = 'badge-missing';

        const shortageClass = m.shortage > 0 ? 'text-red-400 font-bold' : 'text-slate-400';

        return \`
          <tr class="hover:bg-slate-900/60 transition mat-row" data-id="\${escapeStr(m.materialId.toLowerCase())}" data-risk="\${escapeStr(m.riskLevel)}">
            <td class="p-3 font-semibold text-slate-200" title="\${escapeStr(m.materialId)}">\${escapeStr(m.materialId)}</td>
            <td class="p-3 text-right">\${formatNumber(m.adjustedRequirement || m.grossRequirement)} <span class="text-xs text-slate-500 font-sans">\${escapeStr(m.unit)}</span></td>
            <td class="p-3 text-right">\${formatNumber(m.onHand)}</td>
            <td class="p-3 text-right">\${formatNumber(m.scheduledReceipt)}</td>
            <td class="p-3 text-right text-cyan-300 font-semibold">\${formatNumber(m.netAvailable)}</td>
            <td class="p-3 text-right \${shortageClass}">\${formatNumber(m.shortage)}</td>
            <td class="p-3 text-right \${shortageClass}">\${m.shortageRate}%</td>
            <td class="p-3 text-center">
              <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded \${badgeClass}">\${escapeStr(m.riskLevel)}</span>
            </td>
            <td class="p-3 text-xs text-slate-400 font-sans truncate max-w-xs" title="\${escapeStr((m.affectedProducts || []).join(', '))}">
              \${escapeStr((m.affectedProducts || []).join(', ') || 'N/A')}
            </td>
          </tr>
        \`;
      }).join('');
    }

    function filterMaterialTable() {
      const search = (document.getElementById('mat-search-input')?.value || '').toLowerCase();
      const risk = document.getElementById('risk-filter-select')?.value || 'ALL';
      const rows = document.querySelectorAll('.mat-row');

      rows.forEach(row => {
        const id = row.getAttribute('data-id') || '';
        const rowRisk = row.getAttribute('data-risk') || '';
        const matchSearch = id.includes(search);
        const matchRisk = risk === 'ALL' || rowRisk === risk;

        if (matchSearch && matchRisk) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }

    // Render Feasibility Table
    function renderFeasibilityTable() {
      const tbody = document.getElementById('feasibility-tbody');
      if (!tbody) return;

      const feass = MRP_DATA.productFeasibility || [];
      tbody.innerHTML = feass.map(f => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="p-3 font-semibold text-slate-200">\${escapeStr(f.productId)}</td>
          <td class="p-3 text-right">\${formatNumber(f.targetQty)}</td>
          <td class="p-3 text-right text-cyan-300 font-semibold">\${formatNumber(f.feasibleQty)}</td>
          <td class="p-3 text-right \${f.shortfall > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}">\${formatNumber(f.shortfall)}</td>
          <td class="p-3 text-right \${f.achievementRate >= 100 ? 'text-emerald-400 font-bold' : 'text-amber-400'}">\${f.achievementRate}%</td>
          <td class="p-3 text-center">
            <span class="px-2 py-0.5 text-xs rounded \${f.isUrgent ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-slate-800 text-slate-300'}">
              \${f.isUrgent ? '긴급 (P' + f.priorityLevel + ')' : 'P' + f.priorityLevel}
            </span>
          </td>
        </tr>
      \`).join('');
    }

    // Render Allocation Table
    function renderAllocationTable() {
      const tbody = document.getElementById('allocation-tbody');
      if (!tbody) return;

      const allocs = MRP_DATA.productionAllocation || [];
      tbody.innerHTML = allocs.map(a => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="p-3 font-semibold text-slate-200">\${escapeStr(a.productId)}</td>
          <td class="p-3 text-right">\${formatNumber(a.targetQty)}</td>
          <td class="p-3 text-right text-cyan-400 font-bold">\${formatNumber(a.allocatedQty)}</td>
          <td class="p-3 text-center">
            <span class="w-5 h-5 inline-flex items-center justify-center rounded-full bg-cyan-950 text-cyan-300 text-xs border border-cyan-800">
              \${a.priorityRank}
            </span>
          </td>
          <td class="p-3 text-xs text-slate-300 font-sans">\${escapeStr(a.reason)}</td>
        </tr>
      \`).join('');
    }

    // Render Procurement Action Plan
    function renderProcurementTable() {
      const tbody = document.getElementById('procurement-tbody');
      if (!tbody) return;

      const procs = MRP_DATA.procurementPlan || [];
      if (procs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-6 text-center text-emerald-400">모든 자재가 충족되어 긴급 조달 조치가 필요하지 않습니다.</td></tr>';
        return;
      }

      tbody.innerHTML = procs.map(p => \`
        <tr class="hover:bg-slate-900/60 transition">
          <td class="p-3 font-mono font-semibold text-slate-200">\${escapeStr(p.materialId)}</td>
          <td class="p-3 text-right text-red-400 font-bold font-mono">\${formatNumber(p.shortageQty)} <span class="text-xs text-slate-500 font-sans">\${escapeStr(p.unit)}</span></td>
          <td class="p-3 text-xs font-mono text-slate-300">\${escapeStr(p.requiredByDate)}</td>
          <td class="p-3 text-xs text-slate-300">\${escapeStr(p.leadTime)}</td>
          <td class="p-3 text-center text-xs">\${escapeStr(p.alternativeAvailable)}</td>
          <td class="p-3 text-xs text-slate-200 font-medium">\${escapeStr(p.recommendedAction)}</td>
          <td class="p-3 text-center">
            <span class="px-2 py-0.5 text-xs font-semibold rounded \${p.priority.includes('긴급') ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}">
              \${escapeStr(p.priority)}
            </span>
          </td>
        </tr>
      \`).join('');
    }

    // Render Assumptions & Notes
    function renderAssumptions() {
      const container = document.getElementById('assumptions-container');
      if (!container) return;

      const assumptions = MRP_DATA.assumptions || {};
      const notes = assumptions.notes || [];

      container.innerHTML = \`
        <div class="space-y-2 bg-slate-900/80 p-4 rounded-lg border border-slate-800">
          <div class="font-semibold text-cyan-400">적용된 계산 공식 및 기본값 (Defaults)</div>
          <ul class="list-disc list-inside space-y-1 text-slate-400">
            <li><strong>Gross Requirement</strong> = Target Production × Unit Usage</li>
            <li><strong>Adjusted Requirement</strong> = Gross Requirement / (Yield × (1 - Scrap))</li>
            <li><strong>Net Available</strong> = (On-hand + 유효 Scheduled Receipt) - Safety Stock</li>
            <li><strong>Shortage</strong> = MAX(0, Requirement - Net Available)</li>
            <li><strong>미입력 데이터 처리</strong>: Yield(100%), Scrap Rate(0%), Safety Stock(0), Lead Time(N/A)</li>
          </ul>
        </div>
        <div class="space-y-2 bg-slate-900/80 p-4 rounded-lg border border-slate-800">
          <div class="font-semibold text-cyan-400">데이터 한계 및 운영 제약 명시</div>
          <ul class="list-disc list-inside space-y-1 text-slate-400">
            <li><strong>원칙 준수</strong>: 실제 제공되지 않은 가격, 공급업체, Lead Time, 절감효과는 임의 생성하지 않음</li>
            <li><strong>공유 자재 배분 원칙</strong>: 1.최우선 지정 → 2.긴급 납기 → 3.납기일 빠른 순 → 4.입력 순서</li>
            \${notes.map(n => \`<li>\${escapeStr(n)}</li>\`).join('')}
          </ul>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
}
