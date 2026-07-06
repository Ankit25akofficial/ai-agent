import React, { useState, useEffect } from 'react';
import { Search, Newspaper, BarChart3, ShieldAlert, BrainCircuit, FileSpreadsheet } from 'lucide-react';

interface Step {
  id: number;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  { id: 0, text: "Initiating research agent & checking cache...", icon: Search },
  { id: 1, text: "Retrieving company overview & business model...", icon: BrainCircuit },
  { id: 2, text: "Scraping latest financial reports & balance sheet...", icon: BarChart3 },
  { id: 3, text: "Gathering recent news & market sentiment...", icon: Newspaper },
  { id: 4, text: "Weighing competitive moats & key risk factors...", icon: ShieldAlert },
  { id: 5, text: "Running LangChain analysis & generating investment report...", icon: FileSpreadsheet }
];

interface LoadingScreenProps {
  company: string;
}

const LoadingScreen = ({ company }: LoadingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Increment the simulated progress steps every 2.5 seconds to represent agent progress
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-12 animate-fade-in">
      <div className="glass-card glow-indigo rounded-2xl p-8 relative overflow-hidden">
        {/* Floating gradient circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
            <BrainCircuit className="w-7 h-7 text-indigo-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100">Analyzing {company}</h3>
          <p className="text-slate-400 text-sm mt-1">This takes about 10-15 seconds. Please do not close this window.</p>
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            let statusClass = "text-slate-600 border-slate-800 bg-slate-900/50";
            let textClass = "text-slate-500";
            
            if (isCompleted) {
              statusClass = "text-emerald-400 border-emerald-500/30 bg-emerald-500/5";
              textClass = "text-slate-300 font-medium";
            } else if (isActive) {
              statusClass = "text-indigo-400 border-indigo-500/50 bg-indigo-500/10 animate-pulse";
              textClass = "text-indigo-200 font-semibold";
            }

            return (
              <div key={step.id} className="flex items-center gap-4 transition-all duration-500">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${statusClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className={`text-sm md:text-base ${textClass}`}>{step.text}</span>
                  {isCompleted && (
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-fade-in">
                      Done
                    </span>
                  )}
                  {isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
