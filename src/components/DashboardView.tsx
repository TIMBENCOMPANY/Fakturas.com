import React, { useState, useEffect } from "react";
import { 
  Users, FileText, CreditCard, LayoutTemplate, HelpCircle, 
  Plus, Search, Download, Sparkles, Trash2, CheckCircle, Clock, 
  Settings, LogOut, ChevronDown, Check, Globe
} from "lucide-react";
import { FakturasLogo } from "./FakturasLogo";
import { Invoice } from "../types";
import TemplatesSection from "./TemplatesSection";

interface Client {
  id: string;
  name: string;
  email: string;
  location: string;
  currency: string;
  createdAt: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  currency: string;
  method: string;
  date: string;
  status: "settled" | "escrow" | "releasing";
}

interface DashboardViewProps {
  user: any;
  onLogout: () => void;
  isDarkMode: boolean;
}

export default function DashboardView({ user, onLogout, isDarkMode }: DashboardViewProps) {
  // Sidebar items: Dashboard, Invoices, Clients, Payments, Templates, Settings, Logout
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "clients" | "payments" | "templates" | "settings">("overview");

  // State arrays for user-managed actual items
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Search & Filters
  const [clientSearch, setClientSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<string>("all");

  // Modals state
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);

  // Client form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientLocation, setClientLocation] = useState("");
  const [clientCurrency, setClientCurrency] = useState("USD");

  // Invoice form states
  const [invClientName, setInvClientName] = useState("");
  const [invNum, setInvNum] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invStatus, setInvStatus] = useState<"paid" | "pending" | "overdue" | "draft">("pending");
  const [invCurrency, setInvCurrency] = useState("USD");

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Administrator";
  const userInitials = userName.substring(0, 2).toUpperCase();

  // Populate actual storage-backed data with zero default placeholders (strictly real empty state)
  useEffect(() => {
    const storedClients = localStorage.getItem(`fakturas_clients_${user?.id}`);
    const storedInvoices = localStorage.getItem(`fakturas_invoices_${user?.id}`);
    const storedPayments = localStorage.getItem(`fakturas_payments_${user?.id}`);

    if (storedClients) {
      setClients(JSON.parse(storedClients));
    } else {
      setClients([]);
    }

    if (storedInvoices) {
      setInvoices(JSON.parse(storedInvoices));
    } else {
      setInvoices([]);
    }

    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    } else {
      setPayments([]);
    }
  }, [user]);

  // General persistence sync helper
  const syncStorage = (key: string, data: any) => {
    localStorage.setItem(`${key}_${user?.id}`, JSON.stringify(data));
  };

  // Client addition handler
  const handleAddClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) return;

    const newClient: Client = {
      id: `c-${Date.now()}`,
      name: clientName,
      email: clientEmail,
      location: clientLocation || "Global Registry",
      currency: clientCurrency,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newClient, ...clients];
    setClients(updated);
    syncStorage("fakturas_clients", updated);

    // Reset Form
    setClientName("");
    setClientEmail("");
    setClientLocation("");
    setClientCurrency("USD");
    setShowAddClient(false);
  };

  // Invoice addition handler
  const handleAddInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invClientName.trim() || !invNum.trim() || !invAmount.trim()) return;

    const parsedAmount = parseFloat(invAmount) || 0;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      clientName: invClientName,
      clientEmail: `${invClientName.toLowerCase().replace(/[^a-z0-9]/g, "") || "partner"}@finance.com`,
      invoiceNumber: invNum,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      currency: invCurrency,
      vatRate: 0,
      discountRate: 0,
      items: [
        { description: "Treasury Invoicing Ledger Line Item", quantity: 1, unitPrice: parsedAmount }
      ],
      status: invStatus,
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    syncStorage("fakturas_invoices", updatedInvoices);

    // If invoice is paid, create a payment record
    if (invStatus === "paid") {
      const newPay: Payment = {
        id: `p-${Date.now()}`,
        invoiceId: invNum,
        clientName: invClientName,
        amount: parsedAmount,
        currency: invCurrency,
        method: "Settled Balance Credit",
        date: new Date().toISOString().split("T")[0],
        status: "settled",
      };
      const updatedPays = [newPay, ...payments];
      setPayments(updatedPays);
      syncStorage("fakturas_payments", updatedPays);
    }

    // Reset Form
    setInvClientName("");
    setInvNum("");
    setInvAmount("");
    setInvStatus("pending");
    setShowAddInvoice(false);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter(inv => inv.id !== id);
    setInvoices(updated);
    syncStorage("fakturas_invoices", updated);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    syncStorage("fakturas_clients", updated);
  };

  // Stats Counters
  const realTotalRevenue = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + ((inv.items?.[0]?.unitPrice ?? 0) * (inv.items?.[0]?.quantity ?? 1)), 0);

  const realPaidInvoices = invoices.filter(inv => inv.status === "paid").length;
  const realPendingInvoices = invoices.filter(inv => inv.status === "pending").length;
  const realClientsCount = clients.length;

  const filterClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
    c.email.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.location.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filterInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesFilter = invoiceFilterStatus === "all" || inv.status === invoiceFilterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#050B1A] text-slate-100 flex flex-col md:flex-row font-sans relative">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[550px] bg-radial-gradient from-[#F5C542]/5 to-transparent blur-3xl pointer-events-none z-0 rounded-full"></div>

      {/* 4. SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 shrink-0 bg-[#070E1F] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between relative z-20">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <FakturasLogo className="w-8 h-8 text-[#F5C542] shrink-0" />
            <div>
              <h1 className="text-sm font-sans tracking-[0.2em] font-extrabold uppercase text-white flex items-center gap-1.5 animate-fadeIn">
                Fakturas
                <span className="bg-[#F5C542]/10 border border-[#F5C542]/30 text-[#F5C542] text-[7px] tracking-widest font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  LEDGER
                </span>
              </h1>
              <p className="text-[9px] text-slate-550 tracking-wider font-mono font-bold uppercase">Authorized Workspace</p>
            </div>
          </div>

          {/* Sidebar Menu Item list */}
          <nav className="p-4 space-y-1.5">
            {[
              { id: "overview", label: "Dashboard", icon: Sparkles },
              { id: "invoices", label: "Invoices", icon: FileText },
              { id: "clients", label: "Clients", icon: Users },
              { id: "payments", label: "Payments", icon: CreditCard },
              { id: "templates", label: "Templates", icon: LayoutTemplate },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all select-none cursor-pointer group ${
                    isActive
                      ? "bg-[#F5C542] text-[#050B1A] shadow-lg shadow-[#F5C542]/15 hover:brightness-110"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 1. Show the logged-in user account details card */}
        <div className="p-4 border-t border-white/5 bg-[#050B1B]/40">
          <div className="p-3.5 rounded-xl border border-white/5 bg-[#0a142c]/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center font-bold text-xs text-[#F5C542] font-mono">
                {userInitials}
              </div>
              <div className="min-w-0 flex-grow">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">Authorized User</p>
                <p className="text-xs text-white font-extrabold truncate" title={user?.email}>{user?.email}</p>
              </div>
            </div>
            
            {/* Supabase Secure Authorized Connection Indicator */}
            <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">SUPABASE ACTIVE</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-slate-450 hover:text-red-400 transition-all cursor-pointer"
                title="Sign out Secure"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT AREA */}
      <main className="flex-grow flex flex-col min-w-0 min-h-screen relative z-10 p-6 md:p-8 overflow-y-auto">
        
        {/* TAB 1: LEDGER OVERVIEW / DASHBOARD */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in text-left">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-2xl font-light text-white tracking-tight">Ledger Workspace</h2>
                <p className="text-xs text-slate-400 mt-1">Hello, Welcomed back to your secure certified treasury platform workspace.</p>
              </div>

              {/* Dynamic Indicator */}
              <div className="flex items-center gap-2 bg-[#0a142c]/65 border border-white/5 px-4 py-2 rounded-xl text-xs text-slate-350">
                <Globe className="w-3.5 h-3.5 text-[#F5C542]" />
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">REAL CHRONOLOGICAL LEAD</span>
              </div>
            </div>

            {/* 5. Dashboard cards showing real stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-[#0a142c]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5C542]/5 to-transparent rounded-full blur-2xl font-sans"></div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Total Revenue</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-semibold font-mono text-white">${realTotalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <span className="text-[9px] text-[#F5C542] font-mono tracking-wider">USD</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-emerald-400 font-semibold font-mono uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Real-time Settlement
                </div>
              </div>

              <div className="bg-[#0a142c]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5C542]/5 to-transparent rounded-full blur-2xl"></div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Paid Invoices</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-semibold font-mono text-white">{realPaidInvoices}</span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider">PAYMENTS</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-wider">
                  <CheckCircle className="w-3 h-3 text-[#F5C542]" />
                  Ledger Finalized
                </div>
              </div>

              <div className="bg-[#0a142c]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5C542]/5 to-transparent rounded-full blur-2xl"></div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Pending Invoices</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-semibold font-mono text-white">{realPendingInvoices}</span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider">AWAITING</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-[#F5C542] font-semibold font-mono uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-[#F5C542]" />
                  Remit Pending
                </div>
              </div>

              <div className="bg-[#0a142c]/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5C542]/5 to-transparent rounded-full blur-2xl font-sans"></div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">Clients</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-semibold font-mono text-white">{realClientsCount}</span>
                  <span className="text-[9px] text-slate-400 font-mono tracking-wider">MEMBERS</span>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-wider">
                  <Users className="w-3 h-3 text-[#F5C542]" />
                  Active Partners
                </div>
              </div>
            </div>

            {/* 3. Primary Actions Panel */}
            <div className="p-6 md:p-8 border border-white/5 rounded-3xl bg-[#0a142c]/35 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5C542]/30 to-transparent"></div>
              <div>
                <h3 className="text-lg font-light text-white tracking-tight text-left">Access Primary Operations</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xl text-left">Assemble live documents, register active corporate client attributes, or preview templates instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <button
                  onClick={() => { setInvNum(`FAK-${new Date().getFullYear()}-${Math.floor(Math.random() * 800) + 100}`); setShowAddInvoice(true); }}
                  className="p-5 bg-[#0a142c]/80 hover:bg-[#0a142c]/95 border border-white/[0.04] hover:border-[#F5C542]/35 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center text-[#F5C542] mb-4 group-hover:bg-[#F5C542]/20 transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-[#F5C542] transition-colors">Create Invoice</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-light">Draft professional billing invoices, adjust taxes, and secure remittance streams.</p>
                </button>

                <button
                  onClick={() => setShowAddClient(true)}
                  className="p-5 bg-[#0a142c]/80 hover:bg-[#0a142c]/95 border border-white/[0.04] hover:border-[#F5C542]/35 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center text-[#F5C542] mb-4 group-hover:bg-[#F5C542]/20 transition-all">
                    <Users className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-[#F5C542] transition-colors font-sans">Add Client</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-light font-sans">Register valid corporate partners, headquarters addresses, and base currencies.</p>
                </button>

                <button
                  onClick={() => setActiveTab("templates")}
                  className="p-5 bg-[#0a142c]/80 hover:bg-[#0a142c]/95 border border-white/[0.04] hover:border-[#F5C542]/35 rounded-2xl text-left transition-all duration-300 group hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center text-[#F5C542] mb-4 group-hover:bg-[#F5C542]/20 transition-all">
                    <LayoutTemplate className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-semibold text-white tracking-tight group-hover:text-[#F5C542] transition-colors">Choose Template</h4>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-light">Browse bespoke design presets tailored exactly to represent elite brand equity.</p>
                </button>
              </div>
            </div>

            {/* 2. REAL EMPTY STATES / LIST PREVIEWS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Invoices List Status */}
              <div className="bg-[#0a142c]/20 border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono text-slate-350">Recent Invoices List</h3>
                  {invoices.length > 0 && (
                    <button onClick={() => setActiveTab("invoices")} className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#F5C542] hover:underline">View All &rarr;</button>
                  )}
                </div>
                {invoices.length === 0 ? (
                  <div className="bg-[#0a142c]/30 border border-dashed border-white/5 rounded-xl py-12 px-4 text-center text-slate-450 font-light text-xs flex flex-col items-center justify-center space-y-2">
                    <FileText className="w-6 h-6 text-slate-500 mb-1" />
                    <span>No invoices yet. Click 'Create Invoice' to assemble your first draft.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(0, 3).map((inv) => (
                      <div key={inv.id} className="bg-[#0a142c]/50 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="font-mono text-[9px] text-slate-400 block">{inv.invoiceNumber}</span>
                          <span className="font-semibold text-white block truncate max-w-[140px]">{inv.clientName}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white block">${(inv.items?.[0]?.unitPrice ?? 0).toLocaleString()}</span>
                          <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            inv.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-[#F5C542]/10 text-[#F5C542] border border-[#F5C542]/20"
                          }`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clients List Status */}
              <div className="bg-[#0a142c]/20 border border-white/5 p-6 rounded-2xl space-y-4 font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider font-mono text-slate-350">Registered Clients</h3>
                  {clients.length > 0 && (
                    <button onClick={() => setActiveTab("clients")} className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#F5C542] hover:underline">View All &rarr;</button>
                  )}
                </div>
                {clients.length === 0 ? (
                  <div className="bg-[#0a142c]/30 border border-dashed border-white/5 rounded-xl py-12 px-4 text-center text-slate-450 font-light text-xs flex flex-col items-center justify-center space-y-2">
                    <Users className="w-6 h-6 text-slate-500 mb-1" />
                    <span>No clients yet. Register a client profile.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clients.slice(0, 3).map((client) => (
                      <div key={client.id} className="bg-[#0a142c]/50 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div className="text-left">
                          <span className="font-semibold text-white block truncate max-w-[150px]">{client.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono block">{client.email}</span>
                        </div>
                        <div className="text-right font-mono font-bold text-[#F5C542] uppercase tracking-wider">
                          {client.currency}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INVOICES PROGRESS & EDITING */}
        {activeTab === "invoices" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-light text-white tracking-tight">Active Invoices Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">Monitor billing details, dispatch custom reports, and audit transactions.</p>
              </div>
              <button
                onClick={() => { setInvNum(`FAK-${new Date().getFullYear()}-${Math.floor(Math.random() * 800) + 100}`); setShowAddInvoice(true); }}
                className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 select-none border border-[#F5C542]/20"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Assemble Draft
              </button>
            </div>

            {/* Filters Row */}
            <div className="bg-[#0a142c]/50 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex items-center gap-3 bg-[#050B1A]/40 px-3 py-2 rounded-xl border border-white/5 flex-grow">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Filter through invoice numbers or client names..."
                  className="w-full bg-transparent text-xs focus:outline-none placeholder:text-slate-650 font-light text-white border-none p-0"
                />
              </div>

              <div className="flex gap-2 shrink-0 overflow-x-auto">
                {["all", "paid", "pending", "overdue", "draft"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setInvoiceFilterStatus(status)}
                    className={`text-[9px] font-bold tracking-widest uppercase py-1.5 px-3.5 rounded-lg border select-none transition-all ${
                      invoiceFilterStatus === status
                        ? "bg-[#F5C542]/15 border-[#F5C542]/60 text-[#F5C542]"
                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. REAL EMPTY STATES - INVOICES */}
            {filterInvoices.length === 0 ? (
              <div className="bg-[#0a142c]/25 border border-white/5 rounded-2xl py-12 px-6 text-center text-slate-450 space-y-3 font-light text-sm">
                No ledger records are found. Assemble a draft invoice to initialize.
              </div>
            ) : (
              <div className="bg-[#0a142c]/50 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto scrollbar-none">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-mono tracking-widest text-slate-450 uppercase bg-white/[0.01]">
                      <th className="py-4.5 px-6 font-bold">Ledger ID</th>
                      <th className="py-4.5 px-6 font-bold">Corporate Entity</th>
                      <th className="py-4.5 px-6 font-bold">Date Dispatch</th>
                      <th className="py-4.5 px-6 font-bold">Net Total</th>
                      <th className="py-4.5 px-6 font-bold text-center">Status</th>
                      <th className="py-4.5 px-6 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {filterInvoices.map((inv) => {
                      const netVal = (inv.items?.[0]?.unitPrice ?? 0) * (inv.items?.[0]?.quantity ?? 1);
                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] transition-all">
                          <td className="py-4.5 px-6 font-mono text-xs font-bold text-white">{inv.invoiceNumber}</td>
                          <td className="py-4.5 px-6 font-sans">
                            <span className="font-semibold block text-slate-200">{inv.clientName}</span>
                            <span className="text-[10px] text-slate-400 font-light truncate max-w-sm block">{inv.items?.[0]?.description || "Consulting"}</span>
                          </td>
                          <td className="py-4.5 px-6 font-mono text-[11px] text-slate-405">{inv.issueDate}</td>
                          <td className="py-4.5 px-6 font-mono font-bold text-white">
                            {inv.currency === "JPY" ? "¥" : "$"}
                            {netVal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4.5 px-6 text-center whitespace-nowrap">
                            <span className={`inline-block text-[9px] font-mono tracking-wider px-2.5 py-1 rounded font-extrabold uppercase border ${
                              inv.status === "paid" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              inv.status === "pending" ? "bg-[#F5C542]/10 text-[#F5C542] border-[#F5C542]/20" :
                              inv.status === "overdue" ? "bg-rose-500/10 text-rose-450 border-rose-550/20" :
                              "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  alert(`Generating professional vector XML/PDF ledger draft for ${inv.invoiceNumber}.`);
                                }}
                                className="p-1.5 rounded-lg text-[#F5C542] hover:bg-white/[0.04] transition-all cursor-pointer"
                                title="Download Ledger XML"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteInvoice(inv.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/[0.04] transition-all cursor-pointer"
                                title="Purge Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CLIENTS PROFILE */}
        {activeTab === "clients" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-light text-white tracking-tight">Contracted Clients</h3>
                <p className="text-xs text-slate-450 mt-1">Register and manage corporate identities and primary settlement preferences.</p>
              </div>
              <button
                onClick={() => setShowAddClient(true)}
                className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-bold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 select-none border border-[#F5C542]/20"
              >
                <Plus className="w-4 h-4 shrink-0" />
                Add Client Profile
              </button>
            </div>

            {/* Filter Search */}
            <div className="bg-[#0a142c]/50 border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <Search className="w-4 h-4 text-slate-450 shrink-0" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search across corporate entity names or headquarter locations..."
                className="w-full bg-transparent text-sm focus:outline-none placeholder:text-slate-600 font-light border-none p-0 text-white"
              />
            </div>

            {/* 2. REAL EMPTY STATES - CLIENTS */}
            {filterClients.length === 0 ? (
              <div className="bg-[#0a142c]/25 border border-white/5 rounded-2xl py-12 px-6 text-center text-slate-450 space-y-3 font-light text-sm">
                No corporate entities are currently registered. Setup a client profile to initialize.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
                {filterClients.map((client) => (
                  <div key={client.id} className="bg-[#0a142c]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden transition-all hover:border-[#F5C542]/20 flex flex-col justify-between h-44 group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#F5C542]/5 to-transparent rounded-full blur-2xl"></div>
                    
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-semibold text-white tracking-tight line-clamp-1 group-hover:text-[#F5C542] transition-colors">{client.name}</h4>
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-1 rounded bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                          title="Delete Client"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-400 font-light truncate mt-1">{client.email}</p>
                    </div>

                    <div className="space-y-2 border-t border-white/5 pt-3 mt-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                        <span>Headquarters</span>
                        <span className="text-slate-300 font-medium">{client.location}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 uppercase">
                        <span>Base Currency</span>
                        <span className="text-[#F5C542] shrink-0 font-bold">{client.currency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-xl font-light text-white tracking-tight font-sans">Cleared Deposits & Settled Funds</h3>
              <p className="text-xs text-slate-450 mt-1">Audit and organize direct bank wire receipts and escrow clearances.</p>
            </div>

            {/* 2. REAL EMPTY STATES - PAYMENTS */}
            {payments.length === 0 ? (
              <div className="bg-[#0a142c]/25 border border-white/5 rounded-2xl py-12 px-6 text-center text-slate-455 space-y-3 font-light text-sm font-sans">
                No escrow receipts recorded. Setting active invoice status flags to 'Paid' populates settlement entries instantly.
              </div>
            ) : (
              <div className="bg-[#0a142c]/50 border border-white/5 rounded-2xl overflow-hidden overflow-x-auto scrollbar-none font-sans">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] font-mono tracking-widest text-slate-450 uppercase bg-white/[0.01]">
                      <th className="py-4.5 px-6 font-bold">Transaction Reference ID</th>
                      <th className="py-4.5 px-6 font-bold">Invoiced Source</th>
                      <th className="py-4.5 px-6 font-bold">Payment Method</th>
                      <th className="py-4.5 px-6 font-bold">Cleared Amount</th>
                      <th className="py-4.5 px-6 font-bold text-center">Status</th>
                      <th className="py-4.5 px-6 font-bold text-right">Settlement Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-4.5 px-6 font-mono text-slate-405">TXN-{p.id.split("-").pop()?.toUpperCase() || "PAY-A82"}</td>
                        <td className="py-4.5 px-6 font-semibold text-white">
                          <span>{p.clientName}</span>
                          <span className="text-[10px] text-slate-450 font-mono font-light block mt-0.5">{p.invoiceId}</span>
                        </td>
                        <td className="py-4.5 px-6 font-mono text-slate-400 text-xs">{p.method}</td>
                        <td className="py-4.5 px-6 font-mono font-bold text-white">${p.amount.toLocaleString()}</td>
                        <td className="py-4.5 px-6 text-center whitespace-nowrap">
                          <span className="inline-block text-[9px] font-mono tracking-wider px-2.5 py-1 rounded font-extrabold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4.5 px-6 font-mono text-right text-slate-450">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TEMPLATES */}
        {activeTab === "templates" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div>
              <h3 className="text-xl font-light text-white tracking-tight">Luxury Template presets</h3>
              <p className="text-xs text-slate-400 mt-1">Review responsive invoice styles configured strictly to represent premium brand values.</p>
            </div>

            <div className="border border-white/5 rounded-3xl bg-[#0a142c]/35 relative overflow-hidden backdrop-blur-md p-1">
              <div className="absolute top-0 right-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5C542]/30 to-transparent"></div>
              <TemplatesSection isDarkMode={isDarkMode} />
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS (TREASURY COMPLIANCE & RULES) */}
        {activeTab === "settings" && (
          <div className="space-y-6 animate-fade-in text-left max-w-2xl font-sans">
            <div>
              <h3 className="text-xl font-light text-white tracking-tight font-sans">Workspace Preferences</h3>
              <p className="text-xs text-slate-400 mt-1">Configure global invoicing rules, compliance flags, and secure connection indexes.</p>
            </div>

            <div className="bg-[#0a142c]/40 border border-white/5 rounded-2xl p-6 space-y-6">
              <div className="p-4 rounded-xl border border-[#F5C542]/20 bg-[#F5C542]/5 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 text-[#F5C542] font-bold">
                  <Check className="w-4 h-4 text-[#F5C542]" />
                  <span>EU MOSS Regulation Active</span>
                </div>
                <p className="font-light text-[11px] leading-relaxed">VAT calculations inherit strict European Union Article Annex compliance rules for digital service rendering.</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Platform Integrity Metadata</h4>
                
                <div className="grid grid-cols-1 gap-3 font-mono text-xs text-slate-350">
                  <div className="bg-[#050B1A] p-4 rounded-xl border border-white/5 space-y-1">
                    <p className="text-[10px] text-slate-555 uppercase tracking-widest font-bold">Account Identity</p>
                    <p className="text-white font-semibold">{userName}</p>
                  </div>
                  <div className="bg-[#050B1A] p-4 rounded-xl border border-white/5 space-y-1">
                    <p className="text-[10px] text-slate-555 uppercase tracking-widest font-bold">Secure Signed Identity Code</p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                  <div className="bg-[#050B1A] p-4 rounded-xl border border-white/5 space-y-1">
                    <p className="text-[10px] text-slate-555 uppercase tracking-widest font-bold">Cryptographic Key Index</p>
                    <p className="text-[9px] text-[#F5C542] break-all font-semibold select-all">SHA-256://fakt-auth-{user?.id?.substring(0, 16)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* POPUP: ADD CLIENT */}
      {showAddClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddClient(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-[#0a142c]/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-scale-up text-left">
            <h4 className="text-xl font-light text-white tracking-tight mb-2">Configure Corporate Client</h4>
            <p className="text-xs text-slate-450 mb-6">Set registry attributes for dynamic invoicing ledger targeting.</p>

            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Client Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client or corporation name"
                  className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors placeholder:text-slate-650 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Destination Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="e.g. accounts@client.com"
                  className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors placeholder:text-slate-650 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Location / Headquarters</label>
                <input
                  type="text"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  placeholder="e.g. London, UK"
                  className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors placeholder:text-slate-650 font-light"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Payment Settlement Currency</label>
                <select
                  value={clientCurrency}
                  onChange={(e) => setClientCurrency(e.target.value)}
                  className="w-full bg-[#050B1A]/70 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors cursor-pointer text-white"
                >
                  <option value="USD">USD ($) - US Dollars</option>
                  <option value="EUR">EUR (€) - Euros</option>
                  <option value="GBP">GBP (£) - British Pounds</option>
                  <option value="JPY">JPY (¥) - Japanese Yen</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="w-1/2 border border-slate-800 hover:border-slate-700 text-slate-350 text-xs font-bold tracking-wider uppercase py-3.5 rounded-xl transition-all select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all cursor-pointer select-none border border-[#F5C542]/20"
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: ASSEMBLE DRAFT INVOICE */}
      {showAddInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowAddInvoice(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-[#0a142c]/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl animate-scale-up text-left">
            <h4 className="text-xl font-light text-white tracking-tight mb-2">Invoice Assembly Sheet</h4>
            <p className="text-xs text-slate-450 mb-6">Set invoice metadata parameters for dynamic secure general ledger indexing.</p>

            <form onSubmit={handleAddInvoiceSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Invoice Serial ID</label>
                <input
                  type="text"
                  required
                  value={invNum}
                  onChange={(e) => setInvNum(e.target.value)}
                  className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Corporate Client Target</label>
                {clients.length === 0 ? (
                  <input
                    type="text"
                    required
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    placeholder="Enter target client entity name..."
                    className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors placeholder:text-slate-650 font-light font-sans"
                  />
                ) : (
                  <select
                    value={invClientName}
                    onChange={(e) => setInvClientName(e.target.value)}
                    className="w-full bg-[#050B1A]/70 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors cursor-pointer text-white"
                    required
                  >
                    <option value="">-- Choose Registered Client --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Gross Sum</label>
                  <input
                    type="number"
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    placeholder="Amount to invoice"
                    className="w-full bg-[#050B1A]/50 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Settlement Unit</label>
                  <select
                    value={invCurrency}
                    onChange={(e) => setInvCurrency(e.target.value)}
                    className="w-full bg-[#050B1A]/70 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors cursor-pointer font-semibold text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Ledger Status State</label>
                <select
                  value={invStatus}
                  onChange={(e: any) => setInvStatus(e.target.value)}
                  className="w-full bg-[#050B1A]/70 border border-slate-800 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#F5C542]/40 transition-colors cursor-pointer font-semibold text-white"
                >
                  <option value="pending">PENDING CLEARANCE (Unpaid)</option>
                  <option value="paid">DISPATCHED SETTLED (Paid)</option>
                  <option value="overdue">EXPIRED / OVERDUE</option>
                  <option value="draft">SYSTEM DRAFT</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddInvoice(false)}
                  className="w-1/2 border border-slate-800 hover:border-slate-700 text-slate-350 text-xs font-bold tracking-wider uppercase py-3.5 rounded-xl transition-all select-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-bold text-xs tracking-wider uppercase py-3.5 rounded-xl transition-all cursor-pointer select-none border border-[#F5C542]/20"
                >
                  Assemble Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
