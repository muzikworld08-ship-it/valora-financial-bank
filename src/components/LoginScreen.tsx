import React, { useState } from "react";
import { KeyRound, CreditCard, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { UserProfile } from "../types";
import { ValoraLogo } from "./ValoraLogo";

interface LoginScreenProps {
  users: UserProfile[];
  onLogin: (userId: string) => void;
  onEnterAdmin: () => void;
  dark: boolean;
  onBack?: () => void;
}

export function LoginScreen({ users, onLogin, onEnterAdmin, dark, onBack }: LoginScreenProps) {
  // Single unified login form state
  const [accountNumber, setAccountNumber] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPIN] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const acct = accountNumber.trim();
    const pwd = password.trim();
    const securityPin = pin.trim();

    if (!acct) {
      setError("Please enter your 10-digit account number.");
      return;
    }
    if (!pwd) {
      setError("Please enter your account password.");
      return;
    }
    if (securityPin.length < 4) {
      setError("Please enter your 4-digit security PIN.");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountNumber: acct,
          password: pwd,
          pin: securityPin,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("session_user_id", data.userId || "ADMIN");
        localStorage.setItem("session_is_admin", String(data.isAdminView));

        setAccountNumber("");
        setPassword("");
        setPIN("");
        if (data.isAdminView) {
          onEnterAdmin();
        } else {
          onLogin(data.userId);
        }
      } else {
        const errorMsg = data.error || "Access Denied! Invalid credentials. Verify Account Number, Password, and security PIN.";
        setError(errorMsg);
        console.warn("[LOGIN_API_FAIL]", errorMsg);
      }
    } catch (err: any) {
      setError("Portal Connection Timeout. Please check your network linkage or contact support.");
      console.error("[LOGIN_NETWORK_ERROR]", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePinChange = (val: string) => {
    const sanitized = val.replace(/\D/g, "").slice(0, 4);
    setPIN(sanitized);
    setError("");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-slate-800 animate-[fadeIn_0.35s_ease-out]">
      {/* Red Header Bar */}
      <div className="w-full bg-[#C8102E] py-4 px-5 flex items-center justify-between text-white shadow-md select-none shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-1 p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-white flex items-center justify-center border-none bg-transparent"
              title="Back to Landing Page"
            >
              <ArrowLeft size={18} className="stroke-[3]" />
            </button>
          )}
          <ValoraLogo iconOnly={true} className="h-7 w-auto invert brightness-200" />
          <span className="text-[11px] tracking-[0.25em] font-black uppercase text-white font-sans">
            VALORA FINANCIAL BANK
          </span>
        </div>
        <div className="bg-white/10 px-2.5 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase">
          SECURE
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 w-full max-w-md mx-auto">
        {/* Brand/Subtitle */}
        <div className="text-center mt-6 mb-4">
          <p className="text-[11.5px] text-[#C8102E] font-black uppercase tracking-[0.25em]">
            SOVEREIGN INSTITUTIONAL CAPITAL
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">
            Private Wealth & Custody Gateway
          </p>
        </div>

        {/* Corporate Security Entrance Card */}
        <div className="bg-white border border-gray-200 text-slate-800 p-6 md:p-8 rounded-3xl shadow-xl transition-all duration-300">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#C8102E] shrink-0" />
              <h2 className="font-black text-lg tracking-tight uppercase text-slate-900">
                SECURE CLIENT LOG IN
              </h2>
            </div>
            <p className="text-[9.5px] text-slate-500 font-bold uppercase tracking-wider mt-1">
              Authorized Personnel Access Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Number Input */}
            <div className="space-y-2">
              <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-600">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Enter 10-digit Account Number"
                maxLength={15}
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="w-full p-3 rounded-xl outline-none text-xs font-black bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#C8102E] focus:bg-white transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-600">
                Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Passcode"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="w-full p-3 pr-12 rounded-xl outline-none text-xs font-black bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#C8102E] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#C8102E] transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Secure 4-Digit PIN Input */}
            <div className="space-y-2">
              <label className="block text-[10.5px] font-black uppercase tracking-widest text-slate-600">
                Security PIN (4-Digits)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type={showPin ? "text" : "password"}
                  placeholder="••••"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-full p-3 pl-10 pr-12 rounded-xl outline-none text-center font-black text-sm tracking-[0.6em] bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#C8102E] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#C8102E] transition-colors"
                  title={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border-l-4 border-[#C8102E] text-[#C8102E] text-[10.5px] font-bold leading-relaxed rounded-r-xl">
                ⚠️ SYSTEM ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-xl bg-[#C8102E] hover:bg-[#A93226] disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-[1px]"
            >
              <span>{isLoggingIn ? "VERIFYING CREDENTIALS..." : "LOG IN"}</span>
              {!isLoggingIn && <ArrowRight size={14} className="stroke-[3]" />}
            </button>
          </form>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="text-center mt-6 mb-4">
          <p className="text-[9.5px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            © {new Date().getFullYear()} Valora Financial Bank PLC &middot; Authorised by the Prudential Regulation Authority &middot; Regulated by the Financial Conduct Authority (FCA) and PRA &middot; Member FSCS &middot; Security ID: UK-BOE-V-4930
          </p>
        </div>
      </div>
    </div>
  );
}
