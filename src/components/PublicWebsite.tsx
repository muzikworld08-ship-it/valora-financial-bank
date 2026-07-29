import React, { useState } from "react";
import { 
  Landmark, ShieldCheck, HelpCircle, CreditCard, Wallet, Coins, 
  TrendingUp, Calculator, BookOpen, Users, Menu, X, ChevronRight, 
  Info, Sparkles, Phone, MapPin, MessageSquare, Calendar, DollarSign, 
  CheckCircle2, ArrowRight, Award, Compass, Zap, Building2, Briefcase,
  GraduationCap, Car, Shield, Check, Globe, HelpCircle as HelpIcon, Wifi, Cpu,
  Lock, Star, ChevronDown, ChevronUp, Smartphone, Download, Eye, EyeOff
} from "lucide-react";
import { 
  productsList, featuresList, solutionsList, testimonialsList, articlesList, InsightArticle
} from "./HomepageData";
import { ValoraLogo } from "./ValoraLogo";
import { InvestmentSettings } from "../types";
import { InvestmentProperties } from "./InvestmentProperties";
import { BitcoinCenterTab } from "./BitcoinCenterTab";
import { LanguageSelector } from "./LanguageSelector";
import { motion, useScroll, useSpring } from "motion/react";

interface InvestmentsCalculatorTabProps {
  investmentSettings?: InvestmentSettings;
  dark: boolean;
  onOpenLogin: () => void;
  onSubmitInquiry: (inquiry: {
    name: string;
    email: string;
    location: string;
    pin: string;
    passwordText?: string;
    route: "Bitcoin" | "Real Estate" | "Standard Yield" | "Other";
    amount: number;
  }) => boolean | void;
  investmentInquiries: any[];
}

function InvestmentsCalculatorTab({ 
  investmentSettings, 
  dark, 
  onOpenLogin,
  onSubmitInquiry,
  investmentInquiries = []
}: InvestmentsCalculatorTabProps) {
  const pDaily = investmentSettings?.portfolioDailyPercentage ?? 1.5;
  const pDays = investmentSettings?.portfolioDurationDays ?? 30;
  const bDaily = investmentSettings?.bitcoinDailyPercentage ?? 2.0;
  const bDays = investmentSettings?.bitcoinDurationDays ?? 30;
  const boostPct = investmentSettings?.instantFundingBonusPercentage ?? 5.5;

  const [calcAmt, setCalcAmt] = useState<number>(5000);
  const [calcType, setCalcType] = useState<"portfolio" | "bitcoin">("portfolio");

  // Inquiries Form States
  const [inqName, setInqName] = useState("");
  const [inqEmail, setInqEmail] = useState("");
  const [inqLocation, setInqLocation] = useState("");
  const [inqPin, setInqPin] = useState("");
  const [inqPasswordText, setInqPasswordText] = useState("");
  const [showInqPassword, setShowInqPassword] = useState(false);
  const [inqRoute, setInqRoute] = useState<"Bitcoin" | "Real Estate" | "Standard Yield" | "Other">("Standard Yield");
  const [inqAmount, setInqAmount] = useState<number>(5000);
  const [inqSubmitted, setInqSubmitted] = useState(false);

  // Inquiry Verification / Status check states
  const [checkEmail, setCheckEmail] = useState("");
  const [checkPin, setCheckPin] = useState("");
  const [checkedInquiry, setCheckedInquiry] = useState<any | null>(null);
  const [checkTriggered, setCheckTriggered] = useState(false);

  const activeRate = calcType === "portfolio" ? pDaily : bDaily;
  const activeDays = calcType === "portfolio" ? pDays : bDays;
  
  const boostValue = calcAmt * (boostPct / 100);
  const boostedStart = calcAmt + boostValue;
  
  const step = Math.max(1, Math.floor(activeDays / 5));
  const milestones = [];
  for (let d = 0; d <= activeDays; d += step) {
    const val = boostedStart * Math.pow(1 + (activeRate / 100), d);
    milestones.push({ day: d, value: val });
  }
  if (milestones.length > 0 && milestones[milestones.length - 1].day !== activeDays) {
    const finalVal = boostedStart * Math.pow(1 + (activeRate / 100), activeDays);
    milestones.push({ day: activeDays, value: finalVal });
  }

  const matureValue = boostedStart * Math.pow(1 + (activeRate / 100), activeDays);
  const totalProfitValue = matureValue - calcAmt;

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto space-y-12 animate-[fadeIn_0.3s_ease-out]">
      <div className="max-w-2xl text-left">
        <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Valora Yield Forecaster</span>
        <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight mt-1.5 ${dark ? "text-white" : "text-slate-900"}`}>
          Generational Sovereign Investments
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed mt-2">
          Access standard bonds, central bank clearing certificates, high-yielding term vaults, and specialized sovereign indices. Enter an amount below to forecast administrative earnings dynamically.
        </p>
      </div>

      <div className={`p-6 md:p-8 rounded-[2.5rem] border ${
        dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-2.5 ${dark ? "text-slate-300" : "text-slate-707"}`}>
                1. Choose Investment Route
              </h4>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl gap-2">
                <div className="w-full py-2.5 text-[10.5px] font-black uppercase text-center tracking-wider rounded-xl bg-brand-red text-white shadow">
                  Portfolios ({pDaily.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-2 flex justify-between ${dark ? "text-slate-300" : "text-slate-700"}`}>
                <span>2. Allocation capital</span>
                <span className="font-mono text-brand-red font-extrabold">${calcAmt.toLocaleString()} USD</span>
              </h4>
              <input
                type="range"
                min="100"
                max="25000"
                step="100"
                value={calcAmt}
                onChange={(e) => setCalcAmt(Number(e.target.value))}
                className="w-full accent-brand-red cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCalcAmt(val)}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold font-mono ${
                      calcAmt === val
                        ? "bg-brand-red/10 text-brand-red border-brand-red"
                        : dark
                          ? "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-brand-red/5 rounded-2xl border border-dashed border-brand-red/20 text-xs leading-relaxed space-y-1">
              <span className="text-[10px] uppercase font-black text-brand-red tracking-wider flex items-center gap-1">
                <Sparkles size={11} className="animate-spin" /> Sovereign Matching Boost Guarantee
              </span>
              <p className="text-[10.5px] text-slate-400 leading-normal">
                Valora Corporate adds <strong className={dark ? "text-white" : "text-slate-800"}>+{boostPct.toFixed(1)}% ({((calcAmt * boostPct) / 100).toLocaleString()} USD)</strong> matched cash immediately matching your funded principal, locked directly inside your high-yield ledgers on mount.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className={`p-4 rounded-2xl border flex flex-wrap justify-between items-center gap-4 ${
              dark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-150"
            }`}>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Estimated Maturity Profit</span>
                <span className="text-xl font-mono font-black text-emerald-500">+${Math.round(totalProfitValue).toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Final Ledger Account Balance</span>
                <span className="text-xl font-mono font-black text-brand-red">${Math.round(matureValue).toLocaleString()} USD</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Lock-In Duration</span>
                <span className={`text-xs font-mono font-black ${dark ? "text-white bg-slate-800" : "text-slate-800 bg-slate-200"} px-3 py-1 rounded-full`}>{activeDays} Days Lock</span>
              </div>
            </div>

            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${dark ? "text-slate-300" : "text-slate-700"}`}>
                Day-by-Day Forecast Timeline
              </h4>
              <div className="relative border-l-2 border-dashed border-slate-200 pl-6 space-y-3">
                {milestones.map((mil, mIdx) => (
                  <div key={mIdx} className="relative flex justify-between items-center text-xs">
                    <span className="absolute -left-[31px] bg-white border-2 border-brand-red rounded-full h-2.5 w-2.5" />
                    <span className="font-bold uppercase tracking-wider font-mono text-slate-400">Day {mil.day}</span>
                    <span className={`font-mono font-black ${dark ? "text-white" : "text-slate-800"}`}>{calcType === "bitcoin" ? `${(mil.value / 68500).toFixed(5)} BTC` : `$${Math.round(mil.value).toLocaleString()}`}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-250/20 text-center flex items-center justify-between">
              <p className="text-[10px] text-slate-400">Yield formulas certified dynamically via administrative bank indices.</p>
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 bg-brand-red hover:bg-[#A93226] text-white font-black text-[10px] uppercase rounded-xl tracking-wider cursor-pointer transition-all"
              >
                Deposit & Mine APY
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-12">
        {[
          {
            title: "Sovereign Treasury Vault Index",
            rate: `${pDaily.toFixed(2)}% Daily (${(pDaily * pDays).toFixed(1)}% Lock)`,
            desc: `Direct underwritten sovereign bonds compounding over ${pDays} day lock-in periods issued directly under clearing guidelines.`,
            min: "$250,500 Starting Asset Value"
          },
          {
            title: "Bitcoin Vault Reserves",
            rate: `${bDaily.toFixed(2)}% Daily Appreciation`,
            desc: `Sovereign cryptographic ledger balances credited directly inside UK FSCS custody vaults. Fully insulated under automatic daily increases for ${bDays} days.`,
            min: "No threshold limit"
          }
        ].map((inv, idx) => (
          <div 
            key={idx} 
            className={`p-6 lg:p-8 rounded-[2rem] border relative overflow-hidden ${
              dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
            }`}
          >
            <h3 className={`text-base font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>{inv.title}</h3>
            <div className="text-sm font-black text-brand-red font-mono tracking-wider uppercase mt-1 mb-4">{inv.rate}</div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">{inv.desc}</p>
            
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold font-mono uppercase text-slate-400">{inv.min}</span>
              <button
                onClick={onOpenLogin}
                className="text-[10px] uppercase font-bold tracking-wider text-brand-red hover:underline cursor-pointer"
              >
                Authenticate Access
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SOVEREIGN ONBOARDING PORTAL FORM & VERIFICATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16 pt-16 border-t border-slate-200/40 dark:border-slate-800">
        
        {/* Onboarding Form */}
        <div className={`lg:col-span-7 p-6 md:p-8 rounded-[2rem] border ${
          dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="mb-6">
            <span className="text-[9px] font-mono font-bold tracking-widest text-brand-red uppercase">Direct Allocation Desk</span>
            <h3 className={`text-xl font-extrabold uppercase mt-1 ${dark ? "text-white" : "text-slate-900"}`}>
              Sovereign Onboarding Inquiry
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              If you do not currently possess authorized credentials, transmit your allocation request directly to administrative desk handlers below to register your sovereign ledger access.
            </p>
          </div>

          {inqSubmitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <h4 className={`text-sm font-bold uppercase ${dark ? "text-slate-200" : "text-slate-800"}`}>Inquiry Filed Successfully</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-mono">
                Your sovereign onboarding dossier for <strong>{inqRoute} Route</strong> has been successfully transmitted. Record your chosen PIN (<strong>{inqPin}</strong>) and password securely. Use the adjacent audit desk to retrieve credentials once authorized by the administrator.
              </p>
              <button
                type="button"
                onClick={() => {
                  setInqSubmitted(false);
                  setInqName("");
                  setInqEmail("");
                  setInqLocation("");
                  setInqPin("");
                  setInqPasswordText("");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase font-mono tracking-wider cursor-pointer"
              >
                File Another Inquiry
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inqName || !inqEmail || !inqLocation || !inqPin || !inqPasswordText) {
                  alert("Please enter all required dossier fields, including desired password.");
                  return;
                }
                const res = onSubmitInquiry({
                  name: inqName,
                  email: inqEmail,
                  location: inqLocation,
                  pin: inqPin,
                  passwordText: inqPasswordText,
                  route: inqRoute,
                  amount: inqAmount
                });
                if (res !== false) {
                  setInqSubmitted(true);
                }
              }}
              className="space-y-4 text-xs font-mono"
            >
              {/* Onboarding Instructions / Help Guide */}
              <div className={`p-4 rounded-xl border text-[11px] leading-relaxed space-y-1.5 ${
                dark ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-brand-red">
                  <ShieldCheck size={14} className="text-brand-red animate-pulse" />
                  Dossier Instructions & Security Guidelines
                </div>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Exclusive Email Registrations:</strong> To prevent duplicate identities, each email address can only be registered once. Existing profiles or active pending inquiries will reject subsequent attempts.</li>
                  <li><strong>Secured Mail Deliveries:</strong> All login credentials, secure OTPs, and cleared transaction confirmations are emailed directly to your registered mailbox. We do not use insecure cellular SMS pathways.</li>
                  <li><strong>Auto-Save & Session Persistence:</strong> Sessions remain authenticated for exactly <strong>5 minutes</strong> when you switch tabs or leave the portal, before auto-terminating for your financial protection.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Hamilton"
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none`}
                  />
                </div>
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alexander@sovereign.org"
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Geographic Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Geneva, Switzerland"
                    value={inqLocation}
                    onChange={(e) => setInqLocation(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Desired Security PIN (numeric)</label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="e.g. 1994"
                    value={inqPin}
                    onChange={(e) => setInqPin(e.target.value.replace(/\D/g, ""))}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none tracking-widest`}
                  />
                </div>
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Desired Password</label>
                  <div className="relative">
                    <input
                      type={showInqPassword ? "text" : "password"}
                      required
                      placeholder="Enter choice password"
                      value={inqPasswordText}
                      onChange={(e) => setInqPasswordText(e.target.value)}
                      className={`w-full px-4 py-2.5 pr-10 rounded-xl border ${
                        dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                      } outline-none`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowInqPassword(!showInqPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors cursor-pointer bg-transparent border-0 outline-none flex items-center justify-center p-0"
                    >
                      {showInqPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Desired Asset Route</label>
                  <select
                    value={inqRoute}
                    onChange={(e) => setInqRoute(e.target.value as any)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 focus:border-brand-red"
                    } outline-none`}
                  >
                    <option value="Bitcoin">Sovereign Bitcoin Vault</option>
                    <option value="Real Estate">Manhattan Premium Real Estate</option>
                    <option value="Standard Yield">Standard Yield Portfolio</option>
                    <option value="Other">Other Bespoke Strategy</option>
                  </select>
                </div>
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Intended Capital Allocation (USD)</label>
                  <input
                    type="number"
                    min="500"
                    max="500000"
                    step="500"
                    required
                    value={inqAmount}
                    onChange={(e) => setInqAmount(Number(e.target.value))}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 focus:border-brand-red"
                    } outline-none`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-red hover:bg-[#A93226] text-white font-black text-xs uppercase rounded-xl tracking-wider cursor-pointer transition-all shadow-md shadow-brand-red/10 flex items-center justify-center gap-1.5"
                >
                  🛡️ Transmit Secure Onboarding Inquiry
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Verification Desk */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className={`p-6 md:p-8 rounded-[2rem] border h-full flex flex-col justify-between ${
            dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div>
              <div className="mb-6">
                <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-500 uppercase">Cryptographic Audit Desk</span>
                <h3 className={`text-xl font-extrabold uppercase mt-1 ${dark ? "text-white" : "text-slate-900"}`}>
                  Status & Credential Check
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Enter your email and onboarding PIN below to verify clearance status and extract your credentials once approved.
                </p>
              </div>

              <div className="space-y-4 font-mono text-xs mb-6">
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Registered Email</label>
                  <input
                    type="email"
                    placeholder="your-email@example.com"
                    value={checkEmail}
                    onChange={(e) => setCheckEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none`}
                  />
                </div>
                <div>
                  <label className={`block font-bold uppercase tracking-wider mb-1.5 ${dark ? "text-slate-300" : "text-slate-600"}`}>Onboarding PIN</label>
                  <input
                    type="password"
                    placeholder="Enter choice PIN"
                    value={checkPin}
                    onChange={(e) => setCheckPin(e.target.value.replace(/\D/g, ""))}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      dark ? "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-brand-red" : "bg-slate-50 border-slate-250 text-slate-800 placeholder-slate-400 focus:border-brand-red"
                    } outline-none tracking-widest`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCheckTriggered(true);
                    const match = investmentInquiries.find(
                      (i) => i.email.toLowerCase().trim() === checkEmail.toLowerCase().trim() && i.pin === checkPin
                    );
                    setCheckedInquiry(match || null);
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  🔍 Query Dossier System
                </button>
              </div>

              {checkTriggered && (
                <div className="space-y-3 font-mono text-xs">
                  {checkedInquiry ? (
                    <div>
                      {checkedInquiry.status === "Pending" ? (
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                          <div className="flex items-center gap-1.5 font-bold text-amber-500 text-[10px] uppercase tracking-wide">
                            <span className="animate-pulse">●</span> Pending Custody Clearance
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed mt-1.5">
                            Bespoke key authorization dossier is currently on the desk. Please wait while our administrative team configures your ledger accounts.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2.5">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-500 text-[10px] uppercase tracking-wide">
                            <span>✓</span> Account Authorized & Cleared
                          </div>
                          <div className="text-[10.5px] space-y-1 text-slate-300">
                            <div>
                              <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">Allocated Account Number</span>
                              <span className="font-bold text-slate-200 text-xs">{checkedInquiry.createdAccount?.accountNumber}</span>
                            </div>
                            <div className="pt-1">
                              <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">Temporary Password</span>
                              <span className="font-bold text-slate-200 text-xs">{checkedInquiry.createdAccount?.passwordText}</span>
                            </div>
                            <div className="pt-1">
                              <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-bold">Configured PIN</span>
                              <span className="font-bold text-slate-200 text-xs">{checkedInquiry.createdAccount?.pin}</span>
                            </div>
                          </div>
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                onOpenLogin();
                              }}
                              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black rounded-xl text-[9px] uppercase tracking-wider hover:opacity-90"
                            >
                              🚀 Navigate to Onboarding Login
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                      <div className="font-bold text-rose-500 text-[10px] uppercase tracking-wide">No Dossier Found</div>
                      <p className="text-[10px] text-slate-400 leading-normal mt-1">
                        We could not retrieve any inquiry matching this email and PIN combination. Double-check your parameters.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-250/20 text-[10px] text-slate-500 font-mono text-center">
              Encryption secured by HSM clearing certificates.
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

interface PublicWebsiteProps {
  onOpenLogin: () => void;
  onSubmitLoan: (loan: { name: string; email: string; loanType: string; amount: number }) => void;
  onSubmitTicket: (ticket: { name: string; email: string; subject: string; message: string }) => void;
  onSubmitInquiry: (inquiry: {
    name: string;
    email: string;
    location: string;
    pin: string;
    passwordText?: string;
    route: "Bitcoin" | "Real Estate" | "Standard Yield" | "Other";
    amount: number;
  }) => boolean | void;
  investmentInquiries: any[];
  announcements: string[];
  investmentSettings?: InvestmentSettings;
  dark: boolean;
}

export function PublicWebsite({ 
  onOpenLogin, 
  onSubmitLoan, 
  onSubmitTicket,
  onSubmitInquiry,
  investmentInquiries = [],
  announcements,
  investmentSettings,
  dark 
}: PublicWebsiteProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Navigation tab state: "home" | "personal" | "business" | "loans" | "cards" | "investments" | "support"
  const [currentTab, rawSetCurrentTab] = useState<string>("home");
  const [isNavTabLoading, setIsNavTabLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState("Securing connection...");

  const setCurrentTab = (tabId: string) => {
    setIsNavTabLoading(true);
    setLoadingProgress(15);
    const statuses = [
      "Establishing secure sovereign clearance handshakes...",
      "Syncing Valora Financial Ledger database nodes...",
      "Authenticating FSCS insurance route parameters...",
      "Security integrity verified. Clearing route..."
    ];
    
    let statusIndex = 0;
    setLoadingStatusText(statuses[0]);
    const textInterval = setInterval(() => {
      statusIndex++;
      if (statusIndex < statuses.length) {
        setLoadingStatusText(statuses[statusIndex]);
      }
    }, 90);

    const stepInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(stepInterval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 20) + 15;
      });
    }, 55);

    setTimeout(() => {
      clearInterval(stepInterval);
      clearInterval(textInterval);
      setLoadingProgress(100);
      rawSetCurrentTab(tabId);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        setIsNavTabLoading(false);
        setLoadingProgress(0);
      }, 180);
    }, 400);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 0,
      eyebrow: "Sovereign Asset Securities",
      headOne: "Unrivaled",
      headTwo: "Security Clearance",
      desc: "Valora Financial Bank coordinates high-yield capital reserves and sovereign liquidity checks across fully audited configurations.",
      bgImage: "https://github.com/worldminox-pixel/last-oneg/blob/main/ChatGPT%20Image%20Jul%2027,%202026,%2011_47_57%20PM.png?raw=true"
    },
    {
      id: 1,
      eyebrow: "High Yield Wealth Sweeps",
      headOne: "Exponential",
      headTwo: "Capital Growth",
      desc: "Build certified retail savings balances yielding up to 4.85% AER, backed by FSCS-protected securities and legal disclosures.",
      bgImage: "https://github.com/worldminox-pixel/last-oneg/blob/main/ChatGPT%20Image%20Jul%2027,%202026,%2011_51_44%20PM.png?raw=true"
    },
    {
      id: 2,
      eyebrow: "Modern Corporate Credit",
      headOne: "Instantaneous",
      headTwo: "Wire Clearance",
      desc: "Deploy competitive commercial credits and premium card assets featuring lightning-fast internal clearing times.",
      bgImage: "https://github.com/worldminox-pixel/last-oneg/blob/main/ChatGPT%20Image%20Jul%2027,%202026,%2011_53_44%20PM.png?raw=true"
    }
  ];

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // New homepage state definitions
  const [activeRateAccordion, setActiveRateAccordion] = useState<string>("savings");
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [dbStats, setDbStats] = useState({
    usersCount: 16,
    loansCount: 7,
    transactionsCount: 142
  });
  const [selectedArticle, setSelectedArticle] = useState<InsightArticle | null>(null);

  React.useEffect(() => {
    const fetchDbStats = async () => {
      try {
        const response = await fetch("/api/load-state");
        if (response.ok) {
          const resJson = await response.json();
          if (resJson && resJson.state) {
            const users = resJson.state.users || [];
            const loans = resJson.state.loans || [];
            const completedTx = resJson.state.transactions || [];
            setDbStats({
              usersCount: Math.max(users.length, 16),
              loansCount: Math.max(loans.length, 7),
              transactionsCount: Math.max(completedTx.length, 142)
            });
          }
        }
      } catch (err) {
        console.warn("Could not load database stats:", err);
      }
    };
    fetchDbStats();
  }, []);

  // Credit Card interactive showcase states
  const [selectedCardId, setSelectedCardId] = useState<string>("platinum");
  const [isCardApplyOpen, setIsCardApplyOpen] = useState<boolean>(false);
  const [isCardApplying, setIsCardApplying] = useState<boolean>(false);
  const [isAppliedApproved, setIsAppliedApproved] = useState<boolean>(false);
  const [showSsn, setShowSsn] = useState<boolean>(false);

  // EMI Tracker state
  const [emiAmount, setEmiAmount] = useState<number>(15000);
  const [emiTerm, setEmiTerm] = useState<number>(36); // months
  const [emiRate, setEmiRate] = useState<number>(7.5); // interest rate
  const [emiResult, setEmiResult] = useState<number>(0);

  // Quick Savings planner state
  const [saveInitial, setSaveInitial] = useState<number>(5000);
  const [saveMonthly, setSaveMonthly] = useState<number>(300);
  const [saveYears, setSaveYears] = useState<number>(5);
  const [saveAPY, setSaveAPY] = useState<number>(4.25); // high yield cash APY

  // Loan Application input state
  const [loanName, setLoanName] = useState("");
  const [loanEmail, setLoanEmail] = useState("");
  const [loanType, setLoanType] = useState("Mortgage Loan");
  const [loanAmtInput, setLoanAmtInput] = useState("250000");
  const [loanSubmitted, setLoanSubmitted] = useState(false);

  // Support Ticket Form input state
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMsg, setTicketMsg] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Appointment schedule state
  const [bookName, setBookName] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookBranch, setBookBranch] = useState("Main Corporate Headquarters");
  const [bookSubmitted, setBookSubmitted] = useState(false);

  // Calculate EMI Whenever Inputs Change
  React.useEffect(() => {
    const r = emiRate / 1200; // monthly rate
    const n = emiTerm; // total months
    const p = emiAmount; // loan principal
    if (r === 0) {
      setEmiResult(p / n);
      return;
    }
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmiResult(Math.round(emi * 100) / 100);
  }, [emiAmount, emiTerm, emiRate]);

  // Calculate High Yield Future Value Savings Summary
  const calculateSavingsFutureValue = () => {
    const monthlyRate = saveAPY / 100 / 12;
    const totalMonths = saveYears * 12;
    let balance = saveInitial;

    for (let i = 0; i < totalMonths; i++) {
      balance = balance * (1 + monthlyRate) + saveMonthly;
    }
    return Math.round(balance).toLocaleString("en-US", { style: "currency", currency: "USD" });
  };

  const submitLoanApplicationForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanName.trim() || !loanEmail.trim() || !loanAmtInput) return;
    onSubmitLoan({
      name: loanName.trim(),
      email: loanEmail.trim(),
      loanType,
      amount: parseFloat(loanAmtInput) || 5000
    });
    setLoanSubmitted(true);
    setTimeout(() => {
      setLoanSubmitted(false);
      setLoanName("");
      setLoanEmail("");
      setLoanAmtInput("250000");
    }, 7000);
  };

  const submitSupportTicketForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim() || !ticketEmail.trim() || !ticketSubject.trim() || !ticketMsg.trim()) return;
    onSubmitTicket({
      name: ticketName.trim(),
      email: ticketEmail.trim(),
      subject: ticketSubject.trim(),
      message: ticketMsg.trim()
    });
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketName("");
      setTicketEmail("");
      setTicketSubject("");
      setTicketMsg("");
    }, 7000);
  };

  const navItems = [
    { label: "Personal Banking", id: "personal" },
    { label: "Business Banking", id: "business" },
    { label: "Loans & Credit", id: "loans" },
    { label: "Credit Cards", id: "cards" },
    { label: "Investments", id: "investments" },
    { label: "Property Marketplace", id: "properties" },
    { label: "Bitcoin Trading Center", id: "bitcoin" },
    { label: "Support", id: "support" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-brand-red/10 selection:text-brand-red">
      
      {/* Cinema Scroll Progress Indicator Bar requested by user */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1.5 bg-brand-red z-[9999] origin-left shadow-sm shadow-brand-red/20"
        style={{ scaleX }}
      />

      {/* High-Fidelity Secure Handshake Progress Bar */}
      {isNavTabLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-[5px] bg-slate-950/80 backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-brand-red via-red-500 to-rose-600 transition-all duration-100 ease-out shadow-[0_0_15px_rgba(192,57,43,0.95)]"
            style={{ width: `${loadingProgress}%` }}
          />
          <div className="absolute top-[5px] right-4 bg-slate-900 border border-brand-red/30 px-3 py-1 rounded-b-lg text-[9px] font-mono font-black text-brand-red shadow-2xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping" />
            <span>{loadingStatusText}</span>
          </div>
        </div>
      )}

      {/* Announcements Bar removed by user preference */}

      {/* Main Navigation Header */}
      <header className={`sticky top-0 z-50 bg-brand-red border-b border-red-700 text-white transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-none"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo on the left */}
          <button 
            onClick={() => { setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="flex items-center gap-3 group text-left cursor-pointer hover:opacity-95 bg-transparent border-0 outline-none"
          >
            <ValoraLogo dark={true} className="h-11" />
          </button>

          {/* Secure Login icon, Language Selector, and Hamburger Navigation */}
          <div className="flex items-center gap-4">
            {/* Global Language Selector Dropdown */}
            <LanguageSelector dark={true} />

            {/* Hamburger Navigation Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 w-10 h-10 rounded-xl flex flex-col justify-center items-center gap-1.5 hover:bg-white/10 transition-colors cursor-pointer bg-transparent border-0 outline-none"
              aria-label="Open Mobile Menu"
            >
              <span className="w-5 h-[2px] bg-white rounded transition-all"></span>
              <span className="w-5 h-[2px] bg-white rounded transition-all"></span>
              <span className="w-5 h-[2px] bg-white rounded transition-all"></span>
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Menu Slide-in Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-[100] w-[58%] md:w-[40%] bg-white border-r border-slate-100 shadow-2xl transition-transform duration-[280ms] ease-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between p-6">
          {/* Inside panel contents */}
          <div className="space-y-8">
            {/* Repeated Logo */}
            <div className="pb-4 border-b border-slate-150 text-left">
              <ValoraLogo dark={false} className="h-10" />
            </div>

            {/* Nav List */}
            <nav className="flex flex-col space-y-0 divide-y divide-slate-100">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`w-full text-left py-3.5 px-4 font-display font-extrabold text-[11px] uppercase tracking-wider transition-colors ${
                      isActive 
                        ? "bg-brand-red text-white" 
                        : "bg-white text-brand-black hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom of panel: red rounded pill CTA */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenLogin();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-6 rounded-full bg-brand-red hover:bg-[#A93226] text-white text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Lock size={12} className="fill-white" />
              <span>iBanking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hidden fixed overlay sliver on top for close trigger and Close X button */}
      <div 
        className={`fixed inset-y-0 right-0 z-[99] bg-transparent transition-opacity duration-200 pointer-events-none ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
        }`}
        style={{ left: "58%" }}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full border border-brand-red bg-brand-red text-white hover:bg-[#A93226] shadow-xl transition-all cursor-pointer flex items-center justify-center"
          aria-label="Close Mobile Menu"
        >
          <X size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      <main className={`transition-all duration-300 ${isNavTabLoading ? "opacity-30 blur-[1.5px] pointer-events-none" : "opacity-100"}`}>
        {currentTab === "home" && (
          <div className="space-y-0">
            
            {/* SECTION 1: HERO CAROUSEL */}
            <section className="relative flex flex-col lg:grid lg:grid-cols-12 bg-white border-b border-slate-100 select-none overflow-hidden h-auto lg:h-[600px]">
              
              {/* Left Column: Copy Content Carousel */}
              <div className="lg:col-span-7 col-span-12 flex flex-col justify-between p-8 sm:p-12 md:p-16 relative bg-white min-h-[520px] sm:min-h-[460px] lg:h-full">
                
                {/* Carousel Text Slide Container */}
                <div className="relative flex-1 flex flex-col justify-center text-left">
                  {heroSlides.map((slide, sIdx) => {
                    const isActive = currentSlide === sIdx;
                    return (
                      <div
                        key={slide.id}
                        className={`absolute inset-0 flex flex-col justify-center space-y-6 md:space-y-8 transition-all duration-300 ease-in-out ${
                          isActive ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
                        }`}
                      >
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-brand-gray font-display">
                          {slide.eyebrow}
                        </span>
                        
                        <h1 className="font-display text-4xl sm:text-5xl md:text-5.5xl font-black uppercase leading-[1.05] tracking-tight">
                          <span className="text-brand-red">{slide.headOne}</span> <br />
                          <span className="text-brand-black">{slide.headTwo}</span>
                        </h1>

                        <p className="text-xs sm:text-sm text-brand-gray leading-relaxed max-w-lg font-medium">
                          {slide.desc}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <button
                            onClick={onOpenLogin}
                            className="px-6 py-3.5 rounded-full bg-brand-red hover:bg-[#A93226] text-white font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer border-0 outline-none shadow-md"
                          >
                            Access iBanking
                          </button>
                          <button
                            onClick={() => {
                              document.getElementById("rates-panel")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="px-6 py-3.5 rounded-full bg-brand-dark hover:bg-brand-black text-white font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer border-0 outline-none shadow-md"
                          >
                            Explore Rates
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Left Bottom: Pagination Dots */}
                <div className="flex items-center gap-2 mt-auto pt-4 relative z-10 text-left">
                  {heroSlides.map((slide, sIdx) => {
                    const isActive = currentSlide === sIdx;
                    return (
                      <button
                        key={slide.id}
                        onClick={() => setCurrentSlide(sIdx)}
                        className={`transition-all duration-350 cursor-pointer ${
                          isActive 
                            ? "w-2.5 h-2.5 rounded-full bg-brand-red" 
                            : "w-5 h-[3px] bg-slate-200 rounded-full hover:bg-slate-300"
                        }`}
                        aria-label={`Go to slide ${sIdx + 1}`}
                      />
                    );
                  })}
                </div>

                {/* Right Bottom: Nav Arrows */}
                <div className="absolute bottom-8 right-8 flex items-center gap-2 z-10">
                  <button
                    onClick={handlePrevSlide}
                    className="w-10 h-10 rounded-full bg-brand-red hover:bg-[#A93226] text-white flex items-center justify-center transition-all cursor-pointer shadow-md border-0 outline-none"
                    aria-label="Previous Slide"
                  >
                    <ChevronRight size={18} className="translate-x-[-1px] rotate-180" />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    className="w-10 h-10 rounded-full bg-brand-red hover:bg-[#A93226] text-white flex items-center justify-center transition-all cursor-pointer shadow-md border-0 outline-none"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={18} className="translate-x-[1px]" />
                  </button>
                </div>

              </div>

              {/* Right Column: Static / Smooth Fading Background Images */}
              <div className="col-span-12 lg:col-span-5 relative h-[380px] sm:h-[450px] lg:h-full overflow-hidden bg-brand-offwhite">
                {heroSlides.map((slide, sIdx) => {
                  const isActive = currentSlide === sIdx;
                  return (
                    <div
                      key={slide.id}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-95"
                      }`}
                    >
                      <img 
                        src={slide.bgImage} 
                        alt={slide.eyebrow} 
                        className="w-full h-full object-cover transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-brand-black/5" />
                    </div>
                  );
                })}
              </div>

            </section>

            {/* SECTION 2: WELCOME MESSAGE & DATABASE LIVE STATS */}
            <section className="py-16 md:py-20 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
                  
                  {/* Left Column Copy */}
                  <div className="md:col-span-7 space-y-5 text-left">
                    <span className="text-[10px] font-black tracking-widest text-brand-red uppercase block">Commitment to Secure Banking</span>
                    <h2 className="text-2xl md:text-3.5xl font-extrabold tracking-tight uppercase text-brand-black">
                      Welcome to Valora Financial Bank
                    </h2>
                    <p className="text-xs md:text-sm text-brand-gray leading-relaxed font-semibold">
                      For more than two decades, Valora Financial has championed client-first retail banking. Our core philosophy unites classic security measures with modern mobile convenience. Whether securing savings accounts, underwriting loans, or administering wealth portfolios, our platform offers unparalleled clearing times, robust biometric encryptions, and certified auditing checks to guide your ongoing accomplishments.
                    </p>
                    
                    {/* Brand Values Callout Quote block requested by user */}
                    <div className="p-5 rounded-2xl bg-brand-red/5 border border-brand-red/10 shadow-inner">
                      <p className="text-xs md:text-sm italic font-extrabold text-brand-red leading-relaxed">
                        "As it continues to grow, Valora Financial Bank remains committed to innovation, transparency, and financial empowerment. It is not only a place to store money, but a place where financial journeys are shaped with intention and care."
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Database Driven Live Stats */}
                  <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3 gap-4 text-center md:text-left">
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-2xl md:text-3xl font-black text-brand-red font-mono">{dbStats.usersCount}</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Active Portals</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-2xl md:text-3xl font-black text-brand-red font-mono">{dbStats.loansCount}</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Credit Lines</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <p className="text-2xl md:text-3xl font-black text-green-500 font-mono">{dbStats.transactionsCount}</p>
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Processed Wires</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* SECTION 3: FEATURED PRODUCTS */}
            <section className="py-20 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase">Valora Financial Products</span>
                  <h2 className="text-2xl md:text-4xl font-extrabold uppercase text-slate-900">
                    Discover Featured Accounts
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    Choose from standard daily utility accounts, safe savings interest pools, or competitive commercial credits.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {productsList.map((p, idx) => (
                    <div 
                      key={idx}
                      className="group rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-white text-left"
                    >
                      <div className="h-64 sm:h-48 w-full overflow-hidden relative">
                        <img 
                          src={p.img} 
                          alt={p.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute bottom-4 left-4 w-9 h-9 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/30 flex items-center justify-center">
                          {p.icon}
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-3">
                        <h3 className="text-base font-extrabold uppercase text-slate-900">
                          {p.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed min-h-[44px]">
                          {p.desc}
                        </p>
                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold">
                          <span className="text-brand-red uppercase tracking-widest font-mono">
                            {p.feat}
                          </span>
                          <button
                            onClick={() => {
                              if (p.title.includes("Loans")) {
                                setCurrentTab("loans");
                              } else if (p.title.includes("Cards")) {
                                setCurrentTab("cards");
                              } else if (p.title.includes("Wealth")) {
                                setCurrentTab("investments");
                              } else if (p.title.includes("Business")) {
                                setCurrentTab("business");
                              } else {
                                setCurrentTab("personal");
                              }
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-brand-red hover:text-[#A93226] hover:underline uppercase flex items-center gap-1 cursor-pointer font-extrabold"
                          >
                            Explore <ChevronRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 4: CURRENT RATES PANEL ACCORDION */}
            <section id="rates-panel" className="py-20 bg-white border-b border-slate-100">
              <div className="max-w-4xl mx-auto px-6">
                <div className="text-center space-y-3 mb-12">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase">Competitive Rate Tables</span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold uppercase text-brand-black">
                    Current Retail Banking Rates
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sovereign rates certified with our direct deposit guarantees. Select rows to expand legal disclosures and summaries.
                  </p>
                </div>

                {/* Interactive Accordion Layout */}
                <div className="space-y-4 text-left">
                  {[
                    {
                      id: "savings",
                      title: "Savings APY Rates",
                      summary: "4.85% APY",
                      desc: "Secure High Yield interest compounding monthly. Minimum deposit of $50 required to qualify. Premium VIP Wealth tiers achieve up to 12.00% APY under sovereign terms.",
                      benefits: ["No monthly service fees", "Direct automatic interest payouts", "Includes visa debit accessibility"]
                    },
                    {
                      id: "cds",
                      title: "Certificate of Deposits (CD Rates)",
                      summary: "12-Month CD at 4.50% / 24-Month CD at 4.90% APY",
                      desc: "Establish guaranteed long-term cash expansions with our protective certificate deposits lock. Capital remains insured against rate fluctuations.",
                      benefits: ["Guaranteed fixed interest returns", "Federally backed depository structures", "Minimum $1,000 startup limits"]
                    },
                    {
                      id: "loans",
                      title: "Personal Loan Rates",
                      summary: "Rates starting as low as 5.49% APR",
                      desc: "Low-interest rates backing personal signature loans. Perfect for debt consolidation, medical expenses, or family project targets.",
                      benefits: ["Zero collateral obligations", "Flexible options from 12 to 84 months", "Instant mobile check disbursements"]
                    },
                    {
                      id: "mortgages",
                      title: "Mortgage rates",
                      summary: "30-Year Fixed: 6.25% APR / 15-Year Fixed: 5.75% APR",
                      desc: "Custom home loans featuring guaranteed 30-day index locks, clear amortization schemes, and specialized young professional loan incentives.",
                      benefits: ["Direct home building sweeps", "Zero prepayment penalties applied", "Dedicated home acquisition assistant"]
                    }
                  ].map((rate) => {
                    const isOpen = activeRateAccordion === rate.id;
                    return (
                      <div 
                        key={rate.id}
                        className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm"
                      >
                        <button
                          onClick={() => setActiveRateAccordion(isOpen ? "" : rate.id)}
                          className="w-full p-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-mono font-bold text-brand-red uppercase tracking-wider">{rate.title}</p>
                            <p className="text-sm md:text-base font-extrabold text-brand-black mt-1">{rate.summary}</p>
                          </div>
                          <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-brand-red/5 text-xs text-slate-500 space-y-4 animate-[fadeIn_0.15s_ease-out]">
                            <p className="leading-relaxed font-medium">{rate.desc}</p>
                            
                            <div className="grid sm:grid-cols-3 gap-2.5 pt-2">
                              {rate.benefits.map((b, bIdx) => (
                                <div key={bIdx} className="flex items-center gap-2 font-bold text-[10px] text-brand-red">
                                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                                  <span>{b}</span>
                                </div>
                              ))}
                            </div>

                            <div className="pt-2 flex justify-start">
                              <button
                                onClick={onOpenLogin}
                                className="px-4 py-2 rounded-lg bg-brand-red text-white font-extrabold text-[10px] uppercase tracking-wider hover:bg-[#A93226] transition-colors cursor-pointer"
                              >
                                Apply For Rates
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION 5: WHY CHOOSE VALORA BANK */}
            <section className="py-20 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">Built for Modern Convenience</span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold uppercase text-slate-900">
                    Why Choose Valora Financial?
                  </h2>
                  <p className="text-xs text-slate-450">
                    Our depository structures maintain standard Bank Grade clearances to safeguard and accelerate client liquid holdings.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuresList.map((f, idx) => (
                    <div 
                      key={idx}
                      className="p-6 rounded-3xl border border-slate-100 hover:border-brand-red/30 shadow-sm bg-white text-left space-y-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-inner">
                        {f.icon}
                      </div>
                      <h4 className="text-sm font-extrabold uppercase text-slate-900">{f.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed min-h-[72px]">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 6: FINANCIAL SOLUTIONS (Spec 7: Alternating rows with circular icons) */}
            <section className="py-20 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6 space-y-24">
                
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-brand-gray uppercase font-display block">Tailored Financial Horizons</span>
                  <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-brand-black tracking-tight">
                    <span className="text-brand-red">Complete</span> <span className="text-brand-black">Banking Solutions</span>
                  </h2>
                  <p className="text-xs text-brand-gray max-w-md mx-auto leading-relaxed font-semibold">
                    Comprehensive strategic routes structured to elevate daily comfort, business targets, and compound wealth indices.
                  </p>
                </div>

                <div className="space-y-24">
                  {solutionsList.map((sol, idx) => {
                    const isEven = idx % 2 === 0;
                    const iconBg = isEven ? "bg-brand-red" : "bg-brand-dark";
                    
                    // Inline Word splitter
                    const words = sol.subtitle.split(" ");
                    const firstWord = words[0] || "";
                    const restOfWords = words.slice(1).join(" ") || "";

                    // Inline Solutions render matcher
                    const getSolIcon = (i: number) => {
                      switch (i) {
                        case 0: return <Wallet size={24} className="text-white" />;
                        case 1: return <Building2 size={24} className="text-white" />;
                        case 2: return <TrendingUp size={24} className="text-white" />;
                        default: return <Award size={24} className="text-white" />;
                      }
                    };

                    return (
                      <div 
                        key={idx}
                        className={`grid md:grid-cols-12 gap-12 items-center text-left ${
                          isEven ? "" : "md:flex-row-reverse"
                        }`}
                      >
                        
                        {/* Image Block */}
                        <div className={`md:col-span-6 relative ${isEven ? "" : "md:order-2"}`}>
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#C0392B]/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
                          <div className="relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 bg-white">
                            <img 
                              src={sol.img} 
                              alt={sol.title} 
                              className="w-full h-full object-cover opacity-95 transition-all duration-350 hover:scale-[1.015]"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-brand-dark/95 backdrop-blur-sm text-white font-black text-[9px] uppercase tracking-wider rounded-full border border-slate-700/20">
                              {sol.badge}
                            </div>
                          </div>
                        </div>

                        {/* Text Block with circular icon + label + heading + paragraph */}
                        <div className={`md:col-span-6 space-y-5 ${isEven ? "" : "md:order-1"}`}>
                          
                          {/* Circular Icon (alternating red / dark navy) */}
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${iconBg}`}>
                            {getSolIcon(idx)}
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-black tracking-widest text-brand-gray uppercase block font-display">
                              {sol.title}
                            </span>
                            <h3 className="font-display text-2.5xl md:text-3.5xl font-black uppercase tracking-tight text-brand-black leading-none">
                              <span className="text-brand-red">{firstWord}</span> <span className="text-brand-black">{restOfWords}</span>
                            </h3>
                          </div>

                          <p className="text-xs md:text-sm text-brand-gray leading-relaxed max-w-lg font-medium">
                            {sol.desc}
                          </p>
                          
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                if (sol.title.includes("Personal")) setCurrentTab("personal");
                                else if (sol.title.includes("Business")) setCurrentTab("business");
                                else if (sol.title.includes("Investment")) setCurrentTab("investments");
                                else setCurrentTab("loans");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red hover:text-[#A93226] uppercase tracking-wider cursor-pointer bg-transparent border-0 outline-none transition-colors"
                            >
                              Explore Solution <ArrowRight size={13} className="translate-x-[1px]" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            </section>

            {/* SECTION 7: CUSTOMER TESTIMONIALS CAROUSEL */}
            <section className="py-20 bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden">
              
              <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center space-y-3 mb-12">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase">Customer Success Stories</span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold uppercase text-slate-900">
                    Trusted By Families & Business Owners
                  </h2>
                </div>

                {/* Animated Interactive Testimonial Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 md:p-10 text-center space-y-6 shadow-sm">
                  {/* Rating stars */}
                  <div className="flex justify-center gap-1">
                    {[...Array(testimonialsList[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-sm md:text-lg italic text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
                    "{testimonialsList[activeTestimonial].quote}"
                  </blockquote>

                  {/* User Profile */}
                  <div className="pt-4 border-t border-slate-200/60 max-w-xs mx-auto">
                    <p className="text-xs font-black uppercase text-brand-red tracking-wider">
                      {testimonialsList[activeTestimonial].name}
                    </p>
                    <p className="text-[10px] text-slate-400 tracking-wide mt-0.5 font-bold uppercase">
                      {testimonialsList[activeTestimonial].role} • {testimonialsList[activeTestimonial].city}
                    </p>
                  </div>

                  {/* Slider controllers */}
                  <div className="flex justify-center gap-3 pt-4">
                    {testimonialsList.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTestimonial(index)}
                        className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                          activeTestimonial === index 
                            ? "bg-brand-red scale-110 shadow-sm" 
                            : "bg-slate-200 hover:bg-slate-300"
                        }`}
                        aria-label={`Select testimonial ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 8: BANKING INSIGHTS */}
            <section className="py-20 bg-white border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                  <span className="text-[10px] font-black tracking-widest text-brand-red uppercase font-mono">Financial Insights & Education</span>
                  <h2 className="text-2xl md:text-3.5xl font-extrabold uppercase text-slate-900">
                    Valora Financial Insights
                  </h2>
                  <p className="text-xs text-slate-450">
                    Knowledge blocks, rates strategies, and cybersecurity briefs designed by our private banking specialists.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {articlesList.map((art, idx) => (
                    <div 
                      key={idx}
                      className="group rounded-2xl border border-slate-100 p-5 bg-white text-left space-y-3 hover:border-brand-red/30 transition-all hover:shadow-md cursor-pointer"
                      onClick={() => setSelectedArticle(art)}
                    >
                      <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400">
                        <span>{art.date}</span>
                        <span className="text-brand-red uppercase">{art.readTime}</span>
                      </div>
                      
                      <span className="inline-block text-[8px] font-black tracking-wider text-brand-red bg-brand-red/5 px-2 py-0.5 rounded-md uppercase">
                        {art.category}
                      </span>
                      
                      <h4 className="text-xs font-bold leading-relaxed text-slate-800 group-hover:text-brand-red transition-colors uppercase">
                        {art.title}
                      </h4>
                      
                      <div className="pt-2 flex items-center justify-between text-[9px] font-extrabold text-brand-red uppercase tracking-wider">
                        <span>Read Article</span>
                        <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 9: DOWNLOAD MOBILE APP */}
            <section className="py-20 bg-white text-slate-900 border-b border-slate-100">
              <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column Mockups */}
                  <div className="lg:col-span-5 relative flex justify-center order-2 lg:order-1">
                    <div className="absolute inset-x-0 top-12 bottom-12 bg-brand-red/5 rounded-[2rem] blur-3xl" />
                    
                    {/* Realistic CSS/Tailwind smartphone mockup */}
                    <div className="relative w-72 border-[10px] border-slate-900 rounded-[2.5rem] bg-slate-950 shadow-2xl overflow-hidden aspect-[9/18]">
                      {/* Notch */}
                      <div className="absolute top-0 inset-x-0 h-4 bg-slate-900 flex justify-center z-20">
                        <div className="w-16 h-3 bg-black rounded-b-xl" />
                      </div>
                      
                      {/* App Interface simulated layout */}
                      <div className="p-4 pt-8 space-y-4 text-left z-10 relative">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                          <span className="text-[10px] font-black uppercase text-brand-red">Valora Secure Node </span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">SSL LOCKED</span>
                        </div>
                        
                        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-left space-y-1">
                          <p className="text-[8px] uppercase text-slate-400 tracking-wider">Active Account balance</p>
                          <p className="text-lg font-black font-mono text-white">$145,280.74</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[8px] uppercase font-bold text-slate-400">Clearing Statuses</p>
                          <div className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between text-[8px]">
                            <span className="text-slate-200">Checking Deposit</span>
                            <span className="text-emerald-400 font-bold font-mono">COMPLETE</span>
                          </div>
                          <div className="p-2 bg-slate-900/50 rounded-lg flex items-center justify-between text-[8px]">
                            <span className="text-slate-200">Sovereign Sweep</span>
                            <span className="text-brand-red font-bold font-mono">ACTIVE (12%)</span>
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-brand-red text-center text-[10px] text-white font-extrabold uppercase">
                          Transfer Complete
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Copywriting */}
                  <div className="lg:col-span-7 space-y-6 text-left order-1 lg:order-2">
                    <span className="text-[10px] font-black tracking-widest text-brand-red uppercase block">Smart Depository Sync</span>
                    <h2 className="text-2xl md:text-4.25xl font-extrabold uppercase leading-tight text-slate-900">
                      Your Assets, Multiplied On Mobile
                    </h2>
                    <p className="text-xs md:text-sm text-brand-gray leading-relaxed font-semibold">
                      Carry the security of Valora Financial Bank right in your pocket. Verify daily checkings statements, locks/unlocks on lost titanium plastic card assets, automated savings APY configurations, and wire dispatch approvals in a single tactile touch response.
                    </p>

                    <div className="flex flex-wrap items-center gap-4.5 pt-4">
                      {/* Play Store simulated Badge */}
                      <button 
                        onClick={() => alert("Valora Mobile App: Android download links are available inside your user dashboard.")}
                        className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center gap-3 cursor-pointer text-left transition-all hover:scale-[1.02]"
                      >
                        <Smartphone size={20} className="text-brand-red" />
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase font-bold leading-none">Download App</p>
                          <p className="text-xs text-slate-900 font-black leading-tight mt-0.5">Google Play Store</p>
                        </div>
                      </button>

                      {/* App Store simulated Badge */}
                      <button 
                        onClick={() => alert("Valora Mobile App: Apple iOS download links are available inside your user dashboard.")}
                        className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center gap-3 cursor-pointer text-left transition-all hover:scale-[1.02]"
                      >
                        <Download size={20} className="text-brand-red" />
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase font-bold leading-none">Get it on iOS</p>
                          <p className="text-xs text-slate-900 font-black leading-tight mt-0.5">Apple App Store</p>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}

        {/* PERSONAL BANKING SCREEN */}
        {currentTab === "personal" && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl">
              <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Premium Private Banking</span>
              <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight mt-1.5 ${dark ? "text-white" : "text-slate-900"}`}>
                Personal Custody & Checking
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Experience seamless trade clearance with zero administrative hurdles. Our personal accounts feature full visual card access and high interest yields.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Checking Info Card */}
              <div className={`p-6 lg:p-8 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>Sovereign Checking</h3>
                    <p className="text-[10px] text-slate-400 uppercase">Interactive Cash Flow Management</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Monthly Maintenance Fee</span>
                    <span className="text-xs font-black text-emerald-500 uppercase font-mono">None ($0.00)</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Minimum Liquidity Balance</span>
                    <span className="text-xs font-black font-mono">None</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Overdraft Line limit</span>
                    <span className="text-xs font-black text-brand-red font-mono">$10,000.00 Limit</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-brand-red/5 border border-brand-red/10 text-center space-y-2 mb-6">
                  <p className="text-[10.5px] font-bold leading-normal">
                    * Interactive online account signups are restricted for security audits. Client coordinates must compile on your active administrator console.
                  </p>
                </div>

                <button
                  onClick={onOpenLogin}
                  className="w-full py-3 rounded-xl bg-brand-red hover:bg-[#A93226] text-white text-xs font-black hover:shadow-lg transition-all cursor-pointer"
                >
                  Sign In to Access Checking Account
                </button>
              </div>

              {/* Savings Info Card */}
              <div className={`p-6 lg:p-8 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Coins size={20} />
                  </div>
                  <div>
                    <h3 className={`text-base font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>Sovereign High-Yield Savings</h3>
                    <p className="text-[10px] text-slate-400 uppercase">Compound Yield Generation</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Compound Interval</span>
                    <span className="text-xs font-bold uppercase text-slate-300 font-mono">Continuous Monthly</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Interest APY Target</span>
                    <span className="text-xs font-black text-emerald-500 font-mono">Up to 12.00% APY</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-slate-200/50 dark:border-slate-800">
                    <span className="text-xs text-slate-400">Yield Vault Term Lock option</span>
                    <span className="text-xs font-bold font-mono text-brand-red">3, 6, 12 Months Available</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <h4 className="text-[11px] font-bold uppercase mb-2">High Rate Compound Comparison</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Valora Compound Vault</span>
                      <span className="text-emerald-500">12.0% APY</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Traditional Bank Median</span>
                      <span className="text-rose-500">0.45% APY</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full w-[8%]" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* BUSINESS BANKING SCREEN */}
        {currentTab === "business" && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl text-left">
              <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Enterprise Capital Clearance</span>
              <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight mt-1.5 ${dark ? "text-white" : "text-slate-900"}`}>
                Corporate Cash & Merchant Vaults
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                We design trade architectures, bridge credit lines, machinery financing structures, and liquid checking options dedicated for corporate trade clearance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Sovereign Merchant Services",
                  desc: "Clear global payments instantly with zero cross-border clearance fees and automated transfer capabilities linked to checking account holdings.",
                  detail: "Instant settlement clearance"
                },
                {
                  title: "Asset-Backed Overdrafts",
                  desc: "Access temporary credit reserves backed by secure real estate, state bonds, or commercial machinery holdings at fixed rates starting at 4.25%.",
                  detail: "Fixed low rates available"
                },
                {
                  title: "Payroll Clearing Hub",
                  desc: "Distribute monthly workforce payouts, direct deposits, tax clearances, and corporate dividend settlements automatically under elite security.",
                  detail: "Automated ACH payroll engine"
                }
              ].map((b, idx) => (
                <div 
                  key={idx} 
                  className={`p-6 rounded-[2rem] border ${
                    dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-150 shadow-sm"
                  }`}
                >
                  <h3 className={`text-base font-bold uppercase tracking-tight mb-3 ${dark ? "text-white" : "text-slate-900"}`}>{b.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">{b.desc}</p>
                  <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-brand-red tracking-wider uppercase">{b.detail}</span>
                    <div className="w-6 h-6 rounded-full bg-brand-red/10 flex items-center justify-center text-brand-red">
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LOANS WITH EMI CALCULATOR & APPLICATION FORM */}
        {currentTab === "loans" && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-16 text-left">
            
            {/* Header Copy */}
            <div className="max-w-3xl space-y-3">
              <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Sovereign Financing Facilities</span>
              <h2 className={`text-3xl lg:text-5xl font-black uppercase tracking-tight leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                Generational Capital Solutions
              </h2>
              <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
                Whether purchasing a beachfront residential estate, seeding corporate liquid operations, or acquiring luxury transport fleets, our priority underwriting panels clear asset clearances rapidly under full Switzer security protocols.
              </p>
            </div>

            {/* Five Loan Products Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  id: "personal",
                  title: "Personal Loans",
                  description: "Flexible cash reserve with zero spending restrictions. Ideal for stabilizing private balances, purchasing luxury collectibles, or estate restructuring.",
                  rate: "6.49% APY",
                  defaultRate: 6.5,
                  defaultAmt: 50000,
                  defaultTerm: 36,
                  formType: "Personal Loan",
                  amountLimit: "Up to $150,000",
                  eligibility: "Active custody balances over $10,000 or verified income streams statement.",
                  imageUrl: "https://image.cnbcfm.com/api/v1/image/106797854-1605574470310-gettyimages-1126878582-img03195.jpeg?v=1605574607&w=1920&h=1080"
                },
                {
                  id: "home",
                  title: "Home Loans & Mortgages",
                  description: "Procure private modern residential estates or major commercial architectural developments with secure long-term amortization matrices.",
                  rate: "3.49% APY",
                  defaultRate: 3.5,
                  defaultAmt: 650000,
                  defaultTerm: 240,
                  formType: "Mortgage Loan",
                  amountLimit: "Up to $10,000,005",
                  eligibility: "Preregister of land title escrows or high-tier portfolio assets as pledge.",
                  imageUrl: "https://photos.zillowstatic.com/fp/3b4217054f6219bacf67303015497403-cc_ft_768.webp"
                },
                {
                  id: "auto",
                  title: "Premium Automobile & Marine Leases",
                  description: "Acquire executive supercars, yachts, or aircraft files beneath premium amortization terms with swift administrative customs clearances.",
                  rate: "4.25% APY",
                  defaultRate: 4.3,
                  defaultAmt: 120000,
                  defaultTerm: 60,
                  formType: "Premium Auto Lease",
                  amountLimit: "Up to $500,005",
                  eligibility: "Co-endorsement of vehicle or vessel registration under Valora transport clearing index.",
                  imageUrl: "https://www.usnews.com/object/image/0000019c-8c3f-d017-ab9c-dcff9a5f0000/p90625400-highres-bmw-z4-final-edition.jpg?update-time=1771879504193&size=responsive640&format=webp"
                },
                {
                  id: "business",
                  title: "Corporate Liquid Capital Lines",
                  description: "Empower commercial growth, fund high-volume inventories, or upgrade processing machines with interest-only revolving assets clearing.",
                  rate: "4.99% APY",
                  defaultRate: 5.0,
                  defaultAmt: 850000,
                  defaultTerm: 120,
                  formType: "Corporate Capital Line",
                  amountLimit: "Up to $25,000,000",
                  eligibility: "Audited corporate balance sheet or ledger surplus reporting certified by branch.",
                  imageUrl: "https://photos.zillowstatic.com/fp/9bd79c2f214c6aa103bf9a2674f92d32-cc_ft_768.webp"
                },
                {
                  id: "education",
                  title: "Elite Education Loans",
                  description: "Finance premium global university tuition fees, leadership executive master courses, or certified scientific research programs.",
                  rate: "2.99% APY",
                  defaultRate: 3.0,
                  defaultAmt: 75000,
                  defaultTerm: 120,
                  formType: "Education Loan",
                  amountLimit: "Up to $250,000",
                  eligibility: "Enrollment letter validation coordinates or verified parent guardian legal covenant.",
                  imageUrl: "https://cdn.internationalstudentloan.com/assets/ISTL/images/redesign/optimized/private-student-loans.webp"
                }
              ].map((p, idx) => (
                <div 
                  key={idx}
                  className={`group rounded-[2rem] border overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    dark 
                      ? "bg-slate-950/60 border-slate-900 hover:border-slate-800" 
                      : "bg-white border-slate-150 shadow-sm"
                  }`}
                >
                  <div>
                    {/* Loan Product Image */}
                    <div className="h-64 sm:h-48 w-full overflow-hidden relative bg-slate-950">
                      <img 
                        src={p.imageUrl} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <span className="px-2.5 py-1 rounded-full bg-brand-red text-white text-[9px] font-black uppercase tracking-wider">
                          {p.rate} Starting
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-1">
                        <h3 className={`text-base font-bold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>{p.title}</h3>
                        <p className="text-[9.5px] font-mono tracking-wider uppercase text-brand-red font-bold">{p.amountLimit}</p>
                      </div>
                      
                      <p className="text-xs text-slate-400 leading-relaxed font-sans">{p.description}</p>
                      
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1 text-left">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 block">Eligibility checklist</span>
                        <p className="text-[10px] text-slate-450 leading-normal italic">{p.eligibility}</p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="p-6 pt-0 flex gap-3">
                    <button
                      onClick={() => {
                        setEmiAmount(p.defaultAmt);
                        setEmiTerm(p.defaultTerm);
                        setEmiRate(p.defaultRate);
                        setLoanType(p.formType);
                        setLoanAmtInput(p.defaultAmt.toString());
                        const calcEl = document.getElementById("emi-calc-frame");
                        if (calcEl) calcEl.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-brand-red/10 hover:bg-brand-red hover:text-white border border-brand-red/20 text-brand-red font-black text-[9.5px] tracking-wider uppercase transition-all cursor-pointer text-center"
                    >
                      Calculate Payment
                    </button>
                    
                    <button
                      onClick={() => {
                        setLoanType(p.formType);
                        setLoanAmtInput(p.defaultAmt.toString());
                        const formEl = document.getElementById("loan-application-form-block");
                        if (formEl) formEl.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`flex-1 py-2.5 rounded-xl text-[9.5px] tracking-wider uppercase font-black transition-all cursor-pointer border ${
                        dark 
                          ? "border-slate-800 hover:bg-slate-900 text-slate-200" 
                          : "border-slate-200 hover:bg-slate-100 text-slate-700 bg-white"
                      }`}
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Section: Calculator and Application layout */}
            <div id="emi-calc-frame" className="grid lg:grid-cols-12 gap-12 items-start pt-12">
              
              {/* Left Column: EMI Loan Payment Calculator */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Valora Credit Planners</span>
                  <h2 className={`text-2xl lg:text-3xl font-extrabold uppercase mt-1.5 leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                    Dynamic EMI Loan Payment Calculator
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-2 animate-pulse">
                    Accurately balance and estimate expected monthly payments for Property, Auto, or Personal Loans targeting competitive rates.
                  </p>
                </div>

                <div className={`p-6 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-md"}`}>
                  <div className="space-y-4 text-left">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-slate-400">Loan Amount:</span>
                        <span className="text-brand-red font-mono">${emiAmount.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min={5000}
                        max={10000000}
                        step={5000}
                        value={emiAmount}
                        onChange={(e) => setEmiAmount(parseInt(e.target.value))}
                        className="w-full accent-brand-red cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-slate-400">Amortization Term:</span>
                        <span className="text-brand-red font-mono">{emiTerm} Months ({emiTerm / 12} Yrs)</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={360}
                        step={12}
                        value={emiTerm}
                        onChange={(e) => setEmiTerm(parseInt(e.target.value))}
                        className="w-full accent-brand-red cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-slate-400">Expected Interest Rate:</span>
                        <span className="text-brand-red font-mono">{emiRate}% APY</span>
                      </div>
                      <input
                        type="range"
                        min={2.0}
                        max={18.0}
                        step={0.1}
                        value={emiRate}
                        onChange={(e) => setEmiRate(parseFloat(e.target.value))}
                        className="w-full accent-brand-red cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-brand-red/5 border border-brand-red/10 text-center space-y-1 mt-6">
                    <p className="text-[9.5px] uppercase font-black tracking-widest text-slate-400">Projected Monthly EMI Payment</p>
                    <h3 className="text-2xl font-black text-brand-red font-mono">${emiResult.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h3>
                    <p className="text-[10.5px] text-slate-500 leading-normal">
                      Based on standard fixed amortization guidelines. Rates subject to central audit approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Loan Application Form */}
              <div id="loan-application-form-block" className="lg:col-span-6">
                <div className={`p-6 lg:p-8 rounded-[2.5rem] border shadow-2xl ${
                  dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-150"
                }`}>
                  <div className="flex items-center gap-3.5 border-b pb-4 mb-6 dark:border-slate-800 border-slate-100">
                    <Compass className="text-brand-red w-6 h-6 animate-pulse" />
                    <div className="text-left">
                      <h3 className={`text-sm font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>
                        Apply for Sovereign Credit Line
                      </h3>
                      <p className="text-[10px] text-slate-400 uppercase">Immediate Corporate Check & Review</p>
                    </div>
                  </div>

                  {loanSubmitted ? (
                    <div className="p-8 text-center space-y-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <CheckCircle2 className="text-emerald-500 w-12 h-12 mx-auto animate-bounce" />
                      <h4 className="text-sm font-extrabold uppercase text-emerald-400">Application Submitted for Corporate Review</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto text-center">
                        Your sovereign asset credit files have compiled successfully! Note down your coordinates and check with the administrative cabin to track clearance approvals.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitLoanApplicationForm} className="space-y-4 text-left">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Stella Vance"
                            value={loanName}
                            onChange={(e) => setLoanName(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs border ${
                              dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="stella@corporatelane.com"
                            value={loanEmail}
                            onChange={(e) => setLoanEmail(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs border ${
                              dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Credit Category</label>
                          <select
                            value={loanType}
                            onChange={(e) => setLoanType(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs font-bold border ${
                              dark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                          >
                            <option value="Personal Loan">Personal Loan</option>
                            <option value="Mortgage Loan">Mortgage Loan</option>
                            <option value="Premium Auto Lease">Premium Auto Lease</option>
                            <option value="Corporate Capital Line">Corporate Capital Line</option>
                            <option value="Education Loan">Education Loan</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Funding Requested ($)</label>
                          <input
                            type="number"
                            required
                            value={loanAmtInput}
                            onChange={(e) => setLoanAmtInput(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none font-mono text-xs font-bold border ${
                              dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                      </div>

                      <p className="text-[9.5px] text-slate-400 italic leading-normal">
                        * Eligibility Checklist: Under central custody rules, corporate applicants must post verified asset sheets inside their client cabin prior to sovereign release.
                      </p>

                      <button
                        type="submit"
                        className="w-full py-3 bg-brand-red hover:bg-[#A93226] text-white font-black rounded-xl text-xs transition-all uppercase cursor-pointer"
                      >
                        Submit Credit Request Coordinates
                      </button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </section>
        )}

        {/* CREDIT CARDS */}
        {currentTab === "cards" && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-16 text-left">
            {/* Header copy */}
            <div className="max-w-3xl space-y-3">
              <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Prestige Payment Solutions</span>
              <h2 className={`text-3xl lg:text-5xl font-black uppercase tracking-tight leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                Luxury Metallic Credit Instruments
              </h2>
              <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
                Precision-engineered for sovereign traders and estate managers. Experience zero international commission fees, solid metallic frames with laser-engraved signatures, and direct high-yield vault rewards compounding.
              </p>
            </div>

            {/* Interactive Grid Showcase */}
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Left 5 Cards Grid */}
              <div className="lg:col-span-8 space-y-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      id: "platinum",
                      name: "Valora Platinum Card",
                      type: "Personal Elite",
                      gradient: "from-slate-350 via-slate-100 to-slate-400 text-slate-900 border-slate-300",
                      chipColor: "bg-slate-400/80 border-slate-300",
                      shadowColor: "shadow-slate-400/10",
                      num: "4532 9821 3456 1109",
                      expiry: "06/32",
                      holder: "PLATINUM CUSTODIAN",
                      textLight: false,
                      accentText: "text-slate-800",
                      badgeBg: "bg-slate-800 text-slate-100"
                    },
                    {
                      id: "gold",
                      name: "Valora Gold Card",
                      type: "Premium Lifestyle",
                      gradient: "from-amber-600 via-amber-200 to-yellow-600 text-amber-950 border-amber-400",
                      chipColor: "bg-amber-400/80 border-amber-300",
                      shadowColor: "shadow-amber-500/15",
                      num: "4321 0098 7654 3210",
                      expiry: "11/31",
                      holder: "GOLD RESERVE USER",
                      textLight: false,
                      accentText: "text-amber-900",
                      badgeBg: "bg-amber-900 text-amber-100"
                    },
                    {
                      id: "signature",
                      name: "Valora Signature Card",
                      type: "Sovereign Reserve",
                      gradient: "from-slate-950 via-slate-900 to-slate-950 text-white border-slate-800/50",
                      chipColor: "bg-amber-500/80 border-amber-400",
                      shadowColor: "shadow-brand-red/20",
                      num: "4000 8824 1009 5214",
                      expiry: "12/32",
                      holder: "SOVEREIGN REPRESENTATIVE",
                      textLight: true,
                      accentText: "text-brand-red",
                      badgeBg: "bg-brand-red text-white"
                    },
                    {
                      id: "business",
                      name: "Valora Business Card",
                      type: "Sovereign Corporate",
                      gradient: "from-emerald-950 via-teal-900 to-slate-950 text-emerald-50 border-emerald-800/60",
                      chipColor: "bg-slate-300/80 border-slate-200",
                      shadowColor: "shadow-teal-500/15",
                      num: "4912 6543 8761 1205",
                      expiry: "09/33",
                      holder: "CHIEF EXECUTIVE OFFICER",
                      textLight: true,
                      accentText: "text-emerald-400",
                      badgeBg: "bg-emerald-500 text-emerald-950"
                    },
                    {
                      id: "rewards",
                      name: "Valora Rewards Card",
                      type: "Spectrum Travel",
                      gradient: "from-fuchsia-950 via-pink-900 to-indigo-950 text-fuchsia-50 border-pink-900/40",
                      chipColor: "bg-amber-400/80 border-amber-300",
                      shadowColor: "shadow-pink-500/15",
                      num: "4410 7712 9013 4488",
                      expiry: "03/32",
                      holder: "SPECTRUM ADVENTURER",
                      textLight: true,
                      accentText: "text-pink-400",
                      badgeBg: "bg-pink-500 text-fuchsia-950"
                    }
                  ].map((card, idx) => (
                    <div 
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`group cursor-pointer p-[1.5px] rounded-[1.85rem] bg-gradient-to-tr transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl ${card.shadowColor} ${
                        selectedCardId === card.id 
                          ? "from-brand-red via-brand-red to-brand-red" 
                          : dark ? "from-slate-800 to-slate-950 hover:from-slate-700 hover:to-brand-red/20" : "from-slate-200 to-slate-100 hover:from-slate-300 hover:to-brand-red/25"
                      }`}
                    >
                      {/* Physical Card Container */}
                      <div className={`p-6 rounded-[1.75rem] h-56 relative overflow-hidden flex flex-col justify-between bg-gradient-to-tr border ${card.gradient} transition-transform duration-300`}>
                        {/* Shimmer reflection glaze effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out pointer-events-none" />
                        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/5 to-transparent blur-xl pointer-events-none" />
                        
                        {/* Card Header */}
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Landmark className="w-4 h-4 text-inherit" />
                              <span className="text-[9px] font-black tracking-widest uppercase font-sans">VALORA BANK</span>
                            </div>
                            <h3 className="text-xs font-black tracking-wider uppercase mt-1 opacity-90">{card.name}</h3>
                          </div>
                          
                          {/* Contactless wave logo rotated */}
                          <div className="flex items-center gap-1.5">
                            <Wifi className="w-4 h-4 opacity-80 rotate-90" />
                            <Cpu className="w-5 h-5 opacity-40 shrink-0" />
                          </div>
                        </div>

                        {/* EMV Micro Chip design */}
                        <div className="flex items-center gap-3 z-10">
                          <div className={`w-8 h-6 rounded-md border ${card.chipColor} relative p-1`}>
                            {/* Chip micro circuitry lines */}
                            <div className="absolute inset-x-2 inset-y-1 border border-slate-700/20 rounded-sm" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-slate-700/20" />
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-700/20" />
                          </div>
                          <span className={`text-[8.5px] font-mono tracking-widest leading-none ${card.textLight ? "text-slate-400" : "text-slate-600"}`}>
                            PREMIUM CORE ID
                          </span>
                        </div>

                        {/* Card Footer: Number and name details */}
                        <div className="space-y-2 z-10">
                          <p className="text-[12.5px] font-mono tracking-[0.2em] font-extrabold leading-none">
                            {card.num}
                          </p>
                          <div className="flex justify-between items-end">
                            <div className="text-left">
                              <p className="text-[6.5px] font-mono tracking-widest opacity-60 uppercase mb-0.5">CARDHOLDER</p>
                              <p className="text-[8.5px] font-mono font-bold tracking-wider leading-none uppercase">{card.holder}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[6.5px] font-mono tracking-widest opacity-60 uppercase mb-0.5">EXPIRY</p>
                              <span className="text-[8.5px] font-mono font-bold leading-none">{card.expiry}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl text-center text-[10.5px] ${dark ? "bg-slate-900/40 text-slate-400" : "bg-slate-50 text-slate-500"} border border-slate-200/40 dark:border-slate-800/50`}>
                  💡 <span className="font-bold">Interact:</span> Click any metallic card layout above to inspect specific benefits tabs and open the online instant application system.
                </div>
              </div>

              {/* Right In-Depth Benefits Inspector & Online Application Frame */}
              <div className="lg:col-span-4 space-y-6">
                {[
                  {
                    id: "platinum",
                    name: "Valora Platinum Card",
                    type: "Personal Elite",
                    badge: "Platinum Tier Priority",
                    apr: "13.99% Variable APR",
                    annualFee: "$0/Yr",
                    cashback: "2.5% Cash Rebate",
                    benefits: [
                      "No annual maintenance or account fees unconditionally",
                      "2.5% Direct cashback deposit to checking index",
                      "Complimentary five-star terminal access pass keys",
                      "Private travel damage & collision coverage insurance",
                      "24/7 dedicated administrative branch communication line"
                    ]
                  },
                  {
                    id: "gold",
                    name: "Valora Gold Card",
                    type: "Premium Lifestyle",
                    badge: "Gold Priority Category",
                    apr: "15.49% Variable APR",
                    annualFee: "$95/Yr (Waived First Year)",
                    cashback: "4.0% Active Cash",
                    benefits: [
                      "4.0% Cashback dining, local travel, and retail bills",
                      "Accelerated hotel upgrades and airport meal vouchers",
                      "Complimentary gourmet advisory and event coordination concierge",
                      "Trip interruption or travel postponement insurance",
                      "Unlimited continuous currency conversions at standard cost"
                    ]
                  },
                  {
                    id: "signature",
                    name: "Valora Signature Card",
                    type: "Sovereign Reserve",
                    badge: "Sovereign Executive Tier",
                    apr: "11.24% Variable APR",
                    annualFee: "$495/Yr",
                    cashback: "5.5% Direct Cashback",
                    benefits: [
                      "5.5% Direct compounding cashback points pool setup",
                      "Private jet terminal parking and instant customs clearing passes",
                      "Direct access-backed borrowing line starting at 0% collateral",
                      "Sovereign VIP secure safety deposit boxes located in London vault",
                      "Full personal and corporate $10M liability indemnity cover"
                    ]
                  },
                  {
                    id: "business",
                    name: "Valora Business Card",
                    type: "Sovereign Corporate",
                    badge: "Corporate Custodian Tier",
                    apr: "12.99% Variable APR",
                    annualFee: "$0/Yr (with automatic clear)",
                    cashback: "6.0% Uncapped",
                    benefits: [
                      "6.0% Uncapped cashback rewards on servers and utility bills",
                      "Live accounting platform syncing with multi-ledger export",
                      "Provision unlimited employee credit cards with dynamic rules",
                      "Accelerated priority loan review with direct executive panel",
                      "24/7 commercial operations desk and legal assistance"
                    ]
                  },
                  {
                    id: "rewards",
                    name: "Valora Rewards Card",
                    type: "Spectrum Travel",
                    badge: "Spectrum Adventurer Tier",
                    apr: "14.99% Variable APR",
                    annualFee: "$0/Yr",
                    cashback: "5x Miles Accumulator",
                    benefits: [
                      "5x Points on international yacht, marine, and aviation reservations",
                      "Instant travel partner transfer (credits transfer 1:1 format)",
                      "Complimentary baggage delay cargo insurance coverage protection",
                      "Globetrotting health service telephone concierge available",
                      "Zero overseas transactional fee markup or currency holds"
                    ]
                  }
                ].filter(b => b.id === selectedCardId).map(benefit => (
                  <div key={benefit.id} className={`p-6 rounded-[2rem] border space-y-6 ${
                    dark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200 shadow-lg"
                  }`}>
                    {/* Header */}
                    <div className="space-y-1.5 text-left">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-[9px] uppercase font-bold tracking-widest text-brand-red inline-block">
                        {benefit.badge}
                      </span>
                      <h3 className={`text-base lg:text-lg font-black uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>{benefit.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">ID: {benefit.id.toUpperCase()}-VAULT-RESERVE</p>
                    </div>

                    {/* Stats Specs */}
                    <div className="grid grid-cols-3 gap-3 text-center border-y border-slate-200/50 dark:border-slate-800 py-4 font-mono">
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">CASHBACK</p>
                        <p className="text-[11px] font-black text-emerald-500 mt-1">{benefit.cashback}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">ANNUAL FEE</p>
                        <p className={`text-[11px] font-black mt-1 ${dark ? "text-slate-200" : "text-slate-800"}`}>{benefit.annualFee}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">PURCHASE APR</p>
                        <p className="text-[10px] font-bold text-brand-red mt-1">{benefit.apr}</p>
                      </div>
                    </div>

                    {/* List Benefits */}
                    <div className="space-y-3 text-left">
                      <h4 className={`text-[10.5px] font-black uppercase tracking-wider ${dark ? "text-slate-200" : "text-slate-850"}`}>Exclusive Sovereign Perks:</h4>
                      <div className="space-y-2.5">
                        {benefit.benefits.map((b, bIdx) => (
                          <div key={bIdx} className="flex gap-2 items-start">
                            <Check className="text-brand-red w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{b}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instant apply button triggering modal flow inside app */}
                    <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800">
                      {isAppliedApproved ? (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1 text-left">
                          <div className="flex gap-1.5 items-center justify-center text-emerald-400">
                            <ShieldCheck size={14} className="stroke-[2.5]" />
                            <span className="text-[10.5px] font-black uppercase tracking-wider">Application Approved</span>
                          </div>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed">
                            Conditional initial credit limit has been cleared at <span className="font-black text-emerald-400 font-mono">$35,000</span>! Shipping coordinates saved under your profile ledger.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCardApplyOpen(!isCardApplyOpen)}
                          className="w-full py-3 bg-brand-red hover:bg-[#A93226] text-white font-black rounded-xl text-[10.5px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Request Instant Underwriting <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Instant Application Drawer Form */}
                {isCardApplyOpen && !isAppliedApproved && (
                  <div className={`p-6 rounded-[2rem] border text-left space-y-4 ${
                    dark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200 shadow-md"
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h4 className={`text-xs font-black uppercase ${dark ? "text-white" : "text-slate-900"}`}>Underwriting Parameters</h4>
                      <button 
                        onClick={() => setIsCardApplyOpen(false)}
                        className="text-slate-400 hover:text-slate-200 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setIsCardApplying(true);
                      setTimeout(() => {
                        setIsCardApplying(false);
                        setIsAppliedApproved(true);
                        setIsCardApplyOpen(false);
                      }, 2500);
                    }} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Card Selected</label>
                        <input 
                          type="text" 
                          disabled
                          value={`VALORA ${selectedCardId.toUpperCase()} CARD`} 
                          className={`w-full p-2.5 rounded-lg font-mono text-[10.5px] font-bold border ${
                            dark ? "bg-slate-900/60 border-slate-800 text-brand-red" : "bg-slate-100 border-slate-100 text-brand-red"
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Cardholder Legal Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Admiral Johnathan Reed"
                          className={`w-full p-2.5 rounded-lg outline-none text-[10.5px] font-bold border ${
                            dark ? "bg-slate-900 border-slate-800 text-white focus:border-brand-red" : "bg-white border-slate-200 text-slate-900 focus:border-brand-red"
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Yearly Income ($)</label>
                          <input 
                            type="number" 
                            required
                            placeholder="e.g. 150000"
                            className={`w-full p-2.5 rounded-lg outline-none font-mono text-[10.5px] font-bold border ${
                              dark ? "bg-slate-900 border-slate-800 text-white focus:border-brand-red" : "bg-white border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">SSN / Passport ID</label>
                          <div className="relative">
                            <input 
                              type={showSsn ? "text" : "password"} 
                              required
                              placeholder="•••••••••"
                              className={`w-full p-2.5 pr-10 rounded-lg outline-none font-mono text-[10.5px] font-bold border ${
                                dark ? "bg-slate-900 border-slate-800 text-white focus:border-brand-red" : "bg-white border-slate-200 text-slate-900 focus:border-brand-red"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSsn(!showSsn)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-brand-red hover:bg-brand-red/10 transition-colors"
                              title={showSsn ? "Hide SSN / Passport ID" : "Show SSN / Passport ID"}
                            >
                              {showSsn ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start py-1">
                        <input type="checkbox" required className="mt-0.5 text-brand-red accent-brand-red" />
                        <span className="text-[8.5px] text-slate-400 leading-normal">
                          I certify that I hold necessary sovereign asset clearings and authorisations under standard UK FCA/PRA custody treaty codes.
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isCardApplying}
                        className="w-full py-2.5 bg-brand-red hover:bg-[#A93226] disabled:bg-slate-800 text-white font-black rounded-lg text-[10px] tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isCardApplying ? (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full border-[2px] border-white border-t-transparent animate-spin" />
                            Underwriting Assets...
                          </>
                        ) : (
                          "Transmit Clearings"
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* INVESTMENTS */}
        {currentTab === "investments" && (
          <InvestmentsCalculatorTab
            investmentSettings={investmentSettings}
            dark={dark}
            onOpenLogin={onOpenLogin}
            onSubmitInquiry={onSubmitInquiry}
            investmentInquiries={investmentInquiries}
          />
        )}


        {/* INVESTMENT PROPERTIES DEED MARKETPLACE PORTAL */}
        {currentTab === "properties" && (
          <InvestmentProperties dark={dark} />
        )}


        {/* BITCOIN EDUCATION & TRADING CENTER */}
        {currentTab === "bitcoin" && (
          <BitcoinCenterTab dark={dark} onOpenLogin={onOpenLogin} />
        )}


        {/* SUPPORT HUB: FAQ, LIVE CHAT GATEWAY, APPOINTMENT BOOKER, SUPPORT TICKETS */}
        {currentTab === "support" && (
          <section className="py-16 px-6 max-w-7xl mx-auto space-y-16">
            
            {/* Header */}
            <div className="max-w-2xl text-left">
              <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Valora Reception</span>
              <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight mt-1.5 ${dark ? "text-white" : "text-slate-900"}`}>
                Contact & Conversational Support
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Book safe personal appointments at our physical branches, ask continuous terminal questions via Live Chat, or directly post support tickets to obtain administrative clearance.
              </p>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Support Ticket Submission Form (Centrally Aligned) */}
              <div className="lg:col-span-8 lg:col-start-3 space-y-6">
                
                {/* Submit Ticket Container */}
                <div className={`p-6 lg:p-8 rounded-[2.5rem] border ${
                  dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}>
                  <div className="flex items-center gap-3.5 border-b pb-4 mb-6 dark:border-slate-800 border-slate-100">
                    <MessageSquare className="text-brand-red w-5 h-5 animate-pulse" />
                    <div>
                      <h3 className={`text-sm font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>Submit Secure Support Ticket</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-mono">Secure Dedicated Routing Ledger</p>
                    </div>
                  </div>

                  {ticketSubmitted ? (
                    <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <CheckCircle2 className="text-emerald-500 w-10 h-10 mx-auto" />
                      <h4 className="text-xs font-bold uppercase text-emerald-400">Support Ticket Registered successfully</h4>
                      <p className="text-[10.5px] text-slate-400 leading-normal max-w-sm mx-auto">
                        Your technical inquiry coordinates compiled perfectly! View active support logs or resolve pending issues inside the bank administrator workspace.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={submitSupportTicketForm} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Your Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Stella Vance"
                            value={ticketName}
                            onChange={(e) => setTicketName(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs border ${
                              dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-400">Sovereign Email</label>
                          <input
                            type="email"
                            required
                            placeholder="stella@corporatelane.com"
                            value={ticketEmail}
                            onChange={(e) => setTicketEmail(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs border ${
                              dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Ticket Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Card validation query or loan dispatch delay"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs border ${
                            dark ? "bg-slate-950 border-slate-800 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                          }`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-slate-400">Sovereign Message Details</label>
                        <textarea
                          required
                          rows={3}
                          placeholder="Please articulate exact trade parameters or ledger issues experienced..."
                          value={ticketMsg}
                          onChange={(e) => setTicketMsg(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs border ${
                            dark ? "bg-slate-950 border-slate-805 text-white focus:border-brand-red" : "bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-red"
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-brand-red hover:bg-[#A93226] text-white text-xs font-black transition-all rounded-xl uppercase cursor-pointer"
                      >
                        Submit Support Coordinates
                      </button>
                    </form>
                  )}
                </div>

                {/* Appointment booker */}
                <div className={`p-6 rounded-3xl border ${
                  dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-150"
                }`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${dark ? "text-white" : "text-slate-900"}`}>
                    <Calendar size={14} className="text-emerald-400" /> Book Safe Branch Consultation Appointment
                  </h4>

                  {bookSubmitted ? (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-center rounded-xl text-emerald-400 text-xs font-extrabold">
                      Appointment Registered Successfully! An officer will reserve direct clearance gates.
                    </div>
                  ) : (
                    <form onSubmit={(e) => { e.preventDefault(); setBookSubmitted(true); setTimeout(() => { setBookSubmitted(false); setBookName(""); setBookDate(""); }, 5000); }} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Your Name"
                          value={bookName}
                          onChange={(e) => setBookName(e.target.value)}
                          className={`p-2.5 rounded-lg outline-none text-xs border ${
                            dark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        />
                        <select
                          value={bookBranch}
                          onChange={(e) => setBookBranch(e.target.value)}
                          className={`p-2.5 rounded-lg outline-none text-xs font-bold border ${
                            dark ? "bg-slate-950 border-slate-800 text-white text-slate-200" : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        >
                          <option>Main London Headquarters</option>
                          <option>Birmingham Corporate Office Branch</option>
                          <option>London Mayfair Private Center</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          required
                          value={bookDate}
                          onChange={(e) => setBookDate(e.target.value)}
                          className={`p-2.5 rounded-lg outline-none text-xs border ${
                            dark ? "bg-slate-950 border-slate-800 text-white text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"
                          }`}
                        />
                        <button
                          type="submit"
                          className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[10.5px] font-black rounded-lg transition-all cursor-pointer uppercase text-center"
                        >
                          Confirm Requested Target
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </div>

            </div>
          </section>
        )}

        {/* ABOUT US & WHATSAPP CONTACT SECTION */}
        <section className={`py-16 px-6 border-t ${
          dark ? "bg-slate-900/40 border-slate-900 text-white" : "bg-slate-50 border-slate-150 text-slate-800"
        }`}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Title and General Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase block">
                  Corporate Profile
                </span>
                <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight mt-1.5 ${
                  dark ? "text-white" : "text-slate-900"
                }`}>
                  About Valora Financial Bank
                </h2>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                We combine financial expertise with modern technology to provide a reliable platform where investors can confidently grow their assets while working toward their long term financial goals.
              </p>

              {/* General Contact Us Panel */}
              <div className={`p-6 rounded-3xl border ${
                dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              } space-y-4`}>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                  dark ? "text-slate-200" : "text-slate-900"
                }`}>
                  <span>📞</span> General Contact Us & Client Services
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 text-lg">
                      💬
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Hotline</span>
                      <a 
                        href="https://wa.me/447348204490" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-black font-mono tracking-wide text-emerald-400 hover:underline flex items-center gap-1.5"
                      >
                        +44 7348 204490
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-sans uppercase font-bold animate-pulse">Live</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0 text-lg">
                      📍
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Corporate HQ & Registered Office</span>
                      <span className="text-xs font-bold text-slate-500">
                        15 Mayfair Pl, London W1J 8AJ, United Kingdom
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/15 dark:border-slate-800/60">
                  <a 
                    href="https://wa.me/447348204490" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black rounded-xl uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
                  >
                    <span>Chat via WhatsApp</span>
                    <span className="text-sm">→</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Detailed paragraphs */}
            <div className="lg:col-span-7 space-y-6 text-left text-xs md:text-[13px] leading-relaxed text-slate-400">
              <p>
                Valora Financial Bank is a trusted financial institution committed to helping individuals and businesses build lasting wealth through secure, innovative, and high value investment opportunities. We combine financial expertise with modern technology to provide a reliable platform where investors can confidently grow their assets while working toward their long term financial goals.
              </p>
              <p>
                Our investment portfolio focuses on three key sectors that have consistently created value across global markets. These include carefully selected real estate developments, strategic Bitcoin investments, and high potential business ventures. Every investment opportunity is thoroughly evaluated by our experienced professionals to maximize returns while maintaining responsible risk management.
              </p>
              <p>
                At Valora Financial Bank, we believe that financial growth should be accessible to everyone. Whether you are making your first investment or expanding an established portfolio, we provide flexible investment plans designed to match your financial objectives. Our transparent approach ensures that clients always understand where their funds are invested and how their investments are performing.
              </p>
              <p>
                When you invest with Valora Financial Bank, you gain access to competitive returns, secure account management, advanced investment tools, professional financial guidance, and a dedicated support team that is committed to your success. Our modern digital platform allows you to monitor your investments, track earnings, manage your portfolio, and access your account anytime from anywhere in the world.
              </p>
              <p>
                Our mission is to create sustainable wealth by connecting our clients with profitable opportunities in real estate, digital assets, and growing businesses. We are dedicated to building long term relationships based on trust, transparency, integrity, and exceptional service.
              </p>
              <p className={`font-bold border-t pt-4 ${dark ? "border-slate-800 text-slate-200" : "border-slate-200 text-slate-800"}`}>
                At Valora Financial Bank, your financial future is our priority. Together, we help you invest with confidence, grow with purpose, and achieve lasting prosperity.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* COMPREHENSIVE FOOTER */}
      <footer className={`py-12 px-6 border-t ${
        dark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <ValoraLogo dark={dark} className="h-9" />
          </div>
          <p className="text-[10.5px] text-slate-400 leading-normal text-center md:text-left max-w-md">
            © 2026 VALORA FINANCIAL CO-OPERATION S.A. ALL RIGHTS RESERVED. 15 Mayfair Pl, London W1J 8AJ, United Kingdom.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <button onClick={() => { alert("Privacy Policy: All client ledger data remains strictly personal and is never sold, shared, or indexed on public domains."); }} className="hover:text-brand-red cursor-pointer">Privacy</button>
            <button onClick={() => { alert("Terms of Service: Access is restricted to authorized clients. All accounts follow standard secure terms."); }} className="hover:text-brand-red cursor-pointer">Terms</button>
            <button onClick={() => { setCurrentTab("support"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-brand-red cursor-pointer">Support</button>
            <button onClick={onOpenLogin} className="text-brand-red font-bold hover:underline cursor-pointer">Client Entry</button>
          </div>
        </div>
      </footer>

      {/* FULL ARTICLE VIEW MODAL */}
      {selectedArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200/70 dark:border-slate-850 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col text-slate-900 dark:text-white">
            
            {/* Modal Header Cover Image */}
            <div className="h-52 md:h-64 w-full relative shrink-0">
              <img 
                src={selectedArticle.imageUrl} 
                alt={selectedArticle.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
              
              {/* Floating action buttons & tags inside cover image */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-2.5 rounded-full bg-slate-950/80 dark:bg-slate-900/80 text-white hover:bg-rose-600 transition-all shadow-md group border border-white/10 cursor-pointer"
                  title="Close Reader"
                >
                  <X size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-6 space-y-2 text-left">
                <span className="px-2.5 py-1 text-[8px] font-black tracking-widest text-brand-red bg-brand-red/10 rounded-full inline-block uppercase border border-brand-red/20">
                  {selectedArticle.category}
                </span>
                <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                  {selectedArticle.title}
                </h2>
              </div>
            </div>

            {/* Author and Read-Time Strip */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-4 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-brand-red flex items-center justify-center text-[8px] text-white font-extrabold">V</div>
                <span>BY <span className="text-slate-700 dark:text-brand-red">{selectedArticle.author}</span></span>
              </div>
              <div className="flex items-center gap-4">
                <span>{selectedArticle.date}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-brand-red">{selectedArticle.readTime}</span>
              </div>
            </div>

            {/* Scrollable Document Area */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-4 max-h-[50vh] text-left">
              {/* Intro Banner Summary Accent block */}
              <div className="p-4 rounded-2xl bg-brand-red/5 dark:bg-brand-red/10 border-l-4 border-brand-red text-xs md:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                {selectedArticle.summary}
              </div>

              {/* Dynamic text rendering splits by paragraphs */}
              <div className="prose dark:prose-invert max-w-none space-y-5">
                {selectedArticle.content.split("\n\n").map((block: string, bIdx: number) => {
                  if (block.startsWith("###")) {
                    const headingText = block.replace(/^###\s*/, "");
                    return (
                      <h3 key={bIdx} className="text-sm md:text-base font-extrabold text-brand-red dark:text-slate-200 uppercase tracking-wider pt-4 border-b border-slate-100 dark:border-slate-900 pb-1">
                        {headingText}
                      </h3>
                    );
                  }
                  if (block.includes("\n* ") || block.startsWith("* ")) {
                    const items = block.split("\n").map(li => li.replace(/^\*\s*/, "").trim());
                    return (
                      <ul key={bIdx} className="list-disc pl-5 space-y-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 my-2">
                        {items.map((item, itemIdx) => {
                          if (item.includes("**")) {
                            const parts = item.split("**");
                            return (
                              <li key={itemIdx}>
                                {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-slate-850 dark:text-white">{p}</strong> : p)}
                              </li>
                            );
                          }
                          return <li key={itemIdx}>{item}</li>;
                        })}
                      </ul>
                    );
                  }
                  if (block.includes("**")) {
                    const parts = block.split("**");
                    return (
                      <p key={bIdx} className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {parts.map((p, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-extrabold text-slate-850 dark:text-white">{p}</strong> : p)}
                      </p>
                    );
                  }
                  return (
                    <p key={bIdx} className="text-xs md:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {block}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Reader Footer Controls */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-900 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 font-mono">Valora Education Module</span>
              <button 
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-[#A93226] text-white text-[10px] font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
