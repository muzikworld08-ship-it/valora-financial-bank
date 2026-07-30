import React, { useState, useEffect, useCallback } from "react";
import { AppState, UserProfile, BankTransaction, DirectNotification, InvestmentSettings, InvestmentInquiry } from "./types";
import {
  seedState,
  getStoredState,
  setStoredState,
  uid,
  fmtMoney,
  fmtDay,
  generateTransactionId,
  generateSecureOTP,
  sha256,
  resolveSecureUSIP,
  getUSNYTime,
} from "./utils";

function runCompoundingOnAppState(s: AppState): AppState {
  const now = new Date();
  const nowTime = now.getTime();
  
  // Get admin settings
  const settings = s.investmentSettings || {
    portfolioDailyPercentage: 1.5,
    portfolioDurationDays: 30,
    bitcoinDailyPercentage: 2.0,
    bitcoinDurationDays: 30,
    instantFundingBonusPercentage: 5.0,
    thirdPartyTransactionsDisabled: true,
    bitcoinFundingAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    realEstateFundingAccount: "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291",
  };

  const newNotifications: DirectNotification[] = [];

  const updatedUsers = (s.users || []).map((u) => {
    // Determine last run or default
    const lastRunStr = (u as any).lastInterestRun || u.createdAt || new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const lastRunParsed = new Date(lastRunStr).getTime();
    
    const elapsedMs = nowTime - lastRunParsed;
    const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
    
    if (elapsedDays <= 0) return u;

    let investmentBalanceChanged = false;
    let btcBalanceChanged = false;

    // 1. Compound Investments
    const updatedList = (u.investmentsList || []).map((inv) => {
      if (inv.status !== "ACTIVE") return inv;
      
      const creationTime = new Date(inv.date).getTime();
      const ageDays = (nowTime - creationTime) / (1000 * 60 * 60 * 24);
      const daysInvestedAlready = (lastRunParsed - creationTime) / (1000 * 60 * 60 * 24);
      const totalDaysCap = settings.portfolioDurationDays;
      
      // Calculate how many days we can compound interest in this window
      const daysPossible = Math.max(0, totalDaysCap - Math.max(0, daysInvestedAlready));
      const daysToCompound = Math.min(elapsedDays, daysPossible);
      
      if (daysToCompound > 0) {
        const dailyRate = settings.portfolioDailyPercentage;
        // Compound daily rate exponentially: supports positive (growth) and negative (decline)
        const newValue = inv.currentValue * Math.pow(1 + dailyRate / 100, daysToCompound);
        
        investmentBalanceChanged = true;
        return {
          ...inv,
          currentValue: Math.round(newValue * 100) / 100
        };
      }
      return inv;
    });

    // 2. Compound Bitcoin
    let newBtcBalance = u.bitcoinBalance || 0;
    if (newBtcBalance > 0) {
      const btcDailyRate = settings.bitcoinDailyPercentage;
      // Compound daily rate exponentially: supports positive (growth) and negative (decline)
      newBtcBalance = newBtcBalance * Math.pow(1 + btcDailyRate / 100, elapsedDays);
      btcBalanceChanged = true;
    }

    if (investmentBalanceChanged || btcBalanceChanged) {
      const activeInvBal = updatedList
        .filter(inv => inv.status === "ACTIVE")
        .reduce((sum, inv) => sum + inv.currentValue, 0);

      const invChange = activeInvBal - (u.investmentBalance || 0);
      const btcChange = newBtcBalance - (u.bitcoinBalance || 0);
      const netChangeUSD = invChange + (btcChange * 64250);

      if (netChangeUSD > 0.01) {
        // Profit notification
        const profitNotif: DirectNotification = {
          id: "NOTIF-PROF-AUTO-" + Math.floor(100000 + Math.random() * 900000),
          userId: u.id,
          title: "💰 Sovereign Profit Distribution",
          body: `Excellent news! Your private portfolio completed an automated compounding yields settlement. Total profit generated: +${fmtMoney(netChangeUSD)} USD has been compounded into your active balances.`,
          date: now.toISOString(),
          read: false
        };
        newNotifications.push(profitNotif);
        
        const mktNotif: DirectNotification = {
          id: "NOTIF-MKT-AUTO-" + Math.floor(100000 + Math.random() * 900000),
          userId: u.id,
          title: "📈 Automated Market Adjustment",
          body: `Notice: System executed standard 24h market index compound step. Portfolio daily rate: +${settings.portfolioDailyPercentage.toFixed(2)}%, Bitcoin daily rate: +${settings.bitcoinDailyPercentage.toFixed(2)}%.`,
          date: now.toISOString(),
          read: false
        };
        newNotifications.push(mktNotif);
      }

      return {
        ...u,
        bitcoinBalance: btcBalanceChanged ? (Math.round(newBtcBalance * 100000) / 100000) : u.bitcoinBalance,
        investmentBalance: activeInvBal,
        investmentsList: updatedList,
        notifications: [
          ...newNotifications.filter(n => n.userId === u.id),
          ...(u.notifications || [])
        ],
        lastInterestRun: now.toISOString()
      } as any;
    }

    return {
      ...u,
      lastInterestRun: now.toISOString()
    } as any;
  });

  return {
    ...s,
    users: updatedUsers,
    notifications: [...newNotifications, ...(s.notifications || [])]
  };
}

// Components
import { PublicWebsite } from "./components/PublicWebsite";
import { LoginScreen } from "./components/LoginScreen";
import { AdminDashboard } from "./components/AdminDashboard";
import { Header } from "./components/Header";
import { AccountStatusGate } from "./components/AccountStatusGate";
import { BalanceCard } from "./components/BalanceCard";
import { ActionRow } from "./components/ActionRow";
import { QuickTransfer } from "./components/QuickTransfer";
import { BottomNav } from "./components/BottomNav";
import { Sheet } from "./components/Sheet";
import { PrimaryButton } from "./components/PrimaryButton";
import { Preloader } from "./components/Preloader";
import { ValoraLogo } from "./components/ValoraLogo";
import { LanguageSelector } from "./components/LanguageSelector";

// Screen layouts
import { ActivityScreen } from "./components/ActivityScreen";
import { TransferScreen } from "./components/TransferScreen";
import { CardsScreen } from "./components/CardsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { InvestmentsScreen } from "./components/InvestmentsScreen";
import { PayBillsScreen } from "./components/PayBillsScreen";
import { BankingMenu } from "./components/BankingMenu";
import { TransactionReceiptModal } from "./components/TransactionReceiptModal";
import { TransactionOTPVerification } from "./components/TransactionOTPVerification";
import { CookieConsent } from "./components/CookieConsent";

// Icons 
import { Wallet, Receipt, RefreshCw, ShieldCheck, Settings, MessageCircle, Copy, Check, Users, MapPin, Calendar, Bell, LogOut } from "lucide-react";

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ active: boolean; message: string; subMessage?: string } | null>(null);
  const [customAlert, setCustomAlert] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    (window as any).alert = (message: string) => {
      setCustomAlert({ title: "Sovereign Portal Notice", message });
    };
  }, []);

  // Update body class list dynamically to adjust Tawk.to chat widget positioning
  useEffect(() => {
    if (!state) {
      document.body.classList.add("public-active");
      document.body.classList.remove("portal-active");
      return;
    }
    const currentUser = state.users.find((u) => u.id === state.activeUserId);
    const isPortalActive = state.activeUserId !== null && !state.isAdminView && currentUser && currentUser.accountStatus !== "Frozen" && currentUser.accountStatus !== "Blocked";

    if (isPortalActive) {
      document.body.classList.add("portal-active");
      document.body.classList.remove("public-active");
    } else {
      document.body.classList.add("public-active");
      document.body.classList.remove("portal-active");
    }
  }, [state, state?.activeUserId, state?.isAdminView]);

  // Active view tab inside User Portal: "home" | "activity" | "transfer" | "cards" | "profile"
  const [activeTab, setActiveTab ] = useState<string>("home");
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Sheets triggers
  const [showPortalLogin, setShowPortalLogin] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showBankingMenu, setShowBankingMenu] = useState(false);
  const [showIrsRefundSheet, setShowIrsRefundSheet] = useState(false);
  const [irsRefundAmount, setIrsRefundAmount] = useState("");
  const [irsCheckNum, setIrsCheckNum] = useState("");
  const [showLoanSheet, setShowLoanSheet] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanType, setLoanType] = useState("Corporate Line");
  const [showAddBen, setShowAddBen] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  // Holding fields for drawers
  const [topUpAmount, setTopUpAmount] = useState("");
  const [newBenName, setNewBenName] = useState("");
  const [newBenAcc, setNewBenAcc] = useState("");
  const [copied, setCopied] = useState(false);

  // Dynamic selected shortcut payee
  const [preselectedPayee, setPreselectedPayee] = useState<any>(null);

  // Selected transaction receipt modal overlay
  const [activeReceiptTx, setActiveReceiptTx] = useState<BankTransaction | null>(null);

  // Secure Transaction Verification System states
  const [verifyingTxId, setVerifyingTxId] = useState<string | null>(null);
  const [smtpConfigured, setSmtpConfigured] = useState<boolean | null>(null);
  const [currentRawOtp, setCurrentRawOtp] = useState<string>("");
  const lastLocalUpdate = React.useRef<number>(0);

  // Persistent storage synchronous updates
  const persist = useCallback(async (next: AppState) => {
    try {
      await setStoredState(next);
    } catch (e) {
      console.error("Storage write failed", e);
    }
  }, []);

  // Hydrate initial database or fallback value
  useEffect(() => {
    let active = true;
    
    // Safety fallback timer: if the backend load-state takes more than 3.5 seconds,
    // load the fallback state so the user is never stuck on a blank/loader screen!
    const safetyTimeout = setTimeout(() => {
      if (active) {
        console.warn("Backend loading took too long. Initializing with local seed state to prevent hanging.");
        setState((prev) => {
          if (!prev) {
            return seedState();
          }
          return prev;
        });
        setLoading(false);
      }
    }, 3500);

    (async () => {
      try {
        const leftAt = localStorage.getItem("session_left_at");
        if (leftAt) {
          const elapsed = Date.now() - parseInt(leftAt, 10);
          if (elapsed > 5 * 60 * 1000) {
            console.log("Session expired: user left the site for more than 5 minutes.");
            localStorage.removeItem("session_user_id");
            localStorage.removeItem("session_is_admin");
            fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          }
          localStorage.removeItem("session_left_at");
        }

        const stored = await getStoredState();
        if (active) {
          clearTimeout(safetyTimeout);
          if (stored) {
            const combined = { ...seedState(), ...stored };
            const compounded = runCompoundingOnAppState(combined);
            setState(compounded);
            // Only save back if there is a difference to avoid loop writes
            if (compounded.users && stored.users && JSON.stringify(compounded.users) !== JSON.stringify(stored.users)) {
              await setStoredState(compounded);
            }
          } else {
            // No stored state exists on the backend (first time boot only). Seeding initial ledger.
            const fresh = seedState();
            setState(fresh);
            // Persist the starting database to the Express backend file immediately
            await setStoredState(fresh);
          }
        }
      } catch (err) {
        console.warn("Could not load database. Running on local state seeds as fallback to preserve database:", err);
        if (active) {
          setState((prev) => {
            if (!prev) {
              return seedState();
            }
            return prev;
          });
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Multi-device synchronization loop (Real-time sync between Desktop, Laptop, and Mobiles)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (Date.now() - lastLocalUpdate.current < 5000) {
        return;
      }
      try {
        const stored = await getStoredState();
        if (stored) {
          setState((prev) => {
            if (!prev) return stored;
            // Compare central DB properties (excluding local-only browser states)
            const prevDB = JSON.stringify({
              users: prev.users,
              transactions: prev.transactions,
              loans: prev.loans,
              supportTickets: prev.supportTickets,
              investmentInquiries: prev.investmentInquiries,
              announcements: prev.announcements,
              investmentSettings: prev.investmentSettings
            });
            const nextDB = JSON.stringify({
              users: stored.users,
              transactions: stored.transactions,
              loans: stored.loans,
              supportTickets: stored.supportTickets,
              investmentInquiries: stored.investmentInquiries,
              announcements: stored.announcements,
              investmentSettings: stored.investmentSettings
            });

            if (prevDB !== nextDB) {
              return {
                ...prev,
                users: stored.users,
                transactions: stored.transactions,
                loans: stored.loans || prev.loans,
                supportTickets: stored.supportTickets || prev.supportTickets,
                investmentInquiries: stored.investmentInquiries || prev.investmentInquiries,
                announcements: stored.announcements || prev.announcements,
                investmentSettings: stored.investmentSettings || prev.investmentSettings
              };
            }
            return prev;
          });
        }
      } catch (error) {
        console.warn("Background cross-device synchronizer failed:", error);
      }
    }, 2500); // Poll once every 2.5 seconds for instant live multi-device syncing

    return () => clearInterval(syncInterval);
  }, []);

  // Idle session timer: 5 minutes of inactivity signs out the user portal session
  useEffect(() => {
    if (!state?.activeUserId || state?.isAdminView) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 5 minutes timer (300,000 milliseconds)
      timeoutId = setTimeout(() => {
        handleSignOut();
        // Friendly notice to inform customer
        setTimeout(() => {
          alert("Security Notice: Your portal session has been signed out due to 5 minutes of inactivity. Please re-authenticate.");
        }, 1500);
      }, 5 * 60 * 1000);
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    const eventHandler = () => {
      resetTimer();
    };

    events.forEach((name) => {
      window.addEventListener(name, eventHandler);
    });

    // Start timer on mount
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((name) => {
        window.removeEventListener(name, eventHandler);
      });
    };
  }, [state?.activeUserId, state?.isAdminView]);

  // Auto logout when user leaves the website (tab hidden) with 5-minute persistent login
  useEffect(() => {
    let visibilityTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      const activeId = localStorage.getItem("session_user_id");
      const isAdmin = localStorage.getItem("session_is_admin");

      if (document.visibilityState === "hidden") {
        if (activeId && !isAdmin) {
          // Record leaving timestamp
          localStorage.setItem("session_left_at", Date.now().toString());

          // Start 5-minute auto-logout timer
          if (visibilityTimeout) clearTimeout(visibilityTimeout);
          visibilityTimeout = setTimeout(() => {
            console.log("Auto-logging out due to tab being hidden for 5 minutes.");
            localStorage.removeItem("session_user_id");
            localStorage.removeItem("session_is_admin");
            fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
            setState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                activeUserId: null,
                isAdminView: false,
              };
            });
            setShowPortalLogin(false);
          }, 5 * 60 * 1000); // 5 minutes
        }
      } else if (document.visibilityState === "visible") {
        // Clear active timer
        if (visibilityTimeout) {
          clearTimeout(visibilityTimeout);
          visibilityTimeout = null;
        }

        // Check if elapsed time has already exceeded 5 minutes
        const leftAt = localStorage.getItem("session_left_at");
        if (leftAt) {
          const elapsed = Date.now() - parseInt(leftAt, 10);
          if (elapsed > 5 * 60 * 1000) {
            console.log("Auto-logging out because user returned after 5 minutes.");
            localStorage.removeItem("session_user_id");
            localStorage.removeItem("session_is_admin");
            fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
            setState((prev) => {
              if (!prev) return null;
              return {
                ...prev,
                activeUserId: null,
                isAdminView: false,
              };
            });
            setShowPortalLogin(false);
          }
          localStorage.removeItem("session_left_at");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimeout) clearTimeout(visibilityTimeout);
    };
  }, []);

  // Dispatcher for consolidated local updates
  const update = useCallback((updater: AppState | ((prev: AppState) => AppState)) => {
    lastLocalUpdate.current = Date.now();
    setState((prev) => {
      if (!prev) return prev;
      const next = typeof updater === "function" ? updater(prev) : updater;
      setTimeout(() => {
        setStoredState(next).catch((e) => console.error("Async setStoredState failed", e));
      }, 0);
      return next;
    });
  }, []);

  const handleSetDarkMode = (val: boolean | ((p: boolean) => boolean)) => {
    // Force light themes
    update((s) => ({ ...s, darkMode: false }));
  };

  const dark = false;
  const currentUser = state?.users?.find((u) => u.id === state?.activeUserId);

  // SECURITY ACTIONS FOR USER ROUTE
  
  const handleUserLogin = (userId: string) => {
    setActionLoading({
      active: true,
      message: "Authorizing Private Wealth Portal...",
      subMessage: "Syncing secure ledger records and active accounts."
    });
    localStorage.setItem("session_user_id", userId);
    localStorage.setItem("session_is_admin", "false");
    setTimeout(() => {
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeUserId: userId,
          isAdminView: false,
        };
      });
      setActiveTab("home");
      setActionLoading(null);
    }, 1200);
  };

  const handleEnterAdminCabin = () => {
    setActionLoading({
      active: true,
      message: "Opening Executive Admin Control Cabin...",
      subMessage: "Verifying administrative digital keys and database tables."
    });
    localStorage.setItem("session_user_id", "ADMIN");
    localStorage.setItem("session_is_admin", "true");
    setTimeout(() => {
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeUserId: null,
          isAdminView: true,
        };
      });
      setActionLoading(null);
    }, 1400);
  };

  const handleSignOut = async () => {
    setActionLoading({
      active: true,
      message: "Terminating Secure Session...",
      subMessage: "Purging transient identity tokens and local browser cache."
    });
    try {
      localStorage.removeItem("session_user_id");
      localStorage.removeItem("session_is_admin");
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Session termination request omitted.", err);
    }
    setTimeout(() => {
      setState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          activeUserId: null,
          isAdminView: false,
        };
      });
      setShowPortalLogin(false);
      setActionLoading(null);
    }, 1100);
  };

  const handleSwitchTab = (newTab: string) => {
    let msg = "Loading Secure Banking Services...";
    let sub = "Retrieving encrypted balances and ledger metrics.";
    if (newTab === "cards") {
      msg = "Syncing Card Security Registers...";
      sub = "Connecting with primary payment processing token relays.";
    } else if (newTab === "activity") {
      msg = "Compiling Financial Statement...";
      sub = "Retrieving certified audit ledgers for the requested period.";
    } else if (newTab === "transfer") {
      msg = "Initializing Wire Routing Engine...";
      sub = "Configuring recipient routing keys and compliance pipelines.";
    } else if (newTab === "profile") {
      msg = "Securing Identity Keys...";
      sub = "Loading biometric preferences and safe transaction guidelines.";
    }

    setActionLoading({
      active: true,
      message: msg,
      subMessage: sub
    });
    setTimeout(() => {
      setActiveTab(newTab);
      setActionLoading(null);
    }, 900);
  };

  const handleUpdatePin = (newPin: string) => {
    if (!currentUser) return;
    update((s) => {
      const users = s.users.map((u) =>
        u.id === currentUser.id ? { ...u, pin: newPin } : u
      );
      return { ...s, users };
    });
  };

  const handleUpdateProfilePhoto = (newPhotoBase64: string) => {
    if (!currentUser) return;
    update((s) => {
      const users = s.users.map((u) =>
        u.id === currentUser.id ? { ...u, avatarUrl: newPhotoBase64 } : u
      );
      return { ...s, users };
    });
    if (newPhotoBase64) {
      alert("Asset Profile Picture saved! Your identity photo has been stored and synchronized automatically in the Los Angeles central database.");
    } else {
      alert("Asset Profile Picture removed automatically from the Los Angeles database.");
    }
  };

  const handleToggleFreezeCard = () => {
    if (!currentUser) return;
    update((s) => {
      const users = s.users.map((u) =>
        u.id === currentUser.id ? { ...u, cardFrozen: !u.cardFrozen } : u
      );
      return { ...s, users };
    });
  };

  // FUNDS ACTIONS DISPATCHED BY END USERS

  const handleTopUpAmount = () => {
    const amt = parseFloat(topUpAmount);
    if (!currentUser || !amt || amt <= 0) return;

    update((s) => {
      // 1. Credit balance
      const users = s.users.map((u) =>
        u.id === currentUser.id ? { ...u, balance: u.balance + amt } : u
      );

      // 2. Add an approved transaction (instantly approved since it is external input credit)
      const transactions: BankTransaction[] = [
        {
          id: "tx-" + uid(),
          fromUserId: "EXTERNAL",
          toUserId: currentUser.id,
          fromName: "Capital Wallet Deposit",
          toName: currentUser.name,
          fromAccountNumber: "EXT-8820",
          toAccountNumber: currentUser.accountNumber,
          amount: amt,
          note: "Self Liquid Funding Gate",
          date: new Date().toISOString(),
          status: "Approved",
        },
        ...s.transactions,
      ];

      return { ...s, users, transactions };
    });

    setTopUpAmount("");
    setShowTopUp(false);
  };

  const handleIrsRefundProcess = (amount: number, checkNum: string) => {
    if (!currentUser || amount <= 0) return;
    update((s) => {
      const users = s.users.map((u) =>
        u.id === currentUser.id ? { ...u, balance: u.balance + amount } : u
      );
      const transactions: BankTransaction[] = [
        {
          id: "HMRC-TAX-" + uid().toUpperCase(),
          fromUserId: "EXTERNAL",
          toUserId: currentUser.id,
          fromName: "HM Revenue & Customs (HMRC)",
          toName: currentUser.name,
          fromAccountNumber: "HMRC-TREASURY-" + checkNum,
          toAccountNumber: currentUser.accountNumber,
          amount: amount,
          note: `HM Treasury Tax Refund Clearance - Ref #${checkNum}`,
          date: new Date().toISOString(),
          status: "Approved",
          transactionType: "Government Credit Refund",
          recipientBank: "Valora Financial Bank",
          fromBank: "HM Treasury Clearing Bank",
          timeZone: "EST (UTC-5)",
          processingFee: 0,
          serviceCharge: 0,
          totalAmount: amount,
          ipAddress: resolveSecureUSIP()
        },
        ...s.transactions,
      ];
      return { ...s, users, transactions };
    });
  };

  const handleSovereignLoanDispatched = (amount: number, loanType: string) => {
    if (!currentUser || amount <= 0) return;
    update((s) => {
      const newLoan = {
        id: "LOAN-" + uid().toUpperCase(),
        userId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        loanType: loanType,
        amount: amount,
        status: "Pending" as const,
        date: new Date().toISOString()
      };
      const updatedLoans = s.loans ? [...s.loans, newLoan] : [newLoan];
      return { ...s, loans: updatedLoans };
    });
  };

  const handleUnifiedTransactionInitiated = async (newTx: BankTransaction) => {
    if (!currentUser) return;

    if (newTx.isInvestmentFunding) {
      const currentEST = getUSNYTime();
      const directTx: BankTransaction = {
        ...newTx,
        status: "Pending",
        verificationStatus: "Verified",
        auditLog: [
          ...(newTx.auditLog || []),
          `${currentEST} | Investment manual funding submitted. OTP verification bypassed.`
        ]
      };

      update((s) => ({
        ...s,
        transactions: [directTx, ...s.transactions]
      }));
      return;
    }

    // Generate secure OTP
    const rawOtp = generateSecureOTP();
    const hashedOtp = await sha256(rawOtp);
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const currentEST = getUSNYTime();

    // Force status to "Pending OTP"
    const otpTx: BankTransaction = {
      ...newTx,
      status: "Pending OTP",
      verificationStatus: "Awaiting Verification",
      verificationAttempts: 0,
      verificationCodeHash: hashedOtp,
      verificationExpiresAt: otpExpiryTime,
      auditLog: [
        ...(newTx.auditLog || []),
        `${currentEST} | Security Status: [PENDING OTP VERIFICATION]. Ledger lock active.`,
        `${currentEST} | One-Time-Password (OTP) generated & encrypted in state. Expiry: 5 mins.`
      ]
    };

    update((s) => ({
      ...s,
      transactions: [otpTx, ...s.transactions]
    }));

    // Open verification modal
    setVerifyingTxId(newTx.id);
    setCurrentRawOtp(rawOtp);

    // Deliver actual physical email
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          otp: rawOtp,
          amount: newTx.amount,
          toName: newTx.toName,
          toAccountNumber: newTx.toAccountNumber,
          recipientBank: newTx.recipientBank || "Valora Financial Bank",
          transactionId: newTx.id
        })
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSmtpConfigured(!data.deliveredLocally);
        }
      })
      .catch(err => console.error("Error sending OTP email:", err));
    } catch (e) {
      console.error("Error dispatching OTP:", e);
    }
  };

  const handleSendTransactionEnqueued = async ({
    toUserId,
    toName,
    toAccountNumber,
    amount,
    note,
    save,
    recipientBank,
    customType,
    customFee,
    customAuditLog,
  }: {
    toUserId: string;
    toName: string;
    toAccountNumber: string;
    amount: number;
    note: string;
    save: boolean;
    recipientBank?: string;
    customType?: string;
    customFee?: number;
    customAuditLog?: string[];
  }) => {
    if (!currentUser) return;

    // 1. Generate unique random transaction ID securely checking existing entries
    const ip = resolveSecureUSIP();
    const nextId = "TX-" + uid().toUpperCase();

    // 2. Generate secure OTP and cryptographic hash (SHA-256)
    const rawOtp = generateSecureOTP();
    const hashedOtp = await sha256(rawOtp);
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // exactly 5 minutes expiry

    // 3. Prepare transaction ready for compliance and enqueued directly under "Pending OTP" status
    const pFee = customFee !== undefined ? customFee : (Math.round(amount * 0.001 * 100) / 100 || 1.50);
    const sCharge = 0.50;
    const totalAmt = amount + pFee + sCharge;
    const tZ = "America/New_York";
    const currentEST = getUSNYTime();

    const initAuditLog = customAuditLog && customAuditLog.length > 0 ? customAuditLog : [
      `${currentEST} | Secure transaction proposed. IP route checked: ${ip}.`,
      `${currentEST} | Security Status: [PENDING OTP VERIFICATION]. Ledger lock active.`,
      `${currentEST} | One-Time-Password (OTP) generated & encrypted in state. Expiry: 5 mins.`
    ];

    const newTx: BankTransaction = {
      id: nextId,
      fromUserId: currentUser.id,
      toUserId,
      fromName: currentUser.name,
      toName,
      fromAccountNumber: currentUser.accountNumber,
      toAccountNumber,
      amount,
      note,
      date: new Date().toISOString(),
      status: "Pending OTP", // Direct pending compliance clearance
      fromBank: "Valora Financial Bank",
      recipientBank: recipientBank || "Valora Financial Bank",
      processingFee: pFee,
      serviceCharge: sCharge,
      totalAmount: totalAmt,
      timeZone: tZ,
      transactionType: customType || "Sovereign Wire Transfer",
      auditLog: initAuditLog,
      verificationStatus: "Awaiting Verification",
      verificationAttempts: 0,
      verificationCodeHash: hashedOtp,
      verificationExpiresAt: otpExpiryTime,
      ipAddress: ip,
      transactionTime: new Date().toISOString()
    };

    update((s) => {
      // Lock sender funds by debiting sender balance immediately
      const users = s.users.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, balance: u.balance - amount };
        }
        return u;
      });

      const transactions: BankTransaction[] = [
        newTx,
        ...s.transactions,
      ];

      return { ...s, users, transactions };
    });

    // 4. Open OTP Verification screen overlay
    setVerifyingTxId(nextId);
    setCurrentRawOtp(rawOtp);

    // 6. Deliver actual physical email to the customer's verified address instantly via SMTP secure node
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          otp: rawOtp,
          amount,
          toName,
          toAccountNumber,
          recipientBank: recipientBank || "Valora Financial Bank",
          transactionId: nextId
        })
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.deliveredLocally) {
          console.log("Local secure gateway delivery loop active.");
          setSmtpConfigured(false);
        } else {
          console.log("Real OTP email sent successfully:", data);
          setSmtpConfigured(true);
        }
      })
      .catch((err) => {
        console.error("Failed to make POST request to /api/send-otp:", err);
      });
    } catch (e) {
      console.error("Error dispatching OTP email request:", e);
    }
  };

  // Submit verification code challenge check in App.tsx
  const handleVerifyOTP = async (code: string): Promise<boolean> => {
    if (!verifyingTxId || !state || !currentUser) return false;

    const matchedTx = state.transactions.find((t) => t.id === verifyingTxId);
    if (!matchedTx) return false;

    // Is it expired?
    if (matchedTx.verificationExpiresAt && new Date() > new Date(matchedTx.verificationExpiresAt)) {
      return false;
    }

    // Hash the entered OTP and compare it against the stored hash
    const enteredHash = await sha256(code);
    const isMatched = enteredHash === matchedTx.verificationCodeHash;

    if (isMatched) {
      // 1. Mark as verified and transition to completed successful state
      const finalTxId = matchedTx.id; // Keep consistent transaction ID
      const realTime = new Date().toISOString();
      const currentEST = getUSNYTime(realTime);
      
      update((s) => {
        // Step A: Update transaction status, timestamps, and audit log
        const transactions = s.transactions.map((t) => {
          if (t.id === verifyingTxId) {
            const freshAuditLog = [
              ...(t.auditLog || []),
              `${currentEST} | OTP verification successful. Challenge matched.`,
              `${currentEST} | Cryptographic OTP token burned to prevent replay attacks.`,
              `${currentEST} | Transaction approved & executed immediately. Settle state committed.`
            ];
            return {
              ...t,
              status: "Completed" as const, // goes directly to Completed
              verificationStatus: "Verified" as const,
              verificationTime: realTime,
              date: realTime,
              auditLog: freshAuditLog
            };
          }
          return t;
        });

        // Step B: Credit the recipient balance immediately (if internal)
        let users = s.users.map((u) => {
          if (u.id === matchedTx.toUserId) {
            return { ...u, balance: (u.balance || 0) + matchedTx.amount };
          }
          return u;
        });

        // Step C: Push real-time in-app alerts to both parties
        const notifications = [
          {
            id: "notif-" + uid(),
            userId: matchedTx.toUserId,
            title: "Cleared wire received",
            body: `${matchedTx.fromName} sent you ${parseFloat(matchedTx.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })}. Status: Cleared.`,
            read: false,
            date: new Date().toISOString(),
          },
          {
            id: "notif-" + uid(),
            userId: matchedTx.fromUserId,
            title: "Transaction Cleared",
            body: `Your transfer of ${parseFloat(matchedTx.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })} to ${matchedTx.toName} was successfully authorized and completed.`,
            read: false,
            date: new Date().toISOString(),
          },
          ...s.notifications,
        ];

        return { ...s, transactions, users, notifications };
      });

      // Deliver transaction confirmation email instantly
      try {
        fetch("/api/send-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            email: currentUser.email,
            amount: matchedTx.amount,
            toName: matchedTx.toName,
            toAccountNumber: matchedTx.toAccountNumber,
            recipientBank: matchedTx.recipientBank || "Valora Financial Bank",
            transactionId: finalTxId,
            note: matchedTx.note,
            transactionType: matchedTx.transactionType
          })
        }).catch(err => console.error("Error sending confirmation email:", err));
      } catch (e) {
        console.error("Failed to fetch /api/send-confirmation:", e);
      }

      // Close verification states with smooth transition delay so user can see approved status first
      setTimeout(() => {
        setVerifyingTxId(null);
        setCurrentRawOtp("");

        // Trigger standard receipt overlay popup after a small transition delay
        setTimeout(() => {
          update((s) => {
            const validatedTx = s.transactions.find((t) => t.id === finalTxId);
            if (validatedTx) {
              setActiveReceiptTx(validatedTx);
            }
            return s;
          });
        }, 150);
      }, 2200);

      return true;
    } else {
      // 2. Errored code. Record + Increment verification attempts count
      const currentAttempts = (matchedTx.verificationAttempts || 0) + 1;
      const isLocked = currentAttempts >= 3; // Maximum of 3 incorrect attempts before requiring a new OTP

      update((s) => {
        const transactions = s.transactions.map((t) => {
          if (t.id === verifyingTxId) {
            const currentEST = getUSNYTime();
            const logLines = [
              ...(t.auditLog || []),
              `${currentEST} | Security Alert: Inbound verification failed. Attempts: ${currentAttempts}/3.`
            ];
            if (isLocked) {
              logLines.push(`${currentEST} | MAXIMUM SECURITY COMPROMISE: Locked transaction drafts for fraud prevention. Attempts limit exceeded.`);
            }

            return {
              ...t,
              verificationAttempts: currentAttempts,
              verificationStatus: isLocked ? "Locked" as const : "Awaiting Verification" as const,
              status: isLocked ? "Failed" as const : "Pending OTP" as const,
              auditLog: logLines
            };
          }
          return t;
        });

        // Refund balances back if brute force locked
        let users = s.users;
        if (isLocked) {
          users = s.users.map((u) => {
            if (u.id === matchedTx.fromUserId) {
              const isLiquidation = matchedTx.transactionType?.toLowerCase().includes("liquidation");
              if (isLiquidation) {
                return { ...u, balance: Math.max(0, u.balance - matchedTx.amount) };
              } else {
                return { ...u, balance: u.balance + matchedTx.amount };
              }
            }
            return u;
          });
        }

        return { ...s, transactions, users };
      });

      if (isLocked) {
        // Auto-close secure email notification details after lock
        setVerifyingTxId(null);
        setCurrentRawOtp("");
      }

      return false;
    }
  };

  // Resend security OTP code in App.tsx
  const handleResendOTP = async () => {
    if (!verifyingTxId || !state || !currentUser) return;

    const matchedTx = state.transactions.find((t) => t.id === verifyingTxId);
    if (!matchedTx) return;

    const rawOtp = generateSecureOTP();
    setCurrentRawOtp(rawOtp);
    const hashedOtp = await sha256(rawOtp);
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // fresh 10 mins

    update((s) => {
      const transactions = s.transactions.map((t) => {
        if (t.id === verifyingTxId) {
          return {
            ...t,
            verificationCodeHash: hashedOtp,
            verificationExpiresAt: newExpiry,
            verificationAttempts: 0, // Reset attempts on resend
            auditLog: [
              ...(t.auditLog || []),
              `${getUSNYTime()} | Secure resend triggered. Reissued fresh digital OTP signature.`,
              `${getUSNYTime()} | Expiry reset to 10 minutes. Attempts count purged.`
            ]
          };
        }
        return t;
      });
      return { ...s, transactions };
    });

    // Send real-time OTP to Gmail/Email address provided via the backend secure route on resend
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          otp: rawOtp,
          amount: matchedTx.amount,
          toName: matchedTx.toName,
          toAccountNumber: matchedTx.toAccountNumber,
          recipientBank: matchedTx.recipientBank,
          transactionId: verifyingTxId
        })
      })
      .then((r) => r.json())
      .then((data) => {
        if (data.deliveredLocally) {
          console.log("Local secure gateway delivery loop active.");
          setSmtpConfigured(false);
        } else {
          console.log("Real OTP email sent successfully:", data);
          setSmtpConfigured(true);
        }
      })
      .catch((err) => {
        console.error("Failed to make POST request to /api/send-otp on resend:", err);
      });
    } catch (e) {
      console.error("Error dispatching OTP email request on resend:", e);
    }
  };

  // Cancel OTP code and release ledger balance holds
  const handleCancelVerification = () => {
    if (!verifyingTxId || !state) return;
    const txId = verifyingTxId;

    update((s) => {
      const tx = s.transactions.find((t) => t.id === txId);
      if (!tx) return s;

      // Bidirectional refund checking balances immediately to void hold
      const users = s.users.map((u) => {
        if (u.id === tx.fromUserId) {
          const isLiquidation = tx.transactionType?.toLowerCase().includes("liquidation");
          if (isLiquidation) {
            return { ...u, balance: Math.max(0, u.balance - tx.amount) };
          } else {
            return { ...u, balance: u.balance + tx.amount };
          }
        }
        return u;
      });

      // Filter out this unverified draft item
      const transactions = s.transactions.filter((t) => t.id !== txId);

      return { ...s, users, transactions };
    });

    setVerifyingTxId(null);
    setCurrentRawOtp("");
  };

  const handleSubmitLoanApplication = useCallback(({ name, email, loanType, amount }: { name: string; email: string; loanType: string; amount: number }) => {
    update((s) => {
      const newLoan = {
        id: "loan-" + uid(),
        userId: s.activeUserId || undefined,
        name,
        email: email.toLowerCase().trim(),
        loanType,
        amount,
        status: "Pending" as const,
        date: new Date().toISOString()
      };
      return {
        ...s,
        loans: [...(s.loans || []), newLoan]
      };
    });
  }, [update]);

  const handleSubmitSupportTicket = useCallback(({ name, email, subject, message }: { name: string; email: string; subject: string; message: string }) => {
    update((s) => {
      const newTicket = {
        id: "tkt-" + uid(),
        userId: s.activeUserId || undefined,
        name,
        email: email.toLowerCase().trim(),
        subject,
        message,
        status: "Open" as const,
        date: new Date().toISOString()
      };
      return {
        ...s,
        supportTickets: [...(s.supportTickets || []), newTicket]
      };
    });
  }, [update]);

  const handleResolveLoan = useCallback((loanId: string, status: "Approved" | "Declined") => {
    update((s) => {
      const updatedLoans = (s.loans || []).map((l) => {
        if (l.id === loanId) {
          // If approved, let's find if a user with this email exists and add the money to their balance!
          if (status === "Approved") {
            const user = s.users.find((u) => u.email.toLowerCase().trim() === l.email.toLowerCase().trim());
            if (user) {
              const parsedAmt = parseFloat(l.amount.toString()) || 0;
              user.balance = (user.balance || 0) + parsedAmt;
              
              // Add a transaction for the loan payout in exact schema conformity
              const tx: BankTransaction = {
                id: "DISB-" + uid().toUpperCase(),
                fromUserId: "EXTERNAL",
                toUserId: user.id,
                fromName: "Sovereign Treasury Vault",
                toName: user.name,
                fromAccountNumber: "US-TREASURY-01",
                toAccountNumber: user.accountNumber,
                amount: parsedAmt,
                note: `${l.loanType} Disbursements`,
                date: new Date().toISOString(),
                status: "Successful",
                transactionType: "Credit Line Disbursement",
                recipientBank: "Valora Financial Bank",
                fromBank: "Sovereign US Credit Corp",
                timeZone: "EST (UTC-5)",
                processingFee: 0,
                serviceCharge: 0,
                totalAmount: parsedAmt,
                ipAddress: resolveSecureUSIP()
              };
              s.transactions = [tx, ...s.transactions];

              // Add a notification
              const notif = {
                id: "notif-" + uid(),
                userId: user.id,
                title: `${l.loanType} Payout Success`,
                body: `An amount of ${parsedAmt.toLocaleString("en-US", { style: "currency", currency: "USD" })} was credited for your approved loan coordinates.`,
                read: false,
                date: new Date().toISOString()
              };
              s.notifications = [notif, ...s.notifications];
            }
          }
          return { ...l, status };
        }
        return l;
      });
      return { ...s, loans: updatedLoans };
    });
  }, [update]);

  const handleResolveTicket = useCallback((ticketId: string, status: "Resolved") => {
    update((s) => {
      const updatedTickets = (s.supportTickets || []).map((t) => {
        if (t.id === ticketId) {
          // Send notification if user exists
          const user = s.users.find((u) => u.email.toLowerCase().trim() === t.email.toLowerCase().trim());
          if (user) {
            const notif = {
              id: "notif-" + uid(),
              userId: user.id,
              title: `Support Ticket Resolved`,
              body: `Your ticket regarding "${t.subject}" has been marked as resolved by an administrator.`,
              read: false,
              date: new Date().toISOString()
            };
            s.notifications = [notif, ...s.notifications];
          }
          return { ...t, status };
        }
        return t;
      });
      return { ...s, supportTickets: updatedTickets };
    });
  }, [update]);

  const handlePublishAnnouncement = useCallback((text: string) => {
    update((s) => {
      const now = new Date();
      const timestamp = now.toISOString();
      const currentEST = getUSNYTime(timestamp);

      // Create a direct notification for every user profile
      const userProfiles = s.users || [];
      const newNotifications: DirectNotification[] = [];

      const updatedUsers = userProfiles.map((u) => {
        const notif: DirectNotification = {
          id: "NOTIF-ANN-" + Math.floor(100000 + Math.random() * 900000),
          userId: u.id,
          title: "📢 Global Sovereign Security Advisory",
          body: text,
          date: timestamp,
          read: false
        };
        newNotifications.push(notif);

        return {
          ...u,
          notifications: [notif, ...(u.notifications || [])]
        };
      });

      // Dispatch secure outbound SMTP alert triggers to user emails
      userProfiles.forEach((u) => {
        try {
          fetch("/api/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: u.id,
              email: u.email,
              otp: "[ANN]",
              amount: 0,
              toName: u.name,
              toAccountNumber: u.accountNumber,
              recipientBank: "Valora Sovereign Advisory Notification",
              transactionId: "ANNOUNCEMENT-ALERT"
            })
          }).catch(err => console.log("Notification routing relay:", err));
        } catch (e) {
          console.log("Notification SMTP routing error:", e);
        }
      });

      return {
        ...s,
        announcements: [...(s.announcements || []), text],
        users: updatedUsers,
        notifications: [...newNotifications, ...(s.notifications || [])]
      };
    });
  }, [update]);

  const handleTriggerManualMarketFluctuation = useCallback(() => {
    update((s) => {
      const settings = s.investmentSettings || {
        portfolioDailyPercentage: 1.5,
        portfolioDurationDays: 30,
        bitcoinDailyPercentage: 2.0,
        bitcoinDurationDays: 30,
        instantFundingBonusPercentage: 5.0,
        thirdPartyTransactionsDisabled: true,
        bitcoinFundingAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        realEstateFundingAccount: "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291",
        portfolioFundingAccount: "Valora Global Investment Group - Citibank NA - A/C 482937492",
      };

      const portfolioRate = settings.portfolioDailyPercentage;
      const btcRate = settings.bitcoinDailyPercentage;
      const nextDate = new Date().toISOString();
      const currentEST = getUSNYTime();

      const newTransactions: BankTransaction[] = [];
      const newNotifications: DirectNotification[] = [];

      const updatedUsers = (s.users || []).map((u) => {
        let investmentBalanceChanged = false;
        let btcBalanceChanged = false;

        // 1. Compound Investments
        const updatedList = (u.investmentsList || []).map((inv) => {
          if (inv.status !== "ACTIVE") return inv;
          
          // Apply exactly 1-day (24h) compounding based on currentValue
          const newValue = inv.currentValue * (1 + portfolioRate / 100);
          investmentBalanceChanged = true;
          return {
            ...inv,
            currentValue: Math.round(newValue * 100) / 100
          };
        });

        // 2. Compound Bitcoin
        const originalBtc = u.bitcoinBalance || 0;
        let newBtcBalance = originalBtc;
        if (originalBtc > 0) {
          newBtcBalance = originalBtc * (1 + btcRate / 100);
          btcBalanceChanged = true;
        }

        if (investmentBalanceChanged || btcBalanceChanged) {
          const nextInvBal = updatedList
            .filter(inv => inv.status === "ACTIVE")
            .reduce((sum, inv) => sum + inv.currentValue, 0);

          const invChange = nextInvBal - (u.investmentBalance || 0);
          const btcChange = newBtcBalance - originalBtc;
          
          // Calculate net change in USD equivalent for audit and ledger logs (using current BTC benchmark value of ~$64,250)
          const netChangeUSD = invChange + (btcChange * 64250);

          // 1. Market Change Alert Notification
          const mktNotif: DirectNotification = {
            id: "NOTIF-MKT-" + Math.floor(100000 + Math.random() * 900000),
            userId: u.id,
            title: "📈 Market Adjustment Event",
            body: `Global Clearinghouse has adjusted compounding indices. Standard Portfolio daily rate is set to ${portfolioRate >= 0 ? '+' : ''}${portfolioRate.toFixed(2)}% and Sovereign Bitcoin is set to ${btcRate >= 0 ? '+' : ''}${btcRate.toFixed(2)}%. Your balances have updated dynamically.`,
            date: nextDate,
            read: false
          };
          newNotifications.push(mktNotif);

          // 2. Profit Alert Notification (if they get profit)
          if (netChangeUSD > 0.01) {
            const profitNotif: DirectNotification = {
              id: "NOTIF-PROF-" + Math.floor(100000 + Math.random() * 900000),
              userId: u.id,
              title: "💰 Sovereign Profit Distribution",
              body: `Excellent news! Your private portfolio has completed a yields settlement. Total profit generated: +${fmtMoney(netChangeUSD)} USD has been compounded into your active balances.`,
              date: nextDate,
              read: false
            };
            newNotifications.push(profitNotif);
          } else if (netChangeUSD < -0.01) {
            const correctionNotif: DirectNotification = {
              id: "NOTIF-MKT-CORR-" + Math.floor(100000 + Math.random() * 900000),
              userId: u.id,
              title: "📉 Portfolio Market Correction",
              body: `Notice: Market indices experienced a correction step. Your active portfolio balance adjusted by -${fmtMoney(Math.abs(netChangeUSD))} USD in compliance with standard market fluctuations.`,
              date: nextDate,
              read: false
            };
            newNotifications.push(correctionNotif);
          }

          // Generate a professional ledger transaction record for compliance audit
          if (Math.abs(netChangeUSD) >= 0.01) {
            const tx: BankTransaction = {
              id: "VFB-MKT-" + Math.floor(100000 + Math.random() * 900000),
              fromUserId: "SYSTEM",
              toUserId: u.id,
              fromName: "Global Securities Market",
              toName: u.name,
              fromAccountNumber: "SYSTEM-MARKET-NODE",
              toAccountNumber: u.accountNumber,
              amount: Math.round(Math.abs(netChangeUSD) * 100) / 100,
              note: `Automated 24h market fluctuation step applied. Portfolio rate: ${portfolioRate >= 0 ? '+' : ''}${portfolioRate}%. Bitcoin rate: ${btcRate >= 0 ? '+' : ''}${btcRate}%.`,
              date: nextDate,
              status: "Completed",
              transactionType: "Market Fluctuation",
              recipientBank: "Valora Premium Custody Services",
              fromBank: "Global Sovereign Clearinghouse",
              processingFee: 0,
              totalAmount: Math.round(Math.abs(netChangeUSD) * 100) / 100,
              auditLog: [
                `${currentEST} | Applied 24-hour market compounding index step.`,
                `${currentEST} | Portfolio delta: ${invChange >= 0 ? '+' : ''}${fmtMoney(invChange)}. Bitcoin delta: ${btcChange >= 0 ? '+' : ''}${btcChange.toFixed(5)} BTC.`
              ]
            };
            newTransactions.push(tx);
          }

          const userSpecificNotifs = newNotifications.filter(n => n.userId === u.id);

          return {
            ...u,
            bitcoinBalance: btcBalanceChanged ? (Math.round(newBtcBalance * 100000) / 100000) : u.bitcoinBalance,
            investmentBalance: nextInvBal,
            investmentsList: updatedList,
            notifications: [...userSpecificNotifs, ...(u.notifications || [])],
            lastInterestRun: nextDate
          };
        }

        return u;
      });

      return {
        ...s,
        users: updatedUsers,
        transactions: [...newTransactions, ...(s.transactions || [])],
        notifications: [...newNotifications, ...(s.notifications || [])]
      };
    });
  }, [update]);

  const handleApproveInquiry = useCallback((inquiryId: string, customDetails: { accountNumber: string; passwordText: string }) => {
    update((s) => {
      const inquiries = s.investmentInquiries || [];
      const inquiry = inquiries.find(i => i.id === inquiryId);
      if (!inquiry) return s;

      const timestamp = getUSNYTime();
      const startingBalance = 0;
      const startingInv = 0;
      const startingBtc = 0;

      const enabledAccounts: ("checking" | "investment" | "bitcoin")[] = ["checking"];
      if (inquiry.route === "Bitcoin") enabledAccounts.push("bitcoin");
      if (inquiry.route === "Real Estate" || inquiry.route === "Standard Yield") enabledAccounts.push("investment");

      const investmentsList: any[] = [];

      const generatedUser: UserProfile = {
        id: "user-" + uid(),
        name: inquiry.name,
        email: inquiry.email,
        password: customDetails.passwordText,
        pin: inquiry.pin,
        accountNumber: customDetails.accountNumber,
        balance: startingBalance,
        bitcoinBalance: startingBtc,
        investmentBalance: startingInv,
        investmentsList: investmentsList,
        cardNum: "4000 " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000),
        cardExpiry: "12/31",
        cardFrozen: false,
        cardLimit: 150000,
        cardSpent: 0,
        location: inquiry.location,
        createdAt: new Date().toISOString(),
        accountStatus: "Active",
        enabledAccounts,
        emailVerified: true,
        isEmailVerified: true,
        auditLog: [
          `${timestamp} | Account created via Direct Sovereign Investment Inquiry (${inquiry.route}).`,
          `${timestamp} | Initialized checking: $0.00, Investment: $0.00, Bitcoin: 0.00000 BTC. Starting balances initialized at zero. Capital deposits require manual bank payment verification.`
        ]
      };

      const updatedInquiries = inquiries.map(i => {
        if (i.id === inquiryId) {
          return {
            ...i,
            status: "Approved" as const,
            createdAccount: {
              accountNumber: customDetails.accountNumber,
              passwordText: customDetails.passwordText,
              pin: inquiry.pin
            }
          };
        }
        return i;
      });

      const welcomeNotification = {
        id: "notif-" + uid(),
        userId: generatedUser.id,
        title: "🛡️ Sovereign Account Approved",
        body: `Welcome ${generatedUser.name}! Your direct investment portal for ${inquiry.route} has been authorized. Your accounts are active with a starting balance of $0.00. Please proceed to perform a manual capital payment / wire transfer to fund your portfolio.`,
        read: false,
        date: new Date().toISOString()
      };

      return {
        ...s,
        users: [...s.users, generatedUser],
        investmentInquiries: updatedInquiries,
        notifications: [welcomeNotification, ...(s.notifications || [])]
      };
    });
  }, [update]);

  const handleSubmitInvestmentInquiry = useCallback(({ name, email, location, pin, passwordText, route, amount }: {
    name: string;
    email: string;
    location: string;
    pin: string;
    passwordText?: string;
    route: "Bitcoin" | "Real Estate" | "Standard Yield" | "Other";
    amount: number;
  }) => {
    if (state) {
      const emailLower = email.toLowerCase().trim();
      const userExists = state.users.some(u => u.email.toLowerCase().trim() === emailLower);
      const inquiryExists = state.investmentInquiries?.some(i => i.email.toLowerCase().trim() === emailLower);
      if (userExists || inquiryExists) {
        alert("Registration Error: An account or pending onboarding request is already linked to this email address.");
        return false;
      }
    }

    update((s) => {
      const inqId = "inq-" + uid();
      const newInquiry: InvestmentInquiry = {
        id: inqId,
        name,
        email: email.toLowerCase().trim(),
        location,
        pin,
        passwordText,
        route,
        amount,
        status: "Pending",
        date: new Date().toISOString()
      };

      const newTicket = {
        id: "tkt-" + uid(),
        name,
        email: email.toLowerCase().trim(),
        subject: `Sovereign Onboarding: ${route} Route (${fmtMoney(amount)})`,
        message: `Sovereign Onboarding Inquiry Details:\nName: ${name}\nEmail: ${email.toLowerCase().trim()}\nLocation: ${location}\nRequested Asset Route: ${route}\nCapital Allocation: ${fmtMoney(amount)}\nSecurity PIN: ${pin}\nDesired Password: ${passwordText || "Not specified"}\n\n[ONBOARDING_INQUIRY_ID:${inqId}]`,
        status: "Open" as const,
        date: new Date().toISOString()
      };

      return {
        ...s,
        investmentInquiries: [...(s.investmentInquiries || []), newInquiry],
        supportTickets: [...(s.supportTickets || []), newTicket]
      };
    });
  }, [update, state]);

  // ADMIN PERSPECTIVE MODIFIERS

  const handleAdminRegisterProfile = (created: UserProfile) => {
    if (state) {
      const emailLower = created.email.toLowerCase().trim();
      const duplicate = state.users.some(u => u.email.toLowerCase().trim() === emailLower);
      if (duplicate) {
        alert(`Admin Error: A user profile with the email "${created.email}" is already registered. Duplicate account creation aborted.`);
        return;
      }
    }

    const firstNames = [
      "Maria", "David", "James", "John", "Robert", "Michael", "William", "Mary", "Patricia", "Jennifer", 
      "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", 
      "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Melissa", 
      "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", 
      "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Samantha", "Katherine", "Emma", "Ruth", "Christine", 
      "Catherine", "Debra", "Rachel", "Carolyn", "Janet", "Virginia", "Heather", "Diane", "Julie", "Joyce", 
      "Victoria", "Olivia", "Kelly", "Christina", "Lauren", "Joan", "Evelyn", "Judith", "Megan", "Cheryl", 
      "Andrea", "Hannah", "Jane", "Jack", "Christopher", "Thomas", "Daniel", "Matthew", "Anthony", "Mark", 
      "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Edward", 
      "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Stephen"
    ];
    const lastNames = [
      "Rodriguez", "Anderson", "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", 
      "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", 
      "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", 
      "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", 
      "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", 
      "Gomez", "Phillips", "Evans", "Diaz", "Leonard", "Parker", "Cruz", "Edwards", "Collins", "Reyes", 
      "Stewart", "Morris", "Morales", "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", 
      "Peterson", "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Cox", "Ward", "Richardson", "Watson"
    ];

    const transactionTemplates = [
      { type: "Credit", note: "Private loan payback disbursement", baseAmount: 12500 },
      { type: "Debit", note: "Consulting retainer payout", baseAmount: 4500 },
      { type: "Credit", note: "Co-venture dividend payout", baseAmount: 25000 },
      { type: "Debit", note: "Vintage timepiece acquisition settlement", baseAmount: 18505 },
      { type: "Credit", note: "Real estate investment returns redistribution", baseAmount: 35000 },
      { type: "Debit", note: "Legal Advisory retainer fee", baseAmount: 6000 },
      { type: "Credit", note: "Venture debt financing clearance", baseAmount: 55000 },
      { type: "Debit", note: "Private charter transportation flight reimbursement", baseAmount: 12500 },
      { type: "Credit", note: "Sovereign index hedge payout sweep", baseAmount: 42000 },
      { type: "Debit", note: "Artwork auction co-investment escrow settlement", baseAmount: 28000 },
      { type: "Credit", note: "Professional advisory services compensation", baseAmount: 8500 },
      { type: "Debit", note: "Commercial real estate lease contract", baseAmount: 15000 },
      { type: "Credit", note: "Sovereign treasury interest payout", baseAmount: 9400 },
      { type: "Debit", note: "Strategic management consulting settlement", baseAmount: 11500 },
      { type: "Credit", note: "Asset buyout equity disbursement", baseAmount: 85000 },
      { type: "Debit", note: "System administration and licensing allocation", baseAmount: 3200 },
      { type: "Credit", note: "Trust clearance legacy payment", baseAmount: 65000 },
      { type: "Debit", note: "Bespoke design commission invoice", baseAmount: 7500 }
    ];

    const startMs = new Date(created.createdAt || new Date()).getTime();
    const endMs = new Date().getTime();
    const count = 18;
    const diff = Math.max(endMs - startMs, 12 * 60 * 60 * 1000); // minimum 12 hours span

    const generatedTxList: BankTransaction[] = [];

    // Helper to get random item from array
    const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    for (let i = 0; i < count; i++) {
      // Linearly space the transactions from start to end
      const progress = i / (count - 1);
      // Add random small hours/minutes offset to make it look organic
      const jitter = (Math.random() - 0.5) * (diff / count) * 0.5;
      let txTimeMs = startMs + progress * diff + jitter;

      // Classify boundaries
      if (txTimeMs < startMs) txTimeMs = startMs + i * 1000 * 60 * 10;
      if (txTimeMs > endMs) txTimeMs = endMs - (count - 1 - i) * 1000 * 60 * 10;

      const txDate = new Date(txTimeMs).toISOString();

      // Human Names Generation
      const fName = getRandom(firstNames);
      const lName = getRandom(lastNames);
      const fullName = `${fName} ${lName}`;

      const template = transactionTemplates[i % transactionTemplates.length];
      const isCredit = template.type === "Credit";

      // Slight random variation of value
      const rawAmt = template.baseAmount;
      const amount = Math.round((rawAmt * (0.85 + Math.random() * 0.3)) * 100) / 100;

      // Unique format for Transaction Id VFB-YYYYMMDD-XXXXXX
      const targetDate = new Date(txTimeMs);
      const yyyy = targetDate.getUTCFullYear();
      const mm = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(targetDate.getUTCDate()).padStart(2, "0");
      const txId = `VFB-${yyyy}${mm}${dd}-${Math.floor(100000 + Math.random() * 900000)}`;

      const externalAcc = `CH${Math.floor(10 + Math.random()*90)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`;
      const randomBank = getRandom([
        "JP Morgan Chase", "Citibank NA", "Goldman Sachs Bank", "Bank of America", 
        "Wells Fargo", "HSBC Private Bank", "Morgan Stanley", "Barclays Bank", 
        "Deutsche Bank"
      ]);

      generatedTxList.push({
        id: txId,
        fromUserId: isCredit ? "EXTERNAL" : created.id,
        toUserId: isCredit ? created.id : "EXTERNAL",
        fromName: isCredit ? fullName : created.name,
        toName: isCredit ? created.name : fullName,
        fromAccountNumber: isCredit ? externalAcc : created.accountNumber,
        toAccountNumber: isCredit ? created.accountNumber : externalAcc,
        amount: amount,
        note: `${template.note} via ${fullName}`,
        date: txDate,
        status: "Successful" as const,
        recipientBank: isCredit ? "Valora Financial Bank" : randomBank,
        fromBank: isCredit ? randomBank : "Valora Financial Bank",
        timeZone: "CET (UTC+1)",
        processingFee: 0,
        serviceCharge: 0,
        totalAmount: amount,
        transactionType: isCredit ? "Deposit Credit Wire" : "Sovereign Debit Outflow",
        ipAddress: `193.134.254.${Math.floor(1 + Math.random() * 254)}`
      });
    }

    // Sort generated transactions reverse-chronologically so newest are at the top
    generatedTxList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    update((s) => ({
      ...s,
      users: [...s.users, created],
      transactions: [...generatedTxList, ...s.transactions]
    }));
  };

  const handleAdminUpdateUser = (userId: string, changes: Partial<UserProfile>) => {
    update((s) => {
      const oldUser = s.users.find((user) => user.id === userId);
      const isStatusChanging = changes.accountStatus && oldUser?.accountStatus !== changes.accountStatus;
      
      const users = s.users.map((u) => (u.id === userId ? { ...u, ...changes } : u));
      let notifications = s.notifications || [];

      if (isStatusChanging && (changes.accountStatus === "Frozen" || changes.accountStatus === "Blocked")) {
        const titleText = `SecOps Regulatory Notification: Account ${changes.accountStatus}`;
        const bodyText = `ALERT ID SEC-${uid().slice(0, 5).toUpperCase()}: ${
          changes.accountStatusReason || "Your account has been restricted due to financial security review."
        } Action Needed: ${
          changes.accountStatusUnblockInstruction || "Please connect with compliance support to resolve."
        }`;

        const notif: DirectNotification = {
          id: "notif-" + uid(),
          userId,
          title: titleText,
          body: bodyText,
          read: false,
          date: new Date().toISOString(),
        };
        notifications = [notif, ...notifications];
      } else if (isStatusChanging && changes.accountStatus === "Active") {
        const notif: DirectNotification = {
          id: "notif-" + uid(),
          userId,
          title: "Valora Security Bulletin: Account Re-activated",
          body: "Verification audit resolved cleanly. Account restriction removed. Private banking privileges and transfer features are fully restored.",
          read: false,
          date: new Date().toISOString(),
        };
        notifications = [notif, ...notifications];
      }

      return { ...s, users, notifications };
    });
  };

  const handleAdminDeleteUser = (userId: string) => {
    update((s) => ({
      ...s,
      users: s.users.filter((u) => u.id !== userId),
    }));
  };

  const handleAdminUpdateTransaction = (txId: string, changes: Partial<BankTransaction>) => {
    update((s) => {
      const transactions = s.transactions.map((tx) => (tx.id === txId ? { ...tx, ...changes } : tx));
      return { ...s, transactions };
    });
  };

  const handleAdminDirectWire = ({
    targetAccNum,
    amount,
    type,
    note,
    category = "checking",
  }: {
    targetAccNum: string;
    amount: number;
    type: "Credit" | "Debit";
    note: string;
    category?: "checking" | "investment" | "bitcoin";
  }): boolean => {
    let success = true;

    update((s) => {
      const targetUser = s.users.find((u) => u.accountNumber === targetAccNum);
      if (!targetUser) {
        success = false;
        return s;
      }

      // Check specific segment holdings for debit
      const currentValOfCategory = 
        category === "checking" ? targetUser.balance :
        category === "investment" ? (targetUser.investmentBalance || 0) :
        (targetUser.bitcoinBalance || 0) * 68500;

      if (type === "Debit" && currentValOfCategory < amount) {
        success = false;
        return s;
      }

      // Modify selected sub-account balance segment
      const users = s.users.map((u) => {
        if (u.id === targetUser.id) {
          const delta = type === "Credit" ? amount : -amount;
          if (category === "investment") {
            return {
              ...u,
              investmentBalance: Math.max(0, (u.investmentBalance || 0) + delta)
            };
          } else if (category === "bitcoin") {
            const btcDelta = delta / 68500;
            return {
              ...u,
              bitcoinBalance: Math.max(0, (u.bitcoinBalance || 0) + btcDelta)
             };
          } else {
            return {
              ...u,
              balance: Math.max(0, u.balance + delta)
            };
          }
        }
        return u;
      });

      const segmentLabel = 
        category === "checking" ? "Checking Sourced Route" :
        category === "investment" ? "Investment Account Portfolio" :
        "Sovereign Bitcoin Cold Wallet";

      // Create an approved Transaction instantly
      const transactions: BankTransaction[] = [
        {
          id: "tx-" + uid(),
          fromUserId: type === "Credit" ? "ADMIN" : targetUser.id,
          toUserId: type === "Credit" ? targetUser.id : "ADMIN",
          fromName: type === "Credit" ? `Federal Treasury (${segmentLabel})` : targetUser.name,
          toName: type === "Credit" ? targetUser.name : `System Admin (${segmentLabel})`,
          fromAccountNumber: type === "Credit" ? "SYS-ADMIN" : targetUser.accountNumber,
          toAccountNumber: type === "Credit" ? targetUser.accountNumber : "SYS-ADMIN",
          amount,
          note: note || `Treasury Admin ${type} to ${segmentLabel}`,
          date: new Date().toISOString(),
          status: "Approved",
          transactionType: `System Direct (${segmentLabel})`,
        },
        ...s.transactions,
      ];

      // Add custom alert notification instantly to target
      const notifications: DirectNotification[] = [
        {
          id: "notif-" + uid(),
          userId: targetUser.id,
          title: type === "Credit" ? `Capital Dispatched: ${category.toUpperCase()}` : `Balance Adjusted: ${category.toUpperCase()}`,
          body: type === "Credit"
            ? `Admin directly credited your ${segmentLabel} with ${parseFloat(amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })}.`
            : `Systems adjusted your ${segmentLabel} balance by ${parseFloat(amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })}. Ref: ${note}.`,
          read: false,
          date: new Date().toISOString(),
        },
        ...s.notifications,
      ];

      return { ...s, users, transactions, notifications };
    });

    return success;
  };

  /**
   * DECIDES UPON A PENDING WIRE REQUESTED BY A USER
   * - Approved: Deducted funds remain safe, and targets get credited! Matches balance changes.
   * - Declined: Return enqueued funds straight back to Sender.
   * - Failed: Return enqueued funds back to Senders, showing error flag.
   */
  const handleResolveTransactionQueue = (
    txId: string,
    resolution: "Approved" | "Declined" | "Failed"
  ) => {
    update((s) => {
      const match = s.transactions.find((tx) => tx.id === txId);
      if (!match) return s;

      const settings = s.investmentSettings || {
        portfolioDailyPercentage: 1.5,
        portfolioDurationDays: 30,
        bitcoinDailyPercentage: 2.0,
        bitcoinDurationDays: 30,
        instantFundingBonusPercentage: 5.0,
        thirdPartyTransactionsDisabled: true,
        bitcoinFundingAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
        realEstateFundingAccount: "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291",
        portfolioFundingAccount: "Valora Global Investment Group - Citibank NA - A/C 482937492",
      };

      const nextDate = new Date().toISOString();
      const matchDateEST = getUSNYTime(match.date);
      const matchPrevEST = getUSNYTime(new Date(new Date(match.date).getTime() - 2000));
      const nextDateEST = getUSNYTime(nextDate);

      const currentAuditLog = match.auditLog || [
        `${matchPrevEST} | Secure session authenticated via 2FA clearance.`,
        `${matchDateEST} | Enqueued in Federal Reserve Ledger compliance queue: status PENDING.`,
      ];
      const nextAuditLog = [
        ...currentAuditLog,
        `${nextDateEST} | Administrative compliance resolution event: Status resolved to ${resolution.toUpperCase()}.`,
        ...(resolution === "Approved"
          ? [`${nextDateEST} | Sovereign clearing cleared. Funds routed to target destination.`]
          : [`${nextDateEST} | Compliance cancel. Funds returned to checking balance.`])
      ];

      // Update tx status, timestamp, and audit logs
      const transactions = s.transactions.map((tx) =>
        tx.id === txId ? { 
          ...tx, 
          status: resolution, 
          date: nextDate,
          auditLog: nextAuditLog 
        } : tx
      );

      let users = [...s.users];
      let notifications = [...s.notifications];

      if (match.isInvestmentFunding) {
        if (resolution === "Approved") {
          users = users.map((u) => {
            if (u.id === match.fromUserId) {
              const bonusPct = settings.instantFundingBonusPercentage || 5.0;
              const bonusAmt = match.amount * (bonusPct / 100);
              const totalUSD = match.amount + bonusAmt;

              if (match.fundingAssetType === "BITCOIN") {
                const btcSpotPrice = 68500;
                const btcPurchased = totalUSD / btcSpotPrice;
                const prevBtc = u.bitcoinBalance || 0;
                return {
                  ...u,
                  bitcoinBalance: Math.round((prevBtc + btcPurchased) * 100000) / 100000
                };
              } else {
                // Real Estate, Stocks, or Bonds
                const prevInvBalance = u.investmentBalance || 0;
                const prevList = u.investmentsList || [];
                const finalAssetType = (match.fundingAssetType === "STOCKS" || match.fundingAssetType === "BONDS")
                  ? match.fundingAssetType
                  : "REAL_ESTATE";

                const newInvestItem = {
                  id: "INV-" + finalAssetType + "-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
                  assetId: match.fundingAssetId || "REAL_ESTATE",
                  assetName: match.fundingAssetName || "Real Estate",
                  assetType: finalAssetType as "STOCKS" | "BONDS" | "REAL_ESTATE",
                  investedAmount: match.amount,
                  currentValue: totalUSD,
                  yieldRate: match.fundingYieldRate || "8.50% Annual Yield",
                  date: new Date().toISOString(),
                  status: "ACTIVE" as const
                };
                return {
                  ...u,
                  investmentBalance: prevInvBalance + totalUSD,
                  investmentsList: [newInvestItem, ...prevList]
                };
              }
            }
            return u;
          });

          notifications = [
            {
              id: "notif-" + uid(),
              userId: match.fromUserId,
              title: "Manual Investment Approved",
              body: `Your manual funding of ${parseFloat(match.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })} for ${match.fundingAssetName || "your asset"} has been approved. Your asset balance has been credited.`,
              read: false,
              date: new Date().toISOString(),
            },
            ...notifications,
          ];
        } else {
          notifications = [
            {
              id: "notif-" + uid(),
              userId: match.fromUserId,
              title: `Investment Funding ${resolution}`,
              body: `Your manual funding request of ${parseFloat(match.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })} for ${match.fundingAssetName || "your asset"} was ${resolution.toLowerCase()} by administrative audit. No checking funds were affected.`,
              read: false,
              date: new Date().toISOString(),
            },
            ...notifications,
          ];
        }
      } else {
        if (resolution === "Approved") {
          // Step A: Sender balance is already debited when enqueued!
          // Step B: Credit the target recipient balance.
          users = users.map((u) => {
            if (u.id === match.toUserId) {
              return { ...u, balance: u.balance + match.amount };
            }
            return u;
          });

          // Step C: Push alerts
          notifications = [
            {
              id: "notif-" + uid(),
              userId: match.toUserId,
              title: "Cleared wire received",
              body: `${match.fromName} sent you ${parseFloat(match.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })}. Status: Cleared.`,
              read: false,
              date: new Date().toISOString(),
            },
            {
              id: "notif-" + uid(),
              userId: match.fromUserId,
              title: "Transaction Cleared",
              body: `Your wire of ${parseFloat(match.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })} to ${match.toName} is approved and released.`,
              read: false,
              date: new Date().toISOString(),
            },
            ...notifications,
          ];
        } else {
          // Declined / Failed -> Refund Senders! Return locked money
          users = users.map((u) => {
            if (u.id === match.fromUserId) {
              return { ...u, balance: u.balance + match.amount };
            }
            return u;
          });

          // Push alert of failed status
          notifications = [
            {
              id: "notif-" + uid(),
              userId: match.fromUserId,
              title: `Transfer ${resolution}`,
              body: `Your transfer of ${parseFloat(match.amount.toString()).toLocaleString("en-US", { style: "currency", currency: "USD" })} to ${match.toName} was ${resolution.toLowerCase()} by administrative audit. Funds returned to checking.`,
              read: false,
              date: new Date().toISOString(),
            },
            ...notifications,
          ];
        }
      }

      return { ...s, users, transactions, notifications };
    });
  };

  const handleAddNewBeneficiaryShortcut = () => {
    if (newBenName.trim().length < 2) return;
    update((s) => {
      const bSet = s.users.find((u) => u.accountNumber === newBenAcc.trim());
      return {
        ...s,
        beneficiaries: [
          ...s.beneficiaries,
          {
            id: "ben-" + uid(),
            name: newBenName.trim(),
            account: newBenAcc.trim(),
          },
        ],
      };
    });
    setNewBenName("");
    setNewBenAcc("");
    setShowAddBen(false);
  };

  const handleAlertsRead = () => {
    if (!currentUser) return;
    update((s) => ({
      ...s,
      notifications: s.notifications.map((n) =>
        n.userId === currentUser.id ? { ...n, read: true } : n
      ),
    }));
  };

  const realignBankingNodeIndex = () => {
    if (confirm("Re-align secure local banking database records to default starting indexes?")) {
      const fresh = seedState();
      update(fresh);
      setActiveTab("home");
    }
  };

  if (loading || !state) {
    return (
      <Preloader
        duration={1200}
        onComplete={() => {
          if (!state) {
            setState(seedState());
          }
          setLoading(false);
        }}
        message="Loading Secure Banking Services..."
        subMessage="Valora Financial Wealth & Custody Gateway"
      />
    );
  }

  // ROUTE SPLITTING RENDERS

  // 1. LOGIN SCREEN ROUTE
  if (!state.isAdminView && state.activeUserId === null) {
    if (!showPortalLogin) {
      return (
        <>
          <PublicWebsite
            onOpenLogin={() => setShowPortalLogin(true)}
            onSubmitLoan={handleSubmitLoanApplication}
            onSubmitTicket={handleSubmitSupportTicket}
            onSubmitInquiry={handleSubmitInvestmentInquiry}
            investmentInquiries={state.investmentInquiries || []}
            announcements={state.announcements || []}
            investmentSettings={state.investmentSettings}
            dark={dark}
          />
          <CookieConsent />
        </>
      );
    }

    return (
      <LoginScreen
        users={state.users}
        onLogin={handleUserLogin}
        onEnterAdmin={handleEnterAdminCabin}
        dark={dark}
        onBack={() => setShowPortalLogin(false)}
      />
    );
  }

  // 2. ADMIN PORTAL WORKSPACE ROUTE
  if (state.isAdminView) {
    return (
      <div className={`min-h-screen ${dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"}`}>
        <AdminDashboard
          users={state.users}
          transactions={state.transactions}
          loans={state.loans || []}
          supportTickets={state.supportTickets || []}
          investmentInquiries={state.investmentInquiries || []}
          announcements={state.announcements || []}
          investmentSettings={state.investmentSettings}
          onAddUser={handleAdminRegisterProfile}
          onUpdateUser={handleAdminUpdateUser}
          onDeleteUser={handleAdminDeleteUser}
          onUpdateTransaction={handleAdminUpdateTransaction}
          onResolveTransaction={handleResolveTransactionQueue}
          onAdminDirectWire={handleAdminDirectWire}
          onResolveLoan={handleResolveLoan}
          onResolveTicket={handleResolveTicket}
          onApproveInquiry={handleApproveInquiry}
          onPublishAnnouncement={handlePublishAnnouncement}
          onUpdateInvestmentSettings={(newSettings) => update((s) => ({ ...s, investmentSettings: newSettings }))}
          onTrigger24hMarketFluctuation={handleTriggerManualMarketFluctuation}
          onSignOut={handleSignOut}
          dark={dark}
        />
      </div>
    );
  }

  // Helper selectors
  if (!currentUser) return null;
  const userNotifications = state.notifications.filter((n) => n.userId === currentUser.id);

  // Gate check for Frozen or Blocked account status
  if (currentUser.accountStatus === "Frozen" || currentUser.accountStatus === "Blocked") {
    return (
      <AccountStatusGate
        user={currentUser}
        onSignOut={handleSignOut}
        onSubmitSupportTicket={handleSubmitSupportTicket}
        dark={dark}
      />
    );
  }

  // 3. SECURE CUSTOMER MOBILE VIEPORT ROUTE
  const customerScreens: { [key: string]: React.ReactNode } = {
    home: (
      <div className="animate-[fadeIn_0.2s_ease-out]">
        <ActionRow
          onTopUp={() => setShowTopUp(true)}
          onSend={() => setActiveTab("transfer")}
          onReceive={() => setShowReceive(true)}
          onMore={() => setShowBankingMenu(true)}
          dark={dark}
        />
        <QuickTransfer
          beneficiaries={state.beneficiaries}
          onAddNew={() => setShowAddBen(true)}
          onViewAll={() => setActiveTab("transfer")}
          onSelectBeneficiary={(p) => {
            setPreselectedPayee(p);
            setActiveTab("transfer");
          }}
          dark={dark}
        />

        {/* Sovereign BillPay Integrated Quick Widget */}
        <div className="px-5 mt-7 select-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[13px] uppercase tracking-widest text-[#C8102E]">
              Sovereign BillPay
            </h3>
            <button
              onClick={() => setActiveTab("paybills")}
              className="text-xs text-gray-800 hover:text-[#C8102E] hover:underline font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
            >
              Open Module
            </button>
          </div>
          <div className="p-4 rounded-[2rem] border border-gray-200 shadow-sm bg-white flex flex-col gap-3.5 transition-all">
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[9px] uppercase font-black text-gray-700 tracking-wider block leading-none">Monthly Bills Spending</span>
                <span className="text-base font-black font-mono mt-1.5 inline-block text-slate-900">
                  {fmtMoney(state.transactions.filter(t => t.id.startsWith("VFB-BP-")).reduce((sum, tx) => sum + tx.amount, 0))}
                </span>
              </div>
              <button
                onClick={() => setActiveTab("paybills")}
                className="px-3.5 py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#A93226] text-white font-black text-[10px] uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Receipt size={11} className="stroke-[2.5]" /> Quick Pay
              </button>
            </div>
            
            {/* Spending limits progress tracker bar */}
            <div>
              <div className="flex justify-between items-center text-[9px] mb-1">
                <span className="text-gray-700 font-bold uppercase tracking-wider">Compliance Limit Pool utilized</span>
                <span className="text-gray-800 font-mono font-black">$10,000.00 max</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
                <div 
                  className="h-full bg-[#C8102E] rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, Math.round((state.transactions.filter(t => t.id.startsWith("VFB-BP-")).reduce((sum, tx) => sum + tx.amount, 0) / 10000) * 100))}%` }}
                />
              </div>
            </div>

            {/* Micro list of upcoming scheduled payments */}
            <div className="p-2.5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-[#C8102E] shrink-0" />
                <span className="text-gray-700 font-bold">
                  AXA Premium Insurance auto-debit
                </span>
              </div>
              <span className="font-mono font-bold text-[#C8102E] shrink-0">June 28 • $240.00</span>
            </div>
          </div>
        </div>

        {/* Real-time statement recents summary nested on main dashboard */}
        <div className="px-5 mt-7 select-none mb-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-[13px] uppercase tracking-widest text-[#C8102E]">
              Live Transactions Queue
            </h3>
            <button
              onClick={() => setActiveTab("activity")}
              className="text-xs text-gray-800 hover:text-[#C8102E] hover:underline font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
            >
              See All Activity
            </button>
          </div>

          <div className="rounded-3xl overflow-hidden border border-gray-200/50 shadow-sm bg-white">
            {state.transactions
              .filter((tx) => tx.fromUserId === currentUser.id || tx.toUserId === currentUser.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((t, idx, arr) => {
                const isRec = t.toUserId === currentUser.id;
                const otherParty = isRec ? t.fromName : t.toName;

                let stateCol = "text-amber-600";
                if (t.status === "Approved" || t.status === "Successful" || t.status === "Completed") stateCol = "text-emerald-600";
                if (t.status === "Declined" || t.status === "Failed") stateCol = "text-rose-600";

                return (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between gap-3 p-4 transition-colors hover:bg-gray-50 ${
                      idx !== arr.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-sm truncate text-slate-950">
                        {otherParty}
                      </p>
                      <p className="text-[10px] text-gray-700 font-semibold truncate mt-0.5">
                        {t.note} · <span className={`font-black uppercase ${stateCol}`}>{t.status}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`font-mono font-black text-sm ${
                        isRec ? "text-emerald-650" : "text-slate-950"
                      }`}>
                        {isRec ? "+" : "-"}{fmtMoney(t.amount)}
                      </p>
                      <span className="text-[9px] text-gray-700 font-mono font-bold block mt-0.5">
                        {new Date(t.date).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}

            {state.transactions.filter((tx) => tx.fromUserId === currentUser.id || tx.toUserId === currentUser.id).length === 0 && (
              <p className="text-xs text-center text-gray-700 font-bold p-8">No transaction logs registered.</p>
            )}
          </div>
        </div>
      </div>
    ),
    investments: (
      <InvestmentsScreen
        user={currentUser}
        dark={dark}
        transactions={state.transactions}
        investmentSettings={state.investmentSettings}
        onUpdateState={(modifier) => update(modifier)}
        onAddTransaction={handleUnifiedTransactionInitiated}
        onAddNotification={(notif) => {
          update((s) => ({
            ...s,
            notifications: [notif, ...s.notifications]
          }));
        }}
      />
    ),
    activity: (
      <ActivityScreen
        currentUserId={currentUser.id}
        transactions={state.transactions}
        dark={dark}
      />
    ),
    transfer: (
      <TransferScreen
        currentUser={currentUser}
        users={state.users}
        beneficiaries={state.beneficiaries}
        onSend={handleSendTransactionEnqueued}
        dark={dark}
        preselectedPayee={preselectedPayee}
        onClearPreselectedPayee={() => setPreselectedPayee(null)}
        investmentSettings={state.investmentSettings}
      />
    ),
    cards: (
      <CardsScreen
        user={currentUser}
        onToggleFreeze={handleToggleFreezeCard}
        transactions={state.transactions}
        dark={dark}
      />
    ),
    profile: (
      <ProfileScreen
        user={currentUser}
        dark={dark}
        setDarkMode={handleSetDarkMode}
        onReset={realignBankingNodeIndex}
        onUpdatePin={handleUpdatePin}
        onUpdateAvatar={handleUpdateProfilePhoto}
      />
    ),
    paybills: (
      <PayBillsScreen
        user={currentUser}
        transactions={state.transactions}
        dark={dark}
        onAddTransaction={(tx) => {
          update((s) => ({
            ...s,
            transactions: [tx as BankTransaction, ...s.transactions]
          }));
        }}
        onDeductBalance={(amt) => {
          update((s) => {
            const users = s.users.map((u) => {
              if (u.id === currentUser.id) {
                return { ...u, balance: Math.max(0, u.balance - amt) };
              }
              return u;
            });
            return { ...s, users };
          });
        }}
        onAddNotification={(title, body) => {
          const newNotif = {
            id: "notif-bill-" + Math.floor(Math.random() * 100000),
            userId: currentUser.id,
            title,
            body,
            read: false,
            date: new Date().toISOString()
          };
          update((s) => ({
            ...s,
            notifications: [newNotif, ...s.notifications]
          }));
        }}
      />
    ),
  };

  const handleCopyAccountString = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUser.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="customer-portal h-screen max-h-screen md:h-[880px] md:max-h-[880px] md:my-8 md:rounded-[3rem] md:border-[10px] md:border-slate-950 max-w-md mx-auto relative bg-white text-slate-900 shadow-2xl flex flex-col overflow-hidden">
      {/* Header bar styled precisely like the uploaded screenshot, now with brand red background */}
      <div className="w-full bg-[#C8102E] border-b border-red-800 px-5 py-4 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          {/* Circular profile image on top of the header on the left with white border */}
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/90 shadow-md shrink-0">
            <img 
              src={currentUser.avatarUrl || "https://www.mrsindiaqueen.com/blog/uploads/images/2024/12/image_750x_676515e9295e5.jpg"} 
              alt={currentUser.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] tracking-[0.2em] font-black uppercase font-sans text-white/80">
                VALORA BANK
              </span>
            </div>
            <p className="text-sm font-black text-white leading-tight">
              {currentUser.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications feed button styled on red backdrop */}
          <button
            onClick={() => setShowNotifs(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center relative transition-all hover:bg-white/20 text-white bg-white/10 border border-white/10 cursor-pointer"
            title="Notifications Feed"
          >
            <Bell size={15} className="text-white" />
            {userNotifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-2.5 right-2.5 bg-amber-400 w-2 h-2 rounded-full animate-pulse" />
            )}
          </button>

          {/* Secure sign-out button styled on red backdrop */}
          <button
            onClick={handleSignOut}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/15 hover:bg-white/25 text-white border border-white/10 cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Notification Strip */}
      <div className="bg-gray-100 border-b border-gray-200/80 px-4 py-2 flex items-center gap-2 w-full shrink-0">
        <span className="px-1.5 py-0.5 rounded bg-[#C8102E] text-[8px] font-black tracking-wider text-white uppercase shrink-0">
          VFB
        </span>
        <span className="text-[9.5px] text-gray-700 italic font-bold leading-tight truncate">
          VFB -Insured — Backed by the full faith and credit of the U.S. Government
        </span>
      </div>

      {/* Main Scrollable View Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 pb-28">
        {activeTab === "home" ? (
          <>
            {/* Account Card (Swipeable Accounts Carousel) - Positioned at the top of the space */}
            <div className="mt-4 mb-4 mx-1">
              <BalanceCard
                user={currentUser}
                balanceVisible={balanceVisible}
                setBalanceVisible={setBalanceVisible}
              />
            </div>

            {/* Branch and Established Info Capsule styled precisely from screenshot */}
            <div className="mx-4 mb-5 bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-sky-500 shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black tracking-wider text-gray-400 uppercase">VAULT BRANCH</p>
                  <p className="text-xs font-bold text-gray-800">{currentUser.location || "London, United Kingdom"}</p>
                </div>
              </div>
              
              <div className="h-8 w-px bg-gray-200" />
              
              <div className="flex items-center gap-3 flex-1 justify-center">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[8px] font-black tracking-wider text-gray-400 uppercase">ESTABLISHED</p>
                  <p className="text-xs font-bold text-gray-800">{currentUser.createdAt || "Jun 10, 2011"}</p>
                </div>
              </div>
            </div>

            {/* Promo Banner */}
            <div className="mx-4 mb-6 rounded-2xl overflow-hidden relative shadow-md border border-[#C8102E]/20 flex items-center justify-between bg-[#C8102E] text-white p-5">
              <div className="z-10 max-w-[70%] text-left">
                <span className="bg-white/20 text-white text-[8px] font-black tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                  VALORA FINANCIAL
                </span>
                <h3 className="text-xs font-black mt-2 leading-snug text-white uppercase tracking-wider">
                  Secure. Private. Sovereign.
                </h3>
                <p className="text-[9.5px] text-white/90 mt-1 leading-relaxed font-semibold">
                  Experience institutional grade wealth management, multi-asset storage, and real-time ledger settlement designed for ultimate privacy.
                </p>
              </div>
              <div className="flex items-center justify-center pr-1.5 z-10 shrink-0">
                <ValoraLogo iconOnly={true} className="w-14 h-14 text-white invert brightness-200 opacity-90" />
              </div>
            </div>

            {/* Checking Screen Active Content / Widgets */}
            {customerScreens.home}

            {/* Footer links */}
            <div className="flex flex-col items-center justify-center gap-4 py-8 mt-10 text-[11px] shrink-0 border-t border-gray-200/40">
              <button 
                onClick={() => alert("Sovereign Mobile Privacy protocols are active under client certificate.")}
                className="text-[#C8102E] hover:text-[#A93226] underline font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
              >
                Mobile Privacy
              </button>
              <span className="text-gray-700 font-extrabold tracking-widest uppercase text-[10px]">
                Member VFB
              </span>
              <button 
                onClick={() => alert("Sovereign Global Privacy & Settlement policies are enqueued in ledger.")}
                className="text-[#C8102E] hover:text-[#A93226] underline font-bold uppercase tracking-wider cursor-pointer bg-transparent border-none outline-none"
              >
                Privacy Policy
              </button>
              <p className="text-[9px] text-gray-700 font-extrabold uppercase tracking-widest mt-3">
                © {new Date().getFullYear()} VALORA FINANCIAL BANK &bull; EQUAL HOUSING LENDER
              </p>
            </div>
          </>
        ) : (
          <div className="pt-2">{customerScreens[activeTab] || customerScreens.home}</div>
        )}
      </div>

      {/* Bottom perspective navigation */}
      <BottomNav
        tab={activeTab}
        setTab={handleSwitchTab}
        dark={dark}
        avatarUrl={currentUser?.avatarUrl}
        user={currentUser}
      />

      {/* SHEETS DRAWERS DIALOG MODALS */}

      {/* 1. TOP UP CAPACITY FUNDS */}
      <Sheet open={showTopUp} onClose={() => setShowTopUp(false)} title="Add Capital Holdings">
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-950 mb-4 flex items-start gap-3">
          <div className="mt-0.5 font-bold uppercase text-[9px] tracking-wider px-1.5 py-0.5 bg-[#C8102E] text-white rounded font-mono">VALORA NOTICE</div>
          <div className="flex-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-[#C8102E]">How to add funds</h5>
            <p className="text-[10px] leading-relaxed text-gray-800 font-bold mt-1">
              Direct self-service credit loading is completed securely from your external bank account. Please use the private credentials listed below to wire funds.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          You may receive funds instantly via interbank digital clearances or wire transfers using your accounts credentials below:
        </p>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 mb-5 select-all">
          <div className="flex justify-between items-center text-[11px] border-b border-slate-200/50 pb-2">
            <span className="text-slate-400 font-mono">BENEFICIARY</span>
            <span className="font-extrabold text-slate-800">{currentUser?.name}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] border-b border-slate-200/50 pb-2">
            <span className="text-slate-400 font-mono font-black uppercase">VALORA UK IBAN</span>
            <span className="font-extrabold text-slate-800 font-mono">GB24 VALO {currentUser?.accountNumber?.slice(0, 4)} {currentUser?.accountNumber?.slice(4, 8)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] border-b border-slate-200/50 pb-2">
            <span className="text-slate-400 font-mono">CLEARING ACC</span>
            <span className="font-extrabold text-slate-800 font-mono">{currentUser?.accountNumber}</span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400 font-mono font-black uppercase">FED WIRE SWIFT</span>
            <span className="font-extrabold text-slate-800 font-mono">VLFIUSNYXXX</span>
          </div>
        </div>
        <PrimaryButton onClick={() => setShowTopUp(false)}>
          Understand Compliance Rule
        </PrimaryButton>
      </Sheet>

      {/* 2. RECEIVE CO-ORDINATES SHEET */}
      <Sheet open={showReceive} onClose={() => setShowReceive(false)} title="Receive Wire Funds">
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Share these secure checking details with other bank clients to receive enqueued wire funds instantly into your checking holdings.
        </p>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-100 dark:border-slate-850 space-y-3.5 mb-5 select-none">
          <div>
            <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Receiving Bank</p>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">VALORA FINANCIAL BANK</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Account Owner Name</p>
            <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{currentUser.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Unique Routing Account Number</p>
              <p className="font-mono font-black text-[#C8102E] text-sm mt-0.5">{currentUser.accountNumber}</p>
            </div>
            <button
              onClick={handleCopyAccountString}
              className="flex items-center gap-1.5 text-[#C8102E] bg-red-50 border border-red-100 px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-red-100 cursor-pointer"
            >
              {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <PrimaryButton onClick={() => setShowReceive(false)}>
          Done
        </PrimaryButton>
      </Sheet>

      {/* 3. EXTRA OPTIONS DETAILS */}
      <Sheet open={showMore} onClose={() => setShowMore(false)} title="Vault Services">
        <div className="grid grid-cols-3 gap-4 pb-4 select-none">
          {[
            { label: "Reserve Rates", action: () => alert("Valora Financial Reserve limits are linked directly to treasury auditing.") },
            { label: "Generate Statement", action: () => alert("Generating monthly bank statements as direct PDF…") },
            { label: "Interest Vaults", action: () => alert("Savings Accounts partition accumulates 12% APY compound.") },
            { label: "Payee shortcut", action: () => { setShowMore(false); setShowAddBen(true); } },
            { label: "Profile", action: () => { setShowMore(false); setActiveTab("profile"); } },
            { label: "Help Center", action: () => { setShowMore(false); setShowSupport(true); } },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 transition-colors text-center cursor-pointer font-bold text-[10.5px] text-slate-700 dark:text-slate-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      </Sheet>

      {/* 4. ADD BENEFICIARY QUICK SHORTCUT SCREEN */}
      <Sheet open={showAddBen} onClose={() => setShowAddBen(false)} title="Register Payee Coordinates">
        <p className="text-xs text-slate-400 mb-4">
          Save account numbers to favorites for easy quick wire access on your main dashboard shortcut roll.
        </p>
        <div className="space-y-3 mb-5">
          <input
            placeholder="Full Name (e.g. Stella Vance)"
            value={newBenName}
            onChange={(e) => setNewBenName(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none border border-transparent focus:border-sky-500 text-xs font-semibold"
          />
          <input
            placeholder="10-Digit Account Number"
            value={newBenAcc}
            onChange={(e) => setNewBenAcc(e.target.value.replace(/\D/g, ""))}
            className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none border border-transparent focus:border-sky-500 text-xs font-semibold"
          />
        </div>
        <PrimaryButton
          disabled={newBenName.trim().length < 2 || newBenAcc.trim().length < 4}
          onClick={handleAddNewBeneficiaryShortcut}
        >
          Confirm Saved payee
        </PrimaryButton>
      </Sheet>

      {/* 5. LIVE NOTIFICATION DISPATCH ALERTS FEED */}
      <Sheet
        open={showNotifs}
        onClose={() => {
          setShowNotifs(false);
          handleAlertsRead();
        }}
        title="Direct Alerts"
      >
        {userNotifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10 font-medium">You're all caught up! No statements enqueued.</p>
        ) : (
          <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
            {userNotifications.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800"
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                  n.read ? "bg-transparent opacity-0" : "bg-[#C8102E] animate-pulse"
                }`} />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                    {n.title}
                  </p>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                  <p className="text-[8.5px] text-slate-400 font-mono mt-1">
                    {new Date(n.date).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" })} · {new Date(n.date).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Sheet>

      {/* 6. SUPPORT BOT */}
      <Sheet open={showSupport} onClose={() => setShowSupport(false)} title="Conversational Help Center">
        <div className="space-y-4 mb-5">
          <div className="flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl select-none leading-relaxed">
            <div className="w-8 h-8 rounded-full bg-[#C8102E] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-extrabold font-mono">VAL</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-900 dark:text-white">Valora Assistant Bot</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                👋 Welcome {currentUser.name}! How can we assist you with your private banking needs today? Our assistance team is available 24/7.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Please let us know if you have any questions. We are dedicated to providing you with premium private banking service. Thank you for choosing Valora.
              </p>
            </div>
          </div>
        </div>
        <PrimaryButton onClick={() => setShowSupport(false)}>
          Return to Dashboard
        </PrimaryButton>
      </Sheet>

      {/* Persistent global action preloader overlay */}
      {actionLoading && actionLoading.active && (
        <Preloader
          duration={1100}
          message={actionLoading.message}
          subMessage={actionLoading.subMessage}
        />
      )}

      {/* Persistent global digital transaction receipt modal overlay */}
      {activeReceiptTx && (
        <TransactionReceiptModal
          transaction={activeReceiptTx}
          onClose={() => setActiveReceiptTx(null)}
          dark={dark}
        />
      )}

      {/* 7. TRANSACTION OTP SECURE VERIFICATION GATEWAY */}
      {verifyingTxId && (() => {
        const matchingTx = state.transactions.find((tx) => tx.id === verifyingTxId);
        if (!matchingTx) return null;
        return (
          <TransactionOTPVerification
            transaction={matchingTx}
            userEmail={currentUser.email}
            dark={dark}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onCancel={handleCancelVerification}
            attemptsCount={matchingTx.verificationAttempts || 0}
            smtpConfigured={smtpConfigured}
            currentRawOtp={currentRawOtp}
          />
        );
      })()}



      {/* 9. HIGH-FIDELITY LUXURY BANKING MENU MODAL OVERLAY */}
      <BankingMenu
        open={showBankingMenu}
        onClose={() => setShowBankingMenu(false)}
        user={currentUser}
        dark={dark}
        onSelectTab={setActiveTab}
        onOpenTopUp={() => setShowTopUp(true)}
        onOpenLoan={() => setShowLoanSheet(true)}
        onOpenIrsRefund={() => setShowIrsRefundSheet(true)}
        onSignOut={handleSignOut}
      />

      {/* 10. HMRC REVENUE REFUND PROCESSING LEDGER OVERLAY */}
      <Sheet open={showIrsRefundSheet} onClose={() => setShowIrsRefundSheet(false)} title="HMRC Tax Refund Clearance">
        <p className="text-xs text-slate-500 mb-3 ml-0.5 leading-relaxed">
          Sovereign Clearing Gateway for UK HMRC Tax Credits. Enter coordinates:
        </p>
        <div className="space-y-3 mb-5">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 font-mono">REF ID</span>
            <input
              placeholder="HMRC-7301-2026"
              value={irsCheckNum}
              onChange={(e) => setIrsCheckNum(e.target.value.toUpperCase())}
              className="w-full p-4 pl-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={irsRefundAmount}
              onChange={(e) => setIrsRefundAmount(e.target.value)}
              className="w-full p-4 pl-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs font-mono"
            />
          </div>
        </div>
        <div className="flex gap-1.5 mb-5 select-none">
          {[2450, 5800, 10480].map((val) => (
            <button
              key={val}
              onClick={() => {
                setIrsRefundAmount(String(val));
                setIrsCheckNum("HMRC-" + Math.floor(1000 + Math.random() * 9000) + "-TX26");
              }}
              className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 font-bold text-[10px] cursor-pointer text-center"
            >
              +${val}
            </button>
          ))}
        </div>
        <PrimaryButton
          disabled={!(parseFloat(irsRefundAmount) > 0) || !irsCheckNum.trim()}
          onClick={() => {
            handleIrsRefundProcess(parseFloat(irsRefundAmount), irsCheckNum);
            setShowIrsRefundSheet(false);
            setIrsRefundAmount("");
            setIrsCheckNum("");
            alert("HMRC Refund clearance completed via UK HM Treasury bridge! Balance credited successfully.");
          }}
        >
          Clear Refund balance
        </PrimaryButton>
      </Sheet>

      {/* 11. SOVEREIGN PRIVATE CREDIT LINE DISPATCH OVERLAY */}
      <Sheet open={showLoanSheet} onClose={() => setShowLoanSheet(false)} title="Sovereign Credit Provision">
        <p className="text-xs text-slate-500 mb-3 ml-0.5 leading-relaxed">
          Request private line credit enqueued directly through UK HM Treasury Clearing. Select program:
        </p>
        <div className="space-y-3 mb-5">
          <select
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs"
          >
            <option value="Personal Line Program">Personal Line Program (up to $50k)</option>
            <option value="Corporate Extension Line">Corporate Extension Line (up to $250k)</option>
            <option value="Hedge Leveraged Capital">Hedge Leveraged Credit Line (up to $2.5M)</option>
          </select>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="w-full p-4 pl-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-bold text-xs font-mono"
            />
          </div>
        </div>
        <div className="flex gap-1.5 mb-5 select-none">
          {[12500, 50000, 250000].map((val) => (
            <button
              key={val}
              onClick={() => {
                setLoanAmount(String(val));
              }}
              className="flex-1 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 hover:text-slate-900 font-bold text-[10px] cursor-pointer text-center"
            >
              +${val.toLocaleString()}
            </button>
          ))}
        </div>
        <PrimaryButton
          disabled={!(parseFloat(loanAmount) > 0)}
          onClick={() => {
            handleSovereignLoanDispatched(parseFloat(loanAmount), loanType);
            setShowLoanSheet(false);
            setLoanAmount("");
            alert("Sovereign private capital line application submitted successfully! Under UK FCA and PRA banking policies, credit liquidation is pending executive FCA block administrator clearance. You will see an active alert in your inbox once authorized.");
          }}
        >
          Submit Loan Request
        </PrimaryButton>
      </Sheet>

      {/* Modern High-Fidelity Custom Banking Alert Overlay Dialog */}
      {customAlert && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/15 text-red-500">
                <ShieldCheck size={20} className="text-red-500" />
              </div>
              <h3 className="font-extrabold text-white text-sm leading-tight uppercase tracking-wider">
                {customAlert.title}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              {customAlert.message}
            </p>
            <button
              onClick={() => setCustomAlert(null)}
              className="w-full mt-6 py-3.5 bg-[#C8102E] hover:bg-[#A93226] text-white text-[10px] font-black uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg shadow-red-500/10 transition-all duration-200 hover:scale-[1.02]"
            >
              Acknowledge Directive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
