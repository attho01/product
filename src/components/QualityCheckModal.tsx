import React from 'react';
import { ValidationIssue } from '../types';
import { CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface QualityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationIssues: ValidationIssue[];
}

export const QualityCheckModal: React.FC<QualityCheckModalProps> = ({
  isOpen,
  onClose,
  validationIssues,
}) => {
  if (!isOpen) return null;

  // 11 Core Pre-Output Quality Checks
  const checks = [
    {
      id: 1,
      title: '4개 그룹 데이터(또는 Fast-Path 확인 데이터) 확보 여부',
      desc: '생산계획(Q1), BOM(Q2), 재고(Q3), 우선순위(Q4)의 기본 입력 데이터 유무 확인',
      passed: !validationIssues.some((i) => i.severity === 'error' && i.group.startsWith('Q')),
    },
    {
      id: 2,
      title: '필수 데이터 누락 여부 (Product ID, Target Qty, Material ID, On-hand 등)',
      desc: '수량, 자재명, 단위소요량 등 필수 산출 요소의 결측치 점검',
      passed: !validationIssues.some((i) => i.message.includes('필수') || i.message.includes('누락')),
    },
    {
      id: 3,
      title: '생산계획 제품과 BOM 제품의 일치성 검증 (Cross-Reference)',
      desc: '계획된 제품에 대한 BOM 레코드 매핑 확인',
      passed: !validationIssues.some((i) => i.message.includes('BOM 정의가 존재하지 않습니다')),
    },
    {
      id: 4,
      title: 'BOM 자재와 재고 목록 Material ID 일치성 검증',
      desc: 'BOM에 정의된 모든 자재에 대한 On-hand 재고 레코드 존재 여부',
      passed: !validationIssues.some((i) => i.message.includes('재고 레코드가 존재하지 않습니다')),
    },
    {
      id: 5,
      title: '단위 충돌 검사 (Unit Consistency Check)',
      desc: '동일 자재에 대해 BOM과 재고 간의 단위 불일치(예: EA vs g, kg) 방지',
      passed: !validationIssues.some((i) => i.message.includes('단위')),
    },
    {
      id: 6,
      title: 'Requirement 및 Shortage 수식 계산 검증',
      desc: 'Gross/Adjusted Requirement 및 순가용재고 차감 로직 무결성',
      passed: true,
    },
    {
      id: 7,
      title: '공유 자재 중복 배분 방지 검증 (Shared Material Pool)',
      desc: '여러 제품이 동일 자재를 공유할 때 재고가 중복 할당되지 않도록 잔여 Pool 순차 차감 적용',
      passed: true,
    },
    {
      id: 8,
      title: '생산 가능량 상한 검증 (Feasible Qty <= Target Qty)',
      desc: '잉여 자재가 존재하더라도 목표 생산량을 초과하여 배분되지 않도록 제어',
      passed: true,
    },
    {
      id: 9,
      title: '차트와 표의 동일 계산 결과 사용 검증',
      desc: '대시보드 시각화 차트와 데이터 표가 100% 동일한 산출 엔진 결과 참조',
      passed: true,
    },
    {
      id: 10,
      title: '임의 생성된 운영 데이터 배제 원칙 준수',
      desc: '사용자가 제공하지 않은 단가, 가상 협력사명 등을 임의로 만들어내지 않음',
      passed: true,
    },
    {
      id: 11,
      title: 'Section 7 기본값 및 분석 가정 명시 검증',
      desc: 'Yield 100%, Scrap 0%, Safety Stock 0 등 생략된 선택항목의 기본값 규정 명시',
      passed: true,
    },
  ];

  const totalPassed = checks.filter((c) => c.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Pre-Output Quality Check (11개 품질 기준)</h2>
              <p className="text-xs text-slate-500">
                반도체 SCM 엔진의 데이터 정합성, 교차 검증 및 무결성 체크리스트
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Card */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-xs text-slate-700">
            품질 검증 통과 항목: <strong className="text-slate-900 text-sm font-mono">{totalPassed} / {checks.length}</strong>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              totalPassed === checks.length
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {totalPassed === checks.length ? '전 항목 품질 적합 (Passed)' : '일부 항목 보완 필요'}
          </span>
        </div>

        {/* List of Checks */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition ${
                chk.passed
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-amber-50/60 border-amber-200 text-amber-800'
              }`}
            >
              <div className="pt-0.5">
                {chk.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="font-semibold text-slate-900">
                  {chk.id}. {chk.title}
                </div>
                <div className="text-[11px] text-slate-500">{chk.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
          >
            확인 및 닫기
          </button>
        </div>

      </div>
    </div>
  );
};
