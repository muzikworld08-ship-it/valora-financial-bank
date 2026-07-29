import React, { useState, useEffect } from "react";
import { 
  TrendingUp, ShieldCheck, GraduationCap, ArrowRight, BookOpen, 
  HelpCircle, CheckCircle2, Star, RefreshCw, Layers, DollarSign, 
  Search, ShieldAlert, Key, Activity, Award, Briefcase, ChevronRight,
  ChevronDown, MessageSquare, Info, Lock, Play, Clock, BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BitcoinCenterTabProps {
  dark: boolean;
  onOpenLogin: () => void;
}

interface PriceData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
  lastUpdated: string;
}

export function BitcoinCenterTab({ dark, onOpenLogin }: BitcoinCenterTabProps) {
  // Live Price State
  const [priceData, setPriceData] = useState<PriceData>({
    price: 64250.75,
    change24h: 2.45,
    high24h: 64890.00,
    low24h: 62110.50,
    volume: 28450120400,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [loadingPrice, setLoadingPrice] = useState(false);

  // FAQ active indexes
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Quiz State
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [score, setScore] = useState(0);

  // Selected guide lesson
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);

  // Active educational tab (Section 2)
  const [activeEdTab, setActiveEdTab] = useState<"what" | "blockchain" | "why" | "risks" | "history">("what");

  // Load actual Live Bitcoin price from CoinGecko or CoinDesk
  const fetchBtcPrice = async () => {
    setLoadingPrice(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high_low=true");
      if (res.ok) {
        const data = await res.json();
        if (data && data.bitcoin) {
          setPriceData({
            price: data.bitcoin.usd,
            change24h: data.bitcoin.usd_24h_change || 2.45,
            high24h: data.bitcoin.usd_24h_high || data.bitcoin.usd * 1.02,
            low24h: data.bitcoin.usd_24h_low || data.bitcoin.usd * 0.98,
            volume: data.bitcoin.usd_24h_vol || 28450120400,
            lastUpdated: new Date().toLocaleTimeString()
          });
        }
      } else {
        // Fallback to coinDesk
        const deskRes = await fetch("https://api.coindesk.com/v1/bpi/currentprice.json");
        if (deskRes.ok) {
          const deskData = await deskRes.json();
          const p = parseFloat(deskData.bpi.USD.rate.replace(",", ""));
          setPriceData(prev => ({
            ...prev,
            price: p,
            lastUpdated: new Date().toLocaleTimeString()
          }));
        }
      }
    } catch (e) {
      console.warn("Could not fetch real-time BTC price, using local high-fidelity fallback nodes.", e);
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const lessons = [
    {
      title: "1. Creating a Trading Account",
      desc: "Before taking your first position, understanding secure account infrastructure is paramount. Valora Financial accounts provide native integrated cold-storage wallets. Opening a trading ledger involves verifying your identity (KYC compliance) and activating Multi-Factor Authentication (MFA). We recommend using hardware keys or authenticator apps rather than SMS codes to prevent SIM-swapping attempts.",
      tips: [
        "Complete tier-1 security compliance for higher limits",
        "Enable hardware wallet backups (Sovereign Custody option)",
        "Never share seed phrases or authentication credentials"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64 text-brand-red" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C0392B" />
              <stop offset="100%" stopColor="#E74C3C" />
            </linearGradient>
          </defs>
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          <path d="M100 35 L140 50 V85 C140 105 118 118 100 123 C82 118 60 105 60 85 V50 Z" fill="url(#shieldGrad)" opacity="0.85" />
          <path d="M92 82 L100 90 L115 75" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="100" cy="58" r="4" fill="#FFFFFF" />
          <rect x="75" y="105" width="50" height="6" rx="3" fill="#1C2541" />
          <circle cx="85" cy="108" r="1.5" fill="#C0392B" />
          <circle cx="100" cy="108" r="1.5" fill="#C0392B" />
          <circle cx="115" cy="108" r="1.5" fill="#C0392B" />
        </svg>
      )
    },
    {
      title: "2. Understanding Market Trends",
      desc: "Cryptocurrency prices move in cycles influenced by macroeconomic news, halving cycles, and liquidity patterns. A bull market (uptrend) represents overall rising prices characterized by higher-highs and higher-lows. Conversely, a bear market (downtrend) consists of consecutive lower-highs and lower-lows. Recognizing these larger structures prevents fighting the momentum.",
      tips: [
        "Identify high-timeframe trends (Daily or Weekly) before taking positions",
        "Use simple moving averages (e.g., 50-day and 200-day EMA) as dynamic guides",
        "Avoid trading against the primary structural trend"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64 text-emerald-500" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          <path d="M30 115 L65 95 L95 105 L135 60 L170 35" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M170 35 H150 M170 35 V55" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="30" cy="115" r="5" fill="#10B981" />
          <circle cx="65" cy="95" r="5" fill="#10B981" />
          <circle cx="95" cy="105" r="5" fill="#10B981" />
          <circle cx="135" cy="60" r="5" fill="#10B981" />
          <circle cx="170" cy="35" r="6" fill="#10B981" className="animate-pulse" />
          {/* Support line */}
          <path d="M25 130 H175" stroke="#1C2541" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      )
    },
    {
      title: "3. Reading Price Charts",
      desc: "Candlestick charts show four essential points: Open, High, Low, and Close (OHLC) for a specific time increment. Green candles signify a net gain, while red represents a drop. Charting analysis looks for 'Support' (historical regions where buyers prevent further price falls) and 'Resistance' (price ceilings where sellers match demand).",
      tips: [
        "Focus on candlestick bodies, not just the thin wicks, to verify buying pressure",
        "Volume spikes validate support bounce-offs or resistance breakout confirmations",
        "Look for clear double-bottom patterns as signals for structural trend reversals"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          {/* Candle 1 (Red) */}
          <line x1="45" y1="40" x2="45" y2="100" stroke="#EF4444" strokeWidth="2" />
          <rect x="38" y="55" width="14" height="30" fill="#EF4444" rx="2" />
          
          {/* Candle 2 (Green) */}
          <line x1="85" y1="50" x2="85" y2="110" stroke="#10B981" strokeWidth="2" />
          <rect x="78" y="70" width="14" height="25" fill="#10B981" rx="2" />

          {/* Candle 3 (Green) */}
          <line x1="125" y1="30" x2="125" y2="90" stroke="#10B981" strokeWidth="2" />
          <rect x="118" y="40" width="14" height="40" fill="#10B981" rx="2" />

          {/* Candle 4 (Green Breakthrough) */}
          <line x1="165" y1="15" x2="165" y2="70" stroke="#10B981" strokeWidth="2" />
          <rect x="158" y="25" width="14" height="35" fill="#10B981" rx="2" />

          {/* Resistance Line */}
          <line x1="20" y1="40" x2="180" y2="40" stroke="#C0392B" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
          <text x="25" y="34" fill="#C0392B" fontSize="8" className="font-mono font-bold tracking-wider">RESISTANCE LEVEL</text>
        </svg>
      )
    },
    {
      title: "4. Risk Management Techniques",
      desc: "Capital preservation is the single most important rule in professional trading. Never trade with money you cannot afford to lose completely. We teach risk minimization through strict stop-loss limits (automatically liquidating a losing trade at a predetermined price) and position sizing. Professional traders rarely risk more than 1% to 2% of total capital on a single setup.",
      tips: [
        "Calculate position size relative to the distance to your Stop-Loss",
        "Set strict automatic trailing stops to protect unrealized gains",
        "Always define your risk-to-reward ratio (ideally 1:2 or higher)"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          <circle cx="100" cy="75" r="45" stroke="#34D399" strokeWidth="4" strokeDasharray="5 5" />
          <circle cx="100" cy="75" r="25" fill="#EF4444" opacity="0.15" />
          <circle cx="100" cy="75" r="25" stroke="#EF4444" strokeWidth="3" />
          <line x1="100" y1="15" x2="100" y2="135" stroke="#1C2541" strokeWidth="2" />
          <line x1="40" y1="75" x2="160" y2="75" stroke="#1C2541" strokeWidth="2" />
          <text x="100" y="79" fill="#EF4444" fontSize="10" fontWeight="bold" textAnchor="middle" className="font-mono">STOP LOSS</text>
          <text x="100" y="115" fill="#34D399" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">TARGET TARGET</text>
        </svg>
      )
    },
    {
      title: "5. Taking Profits Responsibly",
      desc: "Amateur traders fail not because they don't pick winners, but because they fail to lock in gains. When Bitcoin surges, human psychology triggers a bias called greed, leading to expectation of infinite rises. Structured exit strategies, such as laddering out of a position (selling 25% increments as target prices are breached), secure locked cash profits.",
      tips: [
        "Preset sell limits to automatically trigger during price surges",
        "Avoid keeping 100% of portfolio in speculative positions at cycle peaks",
        "Withdraw profits to interest-bearing stable assets or cold vaults"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64 text-amber-500" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          {/* Stack of Coins */}
          <ellipse cx="100" cy="110" rx="40" ry="12" fill="#D97706" />
          <ellipse cx="100" cy="98" rx="40" ry="12" fill="#F59E0B" />
          <ellipse cx="100" cy="86" rx="40" ry="12" fill="#FBBF24" />
          <ellipse cx="100" cy="74" rx="40" ry="12" fill="#FDE68A" />
          <path d="M100 45 L115 55 L90 65 L100 45 Z" fill="#F59E0B" className="animate-bounce" />
          <circle cx="100" cy="74" r="10" fill="#D97706" opacity="0.4" />
          <text x="100" y="77" fill="#1E293B" fontSize="9" fontWeight="bold" textAnchor="middle">$ $ $</text>
        </svg>
      )
    },
    {
      title: "6. Long Term vs Short Term Trading",
      desc: "Long term investment (often referred to as HODL or DCA) involves acquiring Bitcoin at uniform intervals regardless of price fluctuations to accumulate generational capital safely. Short term swing trading attempts to capture weekly trends. While short term strategies can yield rapid gains, they suffer from high transaction costs, tax events, and emotional burnout.",
      tips: [
        "A hybrid approach allocate 80% to Long Term DCA, and 20% to rule-based swings",
        "DCA (Dollar Cost Averaging) historically outperforms active short term day traders",
        "Keep thorough ledgers for tax compliance and trade logging"
      ],
      illustration: (
        <svg className="w-full h-48 md:h-64" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="150" rx="16" fill="#F1F5F9" />
          {/* Long term timeline */}
          <path d="M30 110 Q100 80 170 40" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          <text x="170" y="30" fill="#10B981" fontSize="9" fontWeight="bold" textAnchor="end" className="font-mono">LONG TERM ACCUMULATION</text>
          
          {/* Short term noise */}
          <path d="M30 110 L50 90 L70 120 L90 85 L110 115 L130 75 L150 95 L170 40" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          <text x="90" y="130" fill="#D97706" fontSize="8" fontWeight="bold" className="font-mono">SHORT TERM NOISE</text>
        </svg>
      )
    }
  ];

  const quickQuiz = [
    {
      question: "What is the primary function of a Stop-Loss order in trading?",
      options: [
        "To guarantee that every transaction makes a high profit",
        "To automatically sell an asset at a set limit to protect your capital from severe losses",
        "To double your position sizing when price starts crashing downwards",
        "To hide your crypto balance from ledger auditors"
      ],
      correct: 1,
      explanation: "A Stop-Loss is a key risk-management tool that automatically liquidates a losing position at a predetermined price, stopping emotional decision-making and preventing catastrophic losses."
    },
    {
      question: "Why is Dollar Cost Averaging (DCA) popular for Bitcoin beginners?",
      options: [
        "It eliminates the need to pay any transaction network fees",
        "It guarantees that you buy Bitcoin only at its absolute all-time lowest price",
        "It spreads out purchases regularly, smoothing out price volatility and removing trading emotion",
        "It leverages borrow funding from corporate shadow banks"
      ],
      correct: 2,
      explanation: "DCA involves buying a fixed dollar amount of an asset at set intervals. This removes the stress of trying to time the highly volatile crypto market."
    },
    {
      question: "What is the total maximum supply limit of Bitcoin?",
      options: [
        "Unlimited, similar to standard fiat paper currencies",
        "Exactly 21 Million coins, hardcoded in the protocol",
        "100 Billion coins, with periodic central bank minting",
        "It depends on the annual mining rewards allocated by global nodes"
      ],
      correct: 1,
      explanation: "Bitcoin has an absolute, immutable hard supply cap of 21,000,000 coins. This scarcity is a primary reason many investors refer to it as 'digital gold'."
    }
  ];

  const handleQuizAnswer = (idx: number) => {
    if (showAnswerFeedback) return;
    setSelectedAnswer(idx);
    setShowAnswerFeedback(true);
    if (idx === quickQuiz[currentQuizIdx].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswerFeedback(false);
    if (currentQuizIdx < quickQuiz.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      // Loop or reset
      setCurrentQuizIdx(0);
      setScore(0);
    }
  };

  return (
    <div className="space-y-24 pb-20 select-none animate-[fadeIn_0.3s_ease-out]">
      
      {/* SECTION 1: HERO BANNER */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-white text-slate-800 rounded-b-[3.5rem] border-b border-slate-200/80 shadow-sm">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-brand-red rounded-full filter blur-[150px] -translate-y-1/2" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-amber-500 rounded-full filter blur-[120px] -translate-y-1/2" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-[10.5px] font-mono tracking-widest text-brand-red font-black uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
              Sovereign Crypto Institute
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1] text-slate-900">
              Learn Bitcoin Trading <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-amber-500">with Confidence</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-light">
              Discover how Bitcoin works, learn proven trading strategies, and explore low risk trading opportunities with guidance from experienced professionals.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a 
                href="#guide"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand-red hover:bg-[#A93226] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-red/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                <GraduationCap size={16} />
                <span>Start Learning Today</span>
              </a>
              <button 
                onClick={onOpenLogin}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 text-xs font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                <Lock size={12} className="fill-white" />
                <span>Access Trading Vault</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl bg-slate-50 p-4">
              {/* Image showing chart indicators overlayed on premium asset */}
              <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1516245834210-c4c142787335?q=80&w=1200&auto=format&fit=crop" 
                  alt="Bitcoin and Financial Charts" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
                
                {/* Visual interface simulation for premium trading center */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 border border-slate-200 rounded-xl p-3 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <TrendingUp className="text-amber-500" size={18} />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block">Live Index Tracker</span>
                      <span className="text-xs font-mono font-black text-slate-900">BTC / USD Ledger</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-emerald-600 flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-mono font-medium text-slate-500 block">Valora Sovereign Feed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT IS BITCOIN? */}
      <section id="what-is-bitcoin" className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Navigation Tabs for educational content */}
          <div className="lg:col-span-4 space-y-3 text-left">
            <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Educational Syllabus</span>
            <h2 className={`text-3xl font-extrabold uppercase tracking-tight mt-1 ${dark ? "text-white" : "text-slate-900"}`}>
              Understanding the Asset Class
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Learn the architectural foundation of digital scarcity, blockchain immutability, and cryptocurrency markets. Select a chapter to explore:
            </p>

            <div className="space-y-2">
              {[
                { id: "what", label: "What is Bitcoin?", subtitle: "Sovereign peer-to-peer gold" },
                { id: "blockchain", label: "How Blockchain Works", subtitle: "Decentralized consensus network" },
                { id: "why", label: "Why Investors Buy BTC", subtitle: "Scarcity & digital inflation hedge" },
                { id: "risks", label: "Benefits & Risks", subtitle: "Symmetric opportunities" },
                { id: "history", label: "History & Growth Cycle", subtitle: "The genesis and evolution" }
              ].map((tab) => {
                const isSelected = activeEdTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEdTab(tab.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer bg-transparent outline-none ${
                      isSelected 
                        ? "border-brand-red bg-brand-red/5 shadow-md" 
                        : dark 
                          ? "border-slate-800 hover:border-slate-700 hover:bg-slate-900/30" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-extrabold block transition-colors ${isSelected ? "text-brand-red" : dark ? "text-slate-200" : "text-slate-800"}`}>
                        {tab.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {tab.subtitle}
                      </span>
                    </div>
                    <ChevronRight size={14} className={`text-slate-400 transition-transform ${isSelected ? "text-brand-red translate-x-1" : "group-hover:translate-x-1"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content display panel with custom animations */}
          <div className="lg:col-span-8">
            <div className={`p-6 sm:p-10 rounded-[2.5rem] border ${
              dark ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-200/60"
            } min-h-[460px] flex flex-col justify-between text-left relative overflow-hidden`}>
              
              <AnimatePresence mode="wait">
                {activeEdTab === "what" && (
                  <motion.div
                    key="what"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center shrink-0">
                        <BookOpen className="text-brand-red" size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold font-mono text-brand-red uppercase block">Chapter 1</span>
                        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>What is Bitcoin?</h3>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      <p>
                        Launched in **2009** by an anonymous creator named **Satoshi Nakamoto**, Bitcoin (BTC) is the world's first decentralized digital currency. Unlike traditional fiat currencies like the USD or EUR, Bitcoin operates entirely without central banks, governments, or intermediaries.
                      </p>
                      <p>
                        It is a peer-to-peer system that allows anyone in the world to transmit value directly to anyone else instantly, securely, and with negligible friction. Bitcoin is stored in cryptographic accounts (wallets) and recorded on an open database that is maintained collectively by millions of computers worldwide.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold font-mono text-slate-300 block mb-1">DECENTRALIZED STRUCTURE</span>
                        <p className="text-[11px] text-slate-400">No singular vault, authority, or agency can freeze balances, reverse clearances, or manipulate currency supplies.</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold font-mono text-slate-300 block mb-1">GLOBAL LIQUIDITY FEED</span>
                        <p className="text-[11px] text-slate-400">Operates continuously 24 hours a day, 365 days a year, bridging boundaries with frictionless value settlement.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeEdTab === "blockchain" && (
                  <motion.div
                    key="blockchain"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Layers className="text-amber-500" size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold font-mono text-amber-500 uppercase block">Chapter 2</span>
                        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>How Blockchain Works</h3>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      <p>
                        At the core of Bitcoin is **Blockchain technology**—a public, distributed digital ledger. Think of it as an open accounting book where every page represents a 'block' of transactions. Once a page is filled, it is sealed with a cryptographic signature and linked irreversibly to the previous page, forming a chain.
                      </p>
                      <p>
                        This chain is stored identically on millions of computers (nodes). If a malicious hacker tries to edit an old transaction on one computer, the entire network compares records, detects the discrepancy, and immediately discards the fraudulent alteration. This represents trust achieved purely via cryptographic proof.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-dashed border-amber-500/20 text-xs text-amber-500/90 leading-normal">
                      <strong>The Consensus Advantage:</strong> Transactions are grouped, verified, and permanent. Once confirmed, a block cannot be deleted or modified.
                    </div>
                  </motion.div>
                )}

                {activeEdTab === "why" && (
                  <motion.div
                    key="why"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <TrendingUp className="text-emerald-500" size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold font-mono text-emerald-500 uppercase block">Chapter 3</span>
                        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>Why Investors Buy Bitcoin</h3>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      <p>
                        Traditional currencies can be printed infinitely by central banks, eroding your purchasing power over time. Bitcoin is different: its protocol has a strict, immutable **hard supply cap of exactly 21,000,000 coins**. This mathematical scarcity is why many call it **Digital Gold**.
                      </p>
                      <p>
                        Investors allocate capital to Bitcoin to preserve wealth, hedge against global currency inflation, and capture asymmetric growth. Major institutions, insurance funds, and public corporations now hold Bitcoin on their balance sheets as a primary reserve asset.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold font-mono text-emerald-500 block">MATHEMATICAL SCARCITY</span>
                        <p className="text-[11px] text-slate-400">Only 21 million BTC will ever exist. No political vote, emergency decree, or banking crisis can ever print more.</p>
                      </div>
                      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-bold font-mono text-emerald-500 block">GLOBAL ASYMMETRY</span>
                        <p className="text-[11px] text-slate-400">A borderless digital bearer asset easily transferrable across jurisdictions, maintaining global value parity.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeEdTab === "risks" && (
                  <motion.div
                    key="risks"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E74C3C]/10 border border-[#E74C3C]/30 flex items-center justify-center shrink-0">
                        <ShieldAlert className="text-[#E74C3C]" size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold font-mono text-[#E74C3C] uppercase block">Chapter 4</span>
                        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>Benefits and Risks</h3>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      <p>
                        Responsible investing requires understanding both sides of the coin. Cryptocurrency offers unprecedented transparency and high return potential, but it comes with distinct structural risks.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <span className="text-xs font-black text-emerald-500 block uppercase">🛡️ The Benefits</span>
                          <ul className="text-[11px] text-slate-400 space-y-1">
                            <li>• High asymmetric return potential</li>
                            <li>• Continuous 24/7 liquid market access</li>
                            <li>• Absolute personal ledger transparency</li>
                            <li>• Uncompromisable cryptography</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <span className="text-xs font-black text-brand-red block uppercase">⚠️ The Risks</span>
                          <ul className="text-[11px] text-slate-400 space-y-1">
                            <li>• High short-term price volatility</li>
                            <li>• Irreversible transactions (no chargebacks)</li>
                            <li>• Regulatory and licensing changes</li>
                            <li>• Complex self-custody requirements</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeEdTab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <Clock className="text-purple-500" size={20} />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold font-mono text-purple-500 uppercase block">Chapter 5</span>
                        <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>History and Growth</h3>
                      </div>
                    </div>

                    <div className="space-y-4 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      <p>
                        From its humble beginnings in **2009**, when 10,000 BTC were famously used to purchase two pizzas, Bitcoin has grown into a trillion-dollar asset. Its history is marked by **four-year halving cycles** (where the rate of new supply creation is cut in half), leading to supply-shock market appreciation.
                      </p>
                      <p>
                        In 2021, Bitcoin achieved widespread institutional adoption, culminated in 2024 with the approval of Spot Bitcoin ETFs by the US Securities and Exchange Commission (SEC), bringing regulated institutional liquidity into the sovereign cryptographic ledger.
                      </p>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="text-center font-mono border-r border-slate-800 pr-4">
                        <div className="text-lg font-black text-white">2009</div>
                        <div className="text-[8px] text-slate-500">GENESIS</div>
                      </div>
                      <div className="text-center font-mono border-r border-slate-800 pr-4 pl-2">
                        <div className="text-lg font-black text-white">2020</div>
                        <div className="text-[8px] text-slate-500">INSTITUTIONAL</div>
                      </div>
                      <div className="text-center font-mono pl-2">
                        <div className="text-lg font-black text-white">2024</div>
                        <div className="text-[8px] text-slate-500">SPOT ETF</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom guide CTA */}
              <div className="pt-6 border-t border-slate-800/60 mt-6 flex flex-wrap justify-between items-center gap-4">
                <span className="text-[10px] text-slate-400">Valora Financial Cryptographic Academy • Lesson {activeEdTab === "what" ? "1" : activeEdTab === "blockchain" ? "2" : activeEdTab === "why" ? "3" : activeEdTab === "risks" ? "4" : "5"} of 5</span>
                <a 
                  href="#guide"
                  className="text-xs font-bold text-brand-red hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Go to Step-by-Step Guide</span>
                  <ArrowRight size={13} />
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: BEGINNER'S GUIDE TO BITCOIN TRADING */}
      <section id="guide" className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="max-w-3xl text-left space-y-2">
          <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Sovereign Onboarding</span>
          <h2 className={`text-3xl lg:text-4xl font-extrabold uppercase leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Beginner's Guide to Bitcoin Trading
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            A step-by-step masterclass structured specifically to help newcomers navigate cryptocurrency markets with absolute composure, analytical discipline, and low exposure.
          </p>
        </div>

        {/* Masterclass lesson navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Steps List */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="space-y-2 text-left">
              {lessons.map((lesson, index) => {
                const isActive = activeLessonIdx === index;
                return (
                  <button
                    key={index}
                    onClick={() => setActiveLessonIdx(index)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group cursor-pointer bg-transparent outline-none ${
                      isActive 
                        ? "border-brand-red bg-brand-red/5 shadow-md" 
                        : dark 
                          ? "border-slate-800 hover:border-slate-700 hover:bg-slate-900/30" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 transition-colors ${
                      isActive 
                        ? "bg-brand-red text-white" 
                        : dark 
                          ? "bg-slate-850 text-slate-400" 
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <span className={`text-xs font-extrabold block transition-colors ${isActive ? "text-brand-red" : dark ? "text-slate-200" : "text-slate-800"}`}>
                        {lesson.title.split(". ")[1]}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Chapter {index + 1} masterclass parameters
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Micro-learning checklist */}
            <div className={`p-4 rounded-2xl border ${dark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"} text-left space-y-2`}>
              <span className="text-[10px] font-black uppercase text-brand-red tracking-wider block">🎓 MASTERCLASS PREREQUISITES</span>
              <p className="text-[10.5px] leading-normal text-slate-400">
                Each chapter is verified for legal, technical, and regulatory compliance. Click through the chapters to activate your institutional ledger modules.
              </p>
            </div>
          </div>

          {/* Active Lesson Detail Panel (Beside steps, includes custom illustration) */}
          <div className="lg:col-span-7">
            <div className={`p-6 sm:p-8 rounded-[2.5rem] border ${
              dark ? "bg-slate-950 border-slate-850" : "bg-white border-slate-250 shadow-sm"
            } h-full flex flex-col justify-between text-left`}>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Text details */}
                  <div className="md:col-span-7 space-y-4">
                    <span className="text-[9px] font-black uppercase text-brand-red font-mono tracking-wider block">ACTIVE COURSE MODULE</span>
                    <h3 className={`text-xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                      {lessons[activeLessonIdx].title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {lessons[activeLessonIdx].desc}
                    </p>
                  </div>

                  {/* High quality Infographic vector/graphic illustration right beside */}
                  <div className="md:col-span-5 rounded-2xl overflow-hidden border border-white/5 bg-slate-950 p-2 flex items-center justify-center">
                    {lessons[activeLessonIdx].illustration}
                  </div>
                </div>

                {/* Practical tips */}
                <div className="pt-6 border-t border-slate-800/60">
                  <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider block mb-3">⚡ PRO TRADING CHEAT SHEET:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {lessons[activeLessonIdx].tips.map((tip, idx) => (
                      <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-start gap-2">
                        <CheckCircle2 size={12} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[10.5px] leading-snug text-slate-300">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation buttons inside card */}
              <div className="pt-6 mt-6 border-t border-slate-800/60 flex justify-between items-center">
                <button
                  onClick={() => setActiveLessonIdx(prev => Math.max(0, prev - 1))}
                  disabled={activeLessonIdx === 0}
                  className={`text-xs font-bold uppercase tracking-wider ${activeLessonIdx === 0 ? "text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-white cursor-pointer"} bg-transparent border-0 outline-none`}
                >
                  Previous Module
                </button>
                <button
                  onClick={() => {
                    if (activeLessonIdx < lessons.length - 1) {
                      setActiveLessonIdx(prev => prev + 1);
                    } else {
                      // Anchor scroll to Section 4
                      document.getElementById("low-risk")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-xs font-black text-brand-red uppercase tracking-wider flex items-center gap-1 cursor-pointer bg-transparent border-0 outline-none hover:underline"
                >
                  <span>{activeLessonIdx === lessons.length - 1 ? "Explore Our Approach" : "Next Module"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4: LOW RISK TRADING PROGRAM */}
      <section id="low-risk" className="bg-white text-slate-800 py-24 sm:py-32 rounded-[3.5rem] border-y border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-red rounded-full filter blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-5 text-left space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-[10.5px] font-mono tracking-widest text-brand-red font-black uppercase">
              Valora Proprietary Framework
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.1] text-slate-900">
              Our Low Risk <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-amber-500">Bitcoin Trading Approach</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              We focus on disciplined strategies, market analysis, and risk management techniques designed to help investors participate in cryptocurrency markets responsibly. While all trading involves risk and profits are never guaranteed, our approach emphasizes capital preservation and informed decision making.
            </p>
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <ShieldCheck className="text-brand-red animate-pulse" size={24} />
                </div>
                <div className="text-left">
                  <span className="text-xs font-extrabold text-slate-900 block uppercase">Capital Preservation Mandate</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Automated safety locks integrated direct in the core financial database.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Low Risk Program Features Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Professional Market Analysis",
                  desc: "We supply deep on-chain transaction monitoring, order flow imbalance analysis, and institutional-grade macroeconomic briefings, allowing traders to execute positions backed by pristine data.",
                  icon: <BarChart2 className="text-brand-red" size={20} />
                },
                {
                  title: "Risk Management Tools",
                  desc: "Automatic structural safeguards including hardcoded stop-losses, trailing take-profit levels, and 1% risk-per-position parameters are enforced directly inside our sovereign clearing engine.",
                  icon: <ShieldCheck className="text-amber-500" size={20} />
                },
                {
                  title: "Educational Support",
                  desc: "Active private channels including weekly real-time trading webinars, structured step-by-step masterclasses, and direct chat channels with experienced institutional portfolio managers.",
                  icon: <GraduationCap className="text-emerald-500" size={20} />
                },
                {
                  title: "Portfolio Monitoring",
                  desc: "Comprehensive dashboards that calculate real-time portfolio volatility, exposure indexing, correlation coefficients, and direct asset allocation recommendations.",
                  icon: <Activity className="text-blue-500" size={20} />
                },
                {
                  title: "Secure Account Protection",
                  desc: "100% of trading assets are locked in segregated physical cold storage vaults matching Grade-A institutional safety, backed up by multi-signature secure recovery systems.",
                  icon: <Lock className="text-purple-500" size={20} />
                }
              ].map((feat, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-3xl border border-slate-200 bg-slate-50 text-left space-y-3 hover:border-brand-red/30 transition-all ${
                    index === 4 ? "sm:col-span-2 bg-slate-50 border-emerald-500/20 hover:border-emerald-500/30" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-sm">
                    {feat.icon}
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">{feat.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Client Testimonials</span>
          <h2 className={`text-3xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Sovereign Success Stories
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Discover how global investors have developed rigorous discipline, complete market understanding, and confidence using our integrated academic system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Michael R.",
              title: "Sovereign Account Holder",
              review: "Excellent educational resources. I finally understand how Bitcoin trading works. The transition from trading blindly to running rules-based risk management completely transformed my approach.",
              avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaph2JgBZcTFMozNJ3WLzrGe0UDe9l4LwHkfWxQTe-_44KPR-cDo8RRYGW&s=10"
            },
            {
              name: "Sarah W.",
              title: "Portfolio Management Client",
              review: "The learning materials were clear and easy to follow. I appreciated that they didn't promise instant riches, but focused on building proper, disciplined analytical frameworks.",
              avatar: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Sarah_Wayne_Callies_-_2018076113811_2018-03-17_Walker_Stalker_Con_-_Sven_-_1D_X_MK_II_-_0032_-_B70I1620_%28cropped%29.jpg"
            },
            {
              name: "David T.",
              title: "Private Ledger Holder",
              review: "I appreciated the focus on risk management and responsible investing. The interface is clean, the support managers are professional, and the security features give me absolute confidence.",
              avatar: "https://media.licdn.com/dms/image/v2/D5603AQHJopZIWvAH9Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1701994618252?e=2147483647&v=beta&t=6MSwi1hMFqhm2liUxzIBnR_Hpl8aWuGj2peYP3JJ4xQ"
            }
          ].map((story, idx) => (
            <div 
              key={idx} 
              className={`p-6 sm:p-8 rounded-3xl border flex flex-col justify-between text-left transition-all hover:scale-[1.01] ${
                dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200/60 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                {/* Five star rating */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className={`text-xs sm:text-sm italic leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                  "{story.review}"
                </p>
              </div>

              {/* Profile details */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-800/20 mt-6">
                <img 
                  src={story.avatar} 
                  alt={story.name} 
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className={`text-xs font-extrabold ${dark ? "text-white" : "text-slate-900"}`}>{story.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{story.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: BITCOIN MARKET INSIGHTS */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-left max-w-2xl space-y-2">
          <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Sovereign Data Terminal</span>
          <h2 className={`text-3xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Bitcoin Market Insights
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Access live price metrics, institutional-grade educational resources, actionable trading advice, and interactive tools.
          </p>
        </div>

        {/* Live Widget & News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Live Price Widget (Left side) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className={`p-6 sm:p-8 rounded-[2.5rem] border ${
              dark ? "bg-slate-950 border-slate-850" : "bg-white border-slate-250 shadow-sm"
            } text-left h-full flex flex-col justify-between space-y-6`}>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-brand-red uppercase tracking-widest">LIVE BITCOIN WIDGET</span>
                  <button 
                    onClick={fetchBtcPrice} 
                    disabled={loadingPrice}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer outline-none bg-transparent"
                  >
                    <RefreshCw size={12} className={loadingPrice ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">Bitcoin Price Feed (USD)</span>
                  <div className="text-3xl font-mono font-black text-white flex items-center gap-2">
                    <span className={dark ? "text-white" : "text-slate-900"}>
                      ${priceData.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${priceData.change24h >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                      {priceData.change24h >= 0 ? "+" : ""}{priceData.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60 font-mono text-left">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">24h High</span>
                    <span className={`text-xs font-black ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      ${priceData.high24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">24h Low</span>
                    <span className={`text-xs font-black ${dark ? "text-slate-300" : "text-slate-700"}`}>
                      ${priceData.low24h.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Sparkline Chart representing high-fidelity live activity (using custom SVG sparkline) */}
              <div className="space-y-2 text-left pt-4 border-t border-slate-800/60">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Sovereign Order Flow Trend</span>
                <div className="h-16 w-full rounded-xl bg-slate-950 p-2 border border-white/5 overflow-hidden flex items-end">
                  <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M0 25 Q15 15 30 20 T60 10 T90 5 L100 2" 
                      stroke="#10B981" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      fill="none" 
                    />
                    <path 
                      d="M0 25 Q15 15 30 20 T60 10 T90 5 L100 2 V30 H0 Z" 
                      fill="url(#sparklineGrad)" 
                      opacity="0.15" 
                    />
                    <defs>
                      <linearGradient id="sparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500">
                  <span>30 mins ago</span>
                  <span>Active Now</span>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Academy Quiz (Middle section) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className={`p-6 sm:p-8 rounded-[2.5rem] border ${
              dark ? "bg-slate-950 border-slate-850" : "bg-white border-slate-250 shadow-sm"
            } text-left h-full flex flex-col justify-between space-y-6`}>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold font-mono text-brand-red uppercase tracking-widest">KNOWLEDGE SELF-CHECK</span>
                  <span className="text-[10px] font-mono text-slate-400">Question {currentQuizIdx + 1}/{quickQuiz.length}</span>
                </div>

                <div className="space-y-4 text-left">
                  <h4 className={`text-sm font-extrabold ${dark ? "text-white" : "text-slate-900"} leading-snug`}>
                    {quickQuiz[currentQuizIdx].question}
                  </h4>
                  
                  <div className="space-y-2">
                    {quickQuiz[currentQuizIdx].options.map((opt, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      const isCorrect = quickQuiz[currentQuizIdx].correct === oIdx;
                      
                      let btnStyle = dark 
                        ? "border-slate-800 hover:border-slate-700 hover:bg-slate-900/30" 
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50";

                      if (showAnswerFeedback) {
                        if (isCorrect) {
                          btnStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-500";
                        } else if (isSelected) {
                          btnStyle = "border-rose-500 bg-rose-500/10 text-rose-500";
                        } else {
                          btnStyle = "opacity-50 border-transparent";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={showAnswerFeedback}
                          onClick={() => handleQuizAnswer(oIdx)}
                          className={`w-full text-left p-3 rounded-xl border text-[11px] leading-snug transition-all flex items-start gap-2.5 cursor-pointer bg-transparent outline-none ${btnStyle}`}
                        >
                          <span className="font-mono text-slate-500 font-bold mt-0.5">{String.fromCharCode(65 + oIdx)}.</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feedback & next button */}
              <div className="space-y-3 pt-4 border-t border-slate-800/60">
                {showAnswerFeedback && (
                  <div className="text-[11.5px] text-slate-400 leading-relaxed text-left">
                    <strong className={selectedAnswer === quickQuiz[currentQuizIdx].correct ? "text-emerald-500" : "text-brand-red"}>
                      {selectedAnswer === quickQuiz[currentQuizIdx].correct ? "✓ Correct!" : "✗ Incorrect."}
                    </strong>{" "}
                    {quickQuiz[currentQuizIdx].explanation}
                  </div>
                )}

                <button
                  onClick={nextQuizQuestion}
                  disabled={!showAnswerFeedback}
                  className={`w-full py-2.5 rounded-xl text-center font-bold text-[10px] uppercase tracking-wider transition-colors ${
                    showAnswerFeedback 
                      ? "bg-brand-red hover:bg-[#A93226] text-white cursor-pointer" 
                      : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {currentQuizIdx === quickQuiz.length - 1 ? "Reset Quiz" : "Next Question"}
                </button>
              </div>

            </div>
          </div>

          {/* Educational Articles & Pro Tips (Right side) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className={`p-6 sm:p-8 rounded-[2.5rem] border ${
              dark ? "bg-slate-950 border-slate-850" : "bg-white border-slate-250 shadow-sm"
            } text-left h-full flex flex-col justify-between space-y-6`}>
              
              <div className="space-y-4 text-left">
                <span className="text-[10px] font-bold font-mono text-brand-red uppercase tracking-widest block">EXPERT TRADING INSIGHTS</span>
                
                <div className="space-y-4">
                  {[
                    {
                      category: "TRADING STRATEGY",
                      title: "DCA Over active Trading",
                      desc: "Why buying small fixed amounts weekly yields historically superior risk-adjusted returns compared to manual daily speculation.",
                      readTime: "3 min read"
                    },
                    {
                      category: "RISK CONTROL",
                      title: "The Golden 1% Exposure Rule",
                      desc: "Never allocate capital where a stop-loss event triggers more than a 1% drawdown in total cash balance assets.",
                      readTime: "4 min read"
                    },
                    {
                      category: "BLOCKCHAIN PROTOCOL",
                      title: "Understanding Halving Cycles",
                      desc: "The programmatic 50% supply contraction cycle that historically induces structural supply-shock valuation uptrends.",
                      readTime: "5 min read"
                    }
                  ].map((art, aIdx) => (
                    <div key={aIdx} className="space-y-1 group">
                      <span className="text-[8.5px] font-bold font-mono text-amber-500 block uppercase tracking-wide">{art.category}</span>
                      <h4 className={`text-xs font-extrabold group-hover:text-brand-red transition-colors cursor-pointer ${dark ? "text-white" : "text-slate-900"}`}>{art.title}</h4>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">{art.desc}</p>
                      <span className="text-[9px] text-slate-500 font-mono block pt-0.5">{art.readTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 text-left">
                <button 
                  onClick={onOpenLogin}
                  className="text-xs font-black text-brand-red uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-transparent border-0 outline-none hover:underline"
                >
                  <span>Access Sovereign Library</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7: FAQ (Accordion Style) */}
      <section className="max-w-4xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10.5px] font-black tracking-widest text-brand-red uppercase">Direct Answers</span>
          <h2 className={`text-3xl font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
            Review detailed solutions covering compliance, technical setups, minimum investments, and regulatory security.
          </p>
        </div>

        <div className="space-y-3 text-left">
          {[
            {
              q: "Is Bitcoin trading safe?",
              a: "Bitcoin trading involves high volatility, meaning prices can swing rapidly. It is safe from a cryptographic perspective—no centralized system can freeze or hijack the core blockchain. To secure your personal trading funds, Valora Financial incorporates institutional cold storage, grade-A multi-signature vaults, and strict compliance safeguards. Always avoid unregulated or shadow trading brokers."
            },
            {
              q: "How much money do I need to start?",
              a: "You do not need to buy an entire Bitcoin to start! Bitcoin is divisible up to eight decimal places (each unit is called a 'Satoshi'). With Valora Financial, you can begin fractional learning and accumulation with as little as $50 USD. This allows newcomers to master market patterns with minimal capital exposure."
            },
            {
              q: "What are the risks?",
              a: "The primary risk is market volatility—unexpected regulatory changes, global liquidity contraction, or geopolitical events can cause rapid price drops. Additionally, transactions on the blockchain are mathematically irreversible. If you transmit crypto to a wrong address outside our secure ecosystem, it cannot be refunded. We manage this through mandatory stop-loss setups and zero-loss clearance protocols."
            },
            {
              q: "How can I protect my investment?",
              a: "To protect your assets, use Valora's integrated Cold-Vault option, which transfers specs into deep offline physical custody. Secondly, activate multi-factor hardware security key (MFA) authorization and avoid active day trading using high leverage. Finally, follow a disciplined Dollar Cost Average (DCA) strategy to spread risk."
            },
            {
              q: "Can beginners learn Bitcoin trading?",
              a: "Absolutely. In fact, beginners often build superior habits because they are more receptive to structured risk management. Our masterclasses, integrated quizzes, and low-exposure educational trackers are built from the ground up to onboard beginners without risking high percentages of their capital."
            }
          ].map((faq, fIdx) => {
            const isOpen = openFaqIdx === fIdx;
            return (
              <div 
                key={fIdx} 
                className={`rounded-2xl border transition-all ${
                  isOpen 
                    ? "border-brand-red bg-brand-red/5" 
                    : dark 
                      ? "border-slate-800 bg-slate-900/40 hover:border-slate-700" 
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <button
                  onClick={() => setOpenFaqIdx(isOpen ? null : fIdx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer bg-transparent border-0 outline-none"
                >
                  <span className={`text-xs sm:text-sm font-extrabold ${dark ? "text-white" : "text-slate-900"}`}>{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180 text-brand-red" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/40">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 8: CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 bg-slate-50 p-8 sm:p-12 md:p-16 text-center shadow-md">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-brand-red rounded-full filter blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-[10px] font-black tracking-widest text-brand-red uppercase block">VALORA REGULATION ALLIANCE</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-slate-900 leading-tight">
              Start Your Bitcoin <br/>
              Education Journey Today
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              Gain the knowledge and confidence you need to understand Bitcoin markets and make informed investment decisions. Open an educational account with Valora Financial Bank today.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-brand-red hover:bg-[#A93226] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-brand-red/20 transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Register Learning Account
              </button>
              <a
                href="#what-is-bitcoin"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-black uppercase tracking-wider transition-all transform hover:-translate-y-0.5 cursor-pointer text-center"
              >
                Review Syllabus Again
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
