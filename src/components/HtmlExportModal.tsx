import React, { useState } from 'react';
import { MrpCalculationOutput } from '../types';
import { generateSingleFileHtmlDashboard } from '../services/htmlReportGenerator';
import { Download, Copy, Check, X, FileCode, ExternalLink } from 'lucide-react';

interface HtmlExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mrpData: MrpCalculationOutput;
}

export const HtmlExportModal: React.FC<HtmlExportModalProps> = ({
  isOpen,
  onClose,
  mrpData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const htmlContent = generateSingleFileHtmlDashboard(mrpData);

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Semiconductor_MRP_Dashboard_${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <FileCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">단일 HTML 실행 대시보드 내보내기 (Export)</h2>
              <p className="text-xs text-slate-500">
                외부 서버 없이 브라우저에서 즉시 열리는 독립형 단일 파일 (.html)
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

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 flex-shrink-0">
          <div className="text-xs text-slate-700">
            포함 구성: <strong>Section 1~7 전체 표, Chart.js 인터랙티브 차트, 필터 & 정렬 엔진, Tailwind CSS</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'HTML 복사됨!' : 'HTML 코드 복사'}</span>
            </button>

            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>새 탭에서 미리보기</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.html 파일 다운로드</span>
            </button>
          </div>
        </div>

        {/* HTML Source Preview */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 flex flex-col">
          <div className="bg-slate-950 px-4 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>Standalone HTML Source Preview ({Math.round(htmlContent.length / 1024)} KB)</span>
            <span className="text-emerald-400 font-bold">XSS Protected</span>
          </div>
          <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-auto flex-1 leading-relaxed">
            {htmlContent.slice(0, 3000)}
            {htmlContent.length > 3000 && '\n\n... [생략된 전체 소스 코드 - 다운로드 시 완제 파일로 저장됩니다] ...'}
          </pre>
        </div>

      </div>
    </div>
  );
};
