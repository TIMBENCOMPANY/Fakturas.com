import { useState, FormEvent } from "react";
import { Mail, Lock, User, ArrowRight, Sparkles, ChevronLeft, AlertCircle, Info, Sun, Moon } from "lucide-react";
import { FakturasTextLogo } from "./FakturasLogo";
import { supabase, isSupabaseConfigured, validateEmail } from "../lib/supabase";

interface AuthScreensProps {
  currentView: "login" | "signup" | "forgot-password";
  setView: (view: "landing" | "login" | "signup" | "forgot-password" | "dashboard") => void;
  onAuthSuccess: (user: any) => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function AuthScreens({
  currentView,
  setView,
  onAuthSuccess,
  isDarkMode = true,
  onToggleDarkMode,
}: AuthScreensProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError("Please provide a valid email address.");
      return;
    }

    if (currentView !== "forgot-password" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Safe fallback Sandbox mode when Supabase variables are not specified yet in settings
        setTimeout(() => {
          setLoading(false);
          if (currentView === "login") {
            const mockUser = {
              email,
              user_metadata: { full_name: fullName || email.split("@")[0] },
              id: "sandbox-user-id",
            };
            onAuthSuccess(mockUser);
            setView("dashboard");
          } else if (currentView === "signup") {
            setSuccess("Your account was created in Sandbox mode. Click 'Sign In' to access the dashboard.");
          } else {
            setSuccess("A password reset link has been simulated successfully.");
          }
        }, 800);
        return;
      }

      if (currentView === "login") {
        const { data, error: authError } = await supabase!.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        if (data?.user) {
          onAuthSuccess(data.user);
          setView("dashboard");
        }
      } else if (currentView === "signup") {
        const { data, error: authError } = await supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (authError) throw authError;
        setSuccess("Registration successful! Please check your inbox for the confirmation link.");
      } else if (currentView === "forgot-password") {
        const { error: authError } = await supabase!.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#dashboard`,
        });

        if (authError) throw authError;
        setSuccess("Password reset instructions have been sent to your email address.");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const skipToSandbox = () => {
    const mockUser = {
      email: "finance@fakturas-sandbox.com",
      user_metadata: { full_name: "Sandbox Administrator" },
      id: "sandbox-user-id-direct",
    };
    onAuthSuccess(mockUser);
    setView("dashboard");
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between py-12 px-6 sm:px-8 relative z-10 font-sans transition-colors duration-300 ${
      isDarkMode ? "bg-[#050B1A] text-slate-100" : "bg-[#FAF8F3] text-slate-800"
    }`}>
      {/* Background radial lighting */}
      {isDarkMode ? (
        <>
          <div className="absolute inset-0 bg-[#050B1A]/40 backdrop-blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-[#F5C542]/10 to-transparent blur-3xl pointer-events-none z-0 rounded-full"></div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[#FAF8F3]/60 backdrop-blur-3xl z-0 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial-gradient from-[#F5C542]/5 to-transparent blur-3xl pointer-events-none z-0 rounded-full"></div>
        </>
      )}

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={() => setView("landing")}
          className={`group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            isDarkMode ? "text-slate-400 hover:text-[#F5C542]" : "text-slate-600 hover:text-[#F5C542]"
          }`}
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Website
        </button>
        <div className="flex items-center gap-4">
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              type="button"
              className={`p-2 rounded-xl transition-all border cursor-pointer select-none ${
                isDarkMode 
                  ? "bg-[#0a142c]/65 border-white/5 text-[#F5C542] hover:bg-white/5" 
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <FakturasTextLogo isDarkMode={isDarkMode} />
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto pt-8 pb-12">
        <div className={`shadow-2xl rounded-3xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-xl border transition-all duration-300 ${
          isDarkMode 
            ? "bg-[#0a142c]/70 border-white/5 shadow-black/45 text-slate-100" 
            : "bg-white border-slate-200/80 shadow-slate-200/25 text-[#050B1A]"
        }`}>
          {/* Subtle gold line on top */}
          <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-[#F5C542]/40 via-[#F5C542] to-[#F5C542]/40"></div>

          <div className="mb-8">
            <h2 className={`text-2xl sm:text-3xl font-light tracking-tight transition-colors ${
              isDarkMode ? "text-white" : "text-[#050B1A]"
            }`}>
              {currentView === "login" && "Welcome Back"}
              {currentView === "signup" && "Create your account"}
              {currentView === "forgot-password" && "Reset password"}
            </h2>
            <h3 className="text-xs font-semibold tracking-wider text-[#F5C542] uppercase mt-2">
              {currentView === "login" && "Sign in to your Fakturas account"}
              {currentView === "signup" && "Get started with Fakturas"}
              {currentView === "forgot-password" && "We'll send you reset instructions"}
            </h3>
          </div>

          {!isSupabaseConfigured && (
            <div className={`mb-6 p-4 rounded-xl border text-xs space-y-2 transition-all ${
              isDarkMode 
                ? "bg-[#F5C542]/5 border-[#F5C542]/20 text-slate-300" 
                : "bg-[#F5C542]/10 border-[#F5C542]/30 text-slate-800"
            }`}>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#F5C542] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#F5C542]">Supabase Credentials Pending:</span>
                  <p className="mt-1 font-light leading-relaxed">
                    Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the AI Studio Secrets panel. Running in <strong>Sandbox mode</strong> for instant preview.
                  </p>
                </div>
              </div>
              <button
                onClick={skipToSandbox}
                type="button"
                className="w-full text-center text-[#F5C542] hover:brightness-110 font-bold hover:underline transition-all block pt-1 select-none cursor-pointer"
              >
                Instant Access via Sandbox &rarr;
              </button>
            </div>
          )}

          {error && (
            <div className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-2.5 animate-shake ${
              isDarkMode 
                ? "bg-red-500/10 border-red-500/20 text-red-200" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />
              <span className="leading-relaxed font-light">{error}</span>
            </div>
          )}

          {success && (
            <div className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-2.5 ${
              isDarkMode 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200" 
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <Sparkles className="w-4 h-4 text-[#F5C542] shrink-0 mt-0.5 animate-pulse" />
              <span className="leading-relaxed font-light">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {currentView === "signup" && (
              <div className="space-y-1.5">
                <label className={`block text-[10px] font-mono uppercase tracking-widest font-semibold transition-colors ${
                  isDarkMode ? "text-slate-400" : "text-slate-650"
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexander Sterling"
                    className={`w-full rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#F5C542]/55 transition-colors font-light ${
                      isDarkMode 
                        ? "bg-[#050B1A]/50 border-slate-800 text-white placeholder:text-slate-600" 
                        : "bg-slate-50 border-slate-200 text-[#050B1A] placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className={`block text-[10px] font-mono uppercase tracking-widest font-semibold transition-colors ${
                isDarkMode ? "text-slate-400" : "text-slate-650"
              }`}>
                Email Address
              </label>
              <div className="relative">
                <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}>
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alexander@example.com"
                  className={`w-full rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#F5C542]/55 transition-colors font-light ${
                    isDarkMode 
                      ? "bg-[#050B1A]/50 border-slate-800 text-white placeholder:text-slate-600" 
                      : "bg-slate-50 border-slate-200 text-[#050B1A] placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            {currentView !== "forgot-password" && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={`block text-[10px] font-mono uppercase tracking-widest font-semibold transition-colors ${
                    isDarkMode ? "text-slate-400" : "text-slate-650"
                  }`}>
                    Password
                  </label>
                  {currentView === "login" && (
                    <button
                      type="button"
                      onClick={() => setView("forgot-password")}
                      className="text-[10px] text-[#F5C542] hover:brightness-110 font-bold tracking-wider uppercase hover:underline transition-all cursor-pointer font-sans"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 alphanumeric characters"
                    className={`w-full rounded-xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:border-[#F5C542]/55 transition-colors font-light ${
                      isDarkMode 
                        ? "bg-[#050B1A]/50 border-slate-800 text-white placeholder:text-slate-600" 
                        : "bg-slate-50 border-slate-200 text-[#050B1A] placeholder:text-slate-400"
                    }`}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full cursor-pointer bg-[#F5C542] hover:bg-[#ffeb99] text-[#050B1A] font-semibold text-xs tracking-[0.2em] uppercase py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 select-none border border-[#F5C542]/20 active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none ${
                isDarkMode 
                  ? "shadow-[0_12px_40px_rgba(245,197,66,0.25)]" 
                  : "shadow-[0_12px_30px_rgba(245,197,66,0.15)] shadow-slate-200/50"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {currentView === "login" && "Sign In"}
                  {currentView === "signup" && "Create Account"}
                  {currentView === "forgot-password" && "Send Reset Link"}
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </>
              )}
            </button>
          </form>

          <div className={`mt-8 pt-6 border-t text-center text-xs flex flex-col gap-2 font-sans transition-colors ${
            isDarkMode 
              ? "border-slate-800/60 text-slate-400" 
              : "border-slate-200 text-slate-600"
          }`}>
            {currentView === "login" && (
              <div>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("signup")}
                  className="text-[#F5C542] font-semibold hover:underline cursor-pointer"
                >
                  Create one &rarr;
                </button>
              </div>
            )}

            {currentView === "signup" && (
              <div>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-[#F5C542] font-semibold hover:underline cursor-pointer"
                >
                  Sign In &rarr;
                </button>
              </div>
            )}

            {currentView === "forgot-password" && (
              <div>
                Remember your password?{" "}
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-[#F5C542] font-semibold hover:underline cursor-pointer"
                >
                  Sign In &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Credits */}
      <footer className={`relative z-10 w-full text-center text-[10px] font-mono tracking-widest uppercase select-none transition-colors ${
        isDarkMode ? "text-slate-500" : "text-slate-400"
      }`}>
        &copy; 2026 Fakturas. All rights reserved.
      </footer>
    </div>
  );
}
