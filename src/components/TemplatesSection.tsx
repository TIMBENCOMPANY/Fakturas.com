import { useState } from "react";
import { 
  Check, FileText, Download, Eye, Award, 
  Building, User, Briefcase, ChevronRight 
} from "lucide-react";

interface TemplatesSectionProps {
  isDarkMode: boolean;
}

type TemplateStyle = "Modern" | "Corporate" | "Freelancer" | "Agency" | "Minimal";

interface TemplateData {
  style: TemplateStyle;
  tagline: string;
  icon: any;
  colorName: string;
  sampleClient: string;
  sampleProject: string;
  sampleItems: Array<{ desc: string; qty: number; price: number }>;
}

const TEMPLATES: Record<TemplateStyle, TemplateData> = {
  Modern: {
    style: "Modern",
    tagline: "Bold luxury design with clean typography and dynamic gold accents",
    icon: Award,
    colorName: "Premium Gold & Navy",
    sampleClient: "Framer Inc.",
    sampleProject: "Interactive Component Library Design",
    sampleItems: [
      { desc: "Interactive System Consulting - Sprint 3 & 4", qty: 25, price: 160 },
      { desc: "Framer Canvas Motion Component Pipeline", qty: 1, price: 4000 },
      { desc: "Responsive UX System Compliance Review", qty: 40, price: 120 }
    ]
  },
  Corporate: {
    style: "Corporate",
    tagline: "Formal structured layout built for high trust and absolute precision",
    icon: Building,
    colorName: "Deep Corporate Onyx",
    sampleClient: "Wells Fargo Europe",
    sampleProject: "Security Infrastructure Audit",
    sampleItems: [
      { desc: "Cloud Security Strategy & Risk Mitigation Plans", qty: 50, price: 200 },
      { desc: "Core Regional Node Firewall Hardening & Setup", qty: 12, price: 250 },
      { desc: "Direct Bank Compliance Protocol Auditing", qty: 1, price: 8500 }
    ]
  },
  Freelancer: {
    style: "Freelancer",
    tagline: "Friendly yet highly polished layout optimized for creative professionals",
    icon: User,
    colorName: "Luxury Gold Accent",
    sampleClient: "Design Within Reach",
    sampleProject: "Visual Rebranding Campaign",
    sampleItems: [
      { desc: "Brand Visual System Design & Palette Structuring", qty: 1, price: 5500 },
      { desc: "Custom SVG Iconography & Motion Micro-animations", qty: 30, price: 110 },
      { desc: "Post-launch Brand Implementation Mentorship", qty: 10, price: 150 }
    ]
  },
  Agency: {
    style: "Agency",
    tagline: "Bold luxury statement with striking structural headers and spacious layouts",
    icon: Briefcase,
    colorName: "High Contrast Luxury Slate",
    sampleClient: "Stripe Communications",
    sampleProject: "Q3 Strategy Playbook",
    sampleItems: [
      { desc: "Full Scale Market Positioning Strategy Analysis", qty: 1, price: 12500 },
      { desc: "International Presentation Deck Development", qty: 45, price: 150 },
      { desc: "Regional Localization Playbook Assembly", qty: 1, price: 4500 }
    ]
  },
  Minimal: {
    style: "Minimal",
    tagline: "Understated Swiss-modern elegance focusing purely on typography and whitespace",
    icon: FileText,
    colorName: "Minimalist Off-White & Black",
    sampleClient: "Notion Labs UK",
    sampleProject: "Documentation Overhaul",
    sampleItems: [
      { desc: "Technical Documentation Structural Mapping Plan", qty: 20, price: 140 },
      { desc: "Custom API Reference Guide Drafting Services", qty: 12, price: 180 },
      { desc: "Interactive Sandbox Content Strategy Review", qty: 1, price: 3200 }
    ]
  }
};

export default function TemplatesSection({ isDarkMode }: TemplatesSectionProps) {
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle>("Modern");
  const [previewScale, setPreviewScale] = useState<boolean>(false);
  const data = TEMPLATES[selectedStyle];

  const handlePreviewTrigger = () => {
    setPreviewScale(true);
    setTimeout(() => setPreviewScale(false), 500);
  };

  const getSubtotal = () => {
    return data.sampleItems.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
  };

  const subtotal = getSubtotal();
  const taxAmount = Math.round(subtotal * 0.15);
  const totalAmount = subtotal + taxAmount;

  return (
    <section id="invoice-templates" className="max-w-7xl mx-auto px-6 relative text-left">
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[300px] bg-[#F5C542]/5 blur-3xl pointer-events-none rounded-full"></div>

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 bg-[#F5C542]/10 border border-[#F5C542]/20 px-3.5 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#F5C542] uppercase font-bold">
          Invoice Templates Showcase
        </span>
        <h2 className={`font-display font-bold text-3xl sm:text-4xl tracking-tight leading-tight transition-colors duration-300 ${
          isDarkMode ? "text-white" : "text-[#050B1A]"
        }`}>
          Meticulously crafted layouts for <span className="text-[#F5C542]">modern brand equity</span>.
        </h2>
        <p className={`text-xs sm:text-sm max-w-xl mx-auto transition-colors duration-300 ${
          isDarkMode ? "text-slate-400" : "text-slate-650"
        }`}>
          Select from beautifully engineered invoice templates conforming strictly to your sector's aesthetic standards. Preview instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
        
        {/* Style Selector Buttons column */}
        <div className="space-y-4">
          <p className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold pl-2">SELECT LAYOUT STYLE</p>
          <div className="flex flex-col gap-2.5">
            {(Object.keys(TEMPLATES) as TemplateStyle[]).map((style) => {
              const item = TEMPLATES[style];
              const IconComp = item.icon;
              const isSelected = selectedStyle === style;

              return (
                <button
                  key={style}
                  onClick={() => {
                    setSelectedStyle(style);
                    handlePreviewTrigger();
                  }}
                  className={`p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer text-left ${
                    isSelected
                      ? isDarkMode
                        ? "bg-[#F5C542]/10 border-[#F5C542] text-white shadow-lg shadow-[#F5C542]/5"
                        : "bg-[#F5C542]/10 border-[#F5C542] text-slate-900 shadow-md"
                      : isDarkMode
                        ? "bg-[#091225]/40 border-white/5 text-slate-400 hover:border-white/10 hover:bg-[#0a142c]/60"
                        : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      isSelected
                        ? isDarkMode
                          ? "bg-[#F5C542]/20 border-[#F5C542]/40 text-[#F5C542]"
                          : "bg-[#F5C542]/20 border-[#F5C542]/40 text-[#ffc83b]"
                        : isDarkMode
                          ? "bg-white/[0.02] border-white/5 text-slate-500 group-hover:text-slate-300"
                          : "bg-slate-50 border-slate-200 text-slate-600 group-hover:text-slate-900"
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm transition-colors">{style} Style</h4>
                      <span className="text-[10px] text-slate-500 transition-colors block mt-0.5">{item.colorName}</span>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${
                    isSelected ? "translate-x-1 text-[#F5C542]" : "text-slate-550 group-hover:translate-x-1"
                  }`} />
                </button>
              );
            })}
          </div>

          <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            isDarkMode ? "border-white/5 bg-[#071126]/60 text-slate-400" : "border-slate-250 bg-[#FAF8F3]/70 text-slate-600 shadow-sm"
          }`}>
            <span className="text-[#F5C542] font-semibold block mb-1">Aesthetic Guideline</span>
            {data.tagline}. Optimized precisely for crystal-clear legibility, immediate trust, and professional conversion elements.
          </div>
        </div>

        {/* Dynamic Canvas Preview Column */}
        <div className={`border p-8 max-sm:p-4 rounded-3xl relative transition-all duration-500 min-h-[550px] flex flex-col justify-between ${
          previewScale ? "scale-[0.99] opacity-90" : "scale-100 opacity-100"
        } ${
          isDarkMode 
            ? "bg-[#0b1428] border-white/5 shadow-xl shadow-[#050B1A]/40" 
            : "bg-[#FCFAF7] border-slate-200 shadow-xl"
        }`}>
          
          {/* Sample Template Preview Label */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#F5C542]/10 border border-[#F5C542]/20 px-2.5 py-1 rounded text-[8px] font-mono tracking-widest text-[#F5C542] uppercase font-bold select-none">
            Sample Template Preview
          </div>
          
          {/* Subtle design element overlay for different styles */}
          {selectedStyle === "Modern" && (
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#F5C542]"></div>
          )}
          {selectedStyle === "Corporate" && (
            <div className="absolute top-0 left-0 right-0 h-4 border-b border-double border-slate-400 dark:border-white/10"></div>
          )}
          {selectedStyle === "Freelancer" && (
            <div className="absolute top-6 left-6 w-1 hover:scale-x-150 h-10 bg-[#F5C542] rounded"></div>
          )}
          {selectedStyle === "Agency" && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-900 dark:bg-white"></div>
          )}

          <div>
            {/* INVOICE HEADER VIEW */}
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-200/50 dark:border-white/5 pb-6 mb-6">
              <div>
                {/* Logo placeholder */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    selectedStyle === "Modern" ? "bg-[#F5C542] text-[#050B1A]" :
                    selectedStyle === "Corporate" ? "bg-slate-900 dark:bg-slate-300 text-white dark:text-black" :
                    selectedStyle === "Freelancer" ? "bg-[#F5C542] text-[#050B1A]" :
                    selectedStyle === "Agency" ? "bg-slate-950 dark:bg-white text-white dark:text-black" :
                    "bg-transparent border border-slate-900 dark:border-white text-slate-900 dark:text-white"
                  }`}>F</div>
                  <span className={`font-display font-extrabold text-sm tracking-widest ${isDarkMode ? "text-white" : "text-slate-900"}`}>FAKTURAS</span>
                </div>
                <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Invoice Number: <span className="font-bold">FAK-2026-105</span></p>
                <p className="text-[10px] text-slate-450 mt-0.5 font-mono">Date Published: <span className="font-bold">May 29, 2026</span></p>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-mono tracking-widest font-bold uppercase rounded px-2.5 py-1 ${
                  selectedStyle === "Modern" ? "bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20" :
                  selectedStyle === "Corporate" ? "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-300/30" :
                  selectedStyle === "Freelancer" ? "bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20" :
                  selectedStyle === "Agency" ? "bg-slate-900 dark:bg-white text-white dark:text-black" :
                  "border border-slate-400 dark:border-slate-800 text-slate-500"
                }`}>
                  {selectedStyle} Standard
                </span>
                <p className="text-[10px] text-slate-400 mt-2 font-mono">REMIT TO: accounts@fakturas.com</p>
              </div>
            </div>

            {/* BILL TO ROW */}
            <div className="grid grid-cols-2 gap-4 pb-6 mb-6 border-b border-slate-200/50 dark:border-white/5 text-xs text-left">
              <div>
                <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">PREPARED FOR</span>
                <h5 className={`font-bold text-sm mt-0.5 ${isDarkMode ? "text-white" : "text-[#050B1A]"}`}>{data.sampleClient}</h5>
                <p className="text-slate-400 mt-0.5">Corporate Financial Accounts Desk</p>
                <p className="text-slate-400">United Kingdom / Worldwide</p>
              </div>
              <div className="text-right flex flex-col justify-start items-end">
                <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">PROJECT DETAILS</span>
                <h5 className={`font-bold text-sm mt-0.5 ${isDarkMode ? "text-white" : "text-[#050B1A]"}`}>{selectedStyle} Invoice</h5>
                <p className="text-slate-400 mt-0.5 italic">{data.sampleProject}</p>
                <p className="text-slate-400">Standard Net-14 Settlement Cycle</p>
              </div>
            </div>

            {/* ITEMS LIST TABLE */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-[1fr_80px_100px] border-b pb-2 font-mono font-bold text-[10px] text-slate-400 uppercase tracking-widest text-left">
                <span>Description of Services</span>
                <span className="text-center">Hours / Qty</span>
                <span className="text-right">Unit Price</span>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-white/5 text-left leading-relaxed">
                {data.sampleItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_80px_100px] py-3 items-center">
                    <span className={`font-medium ${isDarkMode ? "text-stone-300" : "text-stone-700"}`}>{item.desc}</span>
                    <span className="text-center font-mono font-semibold text-slate-400">{item.qty}</span>
                    <span className={`text-right font-mono font-bold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOTAL INVOICE BLOCK SUMMARY */}
          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-end flex-wrap gap-4 text-left">
            <div>
              <p className="text-[9.5px] font-mono text-slate-400 leading-normal max-w-sm">
                Certified authentic ledger statement. Processed instantly using local GDPR calculations under Fakturas Smart Rules v3.0.
              </p>
            </div>

            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">${subtotal.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>VAT (15%):</span>
                <span className="font-mono">${taxAmount.toLocaleString()}.00</span>
              </div>
              <div className="flex justify-between h-[1px] bg-slate-200 dark:bg-white/5 my-1"></div>
              
              {/* Grand Total custom style depending on template choice */}
              <div className={`flex justify-between p-2 rounded-lg items-center ${
                selectedStyle === "Modern" ? "bg-[#F5C542]/10 text-white border border-[#F5C542]/20 font-bold" :
                selectedStyle === "Corporate" ? "bg-slate-100 dark:bg-white/[0.03] text-[#050B1A] dark:text-white border border-slate-300/30 font-extrabold" :
                selectedStyle === "Freelancer" ? "bg-[#F5C542]/10 text-[#F5C542] font-bold border border-[#F5C542]/20" :
                selectedStyle === "Agency" ? "bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold" :
                "border border-slate-900 dark:border-white text-slate-900 dark:text-white font-mono"
              }`}>
                <span className="uppercase text-[9px] font-mono tracking-wider font-bold">Grand Total Amount</span>
                <span className="text-sm font-mono font-bold">${totalAmount.toLocaleString()}.00</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
