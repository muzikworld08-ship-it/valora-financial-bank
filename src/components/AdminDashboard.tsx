import React, { useState } from "react";
import { 
  Users, UserPlus, FileClock, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Trash2, Landmark, Check, X, ShieldAlert, BadgeDollarSign, KeyRound, Snowflake, LogOut, ArrowRightLeft, UserCheck,
  Megaphone, MessageSquare, Compass, Send
} from "lucide-react";
import { UserProfile, BankTransaction, LoanApplication, SupportTicket, InvestmentSettings, InvestmentInquiry } from "../types";
import { fmtMoney, generateAccountNumber, uid } from "../utils";
import { PrimaryButton } from "./PrimaryButton";

interface AdminDashboardProps {
  users: UserProfile[];
  transactions: BankTransaction[];
  loans: LoanApplication[];
  supportTickets: SupportTicket[];
  investmentInquiries?: InvestmentInquiry[];
  announcements: string[];
  investmentSettings?: InvestmentSettings;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (userId: string, updated: Partial<UserProfile>) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateTransaction: (txId: string, updated: Partial<BankTransaction>) => void;
  onResolveTransaction: (txId: string, resolution: "Approved" | "Declined" | "Failed") => void;
  onAdminDirectWire: (params: { targetAccNum: string; amount: number; type: "Credit" | "Debit"; note: string; category?: "checking" | "investment" | "bitcoin" }) => boolean;
  onResolveLoan: (loanId: string, status: "Approved" | "Declined") => void;
  onResolveTicket: (ticketId: string, status: "Resolved") => void;
  onApproveInquiry?: (inquiryId: string, customDetails: { accountNumber: string; passwordText: string }) => void;
  onPublishAnnouncement: (text: string) => void;
  onUpdateInvestmentSettings?: (settings: InvestmentSettings) => void;
  onTrigger24hMarketFluctuation?: () => void;
  onSignOut: () => void;
  dark: boolean;
}

export function AdminDashboard({
  users,
  transactions,
  loans = [],
  supportTickets = [],
  investmentInquiries = [],
  announcements = [],
  investmentSettings,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateTransaction,
  onResolveTransaction,
  onAdminDirectWire,
  onResolveLoan,
  onResolveTicket,
  onApproveInquiry,
  onPublishAnnouncement,
  onUpdateInvestmentSettings,
  onTrigger24hMarketFluctuation,
  onSignOut,
  dark,
}: AdminDashboardProps) {
  // Navigation tabs for Admin view
  const [activeTab, setActiveTab] = useState<"statistics" | "create" | "resolve" | "direct" | "ledger" | "loans" | "tickets" | "announcements" | "investment_settings" | "investment_inquiries">("statistics");

  // Investment Settings Edit States
  const [pDaily, setPDaily] = useState(() => String(investmentSettings?.portfolioDailyPercentage ?? 1.5));
  const [pDays, setPDays] = useState(() => String(investmentSettings?.portfolioDurationDays ?? 30));
  const [bDaily, setBDaily] = useState(() => String(investmentSettings?.bitcoinDailyPercentage ?? 2.0));
  const [bDays, setBDays] = useState(() => String(investmentSettings?.bitcoinDurationDays ?? 30));
  const [bonusFund, setBonusFund] = useState(() => String(investmentSettings?.instantFundingBonusPercentage ?? 5.0));
  const [thirdPartyTransactionsDisabled, setThirdPartyTransactionsDisabled] = useState(() => !!(investmentSettings?.thirdPartyTransactionsDisabled ?? true));
  const [btcAddress, setBtcAddress] = useState(() => investmentSettings?.bitcoinFundingAddress ?? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
  const [reAccount, setReAccount] = useState(() => investmentSettings?.realEstateFundingAccount ?? "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291");
  const [portfolioAccount, setPortfolioAccount] = useState(() => investmentSettings?.portfolioFundingAccount ?? "Valora Global Investment Group - Citibank NA - A/C 482937492");
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Investment Inquiries Filter & Edit States
  const [inquirySearchQuery, setInquirySearchQuery] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<"All" | "Pending" | "Approved">("All");
  const [approvingInquiryId, setApprovingInquiryId] = useState<string | null>(null);
  const [inquiryAccNum, setInquiryAccNum] = useState("");
  const [inquiryPass, setInquiryPass] = useState("");

  // Sync inputs with settings if updated externally
  React.useEffect(() => {
    if (investmentSettings) {
      setPDaily(String(investmentSettings.portfolioDailyPercentage));
      setPDays(String(investmentSettings.portfolioDurationDays));
      setBDaily(String(investmentSettings.bitcoinDailyPercentage));
      setBDays(String(investmentSettings.bitcoinDurationDays));
      setBonusFund(String(investmentSettings.instantFundingBonusPercentage));
      setThirdPartyTransactionsDisabled(!!(investmentSettings.thirdPartyTransactionsDisabled ?? true));
      setBtcAddress(investmentSettings.bitcoinFundingAddress ?? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh");
      setReAccount(investmentSettings.realEstateFundingAccount ?? "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291");
      setPortfolioAccount(investmentSettings.portfolioFundingAccount ?? "Valora Global Investment Group - Citibank NA - A/C 482937492");
    }
  }, [investmentSettings]);

  // Create User State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("pass1234");
  const [newBalance, setNewBalance] = useState("1000");
  const [newPin, setNewPin] = useState("1234");
  const [newAccNum, setNewAccNum] = useState(() => generateAccountNumber());
  const [newLocation, setNewLocation] = useState("London, United Kingdom");
  const [newCreatedAt, setNewCreatedAt] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [newEnabledAccounts, setNewEnabledAccounts] = useState<("checking" | "investment" | "bitcoin")[]>(["checking", "investment", "bitcoin"]);
  const [newInvestmentBalance, setNewInvestmentBalance] = useState("0");
  const [newBitcoinBalance, setNewBitcoinBalance] = useState("0");
  const [createFeedback, setCreateFeedback] = useState("");
  const [newAnnText, setNewAnnText] = useState("");

  // Direct Wire State
  const [wireAccNum, setWireAccNum] = useState("");
  const [wireAmount, setWireAmount] = useState("");
  const [wireType, setWireType] = useState<"Credit" | "Debit">("Credit");
  const [wireNote, setWireNote] = useState("");
  const [wireFeedback, setWireFeedback] = useState("");
  const [wireCategory, setWireCategory] = useState<"checking" | "investment" | "bitcoin">("checking");

  // Account Edit States
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState("");
  const [editingInvestmentBalance, setEditingInvestmentBalance] = useState("");
  const [editingBitcoinBalance, setEditingBitcoinBalance] = useState("");
  const [editingPin, setEditingPin] = useState("");
  const [editingStatus, setEditingStatus] = useState<"Active" | "Frozen" | "Blocked">("Active");
  const [editingStatusReason, setEditingStatusReason] = useState("");
  const [editingStatusUnblockInstruction, setEditingStatusUnblockInstruction] = useState("");
  const [editingEnabledAccounts, setEditingEnabledAccounts] = useState<("checking" | "investment" | "bitcoin")[]>(["checking", "investment", "bitcoin"]);
  const [editingCheckingFrozen, setEditingCheckingFrozen] = useState(false);
  const [editingInvestmentFrozen, setEditingInvestmentFrozen] = useState(false);
  const [editingBitcoinFrozen, setEditingBitcoinFrozen] = useState(false);
  const [quickAddAmount, setQuickAddAmount] = useState("");
  const [quickAddCategory, setQuickAddCategory] = useState<"checking" | "investment" | "bitcoin">("checking");
  const [quickAddFeedback, setQuickAddFeedback] = useState("");

  // compliance audits expanded state
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Transaction Editing State
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editingTxDateTime, setEditingTxDateTime] = useState("");
  const [editingTxAmount, setEditingTxAmount] = useState("");
  const [editingTxFromName, setEditingTxFromName] = useState("");
  const [editingTxToName, setEditingTxToName] = useState("");
  const [editingTxNote, setEditingTxNote] = useState("");
  const [txSearchQuery, setTxSearchQuery] = useState("");

  const startEditingTx = (t: BankTransaction) => {
    setEditingTxId(t.id);
    setEditingTxAmount(String(t.amount));
    setEditingTxFromName(t.fromName || "");
    setEditingTxToName(t.toName || "");
    setEditingTxNote(t.note || "");
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) {
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditingTxDateTime(localISOTime);
    } else {
      setEditingTxDateTime("");
    }
  };

  const saveTxDetails = (txId: string) => {
    if (!onUpdateTransaction) return;
    const updates: Partial<BankTransaction> = {};
    if (editingTxDateTime) {
      updates.date = new Date(editingTxDateTime).toISOString();
    }
    if (editingTxAmount !== "") {
      updates.amount = parseFloat(editingTxAmount) || 0;
    }
    updates.fromName = editingTxFromName.trim();
    updates.toName = editingTxToName.trim();
    updates.note = editingTxNote.trim();

    onUpdateTransaction(txId, updates);
    setEditingTxId(null);
  };

  const pendingTx = transactions.filter((t) => t.status === "Pending" || t.status === "OTP Verified");
  const totalSystemDeposits = users.reduce((sum, u) => sum + u.balance, 0);

  // Dynamic automatic lookup: search name based on account number
  const matchedUser = users.find((u) => u.accountNumber === wireAccNum.trim());

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      setCreateFeedback("Please enter a valid name, email address, and login password.");
      return;
    }

    if (newEnabledAccounts.length === 0) {
      setCreateFeedback("Error: You must assign at least one active account segment (Checking, Investment, or Bitcoin) to register this profile.");
      return;
    }

    const startingBalance = parseFloat(newBalance) || 0;
    const finalAcc = newAccNum.trim() || generateAccountNumber();
    const startingInv = parseFloat(newInvestmentBalance) || 0;
    const startingBtc = parseFloat(newBitcoinBalance) || 0;

    // Check for duplicate account number
    if (users.some((u) => u.accountNumber === finalAcc)) {
      setCreateFeedback(`Error: Account number ${finalAcc} is already allocated to another profile.`);
      return;
    }

    // Check for duplicate email address
    if (users.some((u) => u.email.toLowerCase().trim() === newEmail.trim().toLowerCase())) {
      setCreateFeedback(`Error: Email address "${newEmail}" is already registered to another user profile.`);
      return;
    }

    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

    const createdProfile: UserProfile = {
      id: "user-" + uid(),
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim(),
      pin: newPin.trim() || "1234",
      accountNumber: finalAcc,
      balance: newEnabledAccounts.includes("checking") ? startingBalance : 0,
      investmentBalance: newEnabledAccounts.includes("investment") ? startingInv : 0,
      bitcoinBalance: newEnabledAccounts.includes("bitcoin") ? startingBtc : 0,
      cardNum: "4532 9901 " + String(Math.floor(1000 + Math.random() * 9000)) + " " + String(Math.floor(1000 + Math.random() * 9000)),
      cardExpiry: "06/32",
      cardFrozen: false,
      cardLimit: 10000,
      cardSpent: 0,
      location: newLocation.trim() || "Mayfair, London, United Kingdom, office branch",
      createdAt: newCreatedAt ? new Date(newCreatedAt).toISOString() : new Date().toISOString(),
      enabledAccounts: newEnabledAccounts,
      checkingFrozen: false,
      investmentFrozen: false,
      bitcoinFrozen: false,
      emailVerified: true,
      isEmailVerified: true,
      auditLog: [`${timestamp} | Account created with privileges: [${newEnabledAccounts.join(", ").toUpperCase()}]. INITIAL BALANCES: [Checking: $${startingBalance}, Investment: $${startingInv}, Bitcoin: ${startingBtc} BTC]. Email verification assigned & certified by Admin.`]
    };

    onAddUser(createdProfile);
    setCreateFeedback(`Success! Premium banking profile registered for ${createdProfile.name}. Account: ${createdProfile.accountNumber} | Password: ${createdProfile.password} | PIN: ${createdProfile.pin}`);
    setNewName("");
    setNewEmail("");
    setNewPassword("pass1234");
    setNewBalance("1000");
    setNewInvestmentBalance("0");
    setNewBitcoinBalance("0");
    setNewPin("1234");
    setNewAccNum(generateAccountNumber());
    setNewLocation("London, United Kingdom");
    setNewEnabledAccounts(["checking", "investment", "bitcoin"]);
    setNewCreatedAt(new Date().toISOString().split("T")[0]);
    setTimeout(() => setCreateFeedback(""), 20000); // 20s display so admin has ample time to copy credentials
  };

  const handleWireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(wireAmount) || 0;
    if (amt <= 0) {
      setWireFeedback("Please input a valid transfer amount greater than $0.");
      return;
    }

    if (!matchedUser) {
      setWireFeedback("No matching profile belongs to this Valora account number.");
      return;
    }

    const success = onAdminDirectWire({
      targetAccNum: wireAccNum.trim(),
      amount: amt,
      type: wireType,
      note: wireNote.trim() || `Treasury Administrative ${wireType}`,
      category: wireCategory,
    });

    if (success) {
      setWireFeedback(`Successfully completed ${wireType} direct wire of ${fmtMoney(amt)} to ${matchedUser.name} (${wireCategory})!`);
      setWireAmount("");
      setWireNote("");
      // keep account number so they can perform multiple actions if needed
      setTimeout(() => setWireFeedback(""), 6000);
    } else {
      setWireFeedback("Treasury failure: balance debit exceeds the user's current account holdings.");
    }
  };

  const saveEditedUser = (userId: string) => {
    if (editingEnabledAccounts.length === 0) {
      alert("Error: A private banking client must have at least one active account segment.");
      return;
    }

    const changes: Partial<UserProfile> = {};
    if (editingBalance !== "") {
      changes.balance = parseFloat(editingBalance) || 0;
    }
    if (editingInvestmentBalance !== "") {
      changes.investmentBalance = parseFloat(editingInvestmentBalance) || 0;
    }
    if (editingBitcoinBalance !== "") {
      changes.bitcoinBalance = parseFloat(editingBitcoinBalance) || 0;
    }
    if (editingPin !== "" && editingPin.length === 4) {
      changes.pin = editingPin;
    }
    changes.accountStatus = editingStatus;
    changes.accountStatusReason = editingStatusReason;
    changes.accountStatusUnblockInstruction = editingStatusUnblockInstruction;

    changes.enabledAccounts = editingEnabledAccounts;
    changes.checkingFrozen = editingCheckingFrozen;
    changes.investmentFrozen = editingInvestmentFrozen;
    changes.bitcoinFrozen = editingBitcoinFrozen;

    const user = users.find((u) => u.id === userId);
    if (user) {
      const prevAudit = user.auditLog || [];
      const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
      const adminLog = `${timestamp} | Admin updated permissions: Checking [${editingCheckingFrozen ? "FROZEN" : "ACTIVE"}], Investment [${editingInvestmentFrozen ? "FROZEN" : "ACTIVE"}], Bitcoin [${editingBitcoinFrozen ? "FROZEN" : "ACTIVE"}]. Assigned segments: [${editingEnabledAccounts.join(", ").toUpperCase()}]. Secure verification: PASS`;
      changes.auditLog = [adminLog, ...prevAudit];
    }

    onUpdateUser(userId, changes);
    setEditingUserId(null);
    setEditingBalance("");
    setEditingInvestmentBalance("");
    setEditingBitcoinBalance("");
    setEditingPin("");
    setEditingStatus("Active");
    setEditingStatusReason("");
    setEditingStatusUnblockInstruction("");
  };

  return (
    <div className="px-5 pt-6 pb-28 min-h-[92vh] animate-[fadeIn_0.3s_ease-out]">
      {/* Admin header */}
      <div className="flex items-center justify-between pb-4 border-b border-sky-900/25 mb-5">
        <div>
          <div className="flex items-center gap-1.5 text-sky-400">
            <ShieldCheck size={18} className="animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Central Bank Cabin</span>
          </div>
          <h2 className={`text-xl font-black uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Admin Dash Desk
          </h2>
        </div>
        <button
          onClick={onSignOut}
          className="flex items-center gap-1 px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-rose-950/20"
        >
          <LogOut size={12} /> Sign Out
        </button>
      </div>

      {/* Corporate Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 select-none">
        <div className={`p-3 rounded-2xl border ${
          dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <Landmark className="text-sky-500 w-4 h-4 mb-1.5" />
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Total Reserves</p>
          <p className={`text-xs font-bold font-mono mt-0.5 mt-1 ${dark ? "text-white" : "text-slate-900"}`}>
            {fmtMoney(totalSystemDeposits)}
          </p>
        </div>
        <div className={`p-3 rounded-2xl border ${
          dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <Users className="text-indigo-400 w-4 h-4 mb-1.5" />
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Users Active</p>
          <p className={`text-xs font-bold font-mono mt-0.5 mt-1 ${dark ? "text-white" : "text-slate-900"}`}>
            {users.length} profiles
          </p>
        </div>
        <div className={`relative p-3 rounded-2xl border ${
          dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <FileClock className="text-amber-500 w-4 h-4 mb-1.5" />
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pending Wires</p>
          <p className={`text-xs font-bold font-mono mt-0.5 mt-1 ${
            pendingTx.length > 0 ? "text-amber-500 animate-pulse" : "text-emerald-500"
          }`}>
            {pendingTx.length} pending
          </p>
        </div>
      </div>

      {/* Navigation tabs inside Admin view */}
      <div className="flex gap-1.5 mb-5 border-b border-slate-800/20 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <button
          onClick={() => setActiveTab("statistics")}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "statistics"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Users list
        </button>
        <button
          onClick={() => setActiveTab("resolve")}
          className="relative shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all"
          style={{
            backgroundColor: activeTab === "resolve" ? (dark ? "#0f172a" : "#1e293b") : undefined,
            color: activeTab === "resolve" ? "white" : "#94a3b8",
          }}
        >
          Approvals
          {pendingTx.length > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-amber-500 text-[9px] text-slate-950 font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
              {pendingTx.length}
            </span>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("create");
            setCreateFeedback("");
          }}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "create"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Create User
        </button>
        <button
          onClick={() => {
            setActiveTab("direct");
            setWireFeedback("");
          }}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "direct"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Wire Form
        </button>
        <button
          onClick={() => {
            setActiveTab("ledger");
            setTxSearchQuery("");
            setEditingTxId(null);
          }}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "ledger"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Ledger
        </button>
        <button
          onClick={() => setActiveTab("loans")}
          className="relative shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all"
          style={{
            backgroundColor: activeTab === "loans" ? (dark ? "#0f172a" : "#1e293b") : undefined,
            color: activeTab === "loans" ? "white" : "#94a3b8",
          }}
        >
          Loans
          {loans.filter(l => l.status === "Pending").length > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-sky-500 text-[9px] text-slate-950 font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-950 animate-bounce">
              {loans.filter(l => l.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("tickets")}
          className="relative shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all"
          style={{
            backgroundColor: activeTab === "tickets" ? (dark ? "#0f172a" : "#1e293b") : undefined,
            color: activeTab === "tickets" ? "white" : "#94a3b8",
          }}
        >
          Tickets
          {supportTickets.filter(t => t.status === "Open").length > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-emerald-500 text-[9px] text-slate-950 font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
              {supportTickets.filter(t => t.status === "Open").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("announcements")}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "announcements"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveTab("investment_settings")}
          className={`shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === "investment_settings"
              ? "bg-slate-800 dark:bg-slate-900 text-white shadow-sm"
              : "text-slate-400 hover:text-sky-400"
          }`}
        >
          Investment Settings
        </button>
        <button
          onClick={() => setActiveTab("investment_inquiries")}
          className="relative shrink-0 px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider rounded-lg transition-all"
          style={{
            backgroundColor: activeTab === "investment_inquiries" ? (dark ? "#0f172a" : "#1e293b") : undefined,
            color: activeTab === "investment_inquiries" ? "white" : "#94a3b8",
          }}
        >
          Inquiries
          {investmentInquiries.filter(i => i.status === "Pending").length > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-amber-500 text-[9px] text-slate-950 font-black h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
              {investmentInquiries.filter(i => i.status === "Pending").length}
            </span>
          )}
        </button>
      </div>

      {/* TAB SUB-SCREENS */}

      {/* 1. USERS LIST VIEW */}
      {activeTab === "statistics" && (
        <div className="space-y-4">
          <p className={`text-[10px] font-bold uppercase tracking-wider text-slate-400`}>
            Controlled Financial Profiles ({users.length})
          </p>

          <div className="space-y-3">
            {users.map((u) => {
              const isEditing = editingUserId === u.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                    dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-sm truncate ${dark ? "text-white" : "text-slate-950"}`}>
                          {u.name}
                        </p>
                        {u.accountStatus && u.accountStatus !== "Active" && (
                          <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-widest leading-none ${
                            u.accountStatus === "Frozen"
                              ? "bg-amber-500/15 text-amber-500 border border-amber-500/20"
                              : "bg-rose-500/15 text-rose-500 border border-rose-500/20 animate-pulse"
                          }`}>
                            {u.accountStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Number: <strong className="text-sky-500 font-bold">{u.accountNumber}</strong> | PIN: <strong className="text-slate-300 font-mono">{u.pin}</strong> | Pass: <strong className="text-indigo-400 font-mono">{u.password || "pass1234"}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      {!isEditing ? (
                        <div className="text-right text-[11px] font-mono leading-normal text-slate-400">
                          {((!u.enabledAccounts || u.enabledAccounts.length === 0) || u.enabledAccounts.includes("checking")) && (
                            <div>Checking: <span className="text-emerald-500 font-bold">{fmtMoney(u.balance)} {u.checkingFrozen ? "❄️" : ""}</span></div>
                          )}
                          {((!u.enabledAccounts || u.enabledAccounts.length === 0) || u.enabledAccounts.includes("investment")) && (
                            <div>Investment: <span className="text-teal-400 font-bold">{fmtMoney(u.investmentBalance ?? 0)} {u.investmentFrozen ? "❄️" : ""}</span></div>
                          )}
                          {((!u.enabledAccounts || u.enabledAccounts.length === 0) || u.enabledAccounts.includes("bitcoin")) && (
                            <div>Bitcoin: <span className="text-amber-500 font-bold">{(u.bitcoinBalance ?? 0).toFixed(4)} BTC {u.bitcoinFrozen ? "❄️" : ""}</span></div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1.5 text-right">
                          {editingEnabledAccounts.includes("checking") && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Checking ($):</span>
                              <input
                                type="number"
                                placeholder="Checking"
                                value={editingBalance}
                                onChange={(e) => setEditingBalance(e.target.value)}
                                className="w-24 p-1 font-mono text-xs rounded border border-slate-700 bg-slate-950 text-emerald-400 text-right outline-none"
                              />
                            </div>
                          )}
                          {editingEnabledAccounts.includes("investment") && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Investment ($):</span>
                              <input
                                type="number"
                                placeholder="Investment"
                                value={editingInvestmentBalance}
                                onChange={(e) => setEditingInvestmentBalance(e.target.value)}
                                className="w-24 p-1 font-mono text-xs rounded border border-slate-700 bg-slate-950 text-teal-400 text-right outline-none"
                              />
                            </div>
                          )}
                          {editingEnabledAccounts.includes("bitcoin") && (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[9px] uppercase font-bold text-slate-400">Bitcoin (BTC):</span>
                              <input
                                type="number"
                                step="any"
                                placeholder="Bitcoin"
                                value={editingBitcoinBalance}
                                onChange={(e) => setEditingBitcoinBalance(e.target.value)}
                                className="w-24 p-1 font-mono text-xs rounded border border-slate-700 bg-slate-950 text-amber-400 text-right outline-none"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 pt-4 border-t border-slate-800/20 dark:border-slate-850 space-y-3.5 text-left animate-[fadeIn_0.15s_ease-out]">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-450">Account Lock Status:</span>
                        <div className="flex gap-2">
                          {(["Active", "Frozen", "Blocked"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setEditingStatus(st)}
                              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                                editingStatus === st
                                  ? st === "Active"
                                    ? "bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10"
                                    : st === "Frozen"
                                    ? "bg-amber-500 text-slate-950 font-black animate-pulse"
                                    : "bg-rose-500 text-white font-black"
                                  : "bg-slate-850 text-slate-400 hover:bg-slate-800"
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                        <div>
                          <label className="block text-[9px] uppercase font-extrabold text-slate-400 mb-1 tracking-wider">
                            Block / Freeze Reason (Shown to Client):
                          </label>
                          <textarea
                            value={editingStatusReason}
                            onChange={(e) => setEditingStatusReason(e.target.value)}
                            placeholder="Reason they will see..."
                            rows={2}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-200 focus:border-sky-500 outline-none resize-none leading-normal"
                          />
                          <div className="flex gap-2 mt-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Presets:</span>
                            <button
                              type="button"
                              onClick={() => setEditingStatusReason("Unusual trading & wire anomalies flagged. High-risk transfer lock.")}
                              className="text-[8.5px] text-sky-500 hover:underline cursor-pointer"
                            >
                              Wire Anomalies
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStatusReason("Institutional verification hold under federal KYC-883 banking protocols.")}
                              className="text-[8.5px] text-sky-500 hover:underline cursor-pointer"
                            >
                              Compliance
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-extrabold text-slate-400 mb-1 tracking-wider">
                            Guidelines To Unblock Ledger Actions:
                          </label>
                          <textarea
                            value={editingStatusUnblockInstruction}
                            onChange={(e) => setEditingStatusUnblockInstruction(e.target.value)}
                            placeholder="What they should do..."
                            rows={2}
                            className="w-full p-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-slate-200 focus:border-sky-500 outline-none resize-none leading-normal"
                          />
                          <div className="flex gap-2 mt-1">
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Presets:</span>
                            <button
                              type="button"
                              onClick={() => setEditingStatusUnblockInstruction("Please connect immediately with compliance support at secure@valorafinancialbank.com to resolve.")}
                              className="text-[8.5px] text-sky-500 hover:underline cursor-pointer"
                            >
                              Support Desk
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingStatusUnblockInstruction("Provide clear identity documents (National passport and physical bank statement scans) to lift hold.")}
                              className="text-[8.5px] text-sky-500 hover:underline cursor-pointer"
                            >
                              Upload Scans
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-3.5 border-t border-slate-800/40">
                        {/* 1. Account type assignments (Multi Select checkboxes) */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Assigned Account Type (Multi-Select Overrides):</span>
                          <div className="flex flex-wrap gap-4 bg-slate-950/45 p-2.5 rounded-xl border border-slate-800/80">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingEnabledAccounts.includes("checking")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingEnabledAccounts([...editingEnabledAccounts, "checking"]);
                                  } else {
                                    setEditingEnabledAccounts(editingEnabledAccounts.filter(it => it !== "checking"));
                                  }
                                }}
                                className="rounded accent-sky-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              Checking Account
                            </label>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingEnabledAccounts.includes("investment")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingEnabledAccounts([...editingEnabledAccounts, "investment"]);
                                  } else {
                                    setEditingEnabledAccounts(editingEnabledAccounts.filter(it => it !== "investment"));
                                  }
                                }}
                                className="rounded accent-sky-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              Investment Account
                            </label>
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-300 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingEnabledAccounts.includes("bitcoin")}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditingEnabledAccounts([...editingEnabledAccounts, "bitcoin"]);
                                  } else {
                                    setEditingEnabledAccounts(editingEnabledAccounts.filter(it => it !== "bitcoin"));
                                  }
                                }}
                                className="rounded accent-sky-500 h-3.5 w-3.5 cursor-pointer"
                              />
                              Bitcoin Account
                            </label>
                          </div>
                        </div>

                        {/* 2. Independent frozen status controls */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Independent Account Sublocks (Freeze / Unfreeze):</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-300">Checking Wallet:</span>
                              <button
                                type="button"
                                onClick={() => setEditingCheckingFrozen(!editingCheckingFrozen)}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-black transition-all cursor-pointer ${
                                  editingCheckingFrozen 
                                    ? "bg-amber-500 text-slate-950 animate-pulse" 
                                    : "bg-emerald-500/10 text-emerald-500"
                                }`}
                              >
                                {editingCheckingFrozen ? "FROZEN" : "ACTIVE"}
                              </button>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-300">Investment Portfolio:</span>
                              <button
                                type="button"
                                onClick={() => setEditingInvestmentFrozen(!editingInvestmentFrozen)}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-black transition-all cursor-pointer ${
                                  editingInvestmentFrozen 
                                    ? "bg-amber-500 text-slate-950 animate-pulse" 
                                    : "bg-emerald-500/10 text-emerald-500"
                                }`}
                              >
                                {editingInvestmentFrozen ? "FROZEN" : "ACTIVE"}
                              </button>
                            </div>
                            <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-300">Bitcoin Vault:</span>
                              <button
                                type="button"
                                onClick={() => setEditingBitcoinFrozen(!editingBitcoinFrozen)}
                                className={`px-2 py-0.5 rounded text-[9.5px] font-black transition-all cursor-pointer ${
                                  editingBitcoinFrozen 
                                    ? "bg-amber-500 text-slate-950 animate-pulse" 
                                    : "bg-emerald-500/10 text-emerald-500"
                                }`}
                              >
                                {editingBitcoinFrozen ? "FROZEN" : "ACTIVE"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* 3. Quick Add Funds Injection */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-800/40">
                          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block flex items-center gap-1">
                            <BadgeDollarSign size={12} className="text-emerald-400" />
                            Direct Treasury Fund Injection (Add Funds):
                          </span>
                          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
                            <p className="text-[9.5px] text-slate-400 leading-normal">
                              Instantly credit funds to this specific client's active accounts. The transaction is instantly processed and recorded in the sovereign bank ledger.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1">
                                <input
                                  type="number"
                                  step="any"
                                  placeholder="Amount to inject (e.g. 5000)"
                                  value={quickAddAmount}
                                  onChange={(e) => setQuickAddAmount(e.target.value)}
                                  className="w-full p-2 font-mono text-xs rounded border border-slate-700 bg-slate-950 text-white outline-none"
                                />
                              </div>
                              <div className="sm:w-36">
                                <select
                                  value={quickAddCategory}
                                  onChange={(e: any) => setQuickAddCategory(e.target.value)}
                                  className="w-full p-2 text-xs rounded border border-slate-700 bg-slate-950 text-slate-300 font-bold outline-none cursor-pointer"
                                >
                                  <option value="checking">Checking ($)</option>
                                  <option value="investment">Investment ($)</option>
                                  <option value="bitcoin">Bitcoin (BTC)</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const amt = parseFloat(quickAddAmount);
                                  if (isNaN(amt) || amt <= 0) {
                                    setQuickAddFeedback("Error: Please enter a valid positive amount.");
                                    return;
                                  }
                                  const success = onAdminDirectWire({
                                    targetAccNum: u.accountNumber,
                                    amount: amt,
                                    type: "Credit",
                                    note: `Treasury Administrative Deposit`,
                                    category: quickAddCategory
                                  });
                                  if (success) {
                                    setQuickAddAmount("");
                                    setQuickAddFeedback(`Success: Added ${quickAddCategory === "bitcoin" ? amt + " BTC" : fmtMoney(amt)} to ${u.name}'s ${quickAddCategory} account!`);
                                    
                                    // Dynamically update the local state inputs immediately
                                    if (quickAddCategory === "checking") {
                                      setEditingBalance(String(parseFloat(editingBalance || "0") + amt));
                                    } else if (quickAddCategory === "investment") {
                                      setEditingInvestmentBalance(String(parseFloat(editingInvestmentBalance || "0") + amt));
                                    } else if (quickAddCategory === "bitcoin") {
                                      setEditingBitcoinBalance(String(parseFloat(editingBitcoinBalance || "0") + amt));
                                    }
                                  } else {
                                    setQuickAddFeedback("Error executing treasury credit wire.");
                                  }
                                }}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
                              >
                                Add Funds
                              </button>
                            </div>
                            {quickAddFeedback && (
                              <p className={`text-[10px] font-bold ${quickAddFeedback.startsWith("Error") ? "text-rose-400" : "text-emerald-400"}`}>
                                {quickAddFeedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Drawer */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-800/10 dark:border-slate-800/50 pt-2.5 mt-2.5">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onUpdateUser(u.id, { cardFrozen: !u.cardFrozen })}
                        className={`px-2 py-1 rounded text-[9.5px] font-bold flex items-center gap-1 transition-all ${
                          u.cardFrozen
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-slate-800 text-slate-300 border border-slate-700/50"
                        }`}
                        title="Freeze Credit Card"
                      >
                        <Snowflake size={11} /> {u.cardFrozen ? "Card Frozen" : "Freeze Card"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => {
                              setEditingUserId(u.id);
                              setEditingBalance(String(u.balance));
                              setEditingInvestmentBalance(String(u.investmentBalance ?? 0));
                              setEditingBitcoinBalance(String(u.bitcoinBalance ?? 0));
                              setEditingPin(u.pin);
                              setEditingStatus(u.accountStatus || "Active");
                              setEditingStatusReason(u.accountStatusReason || "");
                              setEditingStatusUnblockInstruction(u.accountStatusUnblockInstruction || "");
                              setEditingEnabledAccounts(u.enabledAccounts || ["checking", "investment", "bitcoin"]);
                              setEditingCheckingFrozen(!!u.checkingFrozen);
                              setEditingInvestmentFrozen(!!u.investmentFrozen);
                              setEditingBitcoinFrozen(!!u.bitcoinFrozen);
                              setQuickAddAmount("");
                              setQuickAddFeedback("");
                            }}
                            className={`px-3 py-1 bg-slate-800/60 dark:bg-slate-950 text-slate-300 hover:text-white rounded text-[10px] font-semibold transition-all`}
                          >
                            Manipulate Profile
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Irreversibly delete profile ${u.name}?`)) {
                                onDeleteUser(u.id);
                              }
                            }}
                            className="text-rose-500 hover:text-rose-400 p-1"
                            title="Delete Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="PIN"
                            value={editingPin}
                            onChange={(e) => setEditingPin(e.target.value)}
                            className="w-12 p-1 font-mono text-xs text-center rounded border bg-slate-950 text-white outline-none"
                            title="4 digit security PIN"
                          />
                          <button
                            onClick={() => saveEditedUser(u.id)}
                            className="bg-emerald-500 text-slate-950 font-bold text-[9.5px] px-2.5 py-1 rounded hover:bg-emerald-400"
                          >
                            Save Updates
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-800 text-slate-300 font-bold text-[9.5px] px-2 rounded hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TRANSACTION APPROVALS QUEUE */}
      {activeTab === "resolve" && (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Awaiting Compliance Review ({pendingTx.length})
          </p>

          {pendingTx.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${
              dark ? "bg-slate-900/20 border-slate-800" : "bg-white border-slate-100"
            }`}>
              <p className="text-xs text-slate-500">All consumer transfers are approved and cleared!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingTx.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border ${
                    dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className={`font-semibold text-xs flex items-center gap-1 ${
                        t.status === "Pending OTP" 
                          ? "text-amber-500 animate-pulse" 
                          : t.status === "OTP Verified" 
                          ? "text-emerald-500 font-bold"
                          : t.status === "Completed" || t.status === "Successful" || t.status === "Approved"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}>
                        <ArrowRightLeft size={12} /> 
                        {t.status === "Pending OTP" 
                          ? "Pending OTP Verification" 
                          : t.status === "OTP Verified" 
                          ? "OTP Verified - Processing Ledger" 
                          : `Status: ${t.status}`}
                      </p>
                      <p className={`font-bold text-sm mt-1.5 ${dark ? "text-white" : "text-slate-950"}`}>
                        {t.fromName} → {t.toName}
                      </p>
                      <p className="text-[10px] font-mono text-indigo-400/80 mt-0.5">
                        Route: Acc {t.fromAccountNumber} to Acc {t.toAccountNumber}
                      </p>
                      {t.note && (
                        <p className="text-[10.5px] text-slate-400 italic mt-1 bg-slate-950/20 px-2 py-1 rounded inline-block">
                          Ref: "{t.note}"
                        </p>
                      )}

                      {t.isInvestmentFunding && (
                        <div className="flex gap-1.5 flex-wrap items-center mt-2">
                          <span className={`text-[8.5px] font-black uppercase font-mono px-2 py-0.5 rounded border ${
                            t.fundingAssetType === "BITCOIN" 
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                              : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                          }`}>
                            Manual {t.fundingAssetType} Funding Request
                          </span>
                          {t.receiptFileName && (
                            <span className="text-[8.5px] font-mono font-bold bg-slate-950/40 text-slate-400 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                              <span>📄</span>
                              <span className="underline cursor-pointer hover:text-white" onClick={() => alert(`Reviewing Document: ${t.receiptFileName}\nHigh-Resolution Payment Ledger Receipt verified successfully.`)}>{t.receiptFileName}</span>
                              <span className="text-emerald-400 font-extrabold text-[8px] uppercase tracking-wider ml-1">(Click to View)</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className={`font-black text-sm tracking-tight text-amber-400 font-mono`}>
                        {fmtMoney(t.amount)}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        {new Date(t.date).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Cryptographic Secure Audit Logs - Read-only view of state for Administrative review */}
                  <div className="border-t border-slate-800/10 dark:border-slate-800/50 pt-3 mt-3 space-y-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      🔒 Cryptographic Audit History
                    </p>
                    {t.auditLog && t.auditLog.slice(-2).map((log, i) => (
                      <p key={i} className="text-[9px] font-mono text-slate-400 leading-normal">
                        &bull; {log}
                      </p>
                    ))}
                    {!t.auditLog && (
                      <p className="text-[9px] font-mono text-slate-500 italic">
                        No automated audits journaled yet. Protected under central MFA protocols.
                      </p>
                    )}
                  </div>

                  {/* Action buttons to resolve pending transaction */}
                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-800/10 dark:border-slate-800/30">
                    {t.isInvestmentFunding ? (
                      <>
                        <button
                          onClick={() => onResolveTransaction && onResolveTransaction(t.id, "Approved")}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Check size={11} className="stroke-[3]" /> Approve & Credit Asset
                        </button>
                        <button
                          onClick={() => onResolveTransaction && onResolveTransaction(t.id, "Declined")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <X size={11} className="stroke-[3]" /> Decline Request
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onResolveTransaction && onResolveTransaction(t.id, "Approved")}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Check size={11} className="stroke-[3]" /> Approve Transfer
                        </button>
                        <button
                          onClick={() => onResolveTransaction && onResolveTransaction(t.id, "Declined")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-[9.5px] uppercase tracking-wider rounded-lg transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <X size={11} className="stroke-[3]" /> Decline Transfer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CREATE PROFILE FORM */}
      {activeTab === "create" && (
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Provision Exclusive Bank Account
          </p>

          <form onSubmit={handleCreateUserSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stella Vance"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-xs ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Client Corporate Email
                  </label>
                  {newEmail.trim() && (
                    <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5 animate-pulse">
                      ✓ ASSIGNED & VERIFIED
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="stella@privatevault.com"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full p-3 pr-10 rounded-xl outline-none text-xs ${
                      dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                    }`}
                  />
                  {newEmail.trim() && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 text-xs font-bold" title="Verified email node">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 mt-1">
                  MFA-enabled. Private communication vault automatically provisioned and verified.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  10-Digit Account Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4401210101"
                  required
                  maxLength={12}
                  value={newAccNum}
                  onChange={(e) => setNewAccNum(e.target.value.replace(/\D/g, ""))}
                  className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Login Password
                </label>
                <input
                  type="text"
                  placeholder="Password for login"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-xs ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Account Type Selection (Multi Select Checkbox) & Corresponding Balances */}
            <div className={`p-4 rounded-2xl border ${
              dark ? "bg-slate-900/60 border-slate-800" : "bg-slate-100/30 border-slate-200"
            } space-y-4`}>
              <div>
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
                  Assign Active Account Types (Multi-Select):
                </span>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEnabledAccounts.includes("checking")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEnabledAccounts([...newEnabledAccounts, "checking"]);
                        } else {
                          setNewEnabledAccounts(newEnabledAccounts.filter(it => it !== "checking"));
                        }
                      }}
                      className="rounded accent-sky-500 h-4 w-4 cursor-pointer"
                    />
                    <span className={dark ? "text-white" : "text-slate-900"}>Checking Account</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEnabledAccounts.includes("investment")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEnabledAccounts([...newEnabledAccounts, "investment"]);
                        } else {
                          setNewEnabledAccounts(newEnabledAccounts.filter(it => it !== "investment"));
                        }
                      }}
                      className="rounded accent-sky-500 h-4 w-4 cursor-pointer"
                    />
                    <span className={dark ? "text-white" : "text-slate-900"}>Investment Account</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newEnabledAccounts.includes("bitcoin")}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewEnabledAccounts([...newEnabledAccounts, "bitcoin"]);
                        } else {
                          setNewEnabledAccounts(newEnabledAccounts.filter(it => it !== "bitcoin"));
                        }
                      }}
                      className="rounded accent-sky-500 h-4 w-4 cursor-pointer"
                    />
                    <span className={dark ? "text-white" : "text-slate-900"}>Bitcoin Account</span>
                  </label>
                </div>
              </div>

              {/* Conditional Starting Balances */}
              {newEnabledAccounts.length > 0 && (
                <div className="pt-3 border-t border-slate-700/20 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      Starting Balances Configuration
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setNewBalance("0");
                        setNewInvestmentBalance("0");
                        setNewBitcoinBalance("0");
                      }}
                      className="px-2.5 py-1 text-[9.5px] font-black uppercase bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/25 transition-all cursor-pointer"
                    >
                      Initialize with Zero Balance ($0)
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {newEnabledAccounts.includes("checking") && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Checking Starting Balance ($)
                        </label>
                        <input
                          type="number"
                          placeholder="1000"
                          required
                          value={newBalance}
                          onChange={(e) => setNewBalance(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                            dark ? "bg-slate-950 border border-slate-800 text-emerald-400" : "bg-white border border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>
                    )}
                    {newEnabledAccounts.includes("investment") && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Investment Starting Balance ($)
                        </label>
                        <input
                          type="number"
                          placeholder="0"
                          required
                          value={newInvestmentBalance}
                          onChange={(e) => setNewInvestmentBalance(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                            dark ? "bg-slate-950 border border-slate-800 text-teal-400" : "bg-white border border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>
                    )}
                    {newEnabledAccounts.includes("bitcoin") && (
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Bitcoin Starting Balance (BTC)
                        </label>
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          required
                          value={newBitcoinBalance}
                          onChange={(e) => setNewBitcoinBalance(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                            dark ? "bg-slate-950 border border-slate-800 text-amber-500" : "bg-white border border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Initial Authentication PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="1234"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                  className={`w-full p-3 rounded-xl outline-none text-center font-mono text-xs font-bold tracking-[0.4em] ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Custom Account Opening Date
                </label>
                <input
                  type="date"
                  required
                  value={newCreatedAt}
                  onChange={(e) => setNewCreatedAt(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Account Opening Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mayfair, London, United Kingdom, office branch"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-xs ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100/80 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * The banking system will allocate a random unique 10-digit identifier by default, but you may supply any specific routing code above.
            </p>

            {createFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                createFeedback.startsWith("Success")
                  ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
                {createFeedback}
              </div>
            )}

            <PrimaryButton onClick={() => {}} className="py-3">
              Approve & Create Financial Account
            </PrimaryButton>
          </form>
        </div>
      )}

      {/* 4. TREASURY DIRECT WIRE FORM */}
      {activeTab === "direct" && (
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Treasury Administrative Wire
          </p>

          <form onSubmit={handleWireSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Target User Account Number
              </label>
              <input
                type="text"
                placeholder="Enter 10-digit identifier"
                value={wireAccNum}
                onChange={(e) => {
                  setWireAccNum(e.target.value);
                  setWireFeedback("");
                }}
                className={`w-full p-3.5 rounded-xl font-mono text-sm tracking-widest outline-none ${
                  dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                }`}
              />

              {/* Automatic name generator verified lookup as specified! */}
              {wireAccNum.trim().length >= 4 && (
                <div className="mt-2 text-xs">
                  {matchedUser ? (
                    <p className="text-emerald-400 font-bold bg-emerald-500/10 p-2 rounded-xl flex items-center gap-1.5">
                      <UserCheck size={14} /> Verified Account Owner: <strong className="underline text-white">{matchedUser.name}</strong>
                    </p>
                  ) : (
                    <p className="text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-xl flex items-center gap-1.5">
                      <ShieldAlert size={14} /> Unknown account ID lookup failed. Enter a valid account.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Choose destination category */}
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                Funding Destination Account Segment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "checking", label: "Checking Route" },
                  { id: "investment", label: "Investment Route" },
                  { id: "bitcoin", label: "Bitcoin Cold Wallet" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setWireCategory(cat.id as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border outline-none cursor-pointer ${
                      wireCategory === cat.id
                        ? "bg-sky-500 text-slate-950 border-sky-400"
                        : dark
                          ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Adjust Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="250.00"
                  required
                  value={wireAmount}
                  onChange={(e) => setWireAmount(e.target.value)}
                  className={`w-full p-3 rounded-xl outline-none text-xs font-mono font-bold ${
                    dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                  Operation Mode
                </label>
                <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setWireType("Credit")}
                    className={`py-1 rounded text-[10px] font-bold ${
                      wireType === "Credit" ? "bg-emerald-500 text-slate-950" : "text-slate-400"
                    }`}
                  >
                    Credit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWireType("Debit")}
                    className={`py-1 rounded text-[10px] font-bold ${
                      wireType === "Debit" ? "bg-rose-500 text-white" : "text-slate-400"
                    }`}
                  >
                    Debit (-)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                Treasury Reference Memo
              </label>
              <input
                type="text"
                placeholder="e.g. Administrative Compensation adjustment"
                value={wireNote}
                onChange={(e) => setWireNote(e.target.value)}
                className={`w-full p-3 rounded-xl outline-none text-xs ${
                  dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-slate-100 border border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {wireFeedback && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                wireFeedback.includes("Successfully")
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
                {wireFeedback}
              </div>
            )}

            <PrimaryButton
              disabled={!matchedUser || !wireAmount}
              onClick={() => {}}
            >
              Dispatch Direct Treasury Wire
            </PrimaryButton>
          </form>
        </div>
      )}

      {/* 5. UNIFIED SYSTEM LEDGER AND TRANSACTION MANAGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="space-y-1">
            <h3 className={`text-md font-extrabold uppercase ${dark ? "text-white" : "text-slate-900"}`}>
              Valora Unified Ledger & Financial History
            </h3>
            <p className="text-xs text-slate-400">
              System database audit. Administrative clearance allowed to backdate, modify, adjust or fix transaction timestamps for clearing sync.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search via Sender, Beneficiary, ID, Status, Bank or Account..."
              value={txSearchQuery}
              onChange={(e) => setTxSearchQuery(e.target.value)}
              className={`w-full p-2.5 rounded-xl outline-none text-xs ${
                dark ? "bg-slate-900 border border-slate-800 text-white" : "bg-white border border-slate-200 text-slate-900 shadow-sm"
              }`}
            />
            {txSearchQuery && (
              <button
                onClick={() => setTxSearchQuery("")}
                className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-xl hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {(() => {
            const query = txSearchQuery.toLowerCase().trim();
            const filteredTx = transactions.filter((t) => {
              if (!query) return true;
              return (
                t.id.toLowerCase().includes(query) ||
                t.fromName.toLowerCase().includes(query) ||
                t.toName.toLowerCase().includes(query) ||
                t.fromAccountNumber.toLowerCase().includes(query) ||
                t.toAccountNumber.toLowerCase().includes(query) ||
                t.status.toLowerCase().includes(query) ||
                (t.note && t.note.toLowerCase().includes(query)) ||
                (t.recipientBank && t.recipientBank.toLowerCase().includes(query)) ||
                (t.fromBank && t.fromBank.toLowerCase().includes(query))
              );
            });

            if (filteredTx.length === 0) {
              return (
                <div className={`p-8 text-center rounded-2xl border ${dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
                  <p className="text-xs text-slate-400">No transactions match your search filter.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filteredTx.map((t) => {
                  const isTxEditing = editingTxId === t.id;
                  let statusColor = "text-amber-500 bg-amber-500/10 border-amber-500/25";
                  if (t.status === "Approved" || t.status === "Successful" || t.status === "Completed") {
                    statusColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
                  } else if (t.status === "Failed" || t.status === "Declined") {
                    statusColor = "text-rose-500 bg-rose-500/10 border-rose-500/25";
                  }

                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
                        dark ? "bg-slate-900 border-slate-800/80" : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-[9px] font-bold text-sky-450 select-all block mr-1 bg-sky-500/5 px-1.5 py-0.5 rounded">
                              {t.id}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider border px-2 py-0.5 rounded-full ${statusColor}`}>
                              {t.status}
                            </span>
                            {t.transactionType && (
                              <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                                {t.transactionType}
                              </span>
                            )}
                          </div>
                          
                          <p className={`font-bold text-sm tracking-tight ${dark ? "text-white" : "text-slate-905"}`}>
                            {t.fromName} → {t.toName}
                          </p>
                          
                          <div className="text-[10px] text-slate-450 mt-1 font-mono space-y-0.5">
                            <p>From Acc: <strong className="text-indigo-400 font-bold">{t.fromAccountNumber}</strong> ({t.fromBank || "Valora Financial Bank"})</p>
                            <p>To Acc: <strong className="text-indigo-400 font-bold">{t.toAccountNumber}</strong> ({t.recipientBank || "External"})</p>
                            {t.note && (
                              <p className="italic text-slate-400 mt-1 pl-2 border-l-2 border-slate-700 bg-slate-950/25 py-0.5 pr-2 rounded inline-block">
                                Note: "{t.note}"
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-sm text-emerald-500">
                            {fmtMoney(t.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                            {new Date(t.date).toLocaleDateString("en-US", { timeZone: "America/New_York" })} {new Date(t.date).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      {/* Editing state */}
                      <div className="mt-3.5 pt-3 border-t border-slate-800/10 dark:border-slate-800/50">
                        {isTxEditing ? (
                          <div className="space-y-3 w-full bg-slate-950/20 p-3 rounded-2xl border border-slate-500/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                                  Transaction Date & Time
                                </label>
                                <input
                                  type="datetime-local"
                                  value={editingTxDateTime}
                                  onChange={(e) => setEditingTxDateTime(e.target.value)}
                                  className="w-full p-2 text-xs font-mono rounded border border-slate-700 bg-slate-950 text-white outline-none focus:border-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                                  Transaction Amount ($)
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  value={editingTxAmount}
                                  onChange={(e) => setEditingTxAmount(e.target.value)}
                                  className="w-full p-2 text-xs font-mono rounded border border-slate-700 bg-slate-950 text-emerald-400 outline-none focus:border-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                                  Sender Name
                                </label>
                                <input
                                  type="text"
                                  value={editingTxFromName}
                                  onChange={(e) => setEditingTxFromName(e.target.value)}
                                  className="w-full p-2 text-xs rounded border border-slate-700 bg-slate-950 text-white outline-none focus:border-sky-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                                  Recipient Name
                                </label>
                                <input
                                  type="text"
                                  value={editingTxToName}
                                  onChange={(e) => setEditingTxToName(e.target.value)}
                                  className="w-full p-2 text-xs rounded border border-slate-700 bg-slate-950 text-white outline-none focus:border-sky-500"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                                Reference Note
                              </label>
                              <input
                                type="text"
                                value={editingTxNote}
                                onChange={(e) => setEditingTxNote(e.target.value)}
                                className="w-full p-2 text-xs rounded border border-slate-700 bg-slate-950 text-white outline-none focus:border-sky-500"
                              />
                            </div>
                            <div className="flex justify-end gap-1.5 pt-2">
                              <button
                                onClick={() => saveTxDetails(t.id)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                              >
                                Save Ledger Details
                              </button>
                              <button
                                onClick={() => setEditingTxId(null)}
                                className="bg-slate-800 text-slate-300 font-extrabold text-[9px] uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-[10px] text-slate-450 truncate max-w-[280px]">
                              Logged: <span className="font-mono text-slate-400 font-semibold">{t.date}</span>
                            </div>
                            <button
                              onClick={() => startEditingTx(t)}
                              className="px-3.5 py-1.5 bg-slate-800/80 dark:bg-slate-950 text-slate-300 hover:text-white rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all border border-transparent cursor-pointer"
                            >
                              Edit Transaction Record
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 6. LOANS WORKSPACE */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">Vault Clearances</p>
              <h3 className="text-sm font-extrabold uppercase">Sovereign Credit Application Panel</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-sky-500/10 text-sky-400 px-3 py-1 rounded-xl">
              {loans.length} applications
            </span>
          </div>

          {loans.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
              <Compass className="w-10 h-10 mx-auto text-slate-500 mb-2.5 animate-spin" />
              <p className="text-xs text-slate-400">No active sovereign credit applications found in treasury queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {loans.map((loan) => (
                <div 
                  key={loan.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase font-mono tracking-widest ${
                        loan.status === "Pending" 
                          ? "bg-amber-500/15 text-amber-500"
                          : loan.status === "Approved" 
                            ? "bg-emerald-500/15 text-emerald-500" 
                            : "bg-rose-500/15 text-rose-500"
                      }`}>
                        {loan.status}
                      </span>
                      <h4 className={`text-xs font-black uppercase mt-2 ${dark ? "text-slate-100" : "text-slate-900"}`}>
                        {loan.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        Contact: {loan.email} | Type: <span className="text-sky-400 font-bold">{loan.loanType}</span>
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">Submitted: {new Date(loan.date).toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-sky-400 font-mono">Requested Fund</p>
                      <p className="text-sm font-black text-emerald-500 font-mono mt-0.5">{fmtMoney(loan.amount)}</p>
                    </div>
                  </div>

                  {loan.status === "Pending" && (
                    <div className="flex gap-2 pt-3 mt-3 border-t border-slate-800/10 dark:border-slate-800/50">
                      <button
                        onClick={() => onResolveLoan(loan.id, "Approved")}
                        className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-[10px] uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check size={11} className="stroke-[3]" /> Approve Payment
                      </button>
                      <button
                        onClick={() => onResolveLoan(loan.id, "Declined")}
                        className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg text-[10px] uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X size={11} className="stroke-[3]" /> Decline & Cancel
                      </button>
                    </div>
                  )}

                  {loan.status === "Approved" && (
                    <div className="pt-2 mt-2 border-t border-slate-800/10 dark:border-slate-800/30 text-[9.5px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Check size={11} /> Approved - Capital dispersed immediately to associated checking ledger.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. SUPPORT TICKETS WORKSPACE */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">Dispatch Queues</p>
              <h3 className="text-sm font-extrabold uppercase">Sovereign Case Resolving Console</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl">
              {supportTickets.length} cases
            </span>
          </div>

          {supportTickets.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border ${dark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200"}`}>
              <MessageSquare className="w-10 h-10 mx-auto text-slate-500 mb-2.5" />
              <p className="text-xs text-slate-400">No client or visitor support cases currently filed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {supportTickets.map((ticket) => {
                const inqMatch = ticket.message.match(/\[ONBOARDING_INQUIRY_ID:(inq-[a-zA-Z0-9_-]+)\]/);
                const inqId = inqMatch ? inqMatch[1] : null;
                const associatedInquiry = inqId ? (investmentInquiries || []).find(i => i.id === inqId) : null;

                return (
                  <div 
                    key={ticket.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                            ticket.status === "Open" ? "bg-amber-500/15 text-amber-500 animate-pulse" : "bg-slate-800 text-slate-400"
                          }`}>
                            {ticket.status}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono tracking-wider">{new Date(ticket.date).toLocaleDateString("en-US", { timeZone: "America/New_York" })}</span>
                        </div>
                        <h4 className={`text-xs font-black uppercase mt-2.5 ${dark ? "text-slate-200" : "text-slate-900"}`}>
                          Subject: {ticket.subject}
                        </h4>
                        <p className="text-[10.5px] text-slate-300 font-bold mt-1">Applicant: {ticket.name} ({ticket.email})</p>
                        
                        <div className={`p-3 rounded-xl text-xs mt-3 select-all leading-relaxed whitespace-pre-wrap ${
                          dark ? "bg-slate-950/80 text-slate-300" : "bg-slate-50 text-slate-700"
                        }`}>
                          "{ticket.message}"
                        </div>

                        {associatedInquiry && (
                          <div className={`mt-3 p-3.5 rounded-xl border ${
                            associatedInquiry.status === "Approved" 
                              ? "bg-emerald-950/20 border-emerald-900/30 text-slate-300" 
                              : "bg-amber-500/5 border-amber-500/20"
                          }`}>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-500">
                              <Landmark size={12} className="stroke-[2.5]" />
                              Sovereign Onboarding Quick Actions
                            </div>
                            <p className="text-[9.5px] text-slate-400 mt-1">
                              Current Inquiry Status: <span className={`font-mono font-black ${
                                associatedInquiry.status === "Approved" ? "text-emerald-400" : "text-amber-500 animate-pulse"
                              }`}>{associatedInquiry.status}</span>
                            </p>

                            <div className="mt-2 text-[10px] font-mono grid grid-cols-2 gap-2 text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/30">
                              <div>
                                <span className="text-[8px] text-slate-400 uppercase font-bold block">User Security PIN</span>
                                <span className="text-emerald-400 font-bold">{associatedInquiry.pin}</span>
                              </div>
                              <div>
                                <span className="text-[8px] text-slate-400 uppercase font-bold block">Chosen Password</span>
                                <span className="text-amber-400 font-bold">{associatedInquiry.passwordText || "Not specified"}</span>
                              </div>
                            </div>

                            {associatedInquiry.status === "Pending" && (
                              <div className="mt-2.5">
                                {approvingInquiryId !== associatedInquiry.id ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setApprovingInquiryId(associatedInquiry.id);
                                      setInquiryAccNum(generateAccountNumber());
                                      setInquiryPass(associatedInquiry.passwordText || "VALORA-" + Math.floor(1000 + Math.random() * 9000));
                                    }}
                                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-[9.5px] uppercase transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <Check size={12} className="stroke-[3]" /> Approve & Configure Profile
                                  </button>
                                ) : (
                                  <div className={`p-3 rounded-xl border space-y-3 mt-2 ${
                                    dark ? "bg-slate-950 border-slate-850" : "bg-slate-100 border-slate-200"
                                  }`}>
                                    <h4 className="text-[9.5px] font-black uppercase text-amber-500">Setup Portal Credentials</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Acc Num</label>
                                        <input
                                          type="text"
                                          value={inquiryAccNum}
                                          onChange={(e) => setInquiryAccNum(e.target.value)}
                                          className={`w-full px-2.5 py-1 rounded-lg text-xs font-mono border ${
                                            dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"
                                          } outline-none`}
                                        />
                                      </div>
                                      <div>
                                        <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Temp Password</label>
                                        <input
                                          type="text"
                                          value={inquiryPass}
                                          onChange={(e) => setInquiryPass(e.target.value)}
                                          className={`w-full px-2.5 py-1 rounded-lg text-xs font-mono border ${
                                            dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"
                                          } outline-none`}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-0.5">
                                      <button
                                        type="button"
                                        onClick={() => setApprovingInquiryId(null)}
                                        className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all ${
                                          dark ? "bg-slate-900 text-slate-400 hover:text-white" : "bg-slate-200 text-slate-600"
                                        }`}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (onApproveInquiry) {
                                            onApproveInquiry(associatedInquiry.id, {
                                              accountNumber: inquiryAccNum,
                                              passwordText: inquiryPass
                                            });
                                            setApprovingInquiryId(null);
                                            onResolveTicket(ticket.id, "Resolved");
                                          }
                                        }}
                                        className="px-3.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded transition-all"
                                      >
                                        Approve & Save
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {associatedInquiry.status === "Approved" && associatedInquiry.createdAccount && (
                              <div className={`p-2.5 rounded-lg border text-[10.5px] font-mono space-y-1 mt-2.5 ${
                                dark ? "bg-emerald-950/10 border-emerald-900/20 text-slate-300" : "bg-emerald-50 border-emerald-100 text-slate-700"
                              }`}>
                                <div className="text-[8.5px] uppercase font-bold text-emerald-500 mb-0.5">Approved Portal Acc Logins:</div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div>Acc: <span className="font-extrabold text-white select-all">{associatedInquiry.createdAccount.accountNumber}</span></div>
                                  <div>Pass: <span className="font-extrabold text-white select-all">{associatedInquiry.createdAccount.passwordText}</span></div>
                                </div>
                                <div className="text-[10px] mt-1">
                                  PIN: <span className="font-extrabold text-emerald-400 select-all">{associatedInquiry.createdAccount.pin}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {ticket.status === "Open" && !associatedInquiry && (
                      <button
                        onClick={() => onResolveTicket(ticket.id, "Resolved")}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-[10px] uppercase mt-3 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check size={12} className="stroke-[3]" /> Resolve ticket (Send Notification)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. ANNOUNCEMENTS / SYSTEM ALERTS */}
      {activeTab === "announcements" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">Alert Broadcasting</p>
              <h3 className="text-sm font-extrabold uppercase">Sovereign News & Notices</h3>
            </div>
          </div>

          <div className={`p-5 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Megaphone size={14} className="text-indigo-400 animate-bounce" /> Broadcast News Flash Notice
            </h4>
            <p className="text-[10px] text-slate-400 mb-4 leading-normal">
              Type coordinates to instantly publish custom notices on the top-level scrolling banner of the homepage portal immediately.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newAnnText.trim()) return;
              onPublishAnnouncement(newAnnText.trim());
              setNewAnnText("");
            }} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Type real-time sovereign bulletins. e.g. Notice: Scheduled private ledger system compliance clears between 02:00 - 03:00 GMT."
                value={newAnnText}
                onChange={(e) => setNewAnnText(e.target.value)}
                className={`w-full p-3 rounded-xl outline-none text-xs ${
                  dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"
                }`}
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black hover:from-sky-600 hover:to-indigo-700 rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Send size={12} /> Publish Live notice
              </button>
            </form>
          </div>

          {/* Published Bulletins */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Bulletin Archive Logs</p>
            
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No published bulletins archived.</p>
            ) : (
              <div className="space-y-2">
                {announcements.map((ann, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl text-xs border flex justify-between items-center gap-2 ${
                      dark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-white border-slate-150 text-slate-800"
                    }`}
                  >
                    <p className="font-medium">"{ann}"</p>
                    <span className="text-[9px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full shrink-0">
                      Active Notice
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. INVESTMENT & BITCOIN ADVANCED MARKET CONTROLS */}
      {activeTab === "investment_settings" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-teal-400 uppercase">Sovereign Market Controls</p>
              <h3 className="text-sm font-extrabold uppercase">Investment & Bitcoin APY Settings</h3>
            </div>
            <Megaphone size={16} className="text-teal-400" />
          </div>

          <div className={`p-5 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              Configure Global Market Yields
            </h4>
            <p className="text-[10px] text-slate-400 mb-6 leading-normal">
              Directly control the compound rates and active duration days for all sovereign assets. These settings are active on all customer portfolio funding clearings, and apply daily growth directly to checking/bitcoin routes.
            </p>

            {settingsFeedback && (
              <div className="p-3 mb-4 bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check size={14} />
                <span>{settingsFeedback}</span>
              </div>
            )}

            <form onSubmit={(e) => {
              e.preventDefault();
              const pDailyNum = parseFloat(pDaily);
              const pDaysNum = parseInt(pDays, 10);
              const bDailyNum = parseFloat(bDaily);
              const bDaysNum = parseInt(bDays, 10);
              const bonusFundNum = parseFloat(bonusFund);

              if (isNaN(pDailyNum) || isNaN(pDaysNum) || isNaN(bDailyNum) || isNaN(bDaysNum) || isNaN(bonusFundNum)) {
                alert("Please verify all numerical settings are valid inputs.");
                return;
              }

              if (onUpdateInvestmentSettings) {
                onUpdateInvestmentSettings({
                  portfolioDailyPercentage: pDailyNum,
                  portfolioDurationDays: pDaysNum,
                  bitcoinDailyPercentage: bDailyNum,
                  bitcoinDurationDays: bDaysNum,
                  instantFundingBonusPercentage: bonusFundNum,
                  thirdPartyTransactionsDisabled: thirdPartyTransactionsDisabled,
                  bitcoinFundingAddress: btcAddress,
                  realEstateFundingAccount: reAccount,
                  portfolioFundingAccount: portfolioAccount
                });
                setSettingsFeedback("System Configuration Committed: Yield portfolios and outbound manual funding accounts updated successfully.");
                setTimeout(() => setSettingsFeedback(null), 5000);
              }
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Portfolio Group */}
                <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="text-[9px] font-black tracking-widest text-teal-400 uppercase block">1. Standard Asset Portfolios</span>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Daily Yield Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={pDaily}
                      onChange={(e) => setPDaily(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Portfolio Lock Duration (Days)</label>
                    <input
                      type="number"
                      required
                      value={pDays}
                      onChange={(e) => setPDays(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                {/* Bitcoin Group */}
                <div className="space-y-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <span className="text-[9px] font-black tracking-widest text-amber-550 uppercase block">2. Sovereign Bitcoin Vault</span>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-455 block mb-1">Daily Yield Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bDaily}
                      onChange={(e) => setBDaily(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-455 block mb-1">Bitcoin Appreciation Duration (Days)</label>
                    <input
                      type="number"
                      required
                      value={bDays}
                      onChange={(e) => setBDays(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Outbound Third-Party Gateways Control */}
              <div className={`space-y-4 p-4 rounded-xl border ${
                thirdPartyTransactionsDisabled 
                  ? "border-amber-500/30 bg-amber-500/5 text-amber-500" 
                  : "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[9px] font-black tracking-widest uppercase block text-teal-400">
                      3. Outbound Third-Party Gateways Control
                    </span>
                    <p className={`text-[11px] mt-1 font-extrabold uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                      Status: {thirdPartyTransactionsDisabled 
                        ? "Currently Under Maintenance (Deactivated)" 
                        : "Fully Active & Operational (Activated)"}
                    </p>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-normal max-w-sm">
                      When deactivated, outbound wire, Zelle, Venmo, crypto, PayPal, and Wise remittance systems are blocked. Users see an outages notice explaining high transaction rates maintenance.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newValue = !thirdPartyTransactionsDisabled;
                      setThirdPartyTransactionsDisabled(newValue);
                      if (onUpdateInvestmentSettings) {
                        onUpdateInvestmentSettings({
                          portfolioDailyPercentage: parseFloat(pDaily) || 1.5,
                          portfolioDurationDays: parseInt(pDays, 10) || 30,
                          bitcoinDailyPercentage: parseFloat(bDaily) || 2.0,
                          bitcoinDurationDays: parseInt(bDays, 10) || 30,
                          instantFundingBonusPercentage: parseFloat(bonusFund) || 5.0,
                          thirdPartyTransactionsDisabled: newValue,
                          bitcoinFundingAddress: btcAddress,
                          realEstateFundingAccount: reAccount,
                          portfolioFundingAccount: portfolioAccount
                        });
                        setSettingsFeedback(`Sovereign Gateway status updated: Third-party transactions are now ${newValue ? "DISABLED" : "ENABLED"}.`);
                        setTimeout(() => setSettingsFeedback(null), 5000);
                      }
                    }}
                    className={`px-4.5 py-3 rounded-2xl text-[10.5px] font-black uppercase tracking-wider cursor-pointer shadow-lg w-full sm:w-auto transition-all ${
                      thirdPartyTransactionsDisabled 
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10"
                    }`}
                  >
                    {thirdPartyTransactionsDisabled ? "Activate 3rd-Party Routes" : "Deactivate (Set to Maintenance)"}
                  </button>
                </div>
              </div>

              {/* Funding Market Boost */}
              <div className="space-y-4 p-4 rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5">
                <span className="text-[9px] font-black tracking-widest text-sky-400 uppercase block">4. Administrative & Investment Market Booster</span>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Funding Boost Rate (%)</label>
                  <p className="text-[9px] text-slate-400 mb-2 leading-relaxed">
                    Adds automatic extra percentage funds instantly when customers fund Portfolios or credit Bitcoin. Controlled jointly by active index market indices and administrative bank reserves.
                  </p>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bonusFund}
                    onChange={(e) => setBonusFund(e.target.value)}
                    className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                      dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Manual Funding Account Customization */}
              <div className="space-y-4 p-4 rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5">
                <span className="text-[9px] font-black tracking-widest text-teal-400 uppercase block">5. Administrative Manual Funding Accounts</span>
                <p className="text-[9.5px] text-slate-400 leading-relaxed">
                  These accounts are displayed to users when they initiate manual investment funding for Bitcoin or Real Estate.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Bitcoin Administrative Wallet Address</label>
                    <input
                      type="text"
                      required
                      value={btcAddress}
                      onChange={(e) => setBtcAddress(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Real Estate Administrative Routing / Bank Wire Account</label>
                    <textarea
                      rows={2}
                      required
                      value={reAccount}
                      onChange={(e) => setReAccount(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Portfolio Investment Administrative Routing / Bank Wire Account</label>
                    <textarea
                      rows={2}
                      required
                      value={portfolioAccount}
                      onChange={(e) => setPortfolioAccount(e.target.value)}
                      className={`w-full p-2.5 rounded-xl outline-none text-xs font-mono font-bold ${
                        dark ? "bg-slate-950 border border-slate-800 text-white" : "bg-indigo-50/20 border border-slate-200 text-slate-900"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                Commit Sovereign Configurations
              </button>
            </form>
          </div>

          {/* 6. Real-Time 24-Hour Market Accrual Engine */}
          <div className={`p-5 rounded-[2rem] border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-amber-500">
              <span className="animate-spin duration-1000 inline-block">🔄</span> 24-Hour Market Accrual Engine
            </h4>
            <p className="text-[10px] text-slate-400 mb-4 leading-normal">
              Every 24 hours, the system applies your configured daily rates to all active customer investment portfolios and Bitcoin vaults. Positive rates will increase balances, while negative rates will decrease balances. Click below to manually step exactly 24 hours ahead and trigger this accrual cycle on all users instantly.
            </p>

            <div className={`p-4 rounded-2xl mb-4 border text-[11px] font-mono ${
              dark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
            }`}>
              <div className="flex justify-between border-b pb-2 mb-2 border-slate-800/20">
                <span className="font-bold uppercase text-[9.5px]">Active Parameter</span>
                <span className="font-bold uppercase text-[9.5px]">Current Active Rate</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Standard Portfolios (S&P 500, Real Estate, etc.)</span>
                <span className={`font-black ${parseFloat(pDaily) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {parseFloat(pDaily) >= 0 ? "+" : ""}{parseFloat(pDaily).toFixed(2)}% / Day
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>Sovereign Bitcoin Vault</span>
                <span className={`font-black ${parseFloat(bDaily) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {parseFloat(bDaily) >= 0 ? "+" : ""}{parseFloat(bDaily).toFixed(2)}% / Day
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onTrigger24hMarketFluctuation) {
                  onTrigger24hMarketFluctuation();
                  setSettingsFeedback("Clearinghouse Settlement Successful: 24h market accrual cycle applied to all active portfolios and bitcoin vaults.");
                  setTimeout(() => setSettingsFeedback(null), 5000);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black rounded-xl text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-md shadow-orange-500/10"
            >
              🚀 Execute 24-Hour Market Accrual Cycle
            </button>
          </div>
        </div>
      )}

      {/* 9. INVESTMENT & CUSTODY INQUIRIES VIEW */}
      {activeTab === "investment_inquiries" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase">Sovereign Onboarding</p>
              <h3 className="text-sm font-extrabold uppercase">Investment & Custody Account Inquiries</h3>
            </div>
            <Landmark size={16} className="text-amber-500" />
          </div>

          {/* Statistics Summary Mini-Row */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className={`p-3 rounded-2xl border text-center ${dark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-150"}`}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Inquiries</p>
              <p className="text-lg font-mono font-black mt-0.5">{investmentInquiries.length}</p>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${dark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-150"}`}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending Audit</p>
              <p className="text-lg font-mono font-black text-amber-500 mt-0.5">
                {investmentInquiries.filter(i => i.status === "Pending").length}
              </p>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${dark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-150"}`}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Authorized</p>
              <p className="text-lg font-mono font-black text-emerald-500 mt-0.5">
                {investmentInquiries.filter(i => i.status === "Approved").length}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={inquirySearchQuery}
              onChange={(e) => setInquirySearchQuery(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl text-xs border ${
                dark 
                  ? "bg-slate-950 border-slate-850 text-white placeholder-slate-500 focus:border-amber-500" 
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-amber-500"
              } outline-none font-mono transition-all`}
            />
            <div className="flex gap-2">
              {(["All", "Pending", "Approved"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setInquiryStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    inquiryStatusFilter === filter
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : dark
                        ? "bg-slate-950 border border-slate-850 text-slate-400 hover:text-white"
                        : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Inquiries List */}
          {(() => {
            const filtered = investmentInquiries.filter((inq) => {
              const matchesSearch = 
                inq.name.toLowerCase().includes(inquirySearchQuery.toLowerCase()) ||
                inq.email.toLowerCase().includes(inquirySearchQuery.toLowerCase()) ||
                inq.location.toLowerCase().includes(inquirySearchQuery.toLowerCase());
              
              const matchesStatus = 
                inquiryStatusFilter === "All" || inq.status === inquiryStatusFilter;
              
              return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
              return (
                <div className={`p-8 text-center rounded-[2rem] border ${dark ? "bg-slate-900/30 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <Landmark className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400 font-mono">No matching investment inquiries found.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {filtered.map((inq) => {
                  const isApproving = approvingInquiryId === inq.id;
                  return (
                    <div
                      key={inq.id}
                      className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                        dark ? "bg-slate-900/50 border-slate-850" : "bg-white border-slate-200 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs uppercase tracking-wide">{inq.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({inq.location})</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                              inq.status === "Pending" ? "bg-amber-500/15 text-amber-500 animate-pulse" : "bg-emerald-500/15 text-emerald-500"
                            }`}>
                              {inq.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{inq.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Requested Capital</span>
                          <span className="text-sm font-mono font-black text-amber-500">{fmtMoney(inq.amount)}</span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-xl border text-xs font-mono grid grid-cols-1 sm:grid-cols-3 gap-2.5 ${
                        dark ? "bg-slate-950/80 border-slate-900 text-slate-300" : "bg-slate-50 border-slate-150 text-slate-700"
                      }`}>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Asset route selection</span>
                          <span className="font-bold text-white uppercase bg-slate-800 px-2 py-0.5 rounded text-[10px]">{inq.route} Route</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">User security pin</span>
                          <span className="font-bold tracking-widest font-mono text-emerald-400">{inq.pin}</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Chosen password</span>
                          <span className="font-bold font-mono text-amber-400">{inq.passwordText || "Not specified"}</span>
                        </div>
                      </div>

                      {inq.status === "Pending" && !isApproving && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setApprovingInquiryId(inq.id);
                              setInquiryAccNum(generateAccountNumber());
                              setInquiryPass(inq.passwordText || "VALORA-" + Math.floor(1000 + Math.random() * 9000));
                            }}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center gap-1"
                          >
                            <Check size={12} className="stroke-[3]" /> Open Approval Setup
                          </button>
                        </div>
                      )}

                      {inq.status === "Pending" && isApproving && (
                        <div className={`p-4 rounded-xl border space-y-3.5 mt-1 ${
                          dark ? "bg-slate-900 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}>
                          <h4 className="text-[11px] font-extrabold uppercase text-amber-500">Secure Account Credentials & Ledger Routing</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Generated Account Number</label>
                              <input
                                type="text"
                                value={inquiryAccNum}
                                onChange={(e) => setInquiryAccNum(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono border ${
                                  dark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"
                                } outline-none`}
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Temporary Password</label>
                              <input
                                type="text"
                                value={inquiryPass}
                                onChange={(e) => setInquiryPass(e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono border ${
                                  dark ? "bg-slate-950 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"
                                } outline-none`}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2.5 pt-1">
                            <button
                              type="button"
                              onClick={() => setApprovingInquiryId(null)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                                dark ? "bg-slate-950 text-slate-400 hover:text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-250"
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onApproveInquiry) {
                                  onApproveInquiry(inq.id, {
                                    accountNumber: inquiryAccNum,
                                    passwordText: inquiryPass
                                  });
                                  setApprovingInquiryId(null);
                                }
                              }}
                              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all"
                            >
                              Approve & Create Account
                            </button>
                          </div>
                        </div>
                      )}

                      {inq.status === "Approved" && inq.createdAccount && (
                        <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                          dark ? "bg-emerald-950/15 border-emerald-900/30 text-slate-300" : "bg-emerald-50 border-emerald-100 text-slate-700"
                        }`}>
                          <div className="text-[9px] uppercase font-bold text-emerald-500">Authorized Account Credentials</div>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <div>
                              <span className="text-[9.5px] text-slate-400 block">Account Number:</span>
                              <span className="font-bold font-mono text-[11px] block text-emerald-500">{inq.createdAccount.accountNumber}</span>
                            </div>
                            <div>
                              <span className="text-[9.5px] text-slate-400 block">Temp Password:</span>
                              <span className="font-bold font-mono text-[11px] block text-emerald-500">{inq.createdAccount.passwordText}</span>
                            </div>
                            <div>
                              <span className="text-[9.5px] text-slate-400 block">User PIN:</span>
                              <span className="font-bold font-mono text-[11px] block text-emerald-500">{inq.createdAccount.pin}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
