import React, { useState } from "react";
import { 
  TrendingUp, Users, CreditCard, Layers, ArrowUpRight, 
  Check, Play, Sparkles, Plus, Search, Calendar, ChevronRight,
  ShieldCheck, Globe, Download, DollarSign, Bell, Settings,
  ArrowRight, FileText, BadgePercent, CheckCircle, RefreshCw
} from "lucide-react";

interface DashboardMockupProps {
  isDarkMode: boolean;
}

export default function DashboardMockup({ isDarkMode }: DashboardMockupProps) {
  const [activeTab, setActiveTab] = useState<"invoices" | "clients" | "payments" | "analytics">("analytics");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Realistic billing data
  const invoices = [
    { id: "INV-2026-004", client: "SpaceX Propulsion", email: "payload@spacex.com", amount: 48500, date: "May 28, 2026", status: "Paid", rate: "$250/hr" },
    { id: "INV-2026-003", client: "Vercel Inc", email: "billing@vercel.com", amount: 14200, date: "May 25, 2026", status: "Paid", rate: "Flat Design Package" },
    { id: "INV-2026-002", client: "Slack Technologies", email: "accounts@slack.com", amount: 8900, date: "May 18, 2026", status: "Pending", rate: "Integration Svc" },
    { id: "INV-2026-001", client: "Dropbox Storage", email: "procure@dropbox.com", amount: 5600, date: "May 10, 2026", status: "Overdue", rate: "$175/hr Contract" }
  ];

  const clients = [
    { name: "SpaceX Propulsion", logo: "🚀", invoicesCount: 12, value: "$284,500", status: "Active Premium" },
    { name: "Vercel Enterprise", logo: "▲", invoicesCount: 8, value: "$95,600", status: "Active Premium" },
    { name: "Slack Integration Ltd", logo: "💬", invoicesCount: 4, value: "$34,200", status: "Standard" },
    { name: "Dropbox Global", logo: "📦", invoicesCount: 3, value: "$18,400", status: "Standard" }
  ];

  const payments = [
    { date: "May 29, 2026", via: "Stripe ACH Transfer", ref: "ch_3M4n9f", from: "SpaceX", amount: 48500, icon: "🏦" },
    { date: "May 28, 2026", via: "Apple Pay Instant", ref: "ch_4P9a2k", from: "Vercel Inc", amount: 14200, icon: "" },
    { date: "May 26, 2026", via: "Revolut Business Wire", ref: "ch_9X2s1m", from: "Freelancer Dev", amount: 4800, icon: "💳" }
  ];

  // Render SVG charts
  const renderSVGChart = () => {
    return (
      <svg viewBox="0 0 500 150" className="w-full h-32 mt-4 overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5C542" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#F5C542" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Grid Lines */}
        <line x1="0" y1="30" x2="500" y2="30" stroke={isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} strokeDasharray="3,3" />
        <line x1="0" y1="70" x2="500" y2="70" stroke={isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} strokeDasharray="3,3" />
        <line x1="0" y1="110" x2="500" y2="110" stroke={isDarkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} strokeDasharray="3,3" />
        
        {/* Curved Flow Line */}
        <path
          d="M 10 120 Q 80 110 140 60 T 260 75 T 380 30 T 490 15"
          fill="none"
          stroke="#F5C542"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Closed Gradient path below the trend line */}
        <path
          d="M 10 120 Q 80 110 140 60 T 260 75 T 380 30 T 490 15 L 490 150 L 10 150 Z"
          fill="url(#chartGradient)"
        />

        {/* Dynamic Nodes with pure custom aesthetic */}
        <circle cx="140" cy="60" r="5" fill="#F5C542" stroke={isDarkMode ? "#050B1A" : "#FFFFFF"} strokeWidth="1.5" />
        <circle cx="380" cy="30" r="5" fill="#F5C542" stroke={isDarkMode ? "#050B1A" : "#FFFFFF"} strokeWidth="1.5" />
        <circle cx="490" cy="15" r="5.5" fill="#E4B22B" stroke={isDarkMode ? "#050B1A" : "#FFFFFF"} strokeWidth="2" className="animate-ping" style={{ transformOrigin: "490px 15px" }} />
        <circle cx="490" cy="15" r="5" fill="#FFF" stroke="#E4B22B" strokeWidth="2.5" />
      </svg>
    );
  };

  return (
    <div className={`w-full text-left font-sans text-xs rounded-2xl overflow-hidden border transition-all duration-300 shadow-2xl relative ${
      isDarkMode 
        ? "bg-[#050B1A]/95 border-white/10 text-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(245,197,66,0.1)]" 
        : "bg-white border-slate-200 text-slate-800 shadow-[0_30px_100px_rgba(245,197,66,0.12),0_4px_30px_rgba(0,0,0,0.03)]"
    }`}>
      
      {/* Top Application Bar */}
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isDarkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/50"}`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-70"></div>
          <span className={`ml-2 text-[10px] font-mono font-medium tracking-wide ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
            fakturas_dashboard_v2.0
          </span>
          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20 font-bold ml-2">
            LIVE PRICING SYSTEM
          </span>
        </div>
        
        {/* Quick Search */}
        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border max-sm:hidden ${isDarkMode ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200"}`}>
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-light pr-12">Search clients, invoices...</span>
          <kbd className={`text-[8.5px] px-1 py-0.5 rounded text-slate-500 font-mono ${isDarkMode ? "bg-white/10" : "bg-slate-100"}`}>⌘K</kbd>
        </div>

        {/* System Profile Mini Indicators */}
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#F5C542] to-[#E4B22B] text-[#050B1A] font-bold text-[9px] flex items-center justify-center shadow-lg shadow-[#F5C542]/20">
            TB
          </div>
        </div>
      </div>

      {/* Internal Navigation & Dashboard Grid Layout */}
      <div className="grid grid-cols-[180px_1fr] max-sm:grid-cols-1 min-h-[420px]">
        
        {/* LEFT COLUMN: Sidebar controllers */}
        <div className={`p-4 border-r flex flex-col justify-between max-sm:border-r-0 max-sm:border-b ${isDarkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-slate-50/30"}`}>
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[8.5px] font-mono tracking-widest text-slate-500 uppercase font-bold pl-2.5 mb-1.5">Overview</p>
              
              <button 
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium transition-all ${
                  activeTab === "analytics"
                    ? isDarkMode 
                      ? "bg-[#F5C542]/10 text-[#F5C542] shadow-[0_0_15px_rgba(245,197,66,0.06)]"
                      : "bg-[#F5C542]/15 text-[#8a6503] font-semibold"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Revenue Overview</span>
              </button>

              <button 
                onClick={() => setActiveTab("invoices")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium transition-all ${
                  activeTab === "invoices"
                    ? isDarkMode 
                      ? "bg-[#F5C542]/10 text-[#F5C542]"
                      : "bg-[#F5C542]/15 text-[#8a6503] font-semibold"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </button>

              <button 
                onClick={() => setActiveTab("clients")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium transition-all ${
                  activeTab === "clients"
                    ? isDarkMode 
                      ? "bg-[#F5C542]/10 text-[#F5C542]"
                      : "bg-[#F5C542]/15 text-[#8a6503] font-semibold"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Clients</span>
              </button>

              <button 
                onClick={() => setActiveTab("payments")}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left font-medium transition-all ${
                  activeTab === "payments"
                    ? isDarkMode 
                      ? "bg-[#F5C542]/10 text-[#F5C542]"
                      : "bg-[#F5C542]/15 text-[#8a6503] font-semibold"
                    : "text-slate-400 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payments</span>
              </button>
            </div>

            <div className="space-y-1 pt-2">
              <p className="text-[8.5px] font-mono tracking-widest text-slate-500 uppercase font-bold pl-2.5 mb-1.5">Tax & Compliance</p>
              <div className={`p-2.5 rounded-xl border border-dashed flex flex-col gap-1.5 ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"}`}>
                <div className="flex items-center gap-1 text-[9.5px] font-mono text-[#F5C542] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>VAT & Tax Ready</span>
                </div>
                <p className="text-[8.5px] text-slate-400 leading-normal">Automatic international tax calculations.</p>
              </div>
            </div>
          </div>

          <div className={`p-2.5 rounded-xl flex items-center justify-between border ${isDarkMode ? "border-white/5 bg-white/[0.02] text-slate-400" : "border-slate-200 bg-slate-50/50 text-slate-600"}`}>
            <span className="text-[9.5px] font-mono">Revenue Live Feed</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: Content Viewer */}
        <div className="p-6 flex flex-col justify-between">
          
          {/* TAB 1: ANALYTICS PREVIEW */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Revenue Dashboard</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Real-time revenue, invoices, and analytics tracking.</p>
                </div>
                <div className={`flex items-center gap-2 text-[10px] px-2.5 py-1 rounded-lg border ${isDarkMode ? "bg-white/[0.03] border-white/5 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                  <Calendar className="w-3 h-3 text-[#F5C542]" />
                  <span>Last 30 Days (2026)</span>
                </div>
              </div>

              {/* Stats Widgets */}
              <div className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
                  <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase block">Revenue (ARR)</span>
                  <div className={`text-lg font-bold mt-1 tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>$412,850.00</div>
                  <span className="text-emerald-500 font-mono text-[9px] font-semibold mt-1 inline-flex items-center gap-0.5">
                    ↑ 18.4%
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl border border-[#F5C542]/20 ${isDarkMode ? "bg-[#F5C542]/5" : "bg-[#F5C542]/5 shadow-sm"}`}>
                  <span className="text-[#a27b13] dark:text-[#F5C542] text-[9px] font-mono tracking-wider uppercase block">Paid Invoices</span>
                  <div className={`text-lg font-bold mt-1 tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>$124,492.00</div>
                  <span className="text-emerald-500 font-mono text-[9px] font-semibold mt-1 inline-flex items-center gap-0.5">
                    ↑ 14.2%
                  </span>
                </div>

                <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
                  <span className="text-slate-400 text-[9px] font-mono tracking-wider uppercase block">Outstanding Balance</span>
                  <div className={`text-lg font-bold mt-1 tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>$14,500.00</div>
                  <span className="text-indigo-400 font-mono text-[9px] mt-1 inline-block">2 client invoices</span>
                </div>
              </div>

              {/* Graphic Plot Container */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-white/[0.02] border-white/5" : "bg-slate-50/50 border-slate-100"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded bg-[#F5C542]" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Revenue Growth Trend</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F5C542]" /> Verified Cashflow</span>
                  </div>
                </div>

                {renderSVGChart()}
              </div>
            </div>
          )}

          {/* TAB 2: INVOICES LIST PREVIEW */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Invoices Log</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Manage, build, and issue customer invoices instantly.</p>
                </div>
                <button className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-bold tracking-wide transition-all shadow-md">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Invoice</span>
                </button>
              </div>

              {/* Invoices List Display */}
              <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-white"}`}>
                <div className={`grid grid-cols-[100px_1fr_100px_80px] p-2.5 font-mono text-[9.5px] font-bold text-slate-400 border-b ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-150 bg-slate-50/50"}`}>
                  <span>INVOICE ID</span>
                  <span>CLIENT ACCOUNT</span>
                  <span className="text-right">TOTAL</span>
                  <span className="text-center">STATUS</span>
                </div>

                <div className="divide-y divide-slate-150 dark:divide-white/5">
                  {invoices.map((inv, idx) => (
                    <div 
                      key={inv.id}
                      onMouseEnter={() => setHoveredRow(idx)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={`grid grid-cols-[100px_1fr_100px_80px] items-center p-3 transition-colors ${
                        hoveredRow === idx 
                          ? isDarkMode ? "bg-white/[0.03]" : "bg-slate-50"
                          : ""
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-slate-500">{inv.id}</span>
                      <div className="flex flex-col">
                        <span className={`font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>{inv.client}</span>
                        <span className="text-[9.5px] text-slate-400 font-light mt-0.5">{inv.email} — {inv.rate}</span>
                      </div>
                      <span className={`font-mono text-right font-bold text-sm ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                        ${inv.amount.toLocaleString()}
                      </span>
                      <div className="flex justify-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wide ${
                          inv.status === "Paid"
                            ? isDarkMode
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inv.status === "Pending"
                              ? isDarkMode
                                ? "bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20"
                                : "bg-[#F5C542]/10 text-amber-700 border border-[#F5C542]/25"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLIENT DATABASE PREVIEW */}
          {activeTab === "clients" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Clients Overview</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Manage customer profiles, billing addresses, and invoice terms.</p>
                </div>
                <button className="border border-slate-300 dark:border-white/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[10px] font-semibold tracking-wide transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                  <Plus className="w-3.5 h-3.5 text-[#F5C542]" />
                  <span>Add New Entity</span>
                </button>
              </div>

              {/* Client Grid */}
              <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
                {clients.map((c, idx) => (
                  <div key={idx} className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isDarkMode 
                      ? "bg-white/[0.02] border-white/5 hover:border-[#F5C542]/45 hover:bg-white/[0.04]" 
                      : "bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-[#F5C542]/40"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/15 text-lg flex items-center justify-center shrink-0">
                        {c.logo}
                      </div>
                      <div>
                        <h4 className={`font-semibold tracking-tight text-xs ${isDarkMode ? "text-white" : "text-slate-900"}`}>{c.name}</h4>
                        <span className="text-[9.5px] text-slate-400 font-mono mt-0.5 block">{c.invoicesCount} issued invoices</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[12px] font-bold font-mono tracking-tight block ${isDarkMode ? "text-white" : "text-slate-900"}`}>{c.value}</span>
                      <span className="text-[8px] font-mono uppercase text-slate-400 block mt-0.5">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS TERMINAL PREVIEW */}
          {activeTab === "payments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className={`text-base font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Payments Feed</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Track received payments, payout balances, and client remittances in real-time.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9.5px] font-mono font-semibold text-slate-400">Gateway Online</span>
                </div>
              </div>

              {/* Payments History log */}
              <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? "border-white/5 bg-white/[0.01]" : "border-slate-100 bg-white"}`}>
                <div className={`grid grid-cols-[100px_1fr_120px_100px] p-2.5 font-mono text-[9.5px] font-bold text-slate-400 border-b ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-150 bg-slate-50/50"}`}>
                  <span>TIMESTAMP</span>
                  <span>SOURCE GATEWAY</span>
                  <span className="text-right">DISPATCHED</span>
                  <span className="text-right font-bold text-[#F5C542]">VERIFIED AMOUNT</span>
                </div>

                <div className="divide-y divide-slate-150 dark:divide-white/5">
                  {payments.map((p, idx) => (
                    <div key={idx} className="grid grid-cols-[100px_1fr_120px_100px] items-center p-3 font-mono text-[10px]">
                      <span className="text-slate-400">{p.date}</span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-xs">{p.icon}</span>
                        <div className="flex flex-col text-left">
                           <span className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-800"}`}>{p.via}</span>
                          <span className="text-[8.5px] text-slate-400 mt-0.5">{p.ref}</span>
                        </div>
                      </div>
                      <span className="text-slate-400 text-right">{p.from}</span>
                      <span className={`text-right font-bold text-sm ${isDarkMode ? "text-emerald-400 font-mono" : "text-emerald-700 font-mono"}`}>
                        +${p.amount.toLocaleString()}.00
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded-xl flex items-center gap-2 justify-center border text-[10px] text-slate-400 ${isDarkMode ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-slate-50/55"}`}>
                <RefreshCw className="w-3.5 h-3.5 text-[#F5C542] animate-spin" style={{ animationDuration: "10s" }} />
                <span>Synchronizing transaction feeds (Stripe, Apple Pay)...</span>
              </div>
            </div>
          )}

          {/* Bottom Trust Row Inside Mockup */}
          <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[9.5px] text-slate-400 flex-wrap gap-2 ${isDarkMode ? "border-white/5" : "border-slate-150"}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>SSL Secured Transmission</span>
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>SaaS Multi-Currency Support (USD, EUR, GBP)</span>
              </span>
            </div>
            <div className="font-mono text-[#F5C542] font-semibold flex items-center gap-1">
              <span>LEDGERS SYNCED REAL-TIME</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
