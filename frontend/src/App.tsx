import React, { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import LoadingScreen from "./components/LoadingScreen";
import ReportDisplay from "./components/ReportDisplay";
import HistorySidebar from "./components/HistorySidebar";
import {
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import logo from "./assets/logo.jpg";

export interface ReportHeader {
  _id: string;
  companyName: string;
  recommendation: string;
  investmentScore: number;
  riskLevel: string;
  createdAt: string;
}

export interface ReportDetail {
  _id: string;
  companyName: string;
  recommendation: string;
  investmentScore: number;
  riskLevel: string;
  createdAt: string;
  [key: string]: any;
}

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/reports";

function App() {
  const [reports, setReports] = useState<ReportHeader[]>([]);
  const [activeReport, setActiveReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [searchingCompany, setSearchingCompany] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Fetch report list on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setReports(data);

      // Auto-select the most recent report if nothing is selected yet
      if (data.length > 0 && !activeReport) {
        fetchReportDetail(data[0]._id);
      }
    } catch (err: any) {
      console.error(err);
      setError(
        "Could not connect to the backend server. Please verify the server is running on port 5000.",
      );
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchReportDetail = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error("Failed to load report details");
      const data = await res.json();
      setActiveReport(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch report details.");
    }
  };

  const handleSearch = async (companyName: string) => {
    setIsLoading(true);
    setSearchingCompany(companyName);
    setError(null);
    setActiveReport(null);

    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: companyName }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.details || errorData.error || "Research failed",
        );
      }

      const report = await res.json();

      // Prepend to historical list
      setReports((prev) => [
        {
          _id: report._id,
          companyName: report.companyName,
          recommendation: report.recommendation,
          investmentScore: report.investmentScore,
          riskLevel: report.riskLevel,
          createdAt: report.createdAt,
        },
        ...prev,
      ]);
      setActiveReport(report);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during company analysis.");
    } finally {
      setIsLoading(false);
      setSearchingCompany("");
    }
  };

  const handleDelete = async (id: string) => {
    console.log("[handleDelete] Attempting to delete report with ID:", id);

    try {
      console.log("[handleDelete] Sending DELETE request to:", `${API_BASE}/${id}`);
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      console.log("[handleDelete] Response status:", res.status);
      
      if (!res.ok) throw new Error("Failed to delete report");

      setReports((prev) => prev.filter((r) => r._id !== id));

      // If we deleted the active report, reset detail view
      if (activeReport && activeReport._id === id) {
        setActiveReport(null);
      }
    } catch (err: any) {
      console.error("[handleDelete] Error during deletion:", err);
      alert("Failed to delete the report.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-darkBg text-slate-100 selection:bg-indigo-500">
      {/* Navigation Header */}
      <header className="h-20 border-b border-darkBorder/30 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-10 flex items-center justify-between print:hidden shadow-lg shadow-slate-950/20 transition-all duration-300">
        {/* Left Side: Brand Logo and Title */}
        <div className="flex items-center gap-4 group cursor-pointer">
          {/* Logo container with gradient border glow and interactive hover effect */}
          <div className="relative w-11 h-11 rounded-xl p-[1px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 shadow-xl shadow-indigo-500/10 transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <div className="w-full h-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              <img src={logo} alt="ai Agent Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            {/* Ambient outer glow */}
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-300 -z-10"></div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
                  ai
                </span>
                <span className="font-bold text-lg tracking-tight text-white ml-1">
                  Agent
                </span>
              </div>
              <span className="text-[9px] tracking-wider bg-indigo-500/10 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase backdrop-blur-sm">
                AI AGENT
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide block mt-0.5">
              Equity Research & Analysis System
            </span>
          </div>
        </div>

        {/* Right Side: Status pill */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400 transition-all shadow-md shadow-emerald-500/5 select-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Agent Online</span>
          </div>
        </div>
      </header>

      {/* Main Layout Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden print:overflow-visible print:block">
        {/* Left sidebar showing history */}
        <HistorySidebar
          reports={reports}
          activeReportId={activeReport ? activeReport._id : null}
          onSelectReport={fetchReportDetail}
          onDeleteReport={handleDelete}
          isLoadingList={isLoadingList}
        />

        {/* Right workspace detail area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center print:overflow-visible print:p-0">
          {/* Top Search bar wrapper */}
          <div className="w-full mb-8 print:hidden">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>

          {/* Loading agent */}
          {isLoading && <LoadingScreen company={searchingCompany} />}

          {/* Error Alert */}
          {error && !isLoading && (
            <div className="w-full max-w-2xl bg-red-500/10 border border-red-500/20 rounded-xl p-5 my-8 flex items-start gap-4 animate-scale-in">
              <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-semibold text-base mb-1">
                  Analysis Error
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={fetchReports}
                  className="mt-3 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold text-red-300 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          )}

          {/* Main detailed Report view */}
          {!isLoading && !error && activeReport && (
            <ReportDisplay report={activeReport} />
          )}

          {/* Empty Landing State */}
          {!isLoading && !error && !activeReport && (
            <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto my-16 py-12 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-2xl transform scale-150"></div>
                <div className="relative bg-slate-900 border border-darkBorder rounded-3xl p-6 flex items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-200">
                Analysis Center
              </h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Enter any public or private company name in the search bar above
                to trigger the research agent. The agent will fetch news,
                overview data, financials, sentiment, and compute a professional
                investment grade rating.
              </p>
              <div className="mt-8 flex flex-col gap-2.5 w-full">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                  Try searching for:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSearch("NVIDIA Corporation")}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-darkBorder/60 hover:border-indigo-500/40 rounded-lg text-xs text-slate-300 transition-all"
                  >
                    NVIDIA Corporation
                  </button>
                  <button
                    onClick={() => handleSearch("Tesla Inc.")}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-darkBorder/60 hover:border-indigo-500/40 rounded-lg text-xs text-slate-300 transition-all"
                  >
                    Tesla Inc.
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
