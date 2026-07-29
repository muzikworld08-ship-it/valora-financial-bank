import React, { useState, useRef } from "react";
import { ShieldCheck, Bell, Settings, LogOut, Sun, Moon, ChevronRight, KeyRound, Check, Camera, Trash2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { UserProfile } from "../types";
import { initials } from "../utils";

interface ProfileScreenProps {
  user: UserProfile;
  dark: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  onReset: () => void;
  onUpdatePin: (newPin: string) => void;
  onUpdateAvatar: (base64: string) => void;
}

export function ProfileScreen({ user, dark, setDarkMode, onReset, onUpdatePin, onUpdateAvatar }: ProfileScreenProps) {
  const [confirmOut, setConfirmOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);

  // SECURE CRYPTOGRAPHICALLY CODES PRESETS
  const presets = [
    {
      name: "Paul Burgess (Sovereign Elite)",
      data: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ea580c" /><stop offset="50%" stop-color="%23f97316" /><stop offset="100%" stop-color="%2338bdf8" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)" /><circle cx="50" cy="38" r="18" fill="%23f1f5f9" /><path d="M 50,60 C 25,60 15,75 15,90 L 85,90 C 85,75 75,60 50,60 Z" fill="%231e293b" /><rect x="35" y="32" width="13" height="6" rx="1.5" fill="%230f172a" /><rect x="52" y="32" width="13" height="6" rx="1.5" fill="%230f172a" /><line x1="48" y1="35" x2="52" y2="35" stroke="%230f172a" stroke-width="2" /></svg>`
    },
    {
      name: "Stella Vance (Private Wealth Gold)",
      data: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23ca8a04" /><stop offset="100%" stop-color="%23eab308" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)" /><circle cx="50" cy="38" r="18" fill="%231e293b" /><path d="M 50,60 C 25,60 15,75 15,90 L 85,90 C 85,75 75,60 50,60 Z" fill="%230f172a" /></svg>`
    },
    {
      name: "Admiral Reed (Sovereign Navy)",
      data: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a" /><stop offset="100%" stop-color="%230f172a" /></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g)" /><path d="M 50,22 L 55,35 L 69,35 L 58,44 L 62,57 L 50,49 L 38,57 L 42,44 L 31,35 L 45,35 Z" fill="%23facc15" /><path d="M 50,60 C 25,60 15,75 15,90 L 85,90 C 85,75 75,60 50,60 Z" fill="%23f8fafc" /></svg>`
    }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Maximum picture size allowed is 2MB to ensure secure offline cache throughput.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onUpdateAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // PIN updating helper state
  const [showPinForm, setShowPinForm] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinFeedback, setPinFeedback] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);

  const handlePinUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = newPin.replace(/\D/g, "");
    if (sanitized.length !== 4) {
      setPinFeedback("PIN must be exactly 4 numeric digits.");
      return;
    }
    if (sanitized === user.pin) {
      setPinFeedback("New PIN cannot match your current access key.");
      return;
    }

    onUpdatePin(sanitized);
    setPinFeedback("Security PIN successfully modified! Use your new key to log in next time.");
    setNewPin("");
    setTimeout(() => {
      setPinFeedback("");
      setShowPinForm(false);
    }, 4000);
  };

  const securityItems = [
    { icon: ShieldCheck, label: "Biometric ID & Devices" },
    { icon: Bell, label: "Valora Push Alerts Manager" },
  ];

  return (
    <div className="px-5 pt-6 pb-28 min-h-[60vh] select-none animate-[fadeIn_0.2s_ease-out]">
      <h2 className={`text-2xl font-bold tracking-tight mb-5 ${dark ? "text-white" : "text-slate-900"}`}>
        My Profile
      </h2>

      {/* User card header with custom Real-Time Photo Upload */}
      <div className={`p-4 rounded-[2rem] border mb-6 ${
        dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-100 shadow-sm"
      }`}>
        <div className="flex items-center gap-4">
          <div className="relative group">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md shrink-0"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0284c7)" }}
              >
                {initials(user.name)}
              </div>
            )}
            {/* Camera Upload Trigger Icon Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 bg-sky-500 hover:bg-sky-600 text-white p-1 rounded-lg shadow-md hover:scale-105 transition-all cursor-pointer"
              title="Upload Private Portrait Photo"
            >
              <Camera size={11} className="stroke-[2.5]" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className={`font-bold text-base truncate ${dark ? "text-white" : "text-slate-900"}`}>
              {user.name}
            </p>
            <p className={`text-xs truncate ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {user.email}
            </p>
            {/* Identity Badge */}
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-500">
              <CheckCircle2 size={10} className="stroke-[3]" /> Verified Vault Member
            </div>
          </div>
        </div>

        {/* Assigned/Active Accounts Overview */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <p className="text-[9.5px] uppercase font-black tracking-wider text-slate-400 mb-2">My SECURE Privileges Ledger</p>
          <div className="grid grid-cols-1 gap-2.5">
            {(() => {
              const accounts = (user.enabledAccounts && user.enabledAccounts.length > 0)
                ? user.enabledAccounts
                : ["checking", "investment", "bitcoin"];
              return (
                <>
                  {accounts.includes("checking") && (
                    <div className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                      dark ? "bg-slate-950/40" : "bg-slate-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.checkingFrozen ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className={`font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>Liquid Checking Wallet</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.checkingFrozen ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {user.checkingFrozen ? "Frozen" : "Active"}
                      </span>
                    </div>
                  )}
                  {accounts.includes("investment") && (
                    <div className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                      dark ? "bg-slate-950/40" : "bg-slate-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.investmentFrozen ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className={`font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>Wealth Investment Portfolio</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.investmentFrozen ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {user.investmentFrozen ? "Frozen" : "Active"}
                      </span>
                    </div>
                  )}
                  {accounts.includes("bitcoin") && (
                    <div className={`p-2 rounded-xl flex items-center justify-between text-xs ${
                      dark ? "bg-slate-950/40" : "bg-slate-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.bitcoinFrozen ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className={`font-bold ${dark ? "text-slate-200" : "text-slate-800"}`}>Sovereign Bitcoin Cold Vault</span>
                      </div>
                      <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.bitcoinFrozen ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      }`}>
                        {user.bitcoinFrozen ? "Frozen" : "Active"}
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Preset Identity Toggle */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="text-[10px] font-black uppercase tracking-wider text-sky-400 hover:text-sky-300"
            >
              {showPresets ? "Hide Presets Ledger" : "Select Pre-Seeded Identity Portrait"}
            </button>
            {user.avatarUrl && (
              <button
                onClick={() => onUpdateAvatar("")}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-0.5"
              >
                <Trash2 size={10} /> Reset Photo
              </button>
            )}
          </div>

          {showPresets && (
            <div className="mt-3 grid grid-cols-3 gap-2 animate-[slideDown_0.15s_ease-out]">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    onUpdateAvatar(preset.data);
                    setShowPresets(false);
                  }}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer group flex flex-col items-center hover:scale-[1.02] ${
                    dark ? "bg-slate-950/50 border-slate-800 hover:border-sky-500/40" : "bg-slate-50 border-slate-150 hover:border-sky-400"
                  }`}
                >
                  <img src={preset.data} alt={preset.name} className="w-10 h-10 rounded-lg shadow-inner bg-slate-800" />
                  <span className={`text-[8px] font-semibold mt-1 leading-tight text-center ${dark ? "text-slate-400" : "text-slate-600"}`}>
                    {preset.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PIN Modification Form Section */}
      <div className={`rounded-3xl p-4 border mb-5 transition-all ${
        dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200/80 shadow-sm"
      }`}>
        <button
          onClick={() => setShowPinForm(!showPinForm)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <KeyRound size={18} className="text-sky-500" />
            <div>
              <p className={`text-xs font-bold ${dark ? "text-white" : "text-slate-800"}`}>
                Change Access PIN
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Current active security key: <strong className="font-mono text-sky-400">••••</strong>
              </p>
            </div>
          </div>
          <ChevronRight size={14} className={`text-slate-400 transform transition-transform ${showPinForm ? "rotate-90" : ""}`} />
        </button>

        {showPinForm && (
          <form onSubmit={handlePinUpdateSubmit} className="mt-4 border-t border-slate-800/15 dark:border-slate-800/50 pt-4 space-y-3 animate-[slideDown_0.15s_ease-out]">
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Enter New 4-Digit Security PIN
              </label>
              <div className="relative">
                <input
                  type={showNewPin ? "text" : "password"}
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className={`w-full p-2.5 pr-12 rounded-xl text-center font-mono text-base tracking-[0.4em] font-bold outline-none border ${
                    dark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 transition-colors"
                  title={showNewPin ? "Hide PIN" : "Show PIN"}
                >
                  {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {pinFeedback && (
              <p className={`text-[10px] font-bold leading-relaxed text-center ${
                pinFeedback.startsWith("Security") ? "text-emerald-500" : "text-rose-500 text-xs animate-bounce"
              }`}>
                {pinFeedback}
              </p>
            )}

            <button
              type="submit"
              disabled={newPin.length !== 4}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-40`}
            >
              <Check size={12} className="stroke-[3]" /> Update Security PIN
            </button>
          </form>
        )}
      </div>

      {/* Option lists */}
      <div className={`rounded-2xl overflow-hidden border mb-6 ${
        dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-150 shadow-sm"
      }`}>
        <div className={`flex items-center justify-between p-4 ${
          dark ? "border-b border-slate-800" : "border-b border-slate-100"
        }`}>
          <div className="flex items-center gap-3">
            {dark ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-indigo-400" />
            )}
            <span className={`text-xs font-semibold ${dark ? "text-white" : "text-slate-700"}`}>
              Dark Mode Theme
            </span>
          </div>
          <button
            onClick={() => setDarkMode((d) => !d)}
            className={`w-10 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
              dark ? "bg-sky-500" : "bg-slate-300"
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${dark ? "translate-x-4" : ""}`} />
          </button>
        </div>

        {securityItems.map((it, i) => {
          const Icon = it.icon;
          return (
            <button
              key={it.label}
              className={`w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors ${
                i !== securityItems.length - 1
                  ? dark
                    ? "border-b border-slate-800"
                    : "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={dark ? "text-slate-400" : "text-slate-500"} />
                <span className={`text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>
                  {it.label}
                </span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          );
        })}
      </div>

      {/* Logout warning triggers */}
      {!confirmOut ? (
        <button
          onClick={() => setConfirmOut(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-xs font-bold cursor-pointer border border-transparent hover:border-rose-500/10"
        >
          <LogOut size={15} /> Exit Valora Banking
        </button>
      ) : (
        <div className={`rounded-2xl p-4 border animate-[slideUp_0.15s_ease-out] ${
          dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-100 shadow-md"
        }`}>
          <p className={`text-xs font-semibold mb-3 ${dark ? "text-slate-300" : "text-slate-700"}`}>
            Exit from Valora Banking Hub?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmOut(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                dark ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer transition-colors"
            >
              Exit Now
            </button>
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="text-center mt-12 animate-pulse">
        <button
          onClick={onReset}
          className={`text-[9px] font-semibold tracking-wide hover:underline cursor-pointer ${
            dark ? "text-slate-600 hover:text-slate-400" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          Re-align secure banking node synchronization
        </button>
      </div>
    </div>
  );
}
