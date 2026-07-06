import React from 'react';
import { History, Trash2, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { ReportHeader } from '../App';

interface HistorySidebarProps {
  reports: ReportHeader[];
  activeReportId: string | null;
  onSelectReport: (id: string) => void;
  onDeleteReport: (id: string) => void;
  isLoadingList: boolean;
}

const HistorySidebar = ({
  reports,
  activeReportId,
  onSelectReport,
  onDeleteReport,
  isLoadingList,
}: HistorySidebarProps) => {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  return (
    <div className="w-full md:w-80 bg-slate-950/20 backdrop-blur-md border-r md:border-r border-darkBorder/40 md:h-[calc(100vh-80px)] flex flex-col transition-all duration-300 print:hidden select-none">
      
      {/* Header */}
      <div className="p-4 border-b border-darkBorder/30 flex items-center justify-between bg-slate-950/10">
        <div className="flex items-center gap-2.5 text-slate-200">
          <History className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-300">Research History</span>
        </div>
        <span className="text-[10px] bg-slate-800/80 text-slate-400 border border-slate-700/40 px-2 py-0.5 rounded-full font-bold">
          {reports.length}
        </span>
      </div>

      {/* List items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {isLoadingList ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2.5">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading history...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs px-4 leading-relaxed">
            No research history. Start by searching a company in the input above!
          </div>
        ) : (
          reports.map((item) => {
            const isActive = item._id === activeReportId;
            const isBuy = item.recommendation === 'Invest';

            return (
              <div
                key={item._id}
                onClick={() => onSelectReport(item._id)}
                className={`group relative w-full text-left p-3.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border-indigo-500/30 border-l-[3px] border-l-indigo-500 text-slate-100 shadow-md shadow-indigo-500/5'
                    : 'bg-darkCard/20 border-darkBorder/30 hover:bg-slate-800/30 hover:border-slate-700/40 text-slate-300'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {isBuy ? (
                      <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="p-1 rounded-md bg-rose-500/10 text-rose-400">
                        <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                      </div>
                    )}
                    <span className={`font-semibold text-sm truncate block ${isActive ? 'text-slate-100 font-bold' : 'text-slate-300 group-hover:text-slate-200'}`}>{item.companyName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded font-bold text-[9px] tracking-wide uppercase border ${
                      isBuy 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {item.recommendation === 'Invest' ? 'Invest' : 'Pass'}
                    </span>
                    <span className="text-slate-400 font-medium text-[11px]">
                      Score: <b className={`font-semibold ${isBuy ? 'text-emerald-400' : 'text-rose-400'}`}>{item.investmentScore}</b>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 z-20">
                  {deletingId === item._id ? (
                    <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/50 rounded-lg p-0.5 relative z-30">
                      <button
                        type="button"
                        onClick={(e) => {
                          console.log("[HistorySidebar] Confirming deletion for ID:", item._id);
                          e.stopPropagation();
                          onDeleteReport(item._id);
                          setDeletingId(null);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(null);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        console.log("[HistorySidebar] Requesting delete confirmation for ID:", item._id);
                        e.stopPropagation();
                        setDeletingId(item._id);
                      }}
                      className="relative z-30 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all duration-300" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
