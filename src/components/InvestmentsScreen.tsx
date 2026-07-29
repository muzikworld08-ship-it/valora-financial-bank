import React, { useState, useEffect } from "react";
import { TrendingUp, ArrowUpRight, ShieldCheck, Landmark, Briefcase, Plus, Coins, Zap, CheckCircle, Flame, Building, ArrowDownRight, RefreshCw, ChevronLeft, ChevronRight, KeyRound, Eye, EyeOff, X } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { UserProfile, UserInvestment, InvestmentSettings, BankTransaction } from "../types";
import { fmtMoney } from "../utils";
import { INITIAL_PROPERTIES, Property, getPropertyImages } from "./InvestmentProperties";

interface InvestmentsScreenProps {
  user: UserProfile;
  dark: boolean;
  transactions?: BankTransaction[];
  investmentSettings?: InvestmentSettings;
  onUpdateState: (modifier: (s: any) => any) => void;
  onAddTransaction: (tx: any) => void;
  onAddNotification: (notif: any) => void;
  initialTab?: "portfolio" | "bitcoin" | "properties";
  enabledTabTypes?: ("checking" | "investment" | "bitcoin")[];
}

interface AssetOption {
  id: string;
  name: string;
  type: "STOCKS" | "BONDS" | "CRYPTO" | "REAL_ESTATE";
  rate: string;
  description: string;
  minAmount: number;
}

export function InvestmentsScreen({
  user,
  dark,
  transactions = [],
  investmentSettings,
  onUpdateState,
  onAddTransaction,
  onAddNotification,
  initialTab,
  enabledTabTypes,
}: InvestmentsScreenProps) {
  const [investInputAmount, setInvestInputAmount] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("s-p-500");

  // Manual Funding States
  const [paymentRef, setPaymentRef] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);

  // Security PIN states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinValue, setShowPinValue] = useState(false);
  const [pinActionCallback, setPinActionCallback] = useState<(() => void) | null>(null);
  const [pinModalAmount, setPinModalAmount] = useState<number>(0);

  // Generate growth timeline data
  const personalBalance = (user.investmentBalance ?? 0) + (user.bitcoinBalance ?? 0) * 68500;
  const [chartSource, setChartSource] = useState<"personal" | "global">(personalBalance > 0 ? "personal" : "global");

  const globalData = [
    { name: "Day -30", value: 10000 },
    { name: "Day -25", value: 10210 },
    { name: "Day -20", value: 10450 },
    { name: "Day -15", value: 10620 },
    { name: "Day -10", value: 10890 },
    { name: "Day -5",  value: 11080 },
    { name: "Today",   value: 11240 }
  ];

  // Reconstruct user transaction history for investments
  const userTransactions = transactions.filter(
    (tx) => tx.fromUserId === user.id || tx.toUserId === user.id
  );

  const now = new Date();
  const btcPrice = 68500;
  const currentTotal = (user.investmentBalance ?? 0) + (user.bitcoinBalance ?? 0) * btcPrice;

  // Let's build a dynamic reconstruction backwards from today's currentTotal
  const personalData = [30, 25, 20, 15, 10, 5, 0].map((daysAgo) => {
    const label = daysAgo === 0 ? "Today" : `Day -${daysAgo}`;
    const cutOffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    let historicalValue = currentTotal;

    userTransactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (txDate > cutOffDate) {
        const isSuccessful = tx.status === "Successful" || tx.status === "Completed" || tx.status === "OTP Verified";
        if (!isSuccessful) return;

        // Is it an investment purchase?
        const isPurchase = 
          tx.fromUserId === user.id && 
          (tx.isInvestmentFunding || 
           tx.transactionType === "Asset Purchase Clearance" || 
           tx.note.toLowerCase().includes("investment") ||
           tx.note.toLowerCase().includes("buy") ||
           tx.toAccountNumber.includes("PORTFOLIO") || 
           tx.toAccountNumber.includes("BTC-CUSTODY") || 
           tx.toAccountNumber.includes("REAL-ESTATE-CUSTODY"));

        // Is it a liquidation?
        const isLiquidation = 
          tx.toUserId === user.id && 
          (tx.note.toLowerCase().includes("liquidate") || 
           tx.note.toLowerCase().includes("asset liquidation") ||
           tx.fromAccountNumber.includes("PORTFOLIO") ||
           tx.fromAccountNumber.includes("BTC-CUSTODY") ||
           tx.fromAccountNumber.includes("REAL-ESTATE-CUSTODY"));

        if (isPurchase) {
          historicalValue -= tx.amount;
        } else if (isLiquidation) {
          historicalValue += tx.amount;
        }
      }
    });

    if (historicalValue < 0) historicalValue = 0;

    return {
      name: label,
      value: Math.round(historicalValue * 100) / 100
    };
  });

  // Live Cryptocurrency Tracker
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, { price: number; change24h: number; history: { name: string; value: number }[] }>>({
    bitcoin: {
      price: 68500,
      change24h: 2.45,
      history: [
        { name: "22:00", value: 66800 },
        { name: "00:00", value: 67100 },
        { name: "02:00", value: 66950 },
        { name: "04:00", value: 67400 },
        { name: "06:00", value: 67200 },
        { name: "08:00", value: 67800 },
        { name: "10:00", value: 68100 },
        { name: "12:00", value: 67900 },
        { name: "14:00", value: 68300 },
        { name: "16:00", value: 68250 },
        { name: "18:00", value: 68400 },
        { name: "20:00", value: 68500 }
      ]
    },
    ethereum: {
      price: 3450.5,
      change24h: 1.82,
      history: [
        { name: "22:00", value: 3310 },
        { name: "00:00", value: 3340 },
        { name: "02:00", value: 3320 },
        { name: "04:00", value: 3380 },
        { name: "06:00", value: 3360 },
        { name: "08:00", value: 3390 },
        { name: "10:00", value: 3420 },
        { name: "12:00", value: 3410 },
        { name: "14:00", value: 3440 },
        { name: "16:00", value: 3435 },
        { name: "18:00", value: 3445 },
        { name: "20:00", value: 3450.5 }
      ]
    },
    solana: {
      price: 142.2,
      change24h: 5.64,
      history: [
        { name: "22:00", value: 131.5 },
        { name: "00:00", value: 134.2 },
        { name: "02:00", value: 133.0 },
        { name: "04:00", value: 136.8 },
        { name: "06:00", value: 135.2 },
        { name: "08:00", value: 138.4 },
        { name: "10:00", value: 139.9 },
        { name: "12:00", value: 138.5 },
        { name: "14:00", value: 141.2 },
        { name: "16:00", value: 140.8 },
        { name: "18:00", value: 141.8 },
        { name: "20:00", value: 142.2 }
      ]
    },
    cardano: {
      price: 0.48,
      change24h: -0.52,
      history: [
        { name: "22:00", value: 0.492 },
        { name: "00:00", value: 0.490 },
        { name: "02:00", value: 0.485 },
        { name: "04:00", value: 0.488 },
        { name: "06:00", value: 0.482 },
        { name: "08:00", value: 0.481 },
        { name: "10:00", value: 0.483 },
        { name: "12:00", value: 0.479 },
        { name: "14:00", value: 0.481 },
        { name: "16:00", value: 0.480 },
        { name: "18:00", value: 0.482 },
        { name: "20:00", value: 0.48 }
      ]
    },
    ripple: {
      price: 0.59,
      change24h: 0.25,
      history: [
        { name: "22:00", value: 0.572 },
        { name: "00:00", value: 0.575 },
        { name: "02:00", value: 0.571 },
        { name: "04:00", value: 0.582 },
        { name: "06:00", value: 0.579 },
        { name: "08:00", value: 0.584 },
        { name: "10:00", value: 0.588 },
        { name: "12:00", value: 0.586 },
        { name: "14:00", value: 0.591 },
        { name: "16:00", value: 0.589 },
        { name: "18:00", value: 0.592 },
        { name: "20:00", value: 0.59 }
      ]
    }
  });

  const [selectedCrypto, setSelectedCrypto] = useState<string>("bitcoin");
  const [loadingCrypto, setLoadingCrypto] = useState<boolean>(false);
  const [lastCryptoUpdated, setLastCryptoUpdated] = useState<string>(new Date().toLocaleTimeString());

  const fetchLiveCryptoPrices = async () => {
    setLoadingCrypto(true);
    try {
      const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano,ripple&vs_currencies=usd&include_24hr_change=true");
      if (res.ok) {
        const data = await res.json();
        setCryptoPrices((prev) => {
          const updated = { ...prev };
          const keys = ["bitcoin", "ethereum", "solana", "cardano", "ripple"];
          keys.forEach((key) => {
            if (data[key]) {
              const currentPrice = data[key].usd;
              const change = data[key].usd_24h_change || 0;
              
              const currentHistory = [...prev[key].history];
              if (currentHistory.length > 0) {
                currentHistory[currentHistory.length - 1] = {
                  ...currentHistory[currentHistory.length - 1],
                  value: currentPrice
                };
              }

              updated[key] = {
                price: currentPrice,
                change24h: change,
                history: currentHistory
              };
            }
          });
          return updated;
        });
        setLastCryptoUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Could not fetch real-time crypto prices, utilizing secure local feeds.", err);
    } finally {
      setLoadingCrypto(false);
    }
  };

  useEffect(() => {
    fetchLiveCryptoPrices();
    const interval = setInterval(fetchLiveCryptoPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border-2 border-slate-900 p-3 rounded-none font-mono text-xs text-slate-900 shadow-md">
          <p className="font-bold uppercase tracking-wider mb-1 text-slate-500">{label}</p>
          <p className="text-emerald-600 font-black">
            Value: {fmtMoney(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const allowedTabs = enabledTabTypes || ((user.enabledAccounts && user.enabledAccounts.length > 0) ? user.enabledAccounts : ["checking", "investment", "bitcoin"]);

  const getStartingTab = (): "portfolio" | "bitcoin" | "properties" => {
    if (initialTab) {
      if ((initialTab === "portfolio" || initialTab === "properties") && allowedTabs.includes("investment")) {
        return initialTab;
      }
      if (initialTab === "bitcoin" && allowedTabs.includes("bitcoin")) {
        return initialTab;
      }
    }
    if (allowedTabs.includes("investment")) return "portfolio";
    if (allowedTabs.includes("bitcoin")) return "bitcoin";
    return "portfolio";
  };

  const [fundingTab, setFundingTab] = useState<"portfolio" | "bitcoin" | "properties">(getStartingTab);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [liquidateSuccessMsg, setLiquidateSuccessMsg] = useState<string | null>(null);
  
  const [properties] = useState<Property[]>(() => {
    try {
      const saved = localStorage.getItem("valora_properties");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validated = parsed.filter((p: any) => p && typeof p === "object" && p.id && p.name && typeof p.price === "number");
          if (validated.length > 0) {
            // Keep custom props created by the user (not in INITIAL_PROPERTIES)
            const customProperties = validated.filter((p: any) => !INITIAL_PROPERTIES.some(ip => ip.id === p.id));
            // For core properties in INITIAL_PROPERTIES, merge them but prioritize codebase updates
            const mergedCoreProperties = INITIAL_PROPERTIES.map(coreProp => {
              const matchedProp = validated.find((p: any) => p.id === coreProp.id);
              if (matchedProp) {
                return {
                  ...matchedProp,
                  name: coreProp.name,
                  type: coreProp.type,
                  category: coreProp.category,
                  location: coreProp.location,
                  imageUrl: coreProp.imageUrl,
                  imageUrls: coreProp.imageUrls,
                  price: coreProp.price,
                  durationMonths: coreProp.durationMonths,
                  expectedMonthlyProfit: coreProp.expectedMonthlyProfit,
                  expectedAnnualProfit: coreProp.expectedAnnualProfit,
                  roiPercentage: coreProp.roiPercentage,
                  description: coreProp.description,
                  features: coreProp.features,
                  riskLevel: coreProp.riskLevel
                };
              }
              return coreProp;
            });
            return [...mergedCoreProperties, ...customProperties];
          }
        }
      }
    } catch (e) {
      console.error("Valora Investments Screen: properties fetch error", e);
    }
    return INITIAL_PROPERTIES;
  });
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(() => {
    return INITIAL_PROPERTIES[0]?.id || "";
  });
  const [propertyPictureIndexes, setPropertyPictureIndexes] = useState<Record<string, number>>({});

  const activeDailyRate = investmentSettings?.portfolioDailyPercentage ?? 1.5;
  const activeDuration = investmentSettings?.portfolioDurationDays ?? 30;
  const activeBtcDailyRate = investmentSettings?.bitcoinDailyPercentage ?? 2.0;
  const activeBtcDuration = investmentSettings?.bitcoinDurationDays ?? 30;
  const activeBoostRate = investmentSettings?.instantFundingBonusPercentage ?? 5.5;

  const isManualFundingAsset = (): boolean => {
    return true; // Stop direct self-funding completely! All must go through manual bank transfer / wallet deposit proof workflow
  };

  // High-fidelity available investment assets with dynamic administrative rates
  const ASSETS: AssetOption[] = [
    {
      id: "s-p-500",
      name: "S&P 500® Blue-Chip Index",
      type: "STOCKS",
      rate: `${activeDailyRate.toFixed(2)}% Daily (${(activeDailyRate * activeDuration).toFixed(1)}% Yield)`,
      description: `Direct exposure to global top five hundred blue-chip equities compounded over ${activeDuration} days.`,
      minAmount: 500
    },
    {
      id: "us-bonds",
      name: "UK Treasury 10Y Gilt Bond",
      type: "BONDS",
      rate: `${(activeDailyRate * 0.8).toFixed(2)}% Daily (${((activeDailyRate * 0.8) * activeDuration).toFixed(1)}% Yield)`,
      description: `Sovereign debt interest reserves backed by United Kingdom Government credit. Compounded for ${activeDuration} days.`,
      minAmount: 1000
    },
    {
      id: "manhattan-re",
      name: "Manhattan Commercial Real Estate ETF",
      type: "REAL_ESTATE",
      rate: `${(activeDailyRate * 0.9).toFixed(2)}% Daily (${((activeDailyRate * 0.9) * activeDuration).toFixed(1)}% Rental APY)`,
      description: `Yielding premium logistics centers, luxury residences, and retail complexes in Manhattan New York. Returns paid out in ${activeDuration} days.`,
      minAmount: 2500
    },
    {
      id: "us-ai",
      name: "Valora Managed Tech Index",
      type: "STOCKS",
      rate: `${(activeDailyRate * 1.25).toFixed(2)}% Daily (${((activeDailyRate * 1.25) * activeDuration).toFixed(1)}% Active Yield)`,
      description: `Risk-adjusted active capital leveraging machine-learning optimization inside NASDAQ-100 high-growth US tech equities. Returns mature in ${activeDuration} days.`,
      minAmount: 100
    }
  ];

  const hasInvestmentAccount = user.investmentBalance !== undefined;
  const currentInvestments = user.investmentsList || [];
  const activeInvestments = currentInvestments.filter(inv => inv.status === "ACTIVE");

  const handleApplyAccount = () => {
    onUpdateState((s: any) => {
      const users = s.users.map((u: any) => {
        if (u.id === user.id) {
          return {
            ...u,
            investmentBalance: 0,
            investmentsList: []
          };
        }
        return u;
      });
      return { ...s, users };
    });

    const notif = {
      id: "notif-inv-" + Math.floor(Math.random() * 10000),
      userId: user.id,
      title: "Wealth Portfolio Activated",
      body: "Institutional Investment and Wealth subaccounts successfully provisioned. Real-time US clearances active.",
      read: false,
      date: new Date().toISOString()
    };
    onAddNotification(notif);
  };

  const handleBuyAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.checkingFrozen) {
      alert("Transaction Declined: Your premium liquid checking account is frozen by governance compliance. Asset procurement is temporarily suspended.");
      return;
    }
    if ((fundingTab === "portfolio" || fundingTab === "properties") && user.investmentFrozen) {
      alert("Transaction Declined: Your wealth investment portfolio account is frozen by governance compliance.");
      return;
    }
    if (fundingTab === "bitcoin" && user.bitcoinFrozen) {
      alert("Transaction Declined: Your sovereign bitcoin cold storage vault is frozen by governance compliance.");
      return;
    }
    const amt = parseFloat(investInputAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid dollar amount");
      return;
    }
    if (isManualFundingAsset()) {
      if (!paymentRef.trim()) {
        alert("Please provide your payment reference / transfer hash / wire memo for verification.");
        return;
      }

      const getAssetType = () => {
        if (fundingTab === "bitcoin") return "BITCOIN" as const;
        if (fundingTab === "properties") return "REAL_ESTATE" as const;
        const selectedAsset = ASSETS.find(a => a.id === selectedAssetId);
        return (selectedAsset?.type || "REAL_ESTATE") as "BITCOIN" | "REAL_ESTATE" | "STOCKS" | "BONDS" | "CRYPTO";
      };
      const assetType = getAssetType();

      const assetName = fundingTab === "bitcoin" 
        ? "Sovereign Bitcoin" 
        : fundingTab === "properties" 
          ? (properties.find(p => p.id === selectedPropertyId)?.name || "Direct Real Estate")
          : (ASSETS.find(a => a.id === selectedAssetId)?.name || "Investment Portfolio");

      const assetId = fundingTab === "bitcoin"
        ? "bitcoin"
        : fundingTab === "properties"
          ? selectedPropertyId
          : selectedAssetId;

      const yieldRate = fundingTab === "bitcoin"
        ? `+${activeBtcDailyRate.toFixed(2)}% Daily`
        : fundingTab === "properties"
          ? `${properties.find(p => p.id === selectedPropertyId)?.roiPercentage || "8.5"}% APY`
          : (ASSETS.find(a => a.id === selectedAssetId)?.rate || "Portfolio APY");

      const tx = {
        id: "VFB-MANUAL-" + Math.floor(100000 + Math.random() * 900000),
        fromUserId: user.id,
        toUserId: "EXTERNAL",
        fromName: user.name,
        toName: `Manual Funding: ${assetName}`,
        fromAccountNumber: user.accountNumber,
        toAccountNumber: fundingTab === "bitcoin" ? "BTC-CUSTODY-POOL" : fundingTab === "properties" ? "REAL-ESTATE-CUSTODY-POOL" : "PORTFOLIO-CUSTODY-POOL",
        amount: amt,
        note: `Pending manual clearance for ${assetName}. (Ref: ${paymentRef})`,
        date: new Date().toISOString(),
        status: "Pending" as const,
        transactionType: "Investment Funding Request",
        recipientBank: fundingTab === "bitcoin" ? "Sovereign Bitcoin Custody" : fundingTab === "properties" ? "Valora Premium Real Estate Custody" : "Valora Institutional Custody Services",
        fromBank: "External Manual Deposit",
        timeZone: "CET (UTC+1)",
        processingFee: 0,
        serviceCharge: 0,
        totalAmount: amt,
        ipAddress: "178.238.165.73",

        isInvestmentFunding: true,
        fundingAssetType: assetType,
        fundingAssetId: assetId,
        fundingAssetName: assetName,
        fundingYieldRate: yieldRate,
        paymentReference: paymentRef,
        receiptFileName: receiptFileName || "receipt_reference.pdf"
      };

      onAddTransaction(tx);

      const notif = {
        id: "notif-manual-funding-" + Math.floor(Math.random() * 10000),
        userId: user.id,
        title: "Funding Request Enqueued",
        body: `Your manual payment reference of ${fmtMoney(amt)} for ${assetName} has been submitted for administrative audit and compliance clearing.`,
        read: false,
        date: new Date().toISOString()
      };
      onAddNotification(notif);

      setSuccessMsg(`Manual funding proof submitted! Once our clearing team verifies the payment (${fmtMoney(amt)}), your position in ${assetName} will be credited.`);
      setInvestInputAmount("");
      setPaymentRef("");
      setReceiptFileName("");
      setTimeout(() => setSuccessMsg(null), 8000);
      return;
    }

    if (amt > user.balance) {
      alert("Insufficient funds in your checked liquid wallet.");
      return;
    }

    const runPurchase = () => {

    if (fundingTab === "portfolio") {
      const selectedAsset = ASSETS.find(a => a.id === selectedAssetId);
      if (!selectedAsset) return;

      if (amt < selectedAsset.minAmount) {
        alert(`The clearing threshold for ${selectedAsset.name} is ${fmtMoney(selectedAsset.minAmount)}.`);
        return;
      }

      // Calculate investment values including boot bonuses
      const bonusPct = activeBoostRate;
      const bonusAmt = amt * (bonusPct / 100);
      const startingVal = amt + bonusAmt;

      // Process Purchase
      onUpdateState((s: any) => {
        const users = s.users.map((u: any) => {
          if (u.id === user.id) {
            const prevBalance = u.balance || 0;
            const prevInvBalance = u.investmentBalance || 0;
            const newList = u.investmentsList || [];

            const newInvestItem: UserInvestment = {
              id: "INV-ITEM-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
              assetId: selectedAsset.id,
              assetName: selectedAsset.name,
              assetType: selectedAsset.type,
              investedAmount: amt,
              currentValue: startingVal, // Boosted starting value!
              yieldRate: selectedAsset.rate,
              date: new Date().toISOString(),
              status: "ACTIVE"
            };

            return {
              ...u,
              balance: prevBalance - amt,
              investmentBalance: prevInvBalance + startingVal,
              investmentsList: [newInvestItem, ...newList]
            };
          }
          return u;
        });
        return { ...s };
      });

      // Add transaction ledger entry
      const tx = {
        id: "VFB-INV-" + Math.floor(100000 + Math.random() * 900000),
        fromUserId: user.id,
        toUserId: "EXTERNAL",
        fromName: user.name,
        toName: `Portfolio: ${selectedAsset.name}`,
        fromAccountNumber: user.accountNumber,
        toAccountNumber: `PORTFOLIO-LEDGER-${selectedAsset.id.toUpperCase()}`,
        amount: amt,
        note: `Capital Investment: Buy ${selectedAsset.name} (Includes +${bonusPct}% Instantly Cleared Market Incentive of ${fmtMoney(bonusAmt)})`,
        date: new Date().toISOString(),
        status: "Successful",
        transactionType: "Asset Purchase Clearance",
        recipientBank: "Valora Financial Asset Management",
        fromBank: "Valora Financial Bank",
        timeZone: "CET (UTC+1)",
        processingFee: 0,
        serviceCharge: 0,
        totalAmount: amt,
        ipAddress: "178.238.165.73"
      };
      onAddTransaction(tx);

      // Notification
      const notif = {
        id: "notif-inv-buy-" + Math.floor(Math.random() * 10000),
        userId: user.id,
        title: "Asset Purchase Cleared",
        body: `Successfully invested ${fmtMoney(amt)} in ${selectedAsset.name}. Administrative balance match +${bonusPct}% booster added.`,
        read: false,
        date: new Date().toISOString()
      };
      onAddNotification(notif);

      setSuccessMsg(`Asset purchased successfully! ${fmtMoney(amt)} was allocated with +${bonusPct}% market booster (${fmtMoney(bonusAmt)}) added instantly.`);
      setInvestInputAmount("");
      setTimeout(() => setSuccessMsg(null), 5000);

    } else if (fundingTab === "properties") {
      const selectedProperty = properties.find(p => p.id === selectedPropertyId);
      if (!selectedProperty) return;

      if (amt < 1000) {
        alert("The minimum investment amount in trophy real estate is $1,000.");
        return;
      }

      // Calculate investment values including boot bonuses
      const bonusPct = activeBoostRate;
      const bonusAmt = amt * (bonusPct / 100);
      const startingVal = amt + bonusAmt;

      // Process Purchase
      onUpdateState((s: any) => {
        const users = s.users.map((u: any) => {
          if (u.id === user.id) {
            const prevBalance = u.balance || 0;
            const prevInvBalance = u.investmentBalance || 0;
            const newList = u.investmentsList || [];

            const newInvestItem: UserInvestment = {
              id: "INV-REAL-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
              assetId: selectedProperty.id,
              assetName: selectedProperty.name,
              assetType: "REAL_ESTATE",
              investedAmount: amt,
              currentValue: startingVal, // Boosted starting value!
              yieldRate: `${selectedProperty.roiPercentage}% Annual Yield`,
              date: new Date().toISOString(),
              status: "ACTIVE"
            };

            return {
              ...u,
              balance: prevBalance - amt,
              investmentBalance: prevInvBalance + startingVal,
              investmentsList: [newInvestItem, ...newList]
            };
          }
          return u;
        });
        return { ...s };
      });

      // Add transaction ledger entry
      const tx = {
        id: "VFB-REAL-" + Math.floor(100000 + Math.random() * 900000),
        fromUserId: user.id,
        toUserId: "EXTERNAL",
        fromName: user.name,
        toName: `Fractional: ${selectedProperty.name}`,
        fromAccountNumber: user.accountNumber,
        toAccountNumber: `CUSTODY-REAL-${selectedProperty.id.toUpperCase()}`,
        amount: amt,
        note: `Fractional Estate Acquisition: Rent-To-Yield index in ${selectedProperty.name} (${selectedProperty.location}). Includes +${bonusPct}% custody match booster of ${fmtMoney(bonusAmt)}.`,
        date: new Date().toISOString(),
        status: "Successful",
        transactionType: "Sovereign Asset Buy-In",
        recipientBank: "Valora Premium Real Estate Custody",
        fromBank: "Valora Financial Bank",
        timeZone: "CET (UTC+1)",
        processingFee: 0,
        serviceCharge: 0,
        totalAmount: amt,
        ipAddress: "178.238.165.73"
      };
      onAddTransaction(tx);

      // Notification
      const notif = {
        id: "notif-prop-buy-" + Math.floor(Math.random() * 10000),
        userId: user.id,
        title: "Estate Investment Cleared",
        body: `Approved fractional buy-in of ${fmtMoney(amt)} in ${selectedProperty.name} at ${selectedProperty.location}. Welcome to premium high-yield real estate custody.`,
        read: false,
        date: new Date().toISOString()
      };
      onAddNotification(notif);

      setSuccessMsg(`Fractional investment complete! ${fmtMoney(amt)} was allocated to ${selectedProperty.name} with +${bonusPct}% matched booster added instantly.`);
      setInvestInputAmount("");
      setTimeout(() => setSuccessMsg(null), 5000);

    } else {
      // BTC Vault Funding
      const bonusPct = activeBoostRate;
      const btcPrice = 68500; // Reference BTC spot price
      const bonusAmt = amt * (bonusPct / 100);
      const totalUSDValue = amt + bonusAmt;
      const btcPurchased = totalUSDValue / btcPrice;

      // Process Bitcoin Purchase
      onUpdateState((s: any) => {
        const users = s.users.map((u: any) => {
          if (u.id === user.id) {
            const prevBalance = u.balance || 0;
            const prevBtc = u.bitcoinBalance || 0;

            return {
              ...u,
              balance: prevBalance - amt,
              bitcoinBalance: Math.round((prevBtc + btcPurchased) * 100000) / 100000
            };
          }
          return u;
        });
        return { ...s };
      });

      // Add transaction ledger entry
      const tx = {
        id: "VFB-BTC-" + Math.floor(100000 + Math.random() * 900000),
        fromUserId: user.id,
        toUserId: "EXTERNAL",
        fromName: user.name,
        toName: "Bitcoin Secured Sovereign Vault",
        fromAccountNumber: user.accountNumber,
        toAccountNumber: "BITCOIN-SECURE-VAULT-MAIN",
        amount: amt,
        note: `Secure Bitcoin Credit (Acquired ${btcPurchased.toFixed(5)} BTC at $68,500/BTC rate, includes +${bonusPct}% administrative booster of ${fmtMoney(bonusAmt)})`,
        date: new Date().toISOString(),
        status: "Successful",
        transactionType: "Sovereign Asset Buy-In",
        recipientBank: "Valora Brokerage & Wealth Clearinghouse",
        fromBank: "Valora Financial Bank",
        timeZone: "CET (UTC+1)",
        processingFee: 0,
        serviceCharge: 0,
        totalAmount: amt,
        ipAddress: "178.238.165.73"
      };
      onAddTransaction(tx);

      // Notification
      const notif = {
        id: "notif-btc-buy-" + Math.floor(Math.random() * 10000),
        userId: user.id,
        title: "Bitcoin Vault Funded",
        body: `Approved purchase of ${btcPurchased.toFixed(5)} BTC credited instantly to secure vault. APY compounding activated.`,
        read: false,
        date: new Date().toISOString()
      };
      onAddNotification(notif);

      setSuccessMsg(`Bitcoin subaccount funded successfully! ${btcPurchased.toFixed(5)} BTC credited ($${amt.toLocaleString()} principal with +${bonusPct}% booster added).`);
      setInvestInputAmount("");
      setTimeout(() => setSuccessMsg(null), 5000);
    }

    };

    setEnteredPin("");
    setPinError("");
    setPinModalAmount(amt);
    setPinActionCallback(() => runPurchase);
    setIsPinModalOpen(true);
  };

  const handleLiquidateAsset = (item: UserInvestment) => {
    if (user.checkingFrozen) {
      alert("Withdrawal Denied: Liquid checking balance route is frozen. Liquidation cannot settle.");
      return;
    }
    if (user.investmentFrozen) {
      alert("Withdrawal Denied: Wealth investment portfolio is frozen.");
      return;
    }
    if (item.status === "LIQUIDATED") return;

    const value = item.currentValue;

    const runLiquidation = () => {

    // Process Liquidation
    onUpdateState((s: any) => {
      const users = s.users.map((u: any) => {
        if (u.id === user.id) {
          const prevBalance = u.balance || 0;
          const prevInvBalance = u.investmentBalance || 0;
          const list = u.investmentsList || [];

          const updatedList = list.map((inv: UserInvestment) => {
            if (inv.id === item.id) {
              return { ...inv, status: "LIQUIDATED" as const };
            }
            return inv;
          });

          return {
            ...u,
            balance: prevBalance + value,
            investmentBalance: Math.max(0, prevInvBalance - item.investedAmount),
            investmentsList: updatedList
          };
        }
        return u;
      });
      return { ...s };
    });

    // Add transaction ledger entry
    const tx = {
      id: "VFB-LIQ-" + Math.floor(100000 + Math.random() * 900000),
      fromUserId: "EXTERNAL",
      toUserId: user.id,
      fromName: `Liquidated: ${item.assetName}`,
      toName: user.name,
      fromAccountNumber: `PORTFOLIO-LEDGER-${item.assetId.toUpperCase()}`,
      toAccountNumber: user.accountNumber,
      amount: value,
      note: `Capital Liquidation Clearance: Sell ${item.assetName}`,
      date: new Date().toISOString(),
      status: "Successful",
      transactionType: "Asset Liquidation clearance",
      recipientBank: "Valora Financial Bank",
      fromBank: "Valora Financial Asset Management",
      timeZone: "CET (UTC+1)",
      processingFee: 0,
      serviceCharge: 0,
      totalAmount: value,
      ipAddress: "178.238.165.73"
    };
    onAddTransaction(tx);

    // Notification
    const notif = {
      id: "notif-inv-liq-" + Math.floor(Math.random() * 10000),
      userId: user.id,
      title: "Asset Liquidation Cleared",
      body: `Liquidated ${fmtMoney(value)} from ${item.assetName}. Capital cleared directly back to checked checking route.`,
      read: false,
      date: new Date().toISOString()
    };
    onAddNotification(notif);

    setLiquidateSuccessMsg(`Successfully cleared ${fmtMoney(value)} holdings to Checking.`);
    setTimeout(() => setLiquidateSuccessMsg(null), 5000);
    };

    setEnteredPin("");
    setPinError("");
    setPinModalAmount(value);
    setPinActionCallback(() => runLiquidation);
    setIsPinModalOpen(true);
  };

  return (
    <div className="px-6 py-8 bg-slate-50 text-slate-800 min-h-[85vh] animate-[fadeIn_0.2s_ease-out] select-none space-y-6">
      {/* Dynamic 3-Axis Balance Overview Header */}
      <div className="p-6 bg-white border-2 border-slate-900 rounded-none mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase size={18} className="text-slate-900" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">
            Sovereign Asset Allocation Overview
          </h4>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-none border border-slate-200">
            <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">Liquid Checked</span>
            <span className="text-sm font-mono font-black text-slate-900 block break-words mt-1">{fmtMoney(user.balance)}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-none border border-slate-200">
            <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">Bitcoin Vault</span>
            <span className="text-sm font-mono font-black text-slate-900 block break-words mt-1">{(user.bitcoinBalance ?? 0).toFixed(4)} BTC</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-none border border-slate-200">
            <span className="text-[10px] font-black text-slate-500 block uppercase tracking-wider">Portfolios</span>
            <span className="text-sm font-mono font-black text-slate-900 block break-words mt-1">{fmtMoney(user.investmentBalance ?? 0)}</span>
          </div>
        </div>
      </div>

      {!hasInvestmentAccount ? (
        /* APPLICATION WORKSPACE ENTRY GATEWAY */
        <div className="p-8 text-center border-2 border-slate-900 bg-white rounded-none shadow-md">
          <div className="w-14 h-14 rounded-none bg-slate-100 text-brand-red flex items-center justify-center mx-auto mb-5 border-2 border-slate-900">
            <TrendingUp size={28} />
          </div>
          <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
            Open Wealth Portfolio Account
          </h3>
          <p className="text-xs leading-relaxed text-slate-600 mt-3 max-w-sm mx-auto font-medium">
            Leverage sovereign asset allocations. Activate your private wealth subaccount to trade blue-chip equities, treasury bond guarantees, and prime commercial complexes.
          </p>

          <div className="rounded-none bg-slate-50 border border-slate-200 p-4 mt-5 text-left space-y-3 text-xs text-slate-700 font-semibold">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={14} className="text-slate-900 shrink-0" />
              <span>Full compliance with FCA & FSCS asset custody directives.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Coins size={14} className="text-slate-900 shrink-0" />
              <span>Purchase assets directly from your checking holdings.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Zap size={14} className="text-slate-900 shrink-0" />
              <span>Instant 24/7 liquidation clearance back to liquid cash.</span>
            </div>
          </div>

          <button
            onClick={handleApplyAccount}
            className="w-full mt-6 py-4 bg-brand-red hover:bg-[#A93226] text-white font-black text-xs uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-lg"
          >
            Apply & Activate Account
          </button>
        </div>
      ) : (
        /* INSTANT HIGH-YIELD TRADING OFFICE */
        <div className="space-y-6">
          {/* Portfolio Growth Dashboard Card */}
          <div className="p-6 bg-white border-2 border-slate-900 rounded-none space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Performance Analysis</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600 animate-pulse" />
                  Sovereign Yield Index & Growth Vector
                </h4>
              </div>
              
              {/* Toggle Source Buttons */}
              <div className="flex bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => personalBalance > 0 && setChartSource("personal")}
                  disabled={personalBalance === 0}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-none transition-all ${
                    chartSource === "personal"
                      ? "bg-slate-900 text-white font-black"
                      : "text-slate-600 hover:bg-slate-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  Personal Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setChartSource("global")}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-none transition-all ${
                    chartSource === "global"
                      ? "bg-slate-900 text-white font-black"
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  Global Index
                </button>
              </div>
            </div>

            {/* Performance Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total Allocated</span>
                <span className="text-base font-mono font-black text-slate-900 mt-0.5 block">
                  {chartSource === "personal" ? fmtMoney(personalBalance) : fmtMoney(11240)}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Accumulated Return</span>
                <span className="text-base font-mono font-black text-emerald-600 mt-0.5 block">
                  {chartSource === "personal" ? `+${fmtMoney(personalBalance * 0.15)}` : `+${fmtMoney(1240)}`}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Cumulative APY</span>
                <span className="text-base font-mono font-black text-emerald-600 mt-0.5 block">
                  {chartSource === "personal" ? "+15.00%" : "+12.40%"}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Risk Threshold</span>
                <span className="text-base font-mono font-black text-slate-700 mt-0.5 block">
                  A+ SECURED
                </span>
              </div>
            </div>

            {/* Actual Recharts Chart Canvas */}
            <div className="h-64 w-full pt-4 relative">
              {personalBalance === 0 && chartSource === "personal" && (
                <div className="absolute inset-0 bg-slate-50/95 flex flex-col items-center justify-center text-center p-4 z-10 border border-dashed border-slate-300">
                  <TrendingUp size={24} className="text-slate-500 mb-2 animate-bounce" />
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-900">No active allocations found</p>
                  <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                    Procure wealth portfolios, sovereign Bitcoin, or premium real estate below to map your personal growth trajectory.
                  </p>
                </div>
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartSource === "personal" ? personalData : globalData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(15,23,42,0.4)" 
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="rgba(15,23,42,0.4)" 
                    fontSize={10}
                    fontFamily="monospace"
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0f172a" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Cryptocurrency Market Hub */}
          <div className="p-6 bg-white border-2 border-slate-900 rounded-none space-y-4 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Real-Time Crypto Feed</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Coins size={16} className="text-amber-500 animate-pulse" />
                  Live Digital Asset Exchange Rates
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500">
                  Last updated: {lastCryptoUpdated}
                </span>
                <button
                  type="button"
                  onClick={fetchLiveCryptoPrices}
                  disabled={loadingCrypto}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-none transition-all cursor-pointer flex items-center justify-center text-slate-800 disabled:opacity-50"
                  title="Force Refresh Live Prices"
                >
                  <RefreshCw size={12} className={`${loadingCrypto ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Quick Crypto Selector / Stats list */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(cryptoPrices).map(([id, rawData]) => {
                const data = rawData as { price: number; change24h: number; history: { name: string; value: number }[] };
                const selected = selectedCrypto === id;
                const isPositive = data.change24h >= 0;
                const tickerSymbol = id === "bitcoin" ? "BTC" : id === "ethereum" ? "ETH" : id === "solana" ? "SOL" : id === "cardano" ? "ADA" : "XRP";
                const displayPrice = id === "cardano" || id === "ripple" ? `$${data.price.toFixed(4)}` : `$${data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCrypto(id)}
                    className={`p-3 text-left border-2 rounded-none transition-all select-none cursor-pointer ${
                      selected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md font-black"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${selected ? "text-amber-400 font-black" : "text-amber-600 font-black"}`}>
                        {tickerSymbol}
                      </span>
                      <span className={`text-[9px] font-mono font-black flex items-center gap-0.5 ${
                        selected 
                          ? (isPositive ? "text-emerald-400" : "text-rose-400") 
                          : (isPositive ? "text-emerald-600" : "text-rose-600")
                      }`}>
                        {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {data.change24h.toFixed(2)}%
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black block mt-1.5">
                      {displayPrice}
                    </span>
                    <span className={`text-[8px] uppercase tracking-widest block mt-0.5 ${selected ? "text-slate-300 font-black" : "text-slate-500 font-black"}`}>
                      {id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Crypto Live Area Chart */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-none space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Selected Ticker</span>
                  <span className="text-xs font-black text-slate-900 uppercase block">
                    {selectedCrypto} (USD) Live 24H Price Path
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-black">Institutional Spot Price</span>
                  <span className="text-sm font-mono font-black text-amber-600">
                    {selectedCrypto === "cardano" || selectedCrypto === "ripple" 
                      ? `$${cryptoPrices[selectedCrypto]?.price.toFixed(4)}` 
                      : `$${cryptoPrices[selectedCrypto]?.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
              </div>

              <div className="h-48 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={cryptoPrices[selectedCrypto]?.history || []}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(15,23,42,0.4)" 
                      fontSize={9}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="rgba(15,23,42,0.4)" 
                      fontSize={9}
                      fontFamily="monospace"
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }: any) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white border border-slate-900 p-2.5 rounded-none font-mono text-[10px] text-slate-900 shadow-md">
                              <p className="font-bold uppercase mb-0.5 text-slate-500">{label} UTC</p>
                              <p className="text-amber-600 font-black">
                                Price: ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: selectedCrypto === "cardano" || selectedCrypto === "ripple" ? 4 : 2 })}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#d97706" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCrypto)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Active Allocations Portfolio */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Active Wealth Assets
              </h3>
              <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-none">
                {activeInvestments.length} Active Positions
              </span>
            </div>

            {liquidateSuccessMsg && (
              <div className="p-3 mb-3 bg-emerald-600 text-white text-xs font-black rounded-none border-2 border-slate-900 flex items-center gap-2 animate-[fadeIn_0.2s]">
                <CheckCircle size={14} />
                <span>{liquidateSuccessMsg}</span>
              </div>
            )}

            {activeInvestments.length === 0 ? (
              <div className="p-6 text-center rounded-none border-2 border-dashed border-slate-300 bg-white">
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  Your investment subaccount is empty.<br />Allocate funds below to build institutional wealth.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeInvestments.map((inv) => {
                  let badgeCol = "bg-slate-100 text-slate-800 border-slate-300";
                  if (inv.assetType === "BONDS") badgeCol = "bg-blue-50 text-blue-800 border-blue-200";
                  if (inv.assetType === "REAL_ESTATE") badgeCol = "bg-purple-50 text-purple-800 border-purple-200";
                  
                  return (
                    <div 
                      key={inv.id}
                      className="p-4 bg-white border-2 border-slate-200 rounded-none flex justify-between items-center transition-all hover:border-slate-400"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-none border ${badgeCol}`}>
                            {inv.assetType}
                          </span>
                          <span className="text-xs text-emerald-600 font-black">{inv.yieldRate}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase mt-1.5">
                          {inv.assetName}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                          Purchase Price: {fmtMoney(inv.investedAmount)} &bull; Date: {new Date(inv.date).toLocaleDateString("en-US", { timeZone: "America/New_York" })}
                        </p>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="text-sm font-black text-slate-900">{fmtMoney(inv.currentValue)}</span>
                        <button
                          onClick={() => handleLiquidateAsset(inv)}
                          className="mt-2 pb-0.5 border-b-2 border-slate-900 hover:text-slate-600 text-slate-900 text-[10px] font-black uppercase tracking-wide cursor-pointer leading-tight"
                        >
                          Liquidate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Secure Allocation Procurement Panel */}
          <div className="p-6 rounded-none bg-white text-slate-800 relative overflow-hidden border-2 border-slate-900 shadow-sm">
            {/* Visual background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-full blur-2xl pointer-events-none" />

            <div className="relative flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-5">
              <div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Trading Office</span>
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-900">Allocate Capital Reserve</h4>
              </div>
              <ShieldCheck size={18} className="text-slate-900" />
            </div>

            {/* Dynamic Funding Toggle Tab */}
            <div className="flex bg-slate-100 p-1 rounded-none mb-5 gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setFundingTab("portfolio");
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-none transition-all ${
                  fundingTab === "portfolio"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                Portfolios
              </button>
              <button
                type="button"
                onClick={() => {
                  setFundingTab("bitcoin");
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-none transition-all ${
                  fundingTab === "bitcoin"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                Bitcoin
              </button>
              <button
                type="button"
                onClick={() => {
                  setFundingTab("properties");
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-none transition-all ${
                  fundingTab === "properties"
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                Real Estate
              </button>
            </div>

            {successMsg && (
              <div className="p-3 mb-4 bg-teal-50 text-teal-800 text-[11px] font-semibold rounded-none border-2 border-teal-500 flex items-center gap-2 animate-[fadeIn_0.2s]">
                <CheckCircle size={12} className="text-teal-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleBuyAsset} className="space-y-5">
              {fundingTab === "portfolio" ? (
                <div>
                  <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-2">
                    1. Select Portfolio Asset
                  </label>
                  <p className="text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-none font-bold mb-3 flex items-center gap-1.5 border border-slate-200">
                    <Zap size={12} className="text-amber-600" /> Active Multi-Asset Incentive: +{activeBoostRate.toFixed(1)}% extra credited funds instantly!
                  </p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {ASSETS.map((ast) => {
                      const selected = selectedAssetId === ast.id;
                      return (
                        <div
                          key={ast.id}
                          onClick={() => setSelectedAssetId(ast.id)}
                          className={`p-4 rounded-none border-2 cursor-pointer transition-all ${
                            selected 
                              ? "bg-slate-50 border-slate-900 text-slate-900" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-black text-amber-600 uppercase">{ast.rate} APY</span>
                              <h5 className="text-sm font-black uppercase text-slate-900 mt-1">{ast.name}</h5>
                            </div>
                            <input 
                              type="radio" 
                              checked={selected} 
                              readOnly
                              className="cursor-pointer accent-slate-900 mt-1 w-4 h-4"
                            />
                          </div>
                          <p className="text-xs text-slate-600 leading-normal mt-2 pr-4 font-bold">{ast.description}</p>
                          <span className="text-[10px] font-black text-slate-500 block mt-2 uppercase">
                            Min threshold: {fmtMoney(ast.minAmount)} clearance
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : fundingTab === "properties" ? (
                <div>
                  <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-2">
                    1. Select Direct Property Asset
                  </label>
                  <p className="text-xs text-slate-800 bg-slate-50 px-3 py-1.5 rounded-none font-bold mb-3 flex items-center gap-1.5 border border-slate-200">
                    <Zap size={12} className="text-amber-600" /> Sovereign Property Incentive: +{activeBoostRate.toFixed(1)}% instant leverage bonus!
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {properties.filter(Boolean).map((prop) => {
                      if (!prop || !prop.id) return null;
                      const selected = selectedPropertyId === prop.id;
                      const images = getPropertyImages(prop);
                      const activeImgIdx = propertyPictureIndexes[prop.id] || 0;

                      const handlePrevImg = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setPropertyPictureIndexes(prev => ({
                          ...prev,
                          [prop.id]: activeImgIdx === 0 ? images.length - 1 : activeImgIdx - 1
                        }));
                      };

                      const handleNextImg = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setPropertyPictureIndexes(prev => ({
                          ...prev,
                          [prop.id]: activeImgIdx === images.length - 1 ? 0 : activeImgIdx + 1
                        }));
                      };

                      return (
                        <div
                          key={prop.id}
                          onClick={() => setSelectedPropertyId(prop.id)}
                          className={`p-4 rounded-none border-2 cursor-pointer transition-all flex gap-3.5 ${
                            selected 
                              ? "bg-slate-50 border-slate-900 text-slate-900" 
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          {/* Mini Image Carousel */}
                          <div className="relative w-24 h-24 rounded-none overflow-hidden shrink-0 bg-slate-100 border-2 border-slate-200">
                            <img 
                              src={images[activeImgIdx]} 
                              className="w-full h-full object-cover select-none"
                              referrerPolicy="no-referrer"
                              alt=""
                            />
                            {images.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={handlePrevImg}
                                  className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full p-1.5 text-white cursor-pointer z-10"
                                >
                                  <ChevronLeft size={10} />
                                </button>
                                <button
                                  type="button"
                                  onClick={handleNextImg}
                                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 rounded-full p-1.5 text-white cursor-pointer z-10"
                                >
                                  <ChevronRight size={10} />
                                </button>
                                <span className="absolute bottom-1 right-1.5 text-[9px] bg-black/85 text-white px-1.5 py-0.5 rounded-none">
                                  {activeImgIdx + 1}/{images.length}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Info Column */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-xs font-black text-amber-600 uppercase truncate block shrink-0">
                                  {prop.roiPercentage}% APY Range
                                </span>
                                <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded-none font-black uppercase scale-95 origin-right">
                                  {prop.status}
                                </span>
                              </div>
                              <h5 className="text-sm font-black text-slate-900 uppercase truncate mt-1 block leading-tight">
                                {prop.name}
                              </h5>
                              <p className="text-xs text-slate-500 font-bold truncate flex items-center gap-0.5 mt-1 leading-snug">
                                {prop.location}
                              </p>
                            </div>
                            <div className="flex justify-between items-end mt-2">
                              <span className="text-xs text-slate-500">
                                Capital: <strong className="text-slate-900">{fmtMoney(prop.price)}</strong>
                              </span>
                              <input 
                                type="radio" 
                                checked={selected} 
                                readOnly
                                className="cursor-pointer accent-slate-900 w-4 h-4"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-slate-50 rounded-none border-2 border-slate-200 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1">
                      <Coins size={14} /> Bitcoin Secured Vault Route
                    </span>
                    <span className="text-xs bg-slate-900 text-white px-2.5 py-1 font-black">
                      Spot: $68,500/BTC
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Sovereign appreciation is fully configured. Funding includes a <strong className="text-amber-600">+{activeBoostRate.toFixed(1)}% instant leverage booster</strong> credited on checkout.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="bg-white p-3 rounded-none border border-slate-200">
                      <span>Daily Growth APY:</span>
                      <span className="block text-amber-600 font-black text-sm mt-1">+{activeBtcDailyRate.toFixed(2)}% Daily</span>
                    </div>
                    <div className="bg-white p-3 rounded-none border border-slate-200">
                      <span>Market Duration Days:</span>
                      <span className="block text-slate-900 font-black text-sm mt-1">{activeBtcDuration} Days</span>
                    </div>
                  </div>
                </div>
              )}
              
              {isManualFundingAsset() ? (
                <>
                  {/* Administrative manual funding details */}
                  <div className="p-5 rounded-none bg-slate-50 border-2 border-dashed border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                        🏦 Sovereign Custody Account Details
                      </span>
                      <span className="text-xs bg-slate-900 text-white px-2 py-0.5 font-black uppercase">
                        Manual Coordinates
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-bold">
                      This asset requires manual external funding. Send your payment to the designated address below, then specify your reference and attach a receipt:
                    </p>
                    
                    {fundingTab === "bitcoin" ? (
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase font-black text-slate-500 block">Sovereign Bitcoin Custody Address</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={investmentSettings?.bitcoinFundingAddress || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}
                            className="w-full p-3 bg-slate-100 border border-slate-300 text-xs font-mono text-amber-600 font-bold outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(investmentSettings?.bitcoinFundingAddress || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
                              alert("Administrative Bitcoin Address copied!");
                            }}
                            className="px-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-none cursor-pointer transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <span className="text-xs uppercase font-black text-slate-500 block">Real Estate Wire / Routing Account</span>
                        <div className="flex gap-2 items-start">
                          <textarea
                            readOnly
                            rows={2}
                            value={investmentSettings?.realEstateFundingAccount || "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291"}
                            className="w-full p-3 bg-slate-100 border border-slate-300 text-xs font-mono text-slate-800 font-bold outline-none resize-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(investmentSettings?.realEstateFundingAccount || "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291");
                              alert("Administrative Wire Coordinates copied!");
                            }}
                            className="px-4 py-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-black rounded-none cursor-pointer transition-all"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-1.5">
                      1. Specify Funding Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 font-mono">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        required
                        value={investInputAmount}
                        onChange={(e) => setInvestInputAmount(e.target.value)}
                        className="w-full p-4 pl-9 rounded-none bg-white text-slate-900 outline-none border-2 border-slate-300 font-black text-sm focus:border-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-1.5">
                      2. Payment Reference / Wire Memo / Hash
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={fundingTab === "bitcoin" ? "Enter BTC transaction hash / TxID" : "Enter Wire Reference Code / Memo"}
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      className="w-full p-4 rounded-none bg-white text-slate-900 outline-none border-2 border-slate-300 text-sm font-bold focus:border-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-1.5">
                      3. Drag & Drop Receipt or Ledger Proof
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setReceiptFileName(e.dataTransfer.files[0].name);
                        }
                      }}
                      onClick={() => {
                        const fileInput = document.createElement("input");
                        fileInput.type = "file";
                        fileInput.accept = ".pdf,.jpg,.jpeg,.png";
                        fileInput.onchange = (e: any) => {
                          if (e.target.files && e.target.files[0]) {
                            setReceiptFileName(e.target.files[0].name);
                          }
                        };
                        fileInput.click();
                      }}
                      className={`p-5 rounded-none border-2 border-dashed text-center cursor-pointer transition-all ${
                        receiptFileName
                          ? "border-emerald-500 bg-emerald-50 text-slate-900"
                          : dragOver
                            ? "border-slate-900 bg-slate-100 text-slate-900"
                            : "border-slate-300 bg-slate-50 text-slate-600 hover:border-slate-900"
                      }`}
                    >
                      {receiptFileName ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-black uppercase text-emerald-600">File Attached Successfully</span>
                          <span className="text-xs text-slate-700 font-mono">📄 {receiptFileName}</span>
                          <span className="text-xs text-slate-500 underline mt-1 font-bold">Click to re-upload receipt</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-black uppercase text-slate-900">Drag & Drop Receipt</span>
                          <span className="text-xs text-slate-500 font-bold">or click to browse from system</span>
                          <span className="text-[10px] text-slate-400 font-bold">Supports PDF, JPG, PNG up to 10MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-red hover:bg-[#A93226] text-white text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-slate-900 shadow-lg"
                  >
                    Submit Manual Funding Proof <ArrowUpRight size={14} className="stroke-[3]" />
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-slate-700 font-black uppercase tracking-wider block mb-1.5">
                      {fundingTab === "portfolio" 
                        ? "2. Clear Investment Amount (Debit liquid checked route)" 
                        : fundingTab === "properties" 
                          ? "2. Clear Allocation Amount (Debit liquid checked route)" 
                          : "Clear Procurement Amount (Debit liquid checked route)"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 font-mono">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={investInputAmount}
                        onChange={(e) => setInvestInputAmount(e.target.value)}
                        className="w-full p-4 pl-9 rounded-none bg-white text-slate-900 outline-none border-2 border-slate-300 font-black text-sm focus:border-slate-900 transition-all"
                      />
                    </div>
                    
                    {investInputAmount && !isNaN(parseFloat(investInputAmount)) && parseFloat(investInputAmount) > 0 && (
                      <div className="mt-3 p-3.5 rounded-none border-2 border-slate-900 bg-slate-50 text-xs font-mono space-y-1.5 text-slate-600">
                        <div className="flex justify-between">
                          <span>Principal Amount:</span>
                          <span className="text-slate-900 font-black">{fmtMoney(parseFloat(investInputAmount))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+{activeBoostRate.toFixed(1)}% Instant Booster:</span>
                          <span className="text-amber-600 font-black">+{fmtMoney((parseFloat(investInputAmount) * activeBoostRate) / 100)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-black text-slate-900">
                          <span>Total Account Growth:</span>
                          <span className="text-slate-900 text-sm font-black">{fmtMoney(parseFloat(investInputAmount) * (1 + activeBoostRate / 100))}</span>
                        </div>
                      </div>
                    )}
     
                    <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-bold">
                      <span>Available Checked Pool:</span>
                      <span className="font-black text-slate-900">{fmtMoney(user.balance)} USD</span>
                    </div>
                  </div>
     
                  <button
                    type="submit"
                    className="w-full py-4 bg-brand-red hover:bg-[#A93226] text-white text-xs tracking-widest font-black uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-slate-900 shadow-lg"
                  >
                    Clear Capital Allocation <ArrowUpRight size={14} className="stroke-[3]" />
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* SECURE TRANSACTION PIN CHALLENGE OVERLAY MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="w-full max-w-md p-6 bg-white border-2 border-slate-900 text-slate-800 rounded-none shadow-2xl relative">
            <button
              onClick={() => {
                setIsPinModalOpen(false);
                setPinActionCallback(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-none hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-brand-red/10 text-brand-red rounded-none border border-brand-red/30">
                <KeyRound size={32} className="stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-slate-900">
                  Security PIN Required
                </h3>
                <p className="text-xs mt-2 text-slate-500 font-bold">
                  Enter your 4-digit security PIN to authorize the investment transaction of <span className="font-black text-slate-900">{fmtMoney(pinModalAmount)}</span>.
                </p>
              </div>

              <div className="w-full space-y-4">
                <div className="relative">
                  <input
                    type={showPinValue ? "text" : "password"}
                    maxLength={4}
                    placeholder="••••"
                    value={enteredPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setEnteredPin(val);
                      setPinError("");
                    }}
                    className={`w-full p-4 rounded-none text-center text-xl font-black tracking-[0.5em] font-mono outline-none border-2 ${
                      pinError 
                        ? "border-rose-600 bg-rose-50 text-rose-600" 
                        : "bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinValue(!showPinValue)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPinValue ? "Hide PIN" : "Show PIN"}
                  >
                    {showPinValue ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {pinError && (
                  <p className="text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-none">
                    {pinError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsPinModalOpen(false);
                      setPinActionCallback(null);
                    }}
                    className="flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-none border-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (enteredPin.length < 4) {
                        setPinError("Please enter your complete 4-digit PIN.");
                        return;
                      }
                      if (enteredPin !== user.pin) {
                        setPinError("Security clearance error: Transaction PIN invalid.");
                        return;
                      }
                      setIsPinModalOpen(false);
                      if (pinActionCallback) {
                        pinActionCallback();
                      }
                      setPinActionCallback(null);
                    }}
                    className="flex-1 py-3 bg-brand-red hover:bg-[#A93226] text-white font-black text-xs uppercase tracking-wider rounded-none transition-all shadow-lg border-2 border-slate-900"
                  >
                    Authorize
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
