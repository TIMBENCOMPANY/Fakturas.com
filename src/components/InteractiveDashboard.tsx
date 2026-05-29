import { useState, useMemo, useEffect, FormEvent } from "react";
import { 
  FileText, Plus, DollarSign, TrendingUp, Sparkles, CheckCircle2, 
  Clock, AlertTriangle, ArrowUpRight, Search, Download, Trash2, 
  Send, Layers, PieChart, Sliders, Settings, Users, Percent, 
  HelpCircle, CreditCard, ChevronRight, Check, RefreshCw 
} from "lucide-react";
import { Invoice, InvoiceItem } from "../types";

interface InteractiveDashboardProps {
  onAiStart: (promptText: string) => void;
  syntheticInvoice: Invoice | null;
  resetSyntheticInvoice: () => void;
  isDarkMode?: boolean;
}

const INITIAL_INVOICES: Invoice[] = [
  {
    id: "inv-1",
    clientName: "Figma, Inc.",
    clientEmail: "billing@figma.com",
    clientAddress: "1247 Howard St, San Francisco, CA 94103",
    invoiceNumber: "FAK-2026-102",
    issueDate: "2026-05-18",
    dueDate: "2026-06-01",
    currency: "USD",
    vatRate: 20,
    discountRate: 0,
    status: "pending",
    items: [
      { description: "Principal UI Design & Interactive Prototyping", quantity: 15, unitPrice: 300 },
      { description: "Design System Tokens & Typography Refinement Library", quantity: 1, unitPrice: 1500 }
    ],
    notes: "Figma Treasury: please direct ACH wire inquiries to treasury@fakturas.com."
  },
  {
    id: "inv-2",
    clientName: "Stripe Enterprise",
    clientEmail: "treasury@stripe.com",
    clientAddress: "510 Townsend St, San Francisco, CA 94103",
    invoiceNumber: "FAK-2026-101",
    issueDate: "2026-05-15",
    dueDate: "2026-05-29",
    currency: "USD",
    vatRate: 15,
    discountRate: 10,
    status: "paid",
    items: [
      { description: "Core Billing Engine Architecture Specification Consultant Services", quantity: 80, unitPrice: 175 }
    ],
    notes: "Direct ACH remittance routing is hardcoded to Wells Fargo account detailed underneath."
  },
  {
    id: "inv-3",
    clientName: "Coinbase Global",
    clientEmail: "accounts@coinbase.com",
    clientAddress: "100 Pine Street, Suite 1250, San Francisco, CA",
    invoiceNumber: "FAK-2026-098",
    issueDate: "2026-05-10",
    dueDate: "2026-05-24",
    currency: "EUR",
    vatRate: 19,
    discountRate: 5,
    status: "paid",
    items: [
      { description: "Smart Contract Safety Audits & Liquidity Protocol Analysis", quantity: 30, unitPrice: 250 },
      { description: "Cryptographic Subgraph Ledger Integration Services", quantity: 1, unitPrice: 4000 }
    ],
    notes: " Remitted via Coinbase USD Cash Account. Reference code: TX-900821."
  },
  {
    id: "inv-4",
    clientName: "Dropbox, Inc.",
    clientEmail: "invoice@dropbox.com",
    clientAddress: "1800 Owens St, San Francisco, CA 94158",
    invoiceNumber: "FAK-2026-095",
    issueDate: "2026-05-01",
    dueDate: "2026-05-15",
    currency: "GBP",
    vatRate: 20,
    discountRate: 0,
    status: "overdue",
    items: [
      { description: "Relational Cold Storage File Tiering Consulting Module", quantity: 16, unitPrice: 200 }
    ],
    notes: "Please execute payment terms immediately to prevent administrative service suspension."
  }
];

export default function InteractiveDashboard({ onAiStart, syntheticInvoice, resetSyntheticInvoice, isDarkMode = true }: InteractiveDashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<'invoices' | 'ai' | 'settings'>('invoices');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("inv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [invoicePrompt, setInvoicePrompt] = useState("");
  const [isGeneratingLocally, setIsGeneratingLocally] = useState(false);
  
  // Custom interactive editing fields
  const [editClientName, setEditClientName] = useState("");
  const [editVatRate, setEditVatRate] = useState(20);
  const [editDiscountRate, setEditDiscountRate] = useState(0);
  const [editCurrency, setEditCurrency] = useState("USD");
  const [editItems, setEditItems] = useState<InvoiceItem[]>([]);
  const [editDueDate, setEditDueDate] = useState("");

  // UI Toast State
  const [toast, setToast] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Watch for synthetic invoice loaded from landing page AI prompt
  useEffect(() => {
    if (syntheticInvoice) {
      // Append the synthetic invoice
      setInvoices((prev) => {
        // Avoid duplicate ID
        if (prev.some(inv => inv.id === syntheticInvoice.id || inv.invoiceNumber === syntheticInvoice.invoiceNumber)) {
          return prev;
        }
        return [syntheticInvoice, ...prev];
      });
      setSelectedInvoiceId(syntheticInvoice.id);
      setActiveTab('invoices');
      triggerToast(`AI Invoice generated for ${syntheticInvoice.clientName}!`);
      // Reset synthetic emitter in landing page so we can generate again
      resetSyntheticInvoice();
    }
  }, [syntheticInvoice, resetSyntheticInvoice]);

  // Find active invoice
  const activeInvoice = useMemo(() => {
    return invoices.find(inv => inv.id === selectedInvoiceId) || invoices[0];
  }, [invoices, selectedInvoiceId]);

  // Load editing state when active invoice transitions
  useEffect(() => {
    if (activeInvoice) {
      setEditClientName(activeInvoice.clientName);
      setEditVatRate(activeInvoice.vatRate);
      setEditDiscountRate(activeInvoice.discountRate);
      setEditCurrency(activeInvoice.currency);
      setEditItems([...activeInvoice.items]);
      setEditDueDate(activeInvoice.dueDate);
    }
  }, [activeInvoice]);

  // Search and status filtering
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      const matchSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.items.some(item => item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Currency symbology mapper
  const getCurrencySymbol = (code: string) => {
    switch (code.toUpperCase()) {
      case "EUR": return "€";
      case "GBP": return "£";
      case "CHF": return "CHF ";
      case "CAD": return "CA$";
      default: return "$";
    }
  };

  // Finance math formulas for single invoice
  const calculateTotals = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const discountVal = subtotal * (invoice.discountRate / 100);
    const postDiscount = subtotal - discountVal;
    const vatVal = postDiscount * (invoice.vatRate / 100);
    const total = postDiscount + vatVal;
    return { subtotal, discountVal, vatVal, total };
  };

  const activeTotals = useMemo(() => {
    if (!activeInvoice) return { subtotal: 0, discountVal: 0, vatVal: 0, total: 0 };
    return calculateTotals(activeInvoice);
  }, [activeInvoice]);

  // Meta aggregated statistics for entire platform
  const stats = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalInvoicesCount = invoices.length;

    invoices.forEach(inv => {
      const { total } = calculateTotals(inv);
      // Normalized to USD conversion approximation for dynamic portfolio total
      const rate = inv.currency === "EUR" ? 1.09 : inv.currency === "GBP" ? 1.25 : 1;
      const valInUsd = total * rate;

      if (inv.status === 'paid') totalPaid += valInUsd;
      else if (inv.status === 'pending') totalPending += valInUsd;
      else if (inv.status === 'overdue') totalOverdue += valInUsd;
    });

    const totalPortfolio = totalPaid + totalPending + totalOverdue;
    const collectionsRate = totalPortfolio > 0 ? (totalPaid / totalPortfolio) * 100 : 100;

    return {
      paid: totalPaid,
      pending: totalPending,
      overdue: totalOverdue,
      total: totalPortfolio,
      count: totalInvoicesCount,
      rate: collectionsRate
    };
  }, [invoices]);

  // Edit actions inside the mockup
  const addEditItem = () => {
    setEditItems([...editItems, { description: "New Consultable Asset Item", quantity: 1, unitPrice: 150 }]);
  };

  const removeEditItem = (idx: number) => {
    setEditItems(editItems.filter((_, i) => i !== idx));
  };

  const updateEditItem = (idx: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...editItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setEditItems(updated);
  };

  const saveInvoiceEdits = () => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === selectedInvoiceId) {
        return {
          ...inv,
          clientName: editClientName,
          vatRate: editVatRate,
          discountRate: editDiscountRate,
          currency: editCurrency,
          dueDate: editDueDate,
          items: editItems
        };
      }
      return inv;
    }));
    setIsEditing(false);
    triggerToast("Ledger parameters logged successfully!");
  };

  // Toggle paid state
  const togglePaidStatus = (id: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const nextStatus = inv.status === 'paid' ? 'pending' : 'paid';
        return { ...inv, status: nextStatus };
      }
      return inv;
    }));
    triggerToast("Invoice ledger transaction completed!");
  };

  // Delete invoice
  const deleteInvoice = (id: string) => {
    const index = invoices.findIndex(i => i.id === id);
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    triggerToast("Invoice deleted.");
    
    // Auto-select another
    if (invoices.length > 1) {
      const nextId = invoices[index === 0 ? 1 : index - 1].id;
      setSelectedInvoiceId(nextId);
    }
  };

  // Simulate PDF download safely
  const handleDownloadPDF = () => {
    triggerToast("Compiling secure Vector PDF standard elements...");
    setTimeout(() => {
      // Simulate real download by opening print view or offering custom alert
      window.print();
    }, 1000);
  };

  // Conversational prompts inside AI dashboard tab
  const handlePremadePrompt = (text: string) => {
    setInvoicePrompt(text);
  };

  const handleAIFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!invoicePrompt.trim()) return;

    // Trigger AI compilation screen
    onAiStart(invoicePrompt);
    setInvoicePrompt("");
  };

  // Local parser to generate an invoice directly inside the panel (Offline Sandbox Fallback)
  const executeSandboxAI = () => {
    if (!invoicePrompt.trim()) return;
    setIsGeneratingLocally(true);
    const activePrompt = invoicePrompt;
    setInvoicePrompt("");

    setTimeout(() => {
      // Direct local extraction
      let client = "Dynamic Sandbox Partner";
      if (activePrompt.toLowerCase().includes("vercel")) client = "Vercel, Inc.";
      else if (activePrompt.toLowerCase().includes("spacex")) client = "SpaceX Core Team";
      else if (activePrompt.toLowerCase().includes("apple")) client = "Apple Inc.";
      
      let rate = 180;
      let hours = 12;
      
      const numbers = activePrompt.match(/\d+/g);
      if (numbers) {
        if (numbers.length > 0) rate = parseInt(numbers[0]);
        if (numbers.length > 1) hours = parseInt(numbers[1]);
      }

      const generated: Invoice = {
        id: `inv-${Date.now()}`,
        clientName: client,
        clientEmail: `treasury@${client.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        clientAddress: "Infinite Loop, Cupertino, Silicon Valley, CA",
        invoiceNumber: `FAK-2026-${Math.floor(Math.random() * 800) + 200}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currency: activePrompt.toLowerCase().includes("euro") ? "EUR" : "USD",
        vatRate: activePrompt.toLowerCase().includes("vat") ? 20 : 0,
        discountRate: 0,
        status: "pending",
        items: [
          { description: "Fakturas Dynamic Platform Package", quantity: hours, unitPrice: rate }
        ],
        notes: "Sandbox auto-ledger generated by client heuristic machine."
      };

      setInvoices(prev => [generated, ...prev]);
      setSelectedInvoiceId(generated.id);
      setIsGeneratingLocally(false);
      setActiveTab("invoices");
      triggerToast(`Successfully generated sandbox invoice for ${client}!`);
    }, 1400);
  };

  return (
    <div 
      id="fintech-casing" 
      className={`w-full max-w-7xl mx-auto rounded-2xl overflow-hidden relative z-10 border transition-all duration-300 ${
        isDarkMode 
          ? "glass-panel-heavy border-royal-800 shadow-[0_0_50px_rgba(7,18,42,0.6)]" 
          : "bg-white border-slate-200/80 shadow-xl shadow-slate-100/50"
      }`}
    >
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-4 rounded-xl flex items-center gap-3 animate-bounce border shadow-lg transition-all duration-300 ${
          isDarkMode 
            ? "glass-panel border-gold-500/30 bg-royal-950 text-white shadow-gold-heavy" 
            : "bg-white border-[#D4AF37]/45 text-slate-900 shadow-md"
        }`}>
          <CheckCircle2 className={`w-5 h-5 ${isDarkMode ? "text-gold-400" : "text-gold-600"}`} />
          <p className="text-sm font-medium tracking-wide">{toast}</p>
        </div>
      )}

      {/* Futuristic Header / Menu bar - Geometric Balance Mac mock style */}
      <div className={`border-b px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition-colors duration-300 ${
        isDarkMode ? "border-white/5 bg-[#0E1B3E]" : "border-slate-150 bg-slate-50"
      }`}>
        <div className="flex items-center gap-6">
          {/* Mac OS Window Traffic dots */}
          <div className="flex gap-1.5 select-none shrink-0">
            <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-red-500/30" : "bg-red-400"}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-yellow-500/30" : "bg-yellow-400"}`}></div>
            <div className={`w-2.5 h-2.5 rounded-full ${isDarkMode ? "bg-green-500/30" : "bg-green-400"}`}></div>
          </div>
          <div className={`h-6 w-px max-sm:hidden ${isDarkMode ? "bg-white/10" : "bg-slate-200"}`}></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F9E29B] flex items-center justify-center shadow-md shadow-[#D4AF37]/10">
              <span className="font-display font-bold text-[#07122A] text-sm italic select-none">F</span>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className={`font-display font-medium tracking-wider text-xs ${isDarkMode ? "text-slate-350" : "text-slate-800"}`}>Fakturas Cloud Dashboard</h2>
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[8px] font-mono px-2 py-0.5 rounded-full border border-[#D4AF37]/20 uppercase tracking-widest animate-pulse font-bold">PRO LEDGER</span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono uppercase">Node Node Active // Secure Cloud Sandbox Mode</p>
            </div>
          </div>
        </div>

        {/* Global Stats bar inside header */}
        <div className={`flex items-center gap-6 text-xs font-mono border-l pl-6 max-sm:hidden ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
          <div className="text-left">
            <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Liquid Funds</span>
            <span className={`font-semibold ${isDarkMode ? "text-[#D4AF37]" : "text-gold-650"}`}>${Number(stats.paid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-left">
            <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Receivables</span>
            <span className={`font-semibold ${isDarkMode ? "text-royal-300" : "text-slate-700"}`}>${Number(stats.pending + stats.overdue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="text-left">
            <span className="text-slate-500 text-[10px] block uppercase font-bold tracking-wider">Coll. Velocity</span>
            <span className="text-emerald-500 font-semibold">{stats.rate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Action button inside core */}
        <button 
          onClick={() => {
            const tempId = `inv-${Date.now()}`;
            const newInv: Invoice = {
              id: tempId,
              clientName: "New Entity, Inc.",
              clientEmail: "treasury@client.com",
              clientAddress: "740 Financial District, San Francisco, CA",
              invoiceNumber: `FAK-2026-${Math.floor(Math.random() * 899) + 100}`,
              issueDate: new Date().toISOString().split('T')[0],
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              currency: "USD",
              vatRate: 20,
              discountRate: 0,
              status: "draft",
              items: [{ description: "Core Consultation Support Package", quantity: 8, unitPrice: 150 }],
              notes: "Full regulatory reporting attached with ACH invoice submission."
            };
            setInvoices([newInv, ...invoices]);
            setSelectedInvoiceId(tempId);
            setIsEditing(true);
            setActiveTab("invoices");
            triggerToast("Draft invoice created!");
          }}
          className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:brightness-110 text-[#07122A] hover:scale-[1.02] transform transition-all font-bold rounded-lg text-xs px-4 py-2 flex items-center gap-2 shadow-lg shadow-[#D4AF37]/10 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Create Invoice
        </button>
      </div>

      {/* Main workspace splits */}
      <div className={`flex min-h-[640px] max-lg:flex-col transition-colors duration-300 ${isDarkMode ? "bg-transparent" : "bg-white"}`}>
        
        {/* Sidebar Nav (Stylish Sections Bar) */}
        <aside className={`w-20 md:w-24 max-lg:w-full border-r max-lg:border-r-0 max-lg:border-b flex flex-col max-lg:flex-row items-center gap-10 max-lg:gap-4 py-8 max-lg:py-2 px-3 shrink-0 transition-all duration-300 ${
          isDarkMode ? "bg-royal-900/40 border-royal-800" : "bg-slate-100/35 border-slate-150"
        }`}>
          <div className="flex flex-col max-lg:flex-row items-center gap-5 w-full max-lg:justify-around">
            {[
              { id: 'invoices', icon: FileText, label: "Ledgers" },
              { id: 'ai', icon: Sparkles, colorClass: "text-gold-550 animate-pulse", label: "Synth AI" },
              { id: 'settings', icon: Settings, label: "Config" }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setIsEditing(false); }}
                  title={tab.label}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group border cursor-pointer ${
                    isActive 
                      ? isDarkMode
                        ? "bg-gold-500/10 border-gold-500/30 text-gold-400 shadow-gold-subtle" 
                        : "bg-gold-500/15 border-gold-500/40 text-[#b59029] shadow-md shadow-gold-400/5"
                      : isDarkMode
                        ? "text-slate-400 hover:text-white hover:bg-royal-850/50 border-transparent"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${tab.colorClass || ""}`} />
                  <span className={`text-[8px] font-mono tracking-wider font-bold select-none transition-colors ${
                    isActive 
                      ? isDarkMode ? "text-gold-400" : "text-[#b59029]"
                      : isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-500 group-hover:text-slate-900"
                  }`}>
                    {tab.label.toUpperCase()}
                  </span>
                  
                  {/* Subtle hover marker on left side */}
                  <span className={`absolute left-0 top-1/4 bottom-1/4 w-[2.5px] rounded-r bg-gold-400 scale-y-0 group-hover:scale-y-100 ${isActive ? "scale-y-100" : ""} transition-transform max-lg:hidden`}></span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto max-lg:hidden flex flex-col items-center gap-5 text-slate-550">
            <HelpCircle className="w-5 h-5 hover:text-slate-400 cursor-pointer transition-colors" />
            <div className={`w-2.5 h-2.5 rounded-full animate-ping ${isDarkMode ? "bg-emerald-400 shadow-[0_0_8px_#10B981]" : "bg-emerald-500"}`} title="Secured Cloud Sandbox Mode"></div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className={`flex-1 p-6 flex flex-col transition-colors duration-300 ${isDarkMode ? "bg-royal-950/20" : "bg-slate-50/40"}`}>
          
          {/* TAB 1: INVOICES PLATFORM */}
          {activeTab === 'invoices' && (
            <div className="flex-grow flex flex-col gap-6 animate-fadeIn">
              
              {/* Internal top control filters */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className={`flex items-center gap-2 border p-1 rounded-lg transition-colors duration-300 ${
                  isDarkMode ? "bg-royal-950/80 border-royal-800" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  {[
                    { id: 'all', label: "All Ledgers" },
                    { id: 'pending', label: "Pending" },
                    { id: 'paid', label: "Settled" },
                    { id: 'overdue', label: "Overdue" }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setStatusFilter(filter.id as any)}
                      className={`text-xs px-3.5 py-1.5 rounded-md font-medium tracking-wide transition-all ${
                        statusFilter === filter.id 
                          ? isDarkMode 
                            ? "bg-royal-800 text-white font-semibold" 
                            : "bg-slate-250 text-slate-900 border border-slate-300/60 shadow-sm font-semibold"
                          : isDarkMode 
                            ? "text-slate-400 hover:text-white" 
                            : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-64 max-sm:w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-505 font-bold" />
                  <input
                    type="text"
                    placeholder="Search invoice sequence, client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none transition-colors duration-300 font-mono ${
                      isDarkMode 
                        ? "bg-royal-950/50 border-royal-800 text-white focus:border-gold-500/30" 
                        : "bg-white border-slate-200 text-[#07122A] focus:border-[#D4AF37]/50"
                    }`}
                  />
                </div>
              </div>

              {/* Main Invoices split panel view */}
              <div className="grid grid-cols-5 gap-6 flex-grow max-xl:grid-cols-1">
                
                {/* Invoice list side (Left col 2) */}
                <div className="col-span-2 flex flex-col gap-3 min-h-[400px] max-h-[580px] overflow-y-auto pr-1">
                  {filteredInvoices.length === 0 ? (
                    <div className={`rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] border transition-all duration-300 ${
                      isDarkMode 
                        ? "glass-panel border-royal-800 text-slate-400" 
                        : "bg-white border-slate-200 text-slate-500 shadow-sm"
                    }`}>
                      <FileText className="w-10 h-10 text-slate-500 mb-3" />
                      <p className="text-sm">No synchronized ledgers found matching criteria.</p>
                    </div>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const { total } = calculateTotals(inv);
                      const isSelected = inv.id === selectedInvoiceId;

                      return (
                        <div
                          key={inv.id}
                          onClick={() => { setSelectedInvoiceId(inv.id); setIsEditing(false); }}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative group border text-left ${
                            isSelected 
                              ? isDarkMode
                                ? "border-gold-500/30 bg-royal-900/60 shadow-gold-subtle" 
                                : "border-gold-500 bg-gold-400/5 shadow-sm ring-1 ring-gold-400/20"
                              : isDarkMode
                                ? "border-royal-800/40 hover:border-slate-700/60 bg-royal-950/30"
                                : "border-slate-200 hover:border-slate-300 bg-white shadow-sm"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className={`text-xs font-mono tracking-wider ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>{inv.invoiceNumber}</p>
                              <h4 className={`font-semibold group-hover:text-gold-500 transition-colors tracking-tight text-sm mt-0.5 ${
                                isDarkMode ? "text-white" : "text-[#07122A]"
                              }`}>{inv.clientName}</h4>
                            </div>
                            
                            {/* Color mapping tags */}
                            <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                              inv.status === 'paid' 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold" 
                                : inv.status === 'pending' 
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold" 
                                : inv.status === 'overdue' 
                                ? "bg-rose-500/10 text-rose-550 border-rose-550/20 font-bold animate-pulse" 
                                : "bg-slate-500/10 text-slate-550 border-slate-550/20"
                            }`}>
                              {inv.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <span className="text-slate-500 text-[10px] font-mono">Due: {inv.dueDate}</span>
                            <span className={`font-mono text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                              {getCurrencySymbol(inv.currency)}{Number(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Action overlay shortcuts */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); togglePaidStatus(inv.id); }}
                              title="Toggle Settlement Status"
                              className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                isDarkMode 
                                  ? "bg-royal-800 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-550" 
                                  : "bg-slate-100 border-slate-200 text-slate-650 hover:text-emerald-600 hover:border-emerald-500 shadow-sm"
                              }`}
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteInvoice(inv.id); }}
                              title="Delete Ledger Entry"
                              className="w-6 h-6 rounded bg-royal-800 border border-slate-700 hover:border-rose-500 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Selected Detail Panel (Right col 3) */}
                <div className="col-span-3 min-h-[500px] flex flex-col justify-between">
                  {isEditing ? (
                    // EDIT MODE EDITOR
                    <div className={`p-6 rounded-xl flex-grow flex flex-col space-y-4 border transition-all duration-300 ${
                      isDarkMode 
                        ? "glass-panel bg-royal-950/20 border-gold-500/15" 
                        : "bg-white border-slate-200 shadow-lg text-slate-800"
                    }`}>
                      <div className={`flex justify-between items-center border-b pb-3 ${isDarkMode ? "border-royal-800" : "border-slate-200"}`}>
                        <h3 className={`font-display font-bold tracking-wide text-sm flex items-center gap-2 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>
                          <Sliders className={`w-4 h-4 ${isDarkMode ? "text-gold-400" : "text-gold-650"}`} />
                          Modify Ledger Parameters
                        </h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setIsEditing(false)}
                            className={`font-medium px-3 py-1 text-[11px] rounded border ${
                              isDarkMode 
                                ? "bg-royal-900 border-slate-800 text-slate-300 hover:text-white" 
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={saveInvoiceEdits}
                            className="bg-gold-500 hover:bg-gold-600 text-royal-950 font-bold px-3 py-1 text-[11px] rounded flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Log Ledger
                          </button>
                        </div>
                      </div>

                      {/* Editing fields */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="text-left">
                          <label className="text-[10px] text-slate-500 uppercase block mb-1">Company/Entity Name</label>
                          <input 
                            type="text" 
                            value={editClientName} 
                            onChange={(e) => setEditClientName(e.target.value)}
                            className={`w-full border rounded p-1.5 focus:outline-none focus:border-gold-500/20 ${
                              isDarkMode ? "bg-royal-950/80 border-royal-800 text-white" : "bg-slate-50 border-slate-250 text-[#07122A]"
                            }`}
                          />
                        </div>
                        <div className="text-left">
                          <label className="text-[10px] text-slate-500 uppercase block mb-1">Currency Standard</label>
                          <select 
                            value={editCurrency} 
                            onChange={(e) => setEditCurrency(e.target.value)}
                            className={`w-full border rounded p-1.5 focus:outline-none focus:border-gold-500/20 ${
                              isDarkMode ? "bg-royal-950/80 border-royal-800 text-white" : "bg-slate-50 border-slate-250 text-[#07122A]"
                            }`}
                          >
                            <option value="USD">USD ($) — US Dollars</option>
                            <option value="EUR">EUR (€) — Euro Area</option>
                            <option value="GBP">GBP (£) — Great British Pounds</option>
                            <option value="CHF">CHF — Swiss Francs</option>
                            <option value="CAD">CAD — Canadian Dollar</option>
                          </select>
                        </div>
                      </div>

                      {/* Slider modifiers */}
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
                          isDarkMode ? "glass-panel border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                          <div className="flex justify-between items-center text-xs font-mono mb-2">
                            <span className="text-slate-500">VAT / TAX SURCHARGE</span>
                            <span className="text-gold-500 font-bold">{editVatRate}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="25" 
                            value={editVatRate} 
                            onChange={(e) => setEditVatRate(Number(e.target.value))}
                            className="w-full cursor-pointer accent-gold-500"
                          />
                          <p className="text-[9px] text-slate-550 font-mono mt-2 uppercase">Complies with EU VAT Article 203</p>
                        </div>

                        <div className={`p-3.5 rounded-lg border transition-all duration-300 ${
                          isDarkMode ? "glass-panel border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                          <div className="flex justify-between items-center text-xs font-mono mb-2">
                            <span className="text-slate-500">DISCOUNT MATRIX</span>
                            <span className="text-emerald-500 font-bold">{editDiscountRate}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="50" 
                            value={editDiscountRate} 
                            onChange={(e) => setEditDiscountRate(Number(e.target.value))}
                            className="w-full cursor-pointer accent-emerald-505"
                          />
                          <p className="text-[9px] text-slate-550 font-mono mt-2 uppercase">Discretionary loyal client rebate</p>
                        </div>
                      </div>

                      {/* Items dynamic listing */}
                      <div className="flex-grow flex flex-col space-y-2 mt-2">
                        <div className={`flex justify-between items-center text-xs font-mono border-b pb-1.5 ${isDarkMode ? "border-royal-800" : "border-slate-200"}`}>
                          <span className={isDarkMode ? "text-slate-400" : "text-slate-500"}>BILLABLE SERVICE MATRIX</span>
                          <button 
                            onClick={addEditItem}
                            className={`text-[10px] hover:underline uppercase tracking-wider flex items-center gap-1 font-bold ${
                              isDarkMode ? "text-gold-400 hover:text-white" : "text-gold-650 hover:text-slate-900"
                            }`}
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>

                        <div className="max-h-[170px] overflow-y-auto space-y-2 pr-1">
                          {editItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-center text-xs font-mono">
                              <input 
                                type="text" 
                                value={item.description} 
                                onChange={(e) => updateEditItem(idx, 'description', e.target.value)}
                                placeholder="Service description"
                                className={`flex-1 border text-xs rounded p-1.5 focus:outline-none ${
                                  isDarkMode ? "bg-royal-950/80 border-royal-800 text-white" : "bg-white border-slate-200 text-[#07122A]"
                                }`}
                              />
                              <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => updateEditItem(idx, 'quantity', Number(e.target.value))}
                                className={`w-12 border text-xs text-center rounded p-1.5 focus:outline-none ${
                                  isDarkMode ? "bg-royal-950/80 border-royal-800 text-white" : "bg-white border-slate-200 text-[#07122A]"
                                }`}
                                title="Qty"
                              />
                              <input 
                                type="number" 
                                value={item.unitPrice} 
                                onChange={(e) => updateEditItem(idx, 'unitPrice', Number(e.target.value))}
                                className={`w-16 border text-xs text-right rounded p-1.5 focus:outline-none ${
                                  isDarkMode ? "bg-royal-950/80 border-royal-800 text-white" : "bg-white border-slate-200 text-[#07122A]"
                                }`}
                                title="Price"
                              />
                              <button 
                                onClick={() => removeEditItem(idx)}
                                className="p-1 text-slate-500 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // PREMIUM APPLE PREVIEW WITH PIXEL-PERFECT GRAPHIC
                    <div className={`rounded-xl flex-grow flex flex-col overflow-hidden border transition-all duration-300 ${
                      isDarkMode ? "glass-panel border-royal-800" : "bg-white border-slate-200 shadow-lg"
                    }`}>
                      
                      {/* Document Toolbar header inside card */}
                      <div className={`border-b px-5 py-3 flex items-center justify-between transition-colors duration-300 ${
                        isDarkMode ? "bg-royal-950/80 border-royal-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${activeInvoice.status === 'paid' ? "text-emerald-500" : "text-amber-500"}`} />
                          <span className={`font-mono text-xs font-semibold uppercase tracking-wider ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>{activeInvoice.invoiceNumber} PREVIEW</span>
                        </div>
                        <div className="flex gap-2 font-mono text-[10px]">
                          <button 
                            onClick={() => setIsEditing(true)}
                            className={`font-semibold px-3 py-1.5 rounded border flex items-center gap-1 transition-colors ${
                              isDarkMode 
                                ? "bg-royal-900 border-slate-800 text-white hover:text-gold-400 hover:bg-royal-800"
                                : "bg-white border-slate-250 text-slate-850 hover:bg-slate-50 hover:text-[#07122A] shadow-sm"
                            }`}
                          >
                            <Sliders className="w-3 h-3 text-gold-550" />
                            Edit Parameters
                          </button>
                          <button 
                            onClick={handleDownloadPDF}
                            className="bg-[#D4A64F] hover:bg-[#C2953E] text-[#050816] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-colors shadow-sm"
                          >
                            <Download className="w-3 h-3" />
                            PDF Invoice
                          </button>
                        </div>
                      </div>

                      {/* ACTUAL EXPENSIVE LOOKING INVOICE PANEL CANVAS */}
                      <div className="bg-white text-royal-950 p-7 font-sans text-xs shadow-inner flex-grow flex flex-col justify-between max-h-[460px] overflow-y-auto selection:bg-[#F3E9BD] selection:text-[#07122A]">
                        
                        {/* Upper Section Logo & Basic Info */}
                        <div>
                          <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-5">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-display font-semibold text-rose-950 text-xl tracking-tighter">FAKTURAS</span>
                                <span className="text-[8px] font-mono tracking-widest border border-slate-300 rounded px-1 text-slate-500 uppercase">LEDGER DOC</span>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
                                Fakturas Treasury Operations Inc<br />
                                120 Sansome Street, San Francisco, CA<br />
                                billing@fakturas.com // VAT ID US-9082
                              </p>
                            </div>

                            <div className="text-right">
                              <h3 className="font-display font-medium text-slate-400 tracking-wider text-[10px] uppercase mb-1">LEDGER TRANSCRIPT</h3>
                              <p className="font-display text-lg font-bold text-slate-800 tracking-tight">{activeInvoice.invoiceNumber}</p>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">Issue Date: {activeInvoice.issueDate}</p>
                              <p className="text-[10px] font-bold text-slate-800 font-mono">DUE DATE: {activeInvoice.dueDate}</p>
                            </div>
                          </div>

                          {/* Bill To & Addresses */}
                          <div className="grid grid-cols-2 gap-8 mb-6 text-[11px]">
                            <div>
                              <h4 className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1.5">CLIENT ENTITY</h4>
                              <p className="font-bold text-slate-900 text-xs">{activeInvoice.clientName}</p>
                              <p className="text-slate-500 mt-0.5">{activeInvoice.clientEmail}</p>
                              <p className="text-slate-400 italic mt-1 leading-relaxed">{activeInvoice.clientAddress || "Financial Core, Registered Client HQ Location"}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-lg flex flex-col justify-between">
                              <div>
                                <h4 className="font-mono text-[9px] text-slate-400 uppercase tracking-widest mb-1">SETTLEMENT INSTRUCTIONS</h4>
                                <p className="text-[10px] text-slate-600 font-mono">Direct Bank Transfer (ACH / SEPA Swift)<br />IBAN US89 4000 1200 4821 9831</p>
                              </div>
                              <p className="text-[9px] text-slate-400 font-mono text-right mt-2 uppercase underline decoration-[#D4AF37]">NET 14 COMPLIANT</p>
                            </div>
                          </div>

                          {/* Invoice Items Table Grid */}
                          <div className="mb-6">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-2 border-b border-slate-300 font-mono text-[9px] text-slate-400 pb-1.5 uppercase tracking-wider">
                              <div className="col-span-8">Description of services render / asset components</div>
                              <div className="col-span-1 text-center">Qty</div>
                              <div className="col-span-1.5 text-right font-semibold">Rate</div>
                              <div className="col-span-1.5 text-right font-bold text-slate-800">Total</div>
                            </div>

                            {/* Table Rows */}
                            <div className="divide-y divide-slate-100 min-h-[80px]">
                              {activeInvoice.items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 py-3 text-[11px] items-center text-slate-800">
                                  <div className="col-span-8 font-medium leading-relaxed">{item.description}</div>
                                  <div className="col-span-1 text-center font-mono text-slate-500">{item.quantity}</div>
                                  <div className="col-span-1.5 text-right font-mono text-slate-500">
                                    {getCurrencySymbol(activeInvoice.currency)}{Number(item.unitPrice).toFixed(2)}
                                  </div>
                                  <div className="col-span-1.5 text-right font-mono font-bold">
                                    {getCurrencySymbol(activeInvoice.currency)}{Number(item.quantity * item.unitPrice).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Calculations section */}
                        <div className="border-t border-slate-200 pt-4 mt-auto">
                          <div className="grid grid-cols-12 gap-4 text-xs">
                            {/* Terms notes */}
                            <div className="col-span-7 pr-4">
                              <h4 className="font-mono text-[8px] text-slate-400 uppercase tracking-widest mb-1">REGULATORY COMPLIANCE EXPLANATION</h4>
                              <p className="text-[9px] text-slate-400 italic font-mono leading-relaxed">
                                {activeInvoice.notes || "This is a digitally generated transcript registered under cryptographic Ledger FAK-908. Thank you for utilizing Fakturas corporate services."}
                              </p>
                            </div>

                            {/* Totals computation lines */}
                            <div className="col-span-5 space-y-1.5 text-[11px] font-mono border-l border-slate-100 pl-4">
                              <div className="flex justify-between text-slate-500">
                                <span>Subtotal:</span>
                                <span>{getCurrencySymbol(activeInvoice.currency)}{Number(activeTotals.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {activeInvoice.discountRate > 0 && (
                                <div className="flex justify-between text-emerald-600 font-semibold">
                                  <span>Discount ({activeInvoice.discountRate}%):</span>
                                  <span>-{getCurrencySymbol(activeInvoice.currency)}{Number(activeTotals.discountVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              {activeInvoice.vatRate > 0 && (
                                <div className="flex justify-between text-slate-500">
                                  <span>VAT ({activeInvoice.vatRate}%):</span>
                                  <span>+{getCurrencySymbol(activeInvoice.currency)}{Number(activeTotals.vatVal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-slate-900 border-t border-slate-200 pt-2 text-xs font-bold font-sans">
                                <span>TOTAL SUM OVERDUE:</span>
                                <span className="font-mono text-sm tracking-tight text-[#07122A]">
                                  {getCurrencySymbol(activeInvoice.currency)}{Number(activeTotals.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}



          {/* TAB 3: AI CONSOLE PLATFORM */}
          {activeTab === 'ai' && (
            <div className="flex-grow flex flex-col gap-6 animate-fadeIn">
              
              <div className={`p-6 rounded-2xl border flex flex-col justify-between min-h-[500px] relative group overflow-hidden transition-all duration-300 ${
                isDarkMode 
                  ? "bg-gradient-to-br from-[#0E1B3E] to-[#14234C] border-[#D4AF37]/30 text-white" 
                  : "bg-white border-slate-205 text-slate-800 shadow-sm"
              }`}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none"></div>
                
                {/* Visual state headers */}
                <div className={`border-b pb-4 mb-4 ${isDarkMode ? "border-royal-800" : "border-slate-150"}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-left">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-ping"></div>
                      <h3 className={`font-display font-bold text-sm ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Fakturas Neural Invoicing Core</h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">MODEL CORE: gemini-3.5-flash-latest</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-left">Provide a prompt structure below and direct artificial nodes to generate complete accounting documents automatically.</p>
                </div>

                {/* AI Assistant Simulated Terminal Conversation log */}
                <div className="flex-grow space-y-4 max-h-[290px] overflow-y-auto mb-6 pr-2">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 flex items-center justify-center font-display font-medium text-xs mt-0.5 shrink-0">F</div>
                    <div className={`border p-3 rounded-lg max-w-[80%] text-xs leading-relaxed font-mono text-left ${
                      isDarkMode ? "bg-royal-900/40 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-705 shadow-sm"
                    }`}>
                      <span className="text-gold-650 font-bold">SYSTEM ACTIVE</span> Welcome to Fakturas Neural Ledger module. State the transactional facts directly, such as: 
                      <span className="font-semibold block mt-1"> "Invoice Dropbox for 40 hours of core backup security audit consultation at $210/hour plus 15% VAT."</span>
                    </div>
                  </div>

                  {invoices.length > 4 && (
                    <div className="flex items-start gap-3 justify-end text-right">
                      <div className={`border p-3 rounded-lg max-w-[80%] text-xs leading-relaxed font-mono text-left ${
                        isDarkMode ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-slate-300" : "bg-gold-500/5 border-[#D4AF37]/45 text-slate-700"
                      }`}>
                        Create transaction ledger logs for the newly imported corporate client.
                      </div>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-medium text-xs mt-0.5 shrink-0 uppercase ${
                        isDarkMode ? "bg-royal-850 text-white" : "bg-slate-200 text-slate-800"
                      }`}>ME</div>
                    </div>
                  )}
                </div>

                {/* Quick examples chips suggestions */}
                <div className="mb-4 text-left">
                  <span className="text-[10px] text-slate-500 font-mono block uppercase mb-2">TAP TO INJECT SPECIMEN PROMPTS</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Invoice Vercel €8,400 for structural migration completed last week.",
                      "Bill Slack for 25 hours of consultation at $150/hr.",
                      "Create custom billing for Stripe, $12,000 package model, VAT 20% included."
                    ].map((sample, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePremadePrompt(sample)}
                        className={`border transition-all text-[10px] font-mono px-3 py-1.5 rounded-lg text-left ${
                          isDarkMode 
                            ? "bg-royal-950/50 hover:bg-gold-500/10 border-royal-800 hover:border-gold-500/30 text-slate-300 hover:text-white" 
                            : "bg-slate-50 hover:bg-gold-500/5 border-slate-200 hover:border-[#D4AF37]/40 text-slate-650 hover:text-slate-900 shadow-sm"
                        }`}
                      >
                        "{sample}"
                      </button>
                    ))}
                  </div>
                </div>

                {/* Massive conversational text input panel */}
                <form 
                  onSubmit={handleAIFormSubmit} 
                  className={`border rounded-xl p-2.5 flex items-center gap-2 transition-colors duration-300 ${
                    isDarkMode ? "bg-royal-950/80 border-royal-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-gold-500 animate-pulse shrink-0 ml-2" />
                  <input
                    type="text"
                    onChange={(e) => setInvoicePrompt(e.target.value)}
                    value={invoicePrompt}
                    placeholder="E.g., Create invoice for Dropbox Inc client, charging $5000 package, discount code applied..."
                    className={`flex-grow bg-transparent text-xs border-none focus:outline-none focus:ring-0 font-mono px-2 ${
                      isDarkMode ? "text-white placeholder-slate-600" : "text-slate-800 placeholder-slate-400"
                    }`}
                  />
                  
                  {/* Local sandboxed engine vs full stack backend routing toggle */}
                  <button
                    type="submit"
                    title="Synthesize Invoice using Gemini AI API"
                    className="bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-[#07122A] text-xs font-bold leading-none px-4 py-2.5 rounded-lg shrink-0 flex items-center gap-1.5 transition-all shadow-gold-subtle cursor-pointer"
                  >
                    {isGeneratingLocally ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    Synthesize
                  </button>
                </form>

              </div>

            </div>
          )}

          {/* TAB 4: SETTINGS PANELS */}
          {activeTab === 'settings' && (
            <div className="flex-grow flex flex-col gap-6 animate-fadeIn font-mono text-xs text-left">
              
              <div className={`p-6 rounded-xl border space-y-6 transition-all duration-300 ${
                isDarkMode ? "glass-panel border-royal-800 text-white" : "bg-white border-slate-200 shadow-sm text-slate-800"
              }`}>
                <div className={`border-b pb-3 mb-3 ${isDarkMode ? "border-royal-800" : "border-slate-150"}`}>
                  <h3 className={`font-display font-medium text-sm ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Enterprise System Parameters</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Configure regulatory, tax compliance numbers, and metadata options.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
                  
                  <div className="space-y-4">
                    <h4 className={`text-[10px] tracking-wider uppercase border-b pb-1 font-bold ${
                      isDarkMode ? "text-gold-400 border-royal-850" : "text-gold-650 border-slate-150"
                    }`}>Billing Entity Info (Your Corporate)</h4>
                    
                    <div>
                      <label className="text-slate-500 block mb-1">REGISTERED COMPANY NAME</label>
                      <input 
                        type="text" 
                        defaultValue="Fakturas Operations & Treasury Inc" 
                        className={`w-full border rounded p-2 focus:outline-none focus:border-gold-500/20 ${
                          isDarkMode ? "bg-royal-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-[#07122A]"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">LOCAL BUSINESS VAT id</label>
                      <input 
                        type="text" 
                        defaultValue="US-9082-8921" 
                        className={`w-full border rounded p-2 focus:outline-none focus:border-gold-500/20 ${
                          isDarkMode ? "bg-royal-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-[#07122A]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className={`text-[10px] tracking-wider uppercase border-b pb-1 font-bold ${
                      isDarkMode ? "text-gold-400 border-royal-850" : "text-gold-650 border-slate-150"
                    }`}>Remittance Directives</h4>

                    <div>
                      <label className="text-slate-500 block mb-1">SWIFT / DIRECT CODE</label>
                      <input 
                        type="text" 
                        defaultValue="CHIPUS33SFX" 
                        className={`w-full border rounded p-2 focus:outline-none focus:border-gold-500/20 ${
                          isDarkMode ? "bg-royal-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-[#07122A]"
                        }`}
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-1">IBAN LEDGER ACCOUNT</label>
                      <input 
                        type="text" 
                        defaultValue="US89 4000 1200 4821 9831" 
                        className={`w-full border rounded p-2 focus:outline-none focus:border-gold-500/20 ${
                          isDarkMode ? "bg-royal-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-205 text-[#07122A]"
                        }`}
                      />
                    </div>
                  </div>

                </div>

                <div className={`p-4 rounded-xl border flex items-center justify-between transition-colors duration-300 ${
                  isDarkMode ? "glass-panel border-gold-400/10 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                }`}>
                  <div className="text-left">
                    <h4 className={`font-semibold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>Automatic Reminders Switch</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Automatically trigger Slack metadata alert when client misses NET 14 due date window.</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-gold-400/20 border border-gold-400/50 p-[2px] flex items-center justify-end cursor-pointer">
                    <div className="w-4 h-4 rounded-full bg-gold-550 shadow-sm"></div>
                  </div>
                </div>

                <div className="text-right">
                  <button 
                    onClick={() => triggerToast("System settings synced globally.")}
                    className="bg-gold-500 hover:bg-gold-600 text-[#050816] font-bold px-4 py-2 rounded text-xs select-none cursor-pointer shadow-sm"
                  >
                    Save Options
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Decorative metal casing screws or indicators */}
      <div className="bg-royal-950 border-t border-royal-800 px-6 py-2.5 text-[9px] font-mono text-slate-500 flex justify-between items-center max-sm:flex-col gap-1 select-none">
        <span>Fakturas Financial Core SHA-256 Validated</span>
        <div className="flex gap-4">
          <span>PORT: 3000</span>
          <span>LATENCY: 14ms</span>
          <span className="text-[#D4AF37]">&bull; STABLE</span>
        </div>
      </div>
    </div>
  );
}
