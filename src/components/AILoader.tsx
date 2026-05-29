import { useEffect, useState } from "react";
import { Sparkles, Cpu, Coins, ShieldCheck, FileSpreadsheet, FileCheck } from "lucide-react";

interface AILoaderProps {
  onComplete: () => void;
  promptText: string;
}

const steps = [
  { id: 1, text: "Consulting Fakturas LLM Core...", icon: Cpu },
  { id: 2, text: "Extracting ledger deliverables & rates...", icon: Coins },
  { id: 3, text: "Cross-referencing multi-currency exchange tables...", icon: Sparkles },
  { id: 4, text: "Verifying tax, VAT, and regulatory compliance...", icon: ShieldCheck },
  { id: 5, text: "Constructing double-entry ledger journals...", icon: FileSpreadsheet },
  { id: 6, text: "Generating ultra-high-resolution dynamic invoice...", icon: FileCheck },
];

export default function AILoader({ onComplete, promptText }: AILoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const duration = 700 + Math.random() * 500; // Realistic parsing lag
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  return (
    <div 
      id="ai-loader-container"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-royal-950/90 backdrop-blur-xl px-4"
    >
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gold-500/15 blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-royal-500/10 blur-3xl animate-pulse-slow"></div>

      {/* Luxury Loading Ring */}
      <div className="relative w-40 h-40 flex items-center justify-center mb-10">
        {/* Golden outer rotating corona */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gold-500/30 animate-spin" style={{ animationDuration: "10s" }}></div>
        {/* Glow halo */}
        <div className="absolute inset-2 rounded-full border border-gold-400/20 shadow-gold-heavy animate-pulse"></div>
        {/* Neon gold pulsing nucleus */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-radial-gradient from-gold-500/20 to-transparent flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-gold-500 animate-bounce" />
        </div>
      </div>

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl relative z-10 border border-gold-500/20">
        <h4 className="text-sm font-mono uppercase tracking-[0.25em] text-gold-400/80 mb-2 text-center">Fakturas Intelligence Core</h4>
        <h3 className="text-xl font-semibold text-white mb-6 text-center tracking-tight">Synthesizing Smart Ledger</h3>

        {/* Display Prompt being parsed */}
        <div className="bg-royal-900/60 border border-slate-800 p-3 rounded-lg mb-6 text-xs text-slate-300 italic font-mono truncate">
          &gt; "{promptText || "parsing conversational terms..."}"
        </div>

        {/* Steps tracker */}
        <div className="space-y-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStep;
            const IsActive = idx === currentStep;

            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isCompleted ? "opacity-100 text-gold-400 font-medium" : IsActive ? "opacity-100 text-white scale-[1.01]" : "opacity-30 text-slate-500"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isCompleted 
                    ? "bg-gold-500/20 border-gold-500/50 text-gold-500 shadow-gold-subtle" 
                    : IsActive 
                    ? "bg-royal-800 border-gold-400/50 text-gold-400 animate-pulse" 
                    : "bg-transparent border-slate-800 text-slate-500"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm tracking-wide">{step.text}</p>
                </div>
                {isCompleted && (
                  <span className="text-[10px] font-mono tracking-widest text-[#F5C542]">DONE</span>
                )}
                {IsActive && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping" style={{ animationDelay: "0.2s" }}></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 bg-royal-900 h-1.5 rounded-full overflow-hidden border border-slate-800 p-[1px]">
          <div 
            className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,197,66,0.3)]"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
