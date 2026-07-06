import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Shield, Calendar, ChevronDown, ChevronUp, FileText, BarChart3, Printer, Newspaper, BrainCircuit } from 'lucide-react';
import { ReportDetail } from '../App';

interface ReportDisplayProps {
  report: ReportDetail;
}

const ReportDisplay = ({ report }: ReportDisplayProps) => {
  const [showRawResearch, setShowRawResearch] = useState(false);
  const [activeResearchTab, setActiveResearchTab] = useState<'overview' | 'financials' | 'news' | 'sentiment'>('overview');
  const [animatedScore, setAnimatedScore] = useState(0);

  const {
    companyName,
    summary,
    pros = [],
    cons = [],
    riskLevel,
    investmentScore,
    recommendation,
    reasoning,
    rawResearch,
    createdAt
  } = report;

  // Animate circular progress ring on mount
  useEffect(() => {
    setAnimatedScore(0);
    const timer = setTimeout(() => {
      setAnimatedScore(investmentScore);
    }, 150);
    return () => clearTimeout(timer);
  }, [investmentScore]);

  const dateFormatted = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const cleanText = (text: string | undefined | null) => {
    if (!text) return "";
    return text.replace(/[#*_\-]/g, '');
  };

  // Circular progress math
  const radius = 55;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  // Determine score colors
  let scoreColorClass = "text-indigo-400 stroke-indigo-500";
  let bgGlow = "glow-indigo";
  if (recommendation === 'Invest') {
    scoreColorClass = "text-emerald-400 stroke-emerald-500";
    bgGlow = "glow-emerald";
  } else {
    scoreColorClass = "text-red-400 stroke-red-500";
    bgGlow = "glow-red";
  }

  // Risk badges
  const riskBadges: Record<string, string> = {
    Low: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    High: "bg-red-500/10 text-red-400 border border-red-500/20"
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 my-8 animate-fade-in print:p-0 print:my-0">
      
      {/* Header Card */}
      <div className={`glass-card rounded-2xl p-6 md:p-8 relative overflow-hidden ${bgGlow} print:border print:border-slate-300 print:shadow-none`}>
        {/* Decorative background light */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 print:hidden ${
          recommendation === 'Invest' ? 'bg-emerald-500' : 'bg-red-500'
        }`}></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1.5 print:text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Report Generated: {dateFormatted}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 tracking-tight print:text-black">{companyName}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Export PDF Print trigger */}
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-darkBorder rounded-xl text-sm font-semibold text-slate-200 transition-all shadow-md cursor-pointer print:hidden"
              title="Print Report / Export PDF"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span>Export PDF</span>
            </button>

            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold print:text-slate-600">Recommendation</span>
              <span className={`text-xl font-bold px-4 py-1.5 rounded-xl border mt-1.5 flex items-center gap-1.5 ${
                recommendation === 'Invest'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 print:text-emerald-700 print:border-emerald-500/60'
                  : 'bg-red-500/15 text-red-400 border-red-500/30 print:text-red-700 print:border-red-500/60'
              }`}>
                {recommendation === 'Invest' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>BUY / INVEST</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>AVOID / PASS</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Dashboard Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Circular Score card */}
        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center print:border print:border-slate-300">
          <span className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider print:text-slate-600">Investment Score</span>
          <div className="relative flex items-center justify-center">
            {/* SVG Radial Progress */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <circle
                stroke="rgba(255,255,255,0.05)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="print:stroke-slate-200"
              />
              <circle
                className={`transition-all duration-1000 ease-out ${scoreColorClass}`}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <span className={`absolute text-3xl font-extrabold ${
              recommendation === 'Invest' ? 'text-emerald-400 print:text-emerald-600' : 'text-red-400 print:text-red-600'
            }`}>
              {investmentScore}
            </span>
          </div>
          <span className="text-xs text-slate-500 mt-4">Calculated out of 100</span>
        </div>

        {/* Risk Card */}
        <div className="glass-card rounded-xl p-6 flex flex-col items-center justify-center text-center print:border print:border-slate-300">
          <span className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider print:text-slate-600">Assessed Risk</span>
          <div className="flex items-center justify-center bg-slate-900/40 p-4 rounded-full border border-darkBorder mb-3 print:bg-slate-100 print:border-slate-300">
            <Shield className={`w-10 h-10 ${
              riskLevel === 'Low' ? 'text-emerald-400' : riskLevel === 'Medium' ? 'text-amber-400' : 'text-red-400'
            }`} />
          </div>
          <span className={`px-4 py-1 rounded-full text-sm font-bold ${riskBadges[riskLevel] || "bg-slate-800 text-slate-300"}`}>
            {riskLevel} Risk
          </span>
          <span className="text-xs text-slate-500 mt-3">Moat & financials weighted</span>
        </div>

        {/* Business Summary */}
        <div className="glass-card rounded-xl p-6 md:col-span-1 flex flex-col justify-between print:border print:border-slate-300">
          <div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-3 print:text-slate-600">Company Overview</span>
            <p className="text-slate-300 text-sm leading-relaxed print:text-slate-800">{summary}</p>
          </div>
        </div>

      </div>

      {/* Grid Dashboard Row 2 (Performance & Valuation Details) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Estimated Performance Chart */}
        <div className="glass-card rounded-xl p-6 md:col-span-2 flex flex-col justify-between print:border print:border-slate-300">
          <div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-2 print:text-slate-600">Estimated Performance Trend</span>
            
            <div className="flex items-end justify-between h-36 px-4 mt-6 border-b border-darkBorder/40 pb-2 print:border-slate-200">
              {/* Year 2024 */}
              <div className="flex flex-col items-center gap-1.5 w-1/4">
                <div className="flex gap-2 items-end h-24 w-full justify-center">
                  <div 
                    style={{ height: `${Math.round(investmentScore * 0.7)}%` }} 
                    className="w-4 bg-indigo-500/80 rounded-t-sm shadow-md transition-all duration-1000 hover:bg-indigo-400 print:bg-slate-400"
                    title="Revenue"
                  ></div>
                  <div 
                    style={{ height: `${Math.round(investmentScore * 0.7 * 0.25)}%` }} 
                    className="w-4 bg-emerald-500/80 rounded-t-sm shadow-md transition-all duration-1000 hover:bg-emerald-400 print:bg-slate-600"
                    title="Net Income"
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">2024</span>
              </div>

              {/* Year 2025 */}
              <div className="flex flex-col items-center gap-1.5 w-1/4">
                <div className="flex gap-2 items-end h-24 w-full justify-center">
                  <div 
                    style={{ height: `${Math.round(investmentScore * 0.85)}%` }} 
                    className="w-4 bg-indigo-500 rounded-t-sm shadow-md transition-all duration-1000 hover:bg-indigo-400 print:bg-slate-500"
                    title="Revenue"
                  ></div>
                  <div 
                    style={{ height: `${Math.round(investmentScore * 0.85 * 0.28)}%` }} 
                    className="w-4 bg-emerald-500 rounded-t-sm shadow-md transition-all duration-1000 hover:bg-emerald-400 print:bg-slate-700"
                    title="Net Income"
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">2025</span>
              </div>

              {/* Year 2026 (Est) */}
              <div className="flex flex-col items-center gap-1.5 w-1/4">
                <div className="flex gap-2 items-end h-24 w-full justify-center">
                  <div 
                    style={{ height: `${Math.round(investmentScore)}%` }} 
                    className="w-4 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm shadow-md transition-all duration-1000 hover:from-indigo-500 hover:to-indigo-300 print:bg-slate-600 print:from-slate-600"
                    title="Revenue"
                  ></div>
                  <div 
                    style={{ height: `${Math.round(investmentScore * 0.32)}%` }} 
                    className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-md transition-all duration-1000 hover:from-emerald-500 hover:to-emerald-300 print:bg-slate-800 print:from-slate-800"
                    title="Net Income"
                  ></div>
                </div>
                <span className="text-[10px] text-slate-300 font-bold print:text-slate-800">2026 (Est)</span>
              </div>
            </div>
            
            {/* Chart Legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-slate-400 font-medium print:text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm print:bg-slate-400"></span>
                <span>Revenue Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm print:bg-slate-700"></span>
                <span>Net Income Index</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytical Score breakdown */}
        <div className="glass-card rounded-xl p-6 flex flex-col justify-between print:border print:border-slate-300">
          <div>
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider block mb-4 print:text-slate-600">Strategic Profile</span>
            <div className="space-y-3.5 text-xs text-slate-300 print:text-slate-800">
              <div className="flex items-center justify-between border-b border-darkBorder/30 pb-2 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Asset Valuation:</span>
                <span className={`font-semibold ${
                  investmentScore >= 80 ? 'text-emerald-400' : investmentScore >= 60 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {investmentScore >= 80 ? 'Premium/Wide Moat' : investmentScore >= 60 ? 'Fair Value/Core' : 'Speculative'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-darkBorder/30 pb-2 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Competitive Moat:</span>
                <span className="font-semibold text-indigo-400 print:text-indigo-700">
                  {investmentScore >= 85 ? 'Wide Competitive' : investmentScore >= 70 ? 'Narrow Moat' : 'Weak Moat'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-darkBorder/30 pb-2 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Pricing Power:</span>
                <span className="font-semibold text-indigo-400 print:text-indigo-700">
                  {investmentScore >= 80 ? 'Strong Power' : investmentScore >= 60 ? 'Moderate Power' : 'Limited'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span className="text-slate-400 print:text-slate-600">Horizon Strategy:</span>
                <span className="font-semibold text-indigo-400 print:text-indigo-700">
                  {recommendation === 'Invest' ? 'Long-Term Hold' : 'Short-Term / Avoid'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Pros & Cons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pros */}
        <div className="glass-card rounded-xl p-6 border-t-2 border-t-emerald-500/50 print:border print:border-slate-300">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-slate-100 print:text-black">Key Strengths & Upsides</h3>
          </div>
          <ul className="space-y-3">
            {pros.map((pro, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm print:text-slate-800">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="glass-card rounded-xl p-6 border-t-2 border-t-red-500/50 print:border print:border-slate-300">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-slate-100 print:text-black">Vulnerabilities & Risks</h3>
          </div>
          <ul className="space-y-3">
            {cons.map((con, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm print:text-slate-800">
                <span className="text-red-400 font-bold mt-0.5">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Thesis & Reasoning */}
      <div className="glass-card rounded-xl p-6 md:p-8 print:border print:border-slate-300">
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2 print:text-black">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span>Detailed Investment Thesis</span>
        </h3>
        <div className="text-slate-300 text-sm leading-relaxed space-y-4 whitespace-pre-line print:text-slate-800">
          {reasoning}
        </div>
      </div>

      {/* Raw Research Accordion */}
      {rawResearch && (
        <div className="glass-card rounded-xl overflow-hidden print:hidden">
          <button
            onClick={() => setShowRawResearch(!showRawResearch)}
            className="w-full px-6 py-4 flex items-center justify-between bg-slate-900/30 hover:bg-slate-900/50 transition-colors border-b border-darkBorder/40"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span className="font-medium text-slate-300 text-sm md:text-base">View Agent Grounding Data (Raw Scraped Research)</span>
            </div>
            {showRawResearch ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showRawResearch && (
            <div className="p-6 bg-slate-950/60 text-slate-300 border-t border-darkBorder/30">
              
              {/* Tab Header Navigation */}
              <div className="flex border-b border-darkBorder/40 mb-6 gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setActiveResearchTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeResearchTab === 'overview'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                
                <button
                  onClick={() => setActiveResearchTab('financials')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeResearchTab === 'financials'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Financials</span>
                </button>
                
                <button
                  onClick={() => setActiveResearchTab('news')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeResearchTab === 'news'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span>Latest News</span>
                </button>
                
                <button
                  onClick={() => setActiveResearchTab('sentiment')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeResearchTab === 'sentiment'
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Sentiment & Risks</span>
                </button>
              </div>

              {/* Tab Content Area */}
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                
                {activeResearchTab === 'overview' && (
                  <div className="space-y-4 animate-fade-in">
                    {rawResearch.overview ? (
                      <div className="bg-darkCard/40 border border-darkBorder/30 p-5 rounded-xl">
                        <h4 className="text-slate-200 font-bold mb-3 text-sm flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-indigo-400" />
                          <span>Core Business Profile</span>
                        </h4>
                        <p className="whitespace-pre-line text-slate-300 text-xs leading-relaxed">{cleanText(rawResearch.overview)}</p>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs py-8 text-center bg-darkCard/10 rounded-xl border border-dashed border-darkBorder/20">
                        No overview findings found.
                      </div>
                    )}
                  </div>
                )}

                {activeResearchTab === 'financials' && (
                  <div className="space-y-4 animate-fade-in">
                    {rawResearch.financials ? (
                      <div className="bg-darkCard/40 border border-darkBorder/30 p-5 rounded-xl">
                        <h4 className="text-slate-200 font-bold mb-3 text-sm flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                          <span>Balance Sheet & Earnings Ledger</span>
                        </h4>
                        <p className="whitespace-pre-line text-slate-300 text-xs leading-relaxed font-mono bg-slate-950/40 p-4 rounded-lg border border-darkBorder/10">{cleanText(rawResearch.financials)}</p>
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs py-8 text-center bg-darkCard/10 rounded-xl border border-dashed border-darkBorder/20">
                        No financial statements data available.
                      </div>
                    )}
                  </div>
                )}

                {activeResearchTab === 'news' && (
                  <div className="space-y-3 animate-fade-in">
                    <h4 className="text-slate-200 font-bold mb-1.5 text-sm flex items-center gap-1.5">
                      <Newspaper className="w-4 h-4 text-indigo-400" />
                      <span>Aggregated News Broadcasts</span>
                    </h4>
                    {rawResearch.news && rawResearch.news.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rawResearch.news.map((item: string, i: number) => (
                          <div key={i} className="bg-darkCard/30 border border-darkBorder/20 hover:border-darkBorder/40 transition-colors p-4 rounded-xl flex gap-3 items-start">
                            <div className="bg-indigo-500/10 p-1.5 rounded-lg text-indigo-400 mt-0.5">
                              <Newspaper className="w-3.5 h-3.5" />
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{cleanText(item)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs py-8 text-center bg-darkCard/10 rounded-xl border border-dashed border-darkBorder/20">
                        No news articles retrieved for this asset.
                      </div>
                    )}
                  </div>
                )}

                {activeResearchTab === 'sentiment' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    {rawResearch.sentiment && (
                      <div className="bg-darkCard/40 border border-darkBorder/30 p-5 rounded-xl">
                        <h4 className="text-slate-200 font-bold mb-3 text-sm flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-indigo-400" />
                          <span>Market Consensus & Analyst sentiment</span>
                        </h4>
                        <p className="whitespace-pre-line text-slate-300 text-xs leading-relaxed">{cleanText(rawResearch.sentiment)}</p>
                      </div>
                    )}

                    {rawResearch.strengthsRisks && (
                      <div className="bg-darkCard/40 border border-darkBorder/30 p-5 rounded-xl">
                        <h4 className="text-slate-200 font-bold mb-3 text-sm flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-indigo-400" />
                          <span>Strategic Strengths & Competitive Risks</span>
                        </h4>
                        <p className="whitespace-pre-line text-slate-300 text-xs leading-relaxed">{cleanText(rawResearch.strengthsRisks)}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default ReportDisplay;
