import { useState, useRef, FormEvent, useEffect } from "react";
import { 
  Sparkles, TrendingUp, Coins, ShieldCheck, FileSpreadsheet, 
  Download, ChevronRight, HelpCircle, Check, ArrowRight, 
  Play, Users, Star, ArrowUpRight, CheckSquare, MessageCircle, 
  Globe, Briefcase, Menu, X, Layers, CreditCard, Lock, Percent,
  Sun, Moon, Send, MapPin, Mail, ChevronDown
} from "lucide-react";
import InteractiveDashboard from "./components/InteractiveDashboard";
import DashboardMockup from "./components/DashboardMockup";
import AILoader from "./components/AILoader";
import TemplatesSection from "./components/TemplatesSection";
import { FakturasLogo, FakturasTextLogo } from "./components/FakturasLogo";
import { Invoice } from "./types";
import AuthScreens from "./components/AuthScreens";
import DashboardView from "./components/DashboardView";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
// @ts-ignore
import heroScene from "./assets/images/fakturas_new_hero_1779476323472.png";

// Dynamic Heuristic client fallback parser for resilient offline action
function parseInvoiceHeuristic(prompt: string): Invoice {
  const numbers = prompt.match(/\d+([.,]\d+)?/g);
  let amount = 3500;
  if (numbers && numbers.length > 0) {
    const parsed = parseFloat(numbers[0].replace(',', '.'));
    if (parsed > 50) amount = parsed;
  }

  const lowercasePrompt = prompt.toLowerCase();
  let clientName = "Specimen Corporation";
  
  if (lowercasePrompt.includes("vercel")) clientName = "Vercel, Inc.";
  else if (lowercasePrompt.includes("slack")) clientName = "Slack Technologies";
  else if (lowercasePrompt.includes("figma")) clientName = "Figma, Inc.";
  else if (lowercasePrompt.includes("stripe")) clientName = "Stripe, Inc.";
  else if (lowercasePrompt.includes("spacex")) clientName = "SpaceX Core Team";
  else if (lowercasePrompt.includes("dropbox")) clientName = "Dropbox, Inc.";
  else {
    const matches = prompt.match(/(?:for|to|bill)\s+([A-Z][a-zA-Z0-9]*(\s+[A-Z][a-zA-Z0-9]*)*)/);
    if (matches && matches[1]) {
      clientName = matches[1].trim();
    }
  }

  let currency = "USD";
  if (lowercasePrompt.includes("euro") || prompt.includes("€") || lowercasePrompt.includes("eur")) currency = "EUR";
  else if (lowercasePrompt.includes("gbp") || prompt.includes("£") || lowercasePrompt.includes("pound")) currency = "GBP";

  let items = [
    { description: "Principal Product UI/UX Engineering Flow Package", quantity: 1, unitPrice: amount }
  ];

  if (lowercasePrompt.includes("hour") || lowercasePrompt.includes("@") || lowercasePrompt.includes("at")) {
    let rate = 175;
    let hours = 20;
    
    const rateMatch = prompt.match(/(?:at|@)\s*([$€£]?\s*)?(\d+)/i);
    const hoursMatch = prompt.match(/(\d+)\s*hour/i);
    
    if (rateMatch && rateMatch[2]) rate = parseInt(rateMatch[2]);
    if (hoursMatch && hoursMatch[1]) hours = parseInt(hoursMatch[1]);
    
    items = [
      {
        description: lowercasePrompt.includes("design") ? "Enterprise Visual System Architecture Design" : "Distributed Smart Ledger Auditing Protocols",
        quantity: hours,
        unitPrice: rate
      }
    ];
  }

  return {
    id: `inv-${Date.now()}`,
    clientName,
    clientEmail: `finance@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'subsidiary'}.com`,
    clientAddress: "750 Sand Hill Road, Building 4, Menlo Park, CA",
    invoiceNumber: `FAK-2026-${Math.floor(Math.random() * 890) + 110}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency,
    vatRate: lowercasePrompt.includes("vat") || lowercasePrompt.includes("tax") ? 20 : 0,
    discountRate: lowercasePrompt.includes("discount") || lowercasePrompt.includes("code") ? 10 : 0,
    items,
    notes: "Integrated with Fakturas ledger verification compliance systems.",
    status: "pending"
  };
}

export default function App() {
  const [route, setRoute] = useState<"landing" | "login" | "signup" | "forgot-password" | "dashboard">("landing");
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  const [heroPrompt, setHeroPrompt] = useState("");
  const [aiPromptText, setAiPromptText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [syntheticInvoice, setSyntheticInvoice] = useState<Invoice | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Parse path and hash
  const parseCurrentRoute = (): typeof route => {
    const hash = window.location.hash;
    const path = window.location.pathname;
    
    if (hash === "#/login" || hash === "#login" || path === "/login") return "login";
    if (hash === "#/signup" || hash === "#signup" || path === "/signup") return "signup";
    if (hash === "#/forgot-password" || hash === "#forgot-password" || path === "/forgot-password") return "forgot-password";
    if (hash === "#/dashboard" || hash === "#dashboard" || path === "/dashboard") return "dashboard";
    
    return "landing";
  };

  const navigateTo = (newRoute: typeof route) => {
    setRoute(newRoute);
    if (newRoute === "landing") {
      window.history.pushState(null, "", "/");
    } else {
      window.history.pushState(null, "", `#/${newRoute}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth synchronization effect
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      const cached = localStorage.getItem("fakturas_sandbox_user");
      if (cached) {
        setUser(JSON.parse(cached));
      }
      return;
    }

    supabase!.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen to hash / history changes
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseCurrentRoute();
      setRoute(parsed);
    };

    window.addEventListener("hashchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);
    
    const initialRoute = parseCurrentRoute();
    setRoute(initialRoute);

    return () => {
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Route Guardian
  useEffect(() => {
    if (!authLoading) {
      if (route === "dashboard" && !user) {
        navigateTo("login");
      } else if ((route === "login" || route === "signup" || route === "forgot-password") && user) {
        navigateTo("dashboard");
      }
    }
  }, [route, user, authLoading]);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    } else {
      localStorage.removeItem("fakturas_sandbox_user");
    }
    setUser(null);
    navigateTo("landing");
  };

  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactInquiryType, setContactInquiryType] = useState("enterprise");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;
    setIsSubmittingContact(true);
    
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1000);
  };

  useEffect(() => {
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Customized luxury golden vector 'F' favicon
    const fillBg = isDarkMode ? "%2307122A" : "%23FFFFFF";
    const textFill = "%23F5C542";
    const svgStr = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='6' fill='${fillBg}'/><text x='10' y='23' font-family='sans-serif' font-weight='950' font-size='20' fill='${textFill}'>F</text></svg>`;
    
    link.href = `data:image/svg+xml;utf8,${svgStr}`;
  }, [isDarkMode]);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  const scrollToPlayground = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Centralized generator triggering full stack or heuristic
  const triggerInvoicingSynthesizer = async (text: string) => {
    setAiPromptText(text);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/ai/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text })
      });

      const data = await response.json();

      if (data && data.success && data.invoice) {
        // Appending internal ID and status parameters
        const receivedInv: Invoice = {
          ...data.invoice,
          id: `inv-${Date.now()}`,
          status: "pending"
        };
        setSyntheticInvoice(receivedInv);
      } else {
        // Safe heuristic fallback for non-configured spaces
        throw new Error("Gemini fallback triggered");
      }
    } catch {
      // Execute local parser offline/sandbox mode instantly
      console.log("Leveraging ultra-resilient heuristic parser...");
      const mockInv = parseInvoiceHeuristic(text);
      setSyntheticInvoice(mockInv);
    } finally {
      // Stop loading element
      setIsAiLoading(false);
      scrollToPlayground();
    }
  };

  const handleHeroSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!heroPrompt.trim()) return;
    triggerInvoicingSynthesizer(heroPrompt);
    setHeroPrompt("");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050B1A] flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 border-2 border-[#F5C542] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono tracking-[0.2em] text-slate-400 uppercase font-semibold">Synchronizing Secure Session...</p>
        </div>
      </div>
    );
  }

  if (route === "login" || route === "signup" || route === "forgot-password") {
    return (
      <AuthScreens 
        currentView={route} 
        setView={navigateTo} 
        onAuthSuccess={(u) => {
          setUser(u);
          if (!isSupabaseConfigured) {
            localStorage.setItem("fakturas_sandbox_user", JSON.stringify(u));
          }
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  if (route === "dashboard") {
    return (
      <DashboardView 
        user={user} 
        onLogout={handleLogout} 
        isDarkMode={isDarkMode} 
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-hidden relative ${
      isDarkMode 
        ? "bg-[#050B1A] text-slate-100 selection:bg-[#F5C542] selection:text-[#050B1A]" 
        : "bg-[#FAF8F5] text-slate-800 selection:bg-[#F5C542] selection:text-white"
    }`}>
      
      {/* Dynamic Fixed Ambient Studio Grid Backdrop */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle grid lines, extremely faint */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"
          style={{
            maskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 30%, #000 70%, transparent 100%)"
          }}
        />
        {/* Soft elegant gradient mesh blending into native layout colors */}
        <div className={`absolute inset-0 transition-colors duration-500 bg-gradient-to-b ${
          isDarkMode 
            ? "from-[#050B1A]/80 via-[#0a142c]/95 to-[#050B1A]" 
            : "from-[#FCFAF7]/90 via-[#FAF8F5]/96 to-[#FAF8F5]"
        }`}></div>
      </div>

      {/* Absolute blurred gradients orbs */}
      <div className={`absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-radial-gradient ${isDarkMode ? 'from-[#F5C542]/10' : 'from-[#F5C542]/15'} to-transparent blur-3xl pointer-events-none z-0`}></div>
      <div className={`absolute top-[800px] left-[-200px] w-[500px] h-[500px] rounded-full ${isDarkMode ? 'bg-[#F5C542]/5' : 'bg-[#F5C542]/8'} blur-3xl pointer-events-none z-0`}></div>
      <div className={`absolute top-[1800px] right-[-200px] w-[600px] h-[600px] rounded-full ${isDarkMode ? 'bg-royal-600/10' : 'bg-[#F5C542]/5'} blur-3xl pointer-events-none z-0`}></div>

      {/* AI Synthesizer loading screen */}
      {isAiLoading && (
        <AILoader 
          promptText={aiPromptText} 
          onComplete={() => setIsAiLoading(false)} 
        />
      )}

      {/* LUXURY STICKY NAVIGATION BAR WITH GLASS BLUR */}
      <header className={`sticky top-0 left-0 right-0 w-full z-40 backdrop-blur-md border-b transition-all duration-300 ${
        isDarkMode 
          ? "bg-[#050B1A]/80 border-white/5 text-slate-100" 
          : "bg-[#FCFAF7]/85 border-slate-200/50 text-slate-800"
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FakturasTextLogo isDarkMode={isDarkMode} />
          </div>

          <nav className={`flex items-center gap-11 max-md:hidden text-sm font-medium transition-colors ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}>
            <a href="#features" className={`relative py-1.5 px-0.5 transition-colors group ${isDarkMode ? "hover:text-white" : "hover:text-slate-950"}`}>
              Features
            </a>
            <a href="#dashboard-play" className={`relative py-1.5 px-0.5 transition-colors flex items-center gap-1.5 group ${isDarkMode ? "hover:text-white" : "hover:text-slate-950"}`}>
              Invoice Builder
              <span className="bg-[#F5C542]/10 text-[#F5C542] text-[8.5px] font-mono px-1.5 py-0.5 rounded border border-[#F5C542]/20 uppercase tracking-widest font-bold">New</span>
            </a>
            <a href="#pricing" className={`relative py-1.5 px-0.5 transition-colors group ${isDarkMode ? "hover:text-white" : "hover:text-slate-950"}`}>
              Pricing
            </a>
            <a href="#contact" className={`relative py-1.5 px-0.5 transition-colors group ${isDarkMode ? "hover:text-white" : "hover:text-slate-950"}`}>
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-5 max-md:hidden">
            {/* Theme toggle switch */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className={`p-2 rounded-full border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                isDarkMode 
                  ? "border-white/10 bg-white/[0.02] text-[#F5C542] hover:bg-white/[0.05]" 
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateTo("dashboard")}
                  className="px-4.5 py-2 bg-[#F5C542] text-[#050B1A] rounded-xl text-xs font-bold tracking-wide transition-all hover:brightness-110 shadow-lg shadow-[#F5C542]/15 active:scale-[0.98] cursor-pointer select-none"
                >
                  Dashboard
                </button>
                <div className="relative">
                  <button
                    onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a142c]/65 border border-white/5 text-slate-300 hover:text-white tracking-wide font-medium transition-all select-none cursor-pointer hover:border-[#F5C542]/20"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/25 text-[#F5C542] flex items-center justify-center font-bold font-mono text-[9px]">
                      {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-450" />
                  </button>
                  {headerDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-48 rounded-xl bg-[#0a142c]/95 border border-white/5 py-2 shadow-2xl backdrop-blur-md z-50">
                      <button
                        onClick={() => { setHeaderDropdownOpen(false); navigateTo("dashboard"); }}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-[#F5C542] hover:bg-white/[0.02] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => { setHeaderDropdownOpen(false); handleLogout(); }}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 font-semibold hover:bg-red-500/5 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        Sign out secure
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => navigateTo("login")}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    isDarkMode ? "hover:text-white text-slate-400" : "hover:text-slate-905 text-slate-600"
                  }`}
                >
                  Log in
                </button>
                <button 
                  onClick={() => navigateTo("signup")}
                  className="px-4.5 py-2 bg-[#F5C542] text-[#050B1A] rounded-xl text-xs font-bold tracking-wide transition-all hover:brightness-110 shadow-lg shadow-[#F5C542]/15 active:scale-[0.98] cursor-pointer"
                >
                  Start free
                </button>
              </>
            )}
          </div>

          {/* Mobile navigation or toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`p-1.5 rounded-full border ${
                isDarkMode ? "border-[#F5C542]/20 text-[#F5C542]" : "border-slate-300 text-slate-700"
              }`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 transition-colors ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-black"}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown menu */}
        {mobileMenuOpen && (
          <div className={`absolute top-full left-0 right-0 md:hidden border-b py-2 px-4 shadow-xl z-50 transition-all ${
            isDarkMode 
              ? "bg-[#050B1A]/96 border-white/5 text-slate-150 backdrop-blur-md" 
              : "bg-[#FCFAF7]/96 border-slate-200/80 text-slate-800 backdrop-blur-md"
          }`}>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 py-1 text-[10px] font-sans font-bold uppercase tracking-wider">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className={`hover:text-[#F5C542] py-0.5 transition-colors ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>FEATURES</a>
              <a href="#dashboard-play" onClick={() => setMobileMenuOpen(false)} className="text-[#F5C542] hover:brightness-110 py-0.5 transition-colors">INVOICE BUILDER</a>
              {user ? (
                <button onClick={() => { setMobileMenuOpen(false); navigateTo("dashboard"); }} className="text-[#F5C542] hover:brightness-110 py-0.5 transition-colors uppercase font-bold text-[10px] tracking-wider">DASHBOARD</button>
              ) : (
                <>
                  <button onClick={() => { setMobileMenuOpen(false); navigateTo("login"); }} className={`hover:text-[#F5C542] py-0.5 transition-colors ${isDarkMode ? "text-slate-300" : "text-slate-700"} uppercase font-bold text-[10px] tracking-wider`}>LOG IN</button>
                  <button onClick={() => { setMobileMenuOpen(false); navigateTo("signup"); }} className="text-[#F5C542] hover:brightness-110 py-0.5 transition-colors uppercase font-bold text-[10px] tracking-wider">SIGN UP</button>
                </>
              )}
            </div>
            <div className="pt-1.5 pb-1 flex justify-center">
              <button 
                onClick={() => { setMobileMenuOpen(false); user ? navigateTo("dashboard") : navigateTo("signup"); }}
                className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-extrabold tracking-[0.12em] py-2 px-5 rounded-[12px] text-[9px] uppercase shadow-[0_4px_12px_rgba(245,197,66,0.2)] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#F5C542]/20"
              >
                {user ? "ACCESS LEDGER" : "START FREE"}
              </button>
            </div>
          </div>
        )}

      </header>

      {/* MAIN LAYOUT WRAPPERS */}
      <main className="pt-4 sm:pt-6 md:pt-8 space-y-28 max-sm:space-y-16">

        {/* 1. HERO SECTION & PORTFOLIO POSTER BACKDROP */}
        <section className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-4 lg:gap-0 items-center w-full relative z-10 overflow-visible">
            
            {/* LEFT COLUMN: HERO CONTENT AND COPYS */}
            <div className="space-y-4 md:space-y-6 flex flex-col justify-center text-left overflow-visible pr-2">
              
              {/* Premium Top Capsule Badge */}
              <div className={`inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full transition-all select-none shadow-[0_4px_15px_rgba(245,197,66,0.15)] border ${
                isDarkMode 
                  ? "bg-[#0a142c]/80 border-[#F5C542]/30 text-[#F5C542]" 
                  : "bg-white border-[#F5C542]/45 text-[#F5C542]"
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-[#F5C542] animate-pulse" />
                <span className="text-[9px] font-sans tracking-[0.25em] uppercase font-bold text-[#F5C542]">
                  AI-POWERED INVOICING
                </span>
                <ChevronRight className="w-3 h-3 text-[#F5C542]" />
              </div>

              {/* Luxury Headline */}
              <h1 className={`font-serif-luxury text-4xl sm:text-6xl md:text-7.5xl lg:text-7xl xl:text-8.5xl tracking-tight leading-[0.98] ${isDarkMode ? "text-white" : "text-black"} flex flex-col gap-1 sm:gap-1.5`}>
                <span className={isDarkMode ? "font-light text-white" : "font-light text-black"}>Invoicing</span>
                <span className="text-gold-pure-gradient font-semibold">Simplified.</span>
                <span className={`${isDarkMode ? "font-light text-white" : "font-light text-black"} mt-0.5 sm:mt-1`}>Business</span>
                <span className="text-gold-pure-gradient font-semibold">Amplified.</span>
              </h1>

              {/* Description styled in SAFIRA MARCH / premium sans-serif typography */}
              <p className={`text-xs sm:text-sm leading-relaxed max-w-[480px] transition-colors duration-300 font-sans font-light tracking-wide ${
                isDarkMode ? 'text-slate-350' : 'text-slate-650'
              }`}>
                Create professional invoices, track payments and get paid faster. All in one smart platform built for modern businesses.
              </p>

              {/* Luxury CTA buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[480px]">
                <button 
                  onClick={() => user ? navigateTo("dashboard") : navigateTo("signup")}
                  className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-semibold text-xs tracking-[0.2em] uppercase py-4.5 px-8 rounded-xl transition-all duration-300 hover:scale-[1.015] active:scale-[0.985] shadow-[0_12px_45px_rgba(245,197,66,0.35)] flex items-center justify-center gap-2 cursor-pointer border border-[#F5C542]/20"
                >
                  {user ? "Dashboard" : "Start Free"}
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                <button 
                  onClick={scrollToPlayground}
                  className={`border border-[#F5C542]/50 hover:border-[#F5C542] font-semibold text-xs tracking-[0.2em] uppercase py-4.5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode 
                      ? 'bg-[#050B1A]/40 text-[#F5C542] hover:text-white hover:bg-white/5 hover:shadow-[0_0_15px_rgba(245,197,66,0.15)] shadow-md' 
                      : 'bg-white text-slate-800 hover:text-black border-slate-300 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <Play className="w-3 h-3 text-[#F5C542] fill-[#F5C542] shrink-0" />
                  Watch Demo
                </button>
              </div>

              {/* Sub-features icons row below buttons */}
              <div className={`grid grid-cols-2 gap-3.5 sm:gap-6 pt-6 max-sm:grid-cols-1 border-t ${isDarkMode ? "border-white/5" : "border-slate-150"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,197,66,0.05)]">
                    <Sparkles className="w-4 h-4 text-[#F5C542]" />
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-light tracking-[0.15em] uppercase ${isDarkMode ? "text-slate-350" : "text-slate-900"}`}>AI Invoice Generator</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,197,66,0.05)]">
                    <Coins className="w-4 h-4 text-[#F5C542]" />
                  </div>
                   <div>
                    <h4 className={`text-[10px] font-light tracking-[0.15em] uppercase ${isDarkMode ? "text-slate-350" : "text-slate-900"}`}>Smart Payment Tracking</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,197,66,0.05)]">
                    <ShieldCheck className="w-4 h-4 text-[#F5C542]" />
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-light tracking-[0.15em] uppercase ${isDarkMode ? "text-slate-350" : "text-slate-900"}`}>Automated Reminders</h4>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,197,66,0.05)]">
                    <TrendingUp className="w-4 h-4 text-[#F5C542]" />
                  </div>
                  <div>
                    <h4 className={`text-[10px] font-light tracking-[0.15em] uppercase ${isDarkMode ? "text-slate-350" : "text-slate-900"}`}>Real-Time Analytics</h4>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: REALISTIC SAAS DASHBOARD MOCKUP PREVIEW */}
            <div className="relative flex justify-center lg:justify-end items-center z-20 w-full overflow-visible lg:-mt-6 lg:-mr-6">
              <div 
                className="relative w-full lg:w-[124%] xl:w-[138%] 2xl:w-[145%] lg:max-w-none origin-center group/dashboard transition-all duration-500 overflow-visible lg:-ml-12 xl:-ml-16"
              >
                {/* Soft gold ambient lighting/glow effect around the important dashboard component */}
                <div className="absolute -inset-8 bg-gradient-to-tr from-[#F5C542]/20 to-royal-500/10 rounded-[3rem] blur-[80px] opacity-100 group-hover/dashboard:scale-105 transition-transform duration-700 pointer-events-none"></div>
                
                {/* Stunning bespoke dashboard mockup component displaying live mock stats */}
                <div className="relative transform hover:scale-[1.015] transition-transform duration-300">
                  <DashboardMockup isDarkMode={isDarkMode} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 1.5 DECK SYNTHESIZER SEARCH INPUT */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pt-2 text-center flex flex-col items-center">
          {/* Quick conversational prompt input at Hero Section */}
          <div className="w-full max-w-2xl mb-12 text-center">
            <p className={`text-[10px] font-mono mb-3 block uppercase tracking-[0.2em] font-semibold ${isDarkMode ? "text-[#F5C542]" : "text-slate-500"}`}>
              DIRECT DECK SYNTHESIZER
            </p>
            <div className={`w-full p-2.5 rounded-2xl transition-all duration-300 shadow-sm ${
              isDarkMode 
                ? 'bg-[#0a142c]/65 border border-white/5 focus-within:border-[#F5C542]/30' 
                : 'bg-white border border-slate-200 focus-within:border-[#F5C542]/55 shadow-md'
            }`}>
              <form onSubmit={handleHeroSubmit} className="flex gap-2">
                <input 
                  type="text" 
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="Type e.g., 'Invoice SpaceX for 20 hours at $300/hour plus 10% VAT code applied'..."
                  className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-xs px-3 font-mono placeholder:text-slate-400 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}
                />
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-[#F5C542] to-[#E4B22B] text-[#050B1A] font-bold text-[11px] font-mono px-5 py-2.5 rounded-lg shrink-0 flex items-center gap-1.5 transition-all shadow-md hover:brightness-110 cursor-pointer"
                >
                  Synthesize
                </button>
              </form>
            </div>
          </div>

          {/* DEDICATED LIVE PRODUCT PREVIEW HEADER */}
          <div className="w-full max-w-4xl text-center space-y-3 mt-4 mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] text-[9.5px] font-mono uppercase tracking-[0.15em] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] animate-ping" />
              <span>Interactive Application Sandbox</span>
            </div>
            <h2 className={`font-serif-luxury text-3xl sm:text-5xl tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
              Live Product Preview
            </h2>
            <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Test the actual invoice generation module below. Experience how easily Fakturas handles smart currency translation, automated ledger matching, and direct compliant billing output.
            </p>
          </div>

          {/* DEDICATED CONFIDENCE / TRUST INDICATORS ROW */}
          <div className="w-full max-w-5xl grid grid-cols-5 gap-3.5 max-lg:grid-cols-3 max-sm:grid-cols-2 mt-2 px-1 text-center">
            {[
              { label: "Secure", detail: "SOC-2 + SSL Encryption", desc: "Bank-grade transmission protocols", icon: ShieldCheck },
              { label: "GDPR Ready", detail: "Privacy Aligned", desc: "100% compliant data nodes", icon: Lock },
              { label: "VAT Support", detail: "Article 203 Compliant", desc: "Automatic international tax checking", icon: Percent },
              { label: "Multi Currency", detail: "Universal FX Router", desc: "Supports USD, EUR, GBP, AUD, SGD", icon: Globe },
              { label: "PDF Export", detail: "Single-Click Dispatch", desc: "Pristine, designer-ready printables", icon: Download }
            ].map((indicator, idx) => {
              const Icon = indicator.icon;
              return (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex flex-col items-center justify-between transition-all duration-300 group/trust ${
                    isDarkMode 
                      ? "border-white/5 bg-[#0a142c]/40 hover:border-[#F5C542]/20 hover:bg-[#0a142c]/60" 
                      : "border-slate-200/60 bg-white/60 shadow-[0_4px_20px_rgba(245,197,66,0.02)] hover:shadow-[0_10px_30px_rgba(245,197,66,0.06)] hover:border-[#F5C542]/30"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center text-[#F5C542] shrink-0 mb-2 transition-transform group-hover/trust:scale-110">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h5 className={`text-[11px] font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                      {indicator.label}
                    </h5>
                    <p className={`text-[9.5px] font-medium leading-none text-[#F5C542]`}>
                      {indicator.detail}
                    </p>
                    <p className="text-[8.5px] leading-tight text-slate-400 font-light max-sm:hidden">
                      {indicator.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LANDING TARGET - INTERACTIVE WORKSPACE */}
          <div id="dashboard-play" ref={dashboardRef} className="w-full relative py-6">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[350px] bg-[#F5C542]/5 blur-3xl pointer-events-none z-0"></div>
            <div className={`relative z-10 p-2 border rounded-3xl transition-all duration-300 ${
              isDarkMode 
                ? 'border-white/5 bg-[#0a142c]/30 shadow-gold-subtle' 
                : 'border-slate-200/60 bg-white/80 shadow-[0_20px_60px_rgba(245,197,66,0.05),0_4px_30px_rgba(0,0,0,0.02)]'
            }`}>
              <InteractiveDashboard 
                onAiStart={triggerInvoicingSynthesizer}
                syntheticInvoice={syntheticInvoice}
                resetSyntheticInvoice={() => setSyntheticInvoice(null)}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

        </section>

        {/* 2. TRUSTED BY SECTION */}
        <section className={`py-10 border-y transition-colors duration-300 text-center ${
          isDarkMode ? "bg-royal-950/30 border-royal-900/45" : "bg-slate-100/60 border-slate-200"
        }`}>
          <p className="text-[10px] font-mono tracking-[0.25em] text-slate-500 uppercase mb-8">GLOBAL FINTECH TRANSFERS VERIFIED IN PARTNERSHIP WITH</p>
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-around gap-8 text-sm font-display font-semibold tracking-wider text-slate-500/50 select-none">
            {["STRI-PE", "COINBASE", "DROP-BOX", "V-ERCEL", "APP_LE", "SL-ACK", "REVOLUT"].map((brand, idx) => (
              <span key={idx} className="hover:text-[#F5C542]/55 transition-colors uppercase tracking-[0.2em]">{brand}</span>
            ))}
          </div>
        </section>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h4 className="text-xs font-mono tracking-[0.25em] text-gold-500 uppercase font-semibold">Fakturas Core Capabilities</h4>
            <h2 className={`font-display font-bold text-3xl sm:text-4xl tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Enterprise Infrastructure Invoicing</h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-650"}`}>Pragmatic, beautifully packaged elements certified for automated global transaction compliance.</p>
          </div>

          <div className="grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-6">
            {[
              { id: "feat-1", title: "AI Invoice Generator", desc: "Generate professional invoices in seconds. Instantly compile billing schemas by stating conversational details in natural language.", icon: Sparkles, gold: true },
              { id: "feat-2", title: "Client Management", desc: "Manage clients and billing history. Track customer profiles, billing addresses, and tax credentials in unified directories.", icon: Users },
              { id: "feat-3", title: "Recurring Billing", desc: "Automate recurring invoices. Set up subscription payment cycles or retainer billings mapped to automatic reminders.", icon: Layers },
              { id: "feat-4", title: "Payment Tracking", desc: "Track paid and unpaid invoices. Monitor live remittances, payout states, and outstanding balances in real-time.", icon: CreditCard },
              { id: "feat-5", title: "VAT & Tax Support", desc: "Handle tax calculations easily. Automatic regional tax compliance standard checking, customized rates, and international VAT parsing.", icon: Percent },
              { id: "feat-6", title: "PDF Export", desc: "Export invoices instantly. Compile raw documents directly into pixel-perfect, vector-sharp PDF invoices with a single click.", icon: Download },
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id}
                  className={`p-8 rounded-2xl border transition-all duration-300 relative group/card min-h-[250px] flex flex-col justify-start ${
                    feat.gold 
                      ? "border-[#F5C542]/35 bg-[#F5C542]/5 shadow-lg shadow-[#F5C542]/5 hover:border-[#F5C542] hover:shadow-[0_0_30px_rgba(245,197,66,0.2)] hover:-translate-y-1" 
                      : isDarkMode
                        ? "border-white/5 bg-[#0a142c]/40 backdrop-blur-md hover:border-[#F5C542]/45 hover:bg-[#0a142c]/75 hover:shadow-[0_0_35px_rgba(245,197,66,0.12)] hover:-translate-y-1.5"
                        : "border-slate-200/70 bg-white shadow-sm hover:shadow-md hover:border-[#F5C542]/40 hover:-translate-y-1.5"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 border transition-all duration-300 ${
                    feat.gold 
                      ? "bg-[#F5C542]/20 border-[#F5C542]/40 text-[#F5C542]" 
                      : isDarkMode
                        ? "bg-[#0d1a33]/80 border-white/5 text-slate-400 group-hover/card:text-gold-400 group-hover/card:border-[#F3C76B]/30 group-hover/card:scale-105"
                        : "bg-slate-50 border-slate-25 text-slate-600 group-hover/card:text-gold-500 group-hover/card:border-gold-500/30 group-hover/card:scale-105"
                  }`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                  <h3 className={`font-display font-semibold mb-2 tracking-wide text-base transition-colors ${
                    isDarkMode ? "text-white group-hover/card:text-gold-400" : "text-slate-900 group-hover/card:text-gold-600"
                  }`}>{feat.title}</h3>
                  <p className={`text-xs leading-relaxed font-sans transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3.5. PREMIUM INVOICE TEMPLATES SECTION */}
        <TemplatesSection isDarkMode={isDarkMode} />

        {/* 4. FUTURISTIC AI SECTION */}
        <section id="ai-assistant" className="max-w-7xl mx-auto px-6 relative text-left">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-500/5 blur-3xl pointer-events-none rounded-full"></div>

          <div className={`p-10 max-sm:p-6 rounded-3xl border relative z-10 grid grid-cols-2 gap-10 max-lg:grid-cols-1 items-center transition-all duration-300 ${
            isDarkMode ? "border-gold-500/15 bg-royal-950/20" : "border-slate-200 bg-white shadow-lg"
          }`}>
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 bg-gold-500/15 border border-gold-500/30 px-3.5 py-1 rounded-full text-[10px] font-mono tracking-widest text-[#F5C542] uppercase">
                AI Invoicing Assistant
              </div>
              <h2 className={`font-display font-bold text-3xl sm:text-4xl tracking-tight leading-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>
                “Generate invoices with <span className="text-gold-gradient">one sentence.</span>”
              </h2>
              <p className={`text-xs sm:text-sm leading-relaxed font-sans transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Fakturas' AI Assistant digests details like quantities, currency symbols, tax rates, and client terms from simple sentences. Watch AI compile structured invoices in real-time.
              </p>

              <div className="space-y-3.5 text-xs font-mono">
                <div className="flex items-center gap-2.5 font-sans">
                  <div className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-[#F5C542] text-[10px] shrink-0 font-bold font-mono">✓</div>
                  <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Resilient parsing falls back gracefully when offline</span>
                </div>
                <div className="flex items-center gap-2.5 font-sans">
                  <div className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-[#F5C542] text-[10px] shrink-0 font-bold font-mono">✓</div>
                  <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Generates structured ledger entries instantly</span>
                </div>
                <div className="flex items-center gap-2.5 font-sans">
                  <div className="w-5 h-5 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-[#F5C542] text-[10px] shrink-0 font-bold font-mono">✓</div>
                  <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>Forces accurate automatic tax compliance math</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={scrollToPlayground}
                  className={`font-semibold text-xs tracking-wider uppercase px-5 py-3 rounded-lg flex items-center gap-2 transition-all ${
                    isDarkMode 
                      ? "bg-royal-900 hover:bg-royal-800 border border-slate-800 text-gold-400 hover:border-[#F5C542]/40" 
                      : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-850"
                  }`}
                >
                  Configure Fakturas AI
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Assistant Chat mockup widget */}
            <div className={`p-6 rounded-2xl border text-xs font-mono relative transition-all duration-350 ${
              isDarkMode ? "border-gold-500/10 bg-royal-950/45 text-slate-300" : "border-slate-200 bg-slate-50/50 text-slate-750"
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 mb-4 ${isDarkMode ? "border-royal-850" : "border-slate-200"}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className={`font-bold text-[10px] tracking-wider uppercase ${isDarkMode ? "text-white" : "text-slate-850"}`}>AI Assistant live</span>
                </div>
                <span className="text-[9px] text-slate-500">REALTIME LINK</span>
              </div>

              <div className="space-y-4 mb-4 select-none text-left">
                <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                  isDarkMode ? "bg-royal-900/60 border-slate-850 text-slate-400" : "bg-white border-slate-200 text-slate-600"
                }`}>
                  <span className="text-gold-500 font-bold">PROMPT_</span> "Bill Figma client €12,500 total package for core development deliverables."
                </div>
                
                <div className={`p-3 rounded-lg border text-[11px] leading-relaxed ${
                  isDarkMode ? "bg-royal-900/40 border-slate-800 text-slate-300" : "bg-white border-slate-150 text-slate-700"
                }`}>
                  <span className="text-emerald-500 font-bold">&gt;&gt; EXTRACTED INVOICE OBJECT</span><br />
                  <span className="text-slate-400">Client:</span> Figma, Inc. <br />
                  <span className="text-slate-400">Invoice:</span> FAK-2026-903 <br />
                  <span className="text-slate-405">Total Valuation:</span> <span className="text-[#F5C542] font-semibold">€12,500.00 EUR</span>
                </div>
              </div>

              {/* Fake typing row triggers actual page synthesis */}
              <div className={`border-t pt-3 flex gap-2 ${isDarkMode ? "border-royal-800" : "border-slate-200"}`}>
                <input 
                  type="text" 
                  placeholder="Click synthetic suggestions above..." 
                  disabled
                  className="flex-grow bg-transparent text-[11px] text-slate-500 border-none focus:outline-none"
                />
                <button 
                  onClick={scrollToPlayground}
                  className="bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-extrabold text-[10px] px-3.5 py-1.5 rounded transition-all active:scale-95 shadow-md shadow-[#F5C542]/20 border border-[#F5C542]/20"
                >
                  Try Sandbox
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 5. PRICING SECTION */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4">
            <h4 className="text-xs font-mono tracking-[0.25em] text-gold-500 uppercase font-semibold">Flexible SaaS Licensing</h4>
            <h2 className={`font-display font-bold text-3xl sm:text-4xl tracking-tight transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Structured For Dynamic Scale</h2>
            <p className={`text-xs sm:text-sm max-w-xl mx-auto transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-650"}`}>Instant compliance setup. Zero hidden surcharge fees. Upgrade or cancel anytime.</p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-xl:gap-4 max-lg:grid-cols-1 max-w-5xl mx-auto text-left">
            <div className={`p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
              isDarkMode 
                ? "border-white/5 bg-[#0a142c]/40 backdrop-blur-md hover:border-[#F5C542]/30 hover:bg-[#0a142c]/65" 
                : "border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(245,197,66,0.06)] hover:border-[#F5C542]/35"
            }`}>
              <div>
                <span className="text-[10px] font-sans text-slate-500 tracking-wider block mb-1">INDEPENDENT</span>
                <h3 className={`font-display font-semibold tracking-wide text-lg mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Starter</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-display font-bold ${isDarkMode ? "text-white" : "text-slate-950"}`}>$19</span>
                  <span className="text-slate-500 text-xs font-sans"> / month</span>
                </div>
                <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Perfect starting package for freelancers, sole traders, and independent developers.</p>
                
                <div className={`space-y-3.5 border-t pt-6 text-xs ${isDarkMode ? "border-white/5 text-slate-355" : "border-slate-100 text-slate-700"}`}>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Up to 15 Compliant Invoices / mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Multi-Currency Sandbox Engine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-gold-500 shrink-0" />
                    <span>Vector PDF Downloads</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={scrollToPlayground} 
                  className={`w-full font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                    isDarkMode 
                      ? "bg-[#0e1e3e] hover:bg-[#1c2e5e] text-white border border-white/5"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  Choose Starter
                </button>
              </div>
            </div>

             {/* Tier 2: HIGHLIGHTED PRO CARDS */}
            <div className={`p-8 rounded-2xl border-2 flex flex-col justify-between relative transition-all duration-300 ${
              isDarkMode 
                ? "border-[#F5C542] bg-[#0e1e3e]/75 shadow-gold-heavy text-slate-100" 
                : "border-[#F5C542] bg-white shadow-[0_20px_50px_rgba(245,197,66,0.1)] text-slate-850 hover:shadow-[0_20px_60px_rgba(245,197,66,0.13)]"
            }`}>
              
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-gold-600 to-[#F5C542] text-[#050B1A] text-[9px] font-sans font-bold tracking-widest px-3.5 py-1 rounded-full uppercase">
                MOST POPULAR
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-sans text-[#F5C542] tracking-wider uppercase font-bold">RECOMMENDED SCALE</span>
                  <Sparkles className="w-4 h-4 text-[#F5C542] animate-pulse" />
                </div>
                <h3 className={`font-display font-semibold tracking-wide text-lg mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Pro (Recommended)</h3>
                <div className="mb-6">
                  <span className="text-4xl font-display font-bold text-[#F5C542]">$49</span>
                  <span className="text-slate-500 text-xs font-sans"> / month</span>
                </div>
                <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? "text-slate-350" : "text-slate-650"}`}>Ideal model for growing agencies, consulting firms, and active startups requiring pro tool compliance.</p>
                
                <div className={`space-y-3.5 border-t pt-6 text-xs ${isDarkMode ? "border-white/5 text-slate-300" : "border-slate-150 text-slate-700"}`}>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Unlimited AI Invoice Generation</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Active VAT Compliance Articles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Dynamic Analytics & Charts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Direct Account Remittance Details</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button onClick={scrollToPlayground} className="w-full bg-gradient-to-r from-[#F5C542] to-[#E4B22B] hover:brightness-110 text-[#050B1A] font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md hover:scale-[1.01] cursor-pointer shadow-[#F5C542]/20">
                  Choose Pro
                </button>
              </div>
            </div>

            {/* Tier 3 */}
            <div className={`p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
              isDarkMode 
                ? "border-white/5 bg-[#0a142c]/40 backdrop-blur-md hover:border-[#F5C542]/30 hover:bg-[#0a142c]/65" 
                : "border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_50px_rgba(245,197,66,0.06)] hover:border-[#F5C542]/35"
            }`}>
              <div>
                <span className="text-[10px] font-sans text-slate-500 tracking-wider block mb-1">BUSINESS SCALE</span>
                <h3 className={`font-display font-semibold tracking-wide text-lg mb-4 ${isDarkMode ? "text-white" : "text-slate-900"}`}>Business</h3>
                <div className="mb-6">
                  <span className={`text-4xl font-display font-bold ${isDarkMode ? "text-white" : "text-slate-950"}`}>$149</span>
                  <span className="text-slate-500 text-xs font-sans"> / month</span>
                </div>
                <p className={`text-xs mb-6 leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>Pristine global transaction elements designed for large corporate organizations & financial houses.</p>
                
                <div className={`space-y-3.5 border-t pt-6 text-xs ${isDarkMode ? "border-white/5 text-slate-355" : "border-slate-100 text-slate-700"}`}>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Custom Brand Monogram Uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Multi-Entity Treasury Logins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>Dedicated Compliance Auditor</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#F5C542] shrink-0" />
                    <span>API Webhook Integrations</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  onClick={scrollToPlayground} 
                  className={`w-full font-bold py-3.5 rounded-xl text-xs tracking-wider uppercase transition-colors cursor-pointer ${
                    isDarkMode 
                      ? "bg-[#0d1a33] hover:bg-[#152747] text-white border border-white/5"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200"
                  }`}
                >
                  Choose Business
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* 6. TESTIMONIALS SECTION */}
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h4 className="text-xs font-sans tracking-[0.25em] text-gold-500 uppercase font-semibold text-center">FUNDED STARTUP PERSPECTIVE</h4>
            <h2 className={`font-display font-bold text-3xl sm:text-4xl text-center transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Trusted By Industry Architects</h2>
          </div>

          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1 max-w-5xl mx-auto text-left">
            {[
              {
                name: "Arthur Pendelton",
                role: "Director of Global Operations",
                company: "Vercel Enterprise",
                quote: "Fakturas' AI translator completely restructured our billing mechanics. We generate corporate compliance invoices through text queries in less than 5 seconds. Absolute masterclass development."
              },
              {
                name: "Sarah Lin",
                role: "Lead Treasury Engineer",
                company: "Stripe Integrations",
                quote: "The interface spacing and dynamic currency matrices are Apple-grade. Playing with the sliders and instantly logging compliant tax calculations is a beautiful interaction."
              },
              {
                name: "Christian Vance",
                role: "General Finance Partner",
                company: "Coinbase Treasury",
                quote: "As a highly regulated corporate entity, our compliance threshold is high. Fakturas handles EU Article 203 VAT and currency standards flawlessly with pristine mathematical security."
              }
            ].map((test, index) => (
              <div key={index} className={`p-6 rounded-2xl border text-xs transition-all duration-300 ${
                isDarkMode 
                  ? "border-royal-800 bg-royal-950/20 text-slate-300" 
                  : "border-slate-200 bg-white/95 shadow-sm hover:shadow-md text-slate-700"
              }`}>
                {/* 5 stars decoration */}
                <div className="flex gap-1 text-gold-500 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-gold-500" />)}
                </div>
                <p className={`italic mb-6 leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>"{test.quote}"</p>
                <div className={`border-t pt-4 flex gap-3 items-center ${isDarkMode ? "border-royal-850" : "border-slate-100"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-sans ${
                    isDarkMode ? "bg-royal-800 border-slate-750 text-slate-300" : "bg-slate-100 text-slate-650"
                  }`}>
                    {test.name[0]}
                  </div>
                  <div>
                    <h4 className={`font-display font-semibold tracking-wide ${isDarkMode ? "text-white" : "text-slate-900"}`}>{test.name}</h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{test.role} &bull; {test.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FINAL CTA */}
        <section className="relative">
          <div className="absolute inset-0 bg-radial-gradient from-gold-500/10 to-transparent blur-3xl pointer-events-none"></div>
          
          <div className={`max-w-4xl mx-auto px-6 py-20 text-center space-y-8 relative z-10 border rounded-3xl transition-all duration-300 ${
            isDarkMode 
              ? "bg-[#0a142c]/45 border-white/5" 
              : "bg-white border-slate-200 shadow-xl"
          }`}>
            <h2 className={`font-display font-bold text-3xl sm:text-5xl tracking-tight max-w-2xl mx-auto leading-tight transition-colors duration-300 ${
              isDarkMode ? "text-white" : "text-[#050B1A]"
            }`}>
              Ready to Upgrade to <br />
              <span className="text-gold-gradient font-bold">Autonomous Invoicing?</span>
            </h2>
            <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed transition-colors duration-300 ${
              isDarkMode ? "text-slate-450" : "text-slate-600"
            }`}>
              Launch Fakturas and join hundreds of fast-scaling agencies, freelancers, and global firms keeping their billing elegant, compliant, and secured.
            </p>

            <div className="pt-4">
              <button 
                onClick={scrollToPlayground}
                className="bg-gradient-to-r from-[#F5C542] to-[#E4B22B] hover:brightness-110 text-[#050B1A] font-bold text-xs tracking-wider uppercase px-10 py-5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-[#F5C542]/20 inline-flex items-center gap-2 cursor-pointer"
              >
                Synthesize Invoices Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-[10px] font-sans text-slate-500 uppercase pt-6">
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-gold-500" /> 256-Bit SSL</span>
              <span>&bull;</span>
              <span>Refund Guarantee</span>
              <span>&bull;</span>
              <span>NET 14 Certified</span>
            </div>
          </div>
        </section>

        {/* 7.5 CONTACT SECTION */}
        <section id="contact" className="max-w-7xl mx-auto px-6 space-y-12 relative z-10 scroll-mt-24">
          <div className="text-center space-y-3">
            <h4 className="text-xs font-sans tracking-[0.25em] text-gold-500 uppercase font-semibold text-center">TREASURY COMMUNICATIONS</h4>
            <h2 className={`font-display font-bold text-3xl sm:text-4xl text-center transition-colors duration-300 ${isDarkMode ? "text-white" : "text-[#07122A]"}`}>Initiate Secure Inquiries</h2>
            <p className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed transition-colors duration-300 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Reach out directly to our Treasury specialists for priority accounts, enterprise integrations, or legal compliance support.
            </p>
          </div>

          <div className="grid grid-cols-5 gap-8 max-lg:grid-cols-1 max-w-5xl mx-auto items-stretch">
            {/* Form Column */}
            <div className={`col-span-3 p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
              isDarkMode 
                ? "bg-royal-950/20 border-royal-800/80 hover:border-gold-500/10 shadow-sm" 
                : "bg-white border-slate-200/90 shadow-md hover:border-[#F5C542]/40"
            }`}>
              
              {contactSuccess ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-4 py-8 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className={`font-display font-semibold text-lg ${isDarkMode ? "text-white" : "text-slate-900"}`}>Transmission Authorized</h3>
                  <p className={`text-xs max-w-sm font-sans leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Your compliance & treasury dispatch was safely encrypted. A financial coordinator will contact you shortly.
                  </p>
                  <button 
                    onClick={() => setContactSuccess(false)}
                    className="text-gold-500 hover:text-gold-400 font-sans text-[11px] font-bold tracking-wider uppercase border border-gold-500/20 hover:border-gold-500/45 px-4 py-2 rounded-lg transition-all"
                  >
                    Send New Dispatch
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5 text-left flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                      <div>
                        <label className={`text-[10px] font-sans uppercase tracking-wider block mb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Your Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Arthur Pendelton"
                          className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-colors duration-300 font-sans ${
                            isDarkMode 
                              ? "bg-royal-950/50 border-royal-800 text-white focus:border-gold-500/30" 
                              : "bg-slate-50 border-slate-200 text-[#07122A] focus:border-[#F5C542]/50"
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`text-[10px] font-sans uppercase tracking-wider block mb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Entity Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="arthur@vercel.com"
                          className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-colors duration-300 font-sans ${
                            isDarkMode 
                              ? "bg-royal-950/50 border-royal-800 text-white focus:border-gold-500/30" 
                              : "bg-slate-50 border-slate-200 text-[#07122A] focus:border-[#F5C542]/50"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`text-[10px] font-sans uppercase tracking-wider block mb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Inquiry Parameters</label>
                      <select 
                        value={contactInquiryType}
                        onChange={(e) => setContactInquiryType(e.target.value)}
                        className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-colors duration-300 font-sans cursor-pointer ${
                          isDarkMode 
                            ? "bg-royal-950/60 border-royal-800 text-white focus:border-gold-500/30" 
                            : "bg-slate-50 border-slate-200 text-[#07122A] focus:border-[#F5C542]/50"
                        }`}
                      >
                        <option value="enterprise">Enterprise Ledger Suite ($149)</option>
                        <option value="api">Treasury API Webhook integration</option>
                        <option value="compliance">Corporate compliance & VAT Article 203</option>
                        <option value="other">General secure inquiries</option>
                      </select>
                    </div>

                    <div>
                      <label className={`text-[10px] font-sans uppercase tracking-wider block mb-1.5 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Inquiry Message Block</label>
                      <textarea 
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="State legal or financial specifications, desired seats count, or treasury parameters here..."
                        className={`w-full border rounded-xl p-3 text-xs focus:outline-none transition-colors duration-300 font-sans resize-none ${
                          isDarkMode 
                            ? "bg-royal-950/50 border-royal-800 text-white focus:border-gold-500/30" 
                            : "bg-slate-50 border-slate-200 text-[#07122A] focus:border-[#F5C542]/50"
                        }`}
                      ></textarea>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full mt-4 bg-gradient-to-r from-[#F5C542] to-[#E4B22B] hover:brightness-110 disabled:from-slate-700 disabled:to-slate-800 text-[#050B1A] font-bold text-xs tracking-wider uppercase py-4 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmittingContact ? (
                      <>Authenticating Secure Dispatch...</>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Transmit Encrypted Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Info Cards Column */}
            <div className="col-span-2 flex flex-col justify-between gap-4">
              <div className={`p-6 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${
                isDarkMode 
                  ? "border-royal-800/60 bg-royal-950/20 text-slate-300" 
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md text-slate-700"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-xs font-sans uppercase tracking-wider font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>DIRECT SECURE CONDUIT</h4>
                  <p className="text-[11px] text-slate-500 font-sans">contact@fakturas.com</p>
                  <p className="text-[10px] leading-relaxed text-slate-400">Average latency &bull; NET 14 hours priority queue.</p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${
                isDarkMode 
                  ? "border-royal-800/60 bg-royal-950/20 text-slate-300" 
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md text-slate-700"
              }`}>
                <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-xs font-sans uppercase tracking-wider font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>GLOBAL HEADQUARTERS</h4>
                  <p className="text-[11px] text-slate-500 font-sans">Berlin, Germany</p>
                  <p className="text-[10px] leading-relaxed text-slate-400">Engineering, product, and European compliance sandbox infrastructure.</p>
                </div>
              </div>

              {/* Status Indicator Panel */}
              <div className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between ${
                isDarkMode 
                  ? "border-royal-800/30 bg-royal-950/10 text-slate-400" 
                  : "border-slate-150 bg-slate-50 text-slate-650 shadow-inner"
              }`}>
                <div className="flex items-center gap-2 text-[10px] font-sans uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>SYSTEM COM STATUS</span>
                </div>
                <span className="text-[10px] font-sans text-emerald-500 font-semibold uppercase">FULLY SECURE</span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. ENTERPRISE FOOTER */}
        <footer className={`border-t transition-all duration-300 pt-16 pb-12 font-sans text-xs ${
          isDarkMode ? "border-royal-900/45 bg-royal-950/80 text-slate-500" : "border-slate-200 bg-slate-50 text-slate-600"
        }`}>
          <div className={`max-w-7xl mx-auto px-6 grid grid-cols-4 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1 pb-12 mb-12 border-b ${
            isDarkMode ? "border-royal-900/40" : "border-slate-200"
          }`}>
            
            {/* Col 1 Brand */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2">
                <svg className="w-7 h-7 text-gold-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" rx="22" fill="#0B1736" stroke="rgba(245, 197, 66, 0.2)" strokeWidth="1" />
                  <path d="M35 30H65V40H47V50H60V60H47V75H35V30Z" fill="url(#gold-grad-footer)" />
                  <defs>
                    <linearGradient id="gold-grad-footer" x1="35" y1="30" x2="65" y2="75" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F3E9BD" />
                      <stop offset="0.5" stopColor="#F5C542" />
                      <stop offset="1" stopColor="#E0AC22" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={`font-display font-semibold tracking-[0.2em] text-sm select-none ${isDarkMode ? "text-white" : "text-slate-900"}`}>FAKTURAS</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                FAKTURAS Treasury Technologies Inc. <br />
                Pristine digital ledgers verified globally under automated cryptographic standards.
              </p>
            </div>

            {/* Col 2 Product */}
            <div className="space-y-3 text-left">
              <h4 className={`text-[10px] tracking-wider uppercase font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Ledger Suite</h4>
              <ul className="space-y-2 text-[10px]">
                <li><a href="#features" className="hover:text-gold-500">AI Synthesizer</a></li>
                <li><a href="#features" className="hover:text-gold-500">VAT Article Compliance</a></li>
                <li><a href="#features" className="hover:text-gold-500">Multi-Currency Systems</a></li>
                <li><a href="#features" className="hover:text-gold-500">Vector PDF Renderers</a></li>
              </ul>
            </div>

            {/* Col 3 Resources */}
            <div className="space-y-3 text-left">
              <h4 className={`text-[10px] tracking-wider uppercase font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Corporate API</h4>
              <ul className="space-y-2 text-[10px]">
                <li><a href="#pricing" className="hover:text-gold-500">Pricing Models</a></li>
                <li><a href="#features" className="hover:text-gold-500">Developer Documentation</a></li>
                <li><a href="#features" className="hover:text-gold-500">Compliance Guideline Book</a></li>
                <li><a href="#features" className="hover:text-gold-500">Status Node Ledger</a></li>
              </ul>
            </div>

            {/* Col 4 Compliance */}
            <div className="space-y-3 text-left">
              <h4 className={`text-[10px] tracking-wider uppercase font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Regulatory Legal</h4>
              <ul className="space-y-2 text-[10px]">
                <li><a href="#features" className="hover:text-gold-500">Privacy Protocols</a></li>
                <li><a href="#features" className="hover:text-gold-500">Terms of Remittance</a></li>
                <li><a href="#features" className="hover:text-gold-500">EU VAT Article Annex</a></li>
                <li><a href="#features" className="hover:text-gold-500 font-bold text-gold-550 flex items-center gap-1">GDPR Secured</a></li>
              </ul>
            </div>

          </div>

          <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-[10px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Fakturas Treasury Operations Inc. All transactions archived.</p>
            <p className="flex items-center gap-2 text-right">
              <span>DESIGNED BY ARTISANS FOR LEADERS</span>
              <span>&bull;</span>
              <span>SHA-256 COMPLIANT</span>
            </p>
          </div>
        </footer>

      </main>

    </div>
  );
}
