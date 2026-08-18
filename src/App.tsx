/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ProductionPlanItem,
  BomItem,
  InventoryItem,
  PriorityItem,
} from './types';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { calculateMrp, validateMrpInputs } from './services/mrpEngine';
import { Header } from './components/Header';
import { WizardDataCollection } from './components/WizardDataCollection';
import { FastPathView } from './components/FastPathView';
import { DataStudioGrid } from './components/DataStudioGrid';
import { DashboardView } from './components/DashboardView';
import { LandingPageView } from './components/LandingPageView';
import { QualityCheckModal } from './components/QualityCheckModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { HtmlExportModal } from './components/HtmlExportModal';
import { AuthGateModal } from './components/AuthGateModal';
import { useApiKey } from './context/ApiKeyContext';

export default function App() {
  const { isKeyVerified } = useApiKey();

  // Initial default dataset: AI Accelerator & HBM3e
  const defaultDataset = SAMPLE_DATASETS[0];

  const [selectedPresetId, setSelectedPresetId] = useState<string>(defaultDataset.id);
  const [productionPlans, setProductionPlans] = useState<ProductionPlanItem[]>(defaultDataset.productionPlans);
  const [boms, setBoms] = useState<BomItem[]>(defaultDataset.boms);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultDataset.inventory);
  const [priorities, setPriorities] = useState<PriorityItem[]>(defaultDataset.priorities);

  // Tab State: default to landing page to greet users with capabilities, or dashboard
  const [currentTab, setCurrentTab] = useState<'landing' | 'wizard' | 'fastpath' | 'grid' | 'dashboard'>('landing');

  // Modal States
  const [isQualityModalOpen, setIsQualityModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAuthGateOpen, setIsAuthGateOpen] = useState<boolean>(false);
  const [authGateTarget, setAuthGateTarget] = useState<string>('선택하신 메뉴');

  // Trigger Auth Gate Helper
  const handleRequireAuth = (featureName: string) => {
    setAuthGateTarget(featureName);
    setIsAuthGateOpen(true);
  };

  const handleProceedToActivation = () => {
    setIsAuthGateOpen(false);
    setCurrentTab('landing');
    setTimeout(() => {
      const card = document.getElementById('gemini-key-activation-card');
      const input = document.getElementById('gemini-api-key-input');
      card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card?.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2');
      setTimeout(() => {
        card?.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2');
        input?.focus();
      }, 1000);
    }, 100);
  };

  // Preset Selection Handler
  const handleSelectPreset = (presetId: string) => {
    if (!isKeyVerified) {
      handleRequireAuth('반도체 라인 프리셋 데이터');
      return;
    }

    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      setProductionPlans([]);
      setBoms([]);
      setInventory([]);
      setPriorities([]);
      setCurrentTab('wizard');
      return;
    }

    const found = SAMPLE_DATASETS.find((d) => d.id === presetId);
    if (found) {
      setProductionPlans(JSON.parse(JSON.stringify(found.productionPlans)));
      setBoms(JSON.parse(JSON.stringify(found.boms)));
      setInventory(JSON.parse(JSON.stringify(found.inventory)));
      setPriorities(JSON.parse(JSON.stringify(found.priorities)));
      setCurrentTab('dashboard');
    }
  };

  // Safe tab switcher
  const handleSafeTabChange = (tab: 'landing' | 'wizard' | 'fastpath' | 'grid' | 'dashboard') => {
    if (tab !== 'landing' && !isKeyVerified) {
      const tabNames: Record<string, string> = {
        wizard: '4단계 가이드 데이터 수집',
        fastpath: '일괄 입력 / Fast-Path',
        grid: '데이터 스튜디오 편집기',
        dashboard: '실행 대시보드',
      };
      handleRequireAuth(tabNames[tab] || '해당 메뉴');
      return;
    }
    setCurrentTab(tab);
  };

  // Reset Data Handler
  const handleResetData = () => {
    if (window.confirm('모든 입력 데이터를 초기화하시겠습니까?')) {
      setProductionPlans([]);
      setBoms([]);
      setInventory([]);
      setPriorities([]);
      setSelectedPresetId('custom');
      if (isKeyVerified) {
        setCurrentTab('wizard');
      } else {
        setCurrentTab('landing');
      }
    }
  };

  // Validation
  const validationIssues = useMemo(() => {
    return validateMrpInputs(productionPlans, boms, inventory, priorities);
  }, [productionPlans, boms, inventory, priorities]);

  const hasErrors = validationIssues.some((i) => i.severity === 'error');

  // Real-time MRP Calculation
  const mrpData = useMemo(() => {
    return calculateMrp(productionPlans, boms, inventory, priorities);
  }, [productionPlans, boms, inventory, priorities]);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleSafeTabChange}
        selectedPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenExportModal={() => {
          if (!isKeyVerified) {
            handleRequireAuth('단일 HTML 다운로드');
            return;
          }
          setIsExportModalOpen(true);
        }}
        onOpenQualityModal={() => {
          if (!isKeyVerified) {
            handleRequireAuth('품질 검증');
            return;
          }
          setIsQualityModalOpen(true);
        }}
        onOpenAiAdvisorModal={() => {
          if (!isKeyVerified) {
            handleRequireAuth('AI 공급망 전략 자문');
            return;
          }
          setIsAiModalOpen(true);
        }}
        onResetData={handleResetData}
        hasErrors={hasErrors}
        onRequireAuth={handleRequireAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'landing' && (
          <LandingPageView
            onNavigateTab={handleSafeTabChange}
            onSelectPreset={handleSelectPreset}
            onOpenExportModal={() => {
              if (!isKeyVerified) {
                handleRequireAuth('단일 HTML 다운로드');
                return;
              }
              setIsExportModalOpen(true);
            }}
            onOpenAiAdvisorModal={() => {
              if (!isKeyVerified) {
                handleRequireAuth('AI 공급망 전략 자문');
                return;
              }
              setIsAiModalOpen(true);
            }}
            onRequireAuth={handleRequireAuth}
          />
        )}

        {currentTab === 'dashboard' && isKeyVerified && (
          <DashboardView mrpData={mrpData} />
        )}

        {currentTab === 'wizard' && isKeyVerified && (
          <WizardDataCollection
            productionPlans={productionPlans}
            setProductionPlans={setProductionPlans}
            boms={boms}
            setBoms={setBoms}
            inventory={inventory}
            setInventory={setInventory}
            priorities={priorities}
            setPriorities={setPriorities}
            validationIssues={validationIssues}
            onCompleteToDashboard={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'fastpath' && isKeyVerified && (
          <FastPathView
            productionPlans={productionPlans}
            setProductionPlans={setProductionPlans}
            boms={boms}
            setBoms={setBoms}
            inventory={inventory}
            setInventory={setInventory}
            priorities={priorities}
            setPriorities={setPriorities}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onGoToWizardStep={(step) => setCurrentTab('wizard')}
          />
        )}

        {currentTab === 'grid' && isKeyVerified && (
          <DataStudioGrid
            productionPlans={productionPlans}
            setProductionPlans={setProductionPlans}
            boms={boms}
            setBoms={setBoms}
            inventory={inventory}
            setInventory={setInventory}
            priorities={priorities}
            setPriorities={setPriorities}
          />
        )}
      </main>

      {/* Modals */}
      <AuthGateModal
        isOpen={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        targetFeatureName={authGateTarget}
        onProceedToActivation={handleProceedToActivation}
      />

      <QualityCheckModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        validationIssues={validationIssues}
      />

      <AiAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        mrpData={mrpData}
      />

      <HtmlExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        mrpData={mrpData}
      />

      {/* Corporate Multi-Column Footer (As in Reference Image) */}
      <footer className="bg-[#07111D] border-t border-slate-800 text-slate-400 py-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-8 border-b border-slate-800/80">
            {/* Brand / Contact Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
                SCM SEMICONDUCTOR PLATFORM
              </div>
              <div className="space-y-1 text-slate-400 font-mono text-[11px] leading-relaxed">
                <div>ADDRESS : 반도체 생산 계획 및 자재 수급 관리 시스템</div>
                <div>TEL : 1588-0000 | SCM SUPPORT : 실시간 계산 엔진</div>
                <div>E-MAIL : supply-chain@semiconductor.ai</div>
              </div>
            </div>

            {/* Column 1 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200 uppercase">시스템 소개</div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>생산계획 (MPS)</li>
                <li>BOM 소요량 분석</li>
                <li>순가용재고 계산</li>
                <li>우선순위 배분 엔진</li>
              </ul>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200 uppercase">분석 기능</div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>독립 생산 가능성 평가</li>
                <li>부족(Shortage) 조달 대응</li>
                <li>수율·스크랩 연동 보정</li>
                <li>단일 HTML 내보내기</li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200 uppercase">고객센터 & 자문</div>
              <ul className="space-y-1 text-[11px] text-slate-400">
                <li>데이터 품질 검증</li>
                <li>AI 공급망 자문</li>
                <li>운영 가이드라인</li>
                <li>시스템 상태 (정상)</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>© Semiconductor Production Planning & MRP Risk Optimization Engine. All rights reserved.</span>
            <span className="font-mono">Pure Calculation & Transparency • Zero Fabricated Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

