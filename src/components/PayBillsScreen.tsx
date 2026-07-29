import React, { useState, useMemo } from "react";
import { 
  Zap, Droplet, Flame, Wifi, Tv, Smartphone, Database, 
  ShieldCheck, GraduationCap, FileText, Home as HomeIcon, 
  Coins, CreditCard, Heart, Train, Receipt, Search, Filter, 
  Download, Printer, ChevronRight, CheckCircle2, AlertTriangle, 
  Lock, Calendar, Bookmark, Star, Clock, Trash2, Plus, RefreshCw, Send, ShieldAlert, Eye, EyeOff
} from "lucide-react";
import { UserProfile, BankTransaction } from "../types";
import { fmtMoney, fmtDay } from "../utils";

// Fully defined static database of 16 categories and their premium providers
export const BILL_CATEGORIES = [
  { id: "electricity", label: "Electricity Bills", icon: Zap, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  { id: "water", label: "Water Bills", icon: Droplet, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { id: "gas", label: "Gas Bills", icon: Flame, color: "text-orange-500 bg-orange-500/10 border-orange-500/20" },
  { id: "internet", label: "Internet Services", icon: Wifi, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" },
  { id: "cable_tv", label: "Cable TV Subscriptions", icon: Tv, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  { id: "mobile_airtime", label: "Mobile Airtime Recharge", icon: Smartphone, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  { id: "mobile_data", label: "Mobile Data Purchase", icon: Database, color: "text-teal-500 bg-teal-500/10 border-teal-500/20" },
  { id: "insurance", label: "Insurance Premium Payments", icon: ShieldCheck, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  { id: "school_fees", label: "School Fees Payments", icon: GraduationCap, color: "text-amber-600 bg-amber-600/10 border-amber-600/20" },
  { id: "taxes", label: "Government Taxes & Levies", icon: FileText, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { id: "rent", label: "Rent Payments", icon: HomeIcon, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { id: "loan_repayment", label: "Loan Repayments", icon: Coins, color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  { id: "credit_card", label: "Credit Card Payments", icon: CreditCard, color: "text-red-500 bg-red-500/10 border-red-500/20" },
  { id: "healthcare", label: "Healthcare & Medical Bills", icon: Heart, color: "text-pink-500 bg-pink-500/10 border-pink-500/20" },
  { id: "transport", label: "Transport & Toll Payments", icon: Train, color: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20" },
  { id: "custom", label: "Custom Bill Payments", icon: Receipt, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" }
];

export const PROVIDERS_BY_CATEGORY: Record<string, string[]> = {
  electricity: ["Con Edison", "Pacific Gas & Electric (PG&E)", "Duke Energy", "Florida Power & Light"],
  water: ["New York Environmental Protection", "Los Angeles Water & Power", "Chicago Water Department", "Austin Water Utility"],
  gas: ["Southern California Gas", "CenterPoint Energy", "People's Gas LLC", "National Grid Gas Services"],
  internet: ["Comcast Xfinity Premium", "Spectrum Charter Pro", "AT&T Fiber Business", "Verizon Fios Highspeed"],
  cable_tv: ["Comcast Xfinity TV Max", "DirecTV Stream Premier", "Dish Network Gold", "YouTube TV Base"],
  mobile_airtime: ["EE Mobile Airtime", "Vodafone UK Prepaid", "O2 Airtime Boost", "Three Mobile Classic"],
  mobile_data: ["EE 5G Unlimited", "Vodafone Ultra 5G Data", "O2 Premium Gigabytes", "Three Mobile Speed"],
  insurance: ["Aviva Insurance PLC", "AXA Auto & Home", "Direct Line Casualty", "Allianz Private Liability"],
  school_fees: ["University of Oxford Tuition", "University of Cambridge Accounts", "Imperial College London", "LSE Finance Registry"],
  taxes: ["HM Revenue & Customs (HMRC)", "London Westminster City Council", "Manchester City Council", "Birmingham Council Tax Dept"],
  rent: ["Grainger Rental Assets", "Foxtons Lease Clearance", "Savills Residential Leases", "Countrywide Property Co"],
  loan_repayment: ["Valora Sovereign Credit Fund", "Barclays Mortgage Payments", "HSBC Auto Amortisation", "Lloyds Home Loans Co"],
  credit_card: ["Valora Premium Visa", "Barclays Barclaycard Pro", "American Express UK", "HSBC Premier CC"],
  healthcare: ["Bupa Private Health UK", "AXA Health Trust", "Vitality Health Care", "NHS Prescription Services"],
  transport: ["National Rail Services", "Transport for London (TfL)", "Oyster Subway Card Refill", "Uber Cash UK"],
  custom: ["Custom Corporate Code Lookup", "Administrative Custom Billing ID", "International Trust Escrow Account"]
};

// Registered account validations database
const VALIDATED_ACCOUNTS_DB: Record<string, string> = {
  "11223344": "Sarah Sterling",
  "55667788": "Benjamin Vance",
  "12345678": "Edward Harrington (Sovereign Aviation Holding)",
  "98765432": "Eleanor Vance (New York Trustees)",
  "88990011": "Muzikworld Corporate Group",
  "00112233": "Grand Hotel Les Trois Rois",
  "88888888": "Dr. Hans-Dieter Schaller"
};

interface PayBillsScreenProps {
  user: UserProfile;
  transactions: BankTransaction[];
  dark: boolean;
  onAddTransaction: (tx: Partial<BankTransaction>) => void;
  onDeductBalance: (amt: number) => void;
  onAddNotification: (title: string, body: string) => void;
}

export function PayBillsScreen({
  user,
  transactions,
  dark,
  onAddTransaction,
  onDeductBalance,
  onAddNotification
}: PayBillsScreenProps) {
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<"pay" | "history" | "scheduled" | "beneficiaries">("pay");

  // Selection states
  const [selectedCategory, setSelectedCategory] = useState<typeof BILL_CATEGORIES[0] | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Validation feedback loading/states
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validatedAccountName, setValidatedAccountName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Flow State Management
  const [paymentStep, setPaymentStep] = useState<"input" | "security" | "success">("input");
  const [pinValue, setPinValue] = useState<string>("");
  const [showPin, setShowPin] = useState<boolean>(false);
  const [enteredOtp, setEnteredOtp] = useState<string>("");
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpSentAt, setOtpSentAt] = useState<Date | null>(null);
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Success state container
  const [finalTxId, setFinalTxId] = useState<string>("");
  const [finalTxTime, setFinalTxTime] = useState<string>("");
  const [latestReceipt, setLatestReceipt] = useState<any>(null);

  // Favorites / Saved Billers / Scheduled
  const [savedBillers, setSavedBillers] = useState<Array<{ id: string; categoryId: string; provider: string; account: string; title: string; isFavorite: boolean }>>([
    { id: "fav-1", categoryId: "electricity", provider: "Con Edison", account: "11223344", title: "NY ConEd Studio", isFavorite: true },
    { id: "fav-2", categoryId: "internet", provider: "Comcast Xfinity Premium", account: "55667788", title: "Manhattan Wifi", isFavorite: true },
    { id: "fav-3", categoryId: "taxes", provider: "New York State Tax Dept", account: "98765432", title: "State Tax Ref No. 2", isFavorite: false }
  ]);

  const [scheduledPayments, setScheduledPayments] = useState<Array<{ id: string; categoryId: string; provider: string; account: string; amount: number; description: string; nextDate: string; frequency: string }>>([
    { id: "sch-1", categoryId: "rent", provider: "Greystar Asset Management", account: "12345678", amount: 1850, description: "Monthly Manhattan Rent Clearance", nextDate: "2026-07-01", frequency: "Monthly" },
    { id: "sch-2", categoryId: "insurance", provider: "State Farm Insurance", account: "11223344", amount: 240, description: "Vehicular Premium Insurance", nextDate: "2026-06-28", frequency: "Monthly" }
  ]);

  // Scheduled options state
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<string>("Monthly");
  const [saveAsBiller, setSaveAsBiller] = useState<boolean>(false);
  const [billerNickname, setBillerNickname] = useState<string>("");

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Quick Action Handler for Favorites
  const handleQuickPayBiller = (biller: any) => {
    const catObj = BILL_CATEGORIES.find(c => c.id === biller.categoryId) || BILL_CATEGORIES[0];
    setSelectedCategory(catObj);
    setProvider(biller.provider);
    setAccountNumber(biller.account);
    setAmount("");
    setDescription(`Direct payment for ${biller.title}`);
    setPaymentStep("input");
    setActiveSubTab("pay");
    triggerAccountValidation(biller.account);
  };

  // Perform Real-Time Biller Validation
  const triggerAccountValidation = (account: string) => {
    if (!account || account.length < 5) {
      setValidatedAccountName(null);
      setValidationError("Biller account identifier must exceed 4 digits.");
      return;
    }
    setIsValidating(true);
    setValidationError(null);
    setValidatedAccountName(null);

    setTimeout(() => {
      setIsValidating(false);
      // Check registered account database
      if (VALIDATED_ACCOUNTS_DB[account]) {
        setValidatedAccountName(VALIDATED_ACCOUNTS_DB[account]);
      } else {
        // Generative validator for user experience confirmation
        const generatedUser = `Verified Corp Cust ID: ${account.toUpperCase().slice(-4)}-CH`;
        setValidatedAccountName(generatedUser);
      }
    }, 1250);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, ""); // numeric only
    setAccountNumber(val);
    if (val.length >= 6) {
      triggerAccountValidation(val);
    } else {
      setValidatedAccountName(null);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  // Initiate Payment Submission (Generates OTP)
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !provider || !accountNumber || !amount) {
      alert("Please complete all billing fields.");
      return;
    }

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      alert("Please specify a valid transaction amount.");
      return;
    }

    if (amtNum > user.balance) {
      alert("Sovereign Wallet warning: Insufficient holdings to process this bill settlement.");
      return;
    }

    if (amtNum > 10000) {
      alert("Security Limit Exceeded: Standard electronic bill payments are restricted to $10,000.00 maximum per clearance window. Please run an International Private Wire instead.");
      return;
    }

    // Generate random 6-digit email OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpSent(true);
    setOtpSentAt(new Date());
    setSecurityError(null);
    setPinValue("");
    setEnteredOtp("");

    // Dispatch real-time secure OTP via API backend
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp: code,
          amount: amtNum,
          toName: provider,
          toAccountNumber: accountNumber,
          recipientBank: "VALORA CH-PAY CLEARING",
          transactionId: "BILLPAY-" + Math.floor(Math.random() * 90000).toString()
        })
      });
    } catch (e) {
      console.log("Local development OTP server trigger bypassed.");
    }

    setPaymentStep("security");
  };

  // Resend OTP trigger
  const handleResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsOtpSent(true);
    setOtpSentAt(new Date());
    setSecurityError("Cryptographic dispatch active: Check email inbox.");
    
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          otp: code,
          amount: parseFloat(amount),
          toName: provider,
          toAccountNumber: accountNumber,
          recipientBank: "VALORA CH-PAY CLEARING",
          transactionId: "BILLPAY-" + Math.floor(Math.random() * 90000).toString()
        })
      });
    } catch (e) {}
  };

  // Secure Final Authorization Validation (Checks PIN + OTP)
  const handleAuthorizePayment = () => {
    setSecurityError(null);

    // 1. PIN validation
    if (pinValue !== user.pin) {
      setSecurityError("Security clearance error: Transaction PIN invalid.");
      return;
    }

    // 2. OTP expiration check (5 minutes expiry)
    if (otpSentAt && (new Date().getTime() - otpSentAt.getTime() > 5 * 60 * 1000)) {
      setSecurityError("Security code expired. Please click resend.");
      return;
    }

    // 3. OTP Code matching
    if (enteredOtp !== generatedOtp) {
      setSecurityError("Validation challenge failure: Access code does not match registered code.");
      return;
    }

    // All Secure compliance pass! Execute debit and commit transaction state
    const targetAmt = parseFloat(amount);
    const txId = "VFB-BP-" + Math.floor(10000000 + Math.random() * 89999999);
    const nowStr = new Date().toISOString();

    setFinalTxId(txId);
    setFinalTxTime(nowStr);

    onDeductBalance(targetAmt);

    // Create the transaction
    const processingFee = 0.50; // Special low biller charge
    const totalDeducted = targetAmt + processingFee;

    const receiptData = {
      id: txId,
      fromUserId: user.id,
      toUserId: "EXTERNAL",
      fromName: user.name,
      toName: provider,
      fromAccountNumber: user.accountNumber,
      toAccountNumber: accountNumber,
      amount: targetAmt,
      note: description || `Settlement of ${selectedCategory?.label || "bills"}`,
      date: nowStr,
      status: "Successful" as const,
      recipientBank: provider,
      fromBank: "Valora Financial Bank",
      timeZone: "CET (UTC+1)",
      processingFee,
      serviceCharge: 0,
      totalAmount: totalDeducted,
      transactionType: `Bill Pay: ${selectedCategory?.label || "General"}`,
      auditLog: [
        `${nowStr.replace("T", " ").slice(0, 19)} | Proposed digital bill settlement. Category: ${selectedCategory?.label}.`,
        `${nowStr.replace("T", " ").slice(0, 19)} | Secure secure PIN verified of user [${user.name.toUpperCase()}].`,
        `${nowStr.replace("T", " ").slice(0, 19)} | SSL/TLS Handshake verified. Internal OTP token clearing complete.`,
        `${nowStr.replace("T", " ").slice(0, 19)} | Ledger lock committed successfully. Balance debited.`
      ],
      ipAddress: "193.134.254.91",
      verificationStatus: "Verified" as const,
      verificationTime: nowStr
    };

    onAddTransaction(receiptData);
    setLatestReceipt(receiptData);

    // Dispatch physical confirmation email via secure SMTP gateway
    try {
      fetch("/api/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          amount: targetAmt,
          toName: provider,
          toAccountNumber: accountNumber,
          recipientBank: provider,
          transactionId: txId,
          note: description || `Settlement of ${selectedCategory?.label || "bills"}`,
          transactionType: `Bill Pay: ${selectedCategory?.label || "General"}`
        })
      }).catch(err => console.error("Error sending bill confirmation:", err));
    } catch (e) {
      console.error("Failed to fetch /api/send-confirmation for bill pay:", e);
    }

    // Post system in-app notification inside database state automatically
    onAddNotification(
      `${selectedCategory?.label || "Bill"} Settlement Approved`,
      `Successfully debited ${fmtMoney(targetAmt)} to ${provider} on account ${accountNumber}. Tracking ID: ${txId}.`
    );

    // Save Biller favorite logic
    if (saveAsBiller) {
      const newBiller = {
        id: "biller-" + Math.floor(Math.random() * 90000),
        categoryId: selectedCategory?.id || "custom",
        provider,
        account: accountNumber,
        title: billerNickname || provider,
        isFavorite: true
      };
      setSavedBillers(prev => [newBiller, ...prev]);
    }

    // Schedule payment logic
    if (isRecurring) {
      const newSchedule = {
        id: "sched-" + Math.floor(Math.random() * 90000),
        categoryId: selectedCategory?.id || "custom",
        provider,
        account: accountNumber,
        amount: targetAmt,
        description: description || `${selectedCategory?.label || "Bill Payment"} Scheduler`,
        nextDate: new Date(Date.now() + 30 * 86400 * 1000).toISOString().split("T")[0],
        frequency: recurringFrequency
      };
      setScheduledPayments(prev => [newSchedule, ...prev]);
    }

    // Clear and enter Success tab
    setPaymentStep("success");
  };

  // PDF / HTML Receipt Voucher generator
  const downloadReceipt = (tx: any) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VFB Certified Bill Payment Receipt - ${tx.id}</title>
          <style>
            body { font-family: monospace; background:#ffffff; color:#0f172a; padding: 40px; margin:0; }
            .receipt-box { border: 2px solid #1e293b; max-width: 550px; margin: 0 auto; padding: 30px; border-radius: 12px; }
            .title { text-align: center; font-weight: bold; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .subtitle { text-align: center; font-size: 11px; color:#64748b; margin-bottom: 25px; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1; font-size: 13px; }
            .item-total { font-size:16px; font-weight:bold; border-top: 2px solid #0f172a; padding-top:15px; margin-top:15px; }
            .certified { text-align: center; color: #B89765; font-weight: bold; font-size: 11px; margin-top: 30px; border: 1px solid #B89765; padding: 10px; border-radius: 6px; }
            .logo { text-align: center; font-size: 24px; font-weight: 900; color: #0A2540; font-family: 'Georgia', serif; letter-spacing: 2px; }
            .logo span { color: #B89765; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <svg viewBox="0 0 120 100" style="height: 48px; margin: 0 auto 10px auto; display: block;" xmlns="http://www.w3.org/2000/svg">
              <path d="M 16 16 H 48 V 21 C 40 21, 38 24, 36 30 L 58 80 H 61 L 79 30 C 81 24, 82 21, 88 21 V 16 H 68 V 21 C 74 21, 75 24, 73 30 L 59 74 L 43 30 C 41 24, 38 21, 30 21 V 16 Z" fill="#0A2540"/>
              <path d="M 76 48 L 81 40 V 60 L 76 66 Z" fill="#B89765"/>
              <path d="M 85 34 L 90 26 V 53 L 85 59 Z" fill="#B89765"/>
              <path d="M 94 20 L 99 12 V 46 L 94 52 Z" fill="#B89765"/>
            </svg>
            <div class="logo">VALORA <span>FINANCIAL</span></div>
            <div class="title">Official Billing Voucher</div>
            <div class="subtitle">Official payment clearance voucher</div>
            
            <div class="item"><span>Transaction reference</span> <span>${tx.id}</span></div>
            <div class="item"><span>Sovereign Debitor</span> <span>${tx.fromName}</span></div>
            <div class="item"><span>Recipient Biller</span> <span>${tx.toName}</span></div>
            <div class="item"><span>Customer Account Ref</span> <span>${tx.toAccountNumber}</span></div>
            <div class="item"><span>Clearance Date</span> <span>${new Date(tx.date).toUTCString()}</span></div>
            <div class="item"><span>Category</span> <span>${tx.transactionType}</span></div>
            <div class="item"><span>Status</span> <span style="color:#059669; font-weight:bold;">${tx.status.toUpperCase()}</span></div>
            <div class="item font-mono"><span>Processing Fee</span> <span>${fmtMoney(tx.processingFee || 0)}</span></div>
            <div class="item item-total font-mono"><span>Settlement Amount</span> <span>${fmtMoney(tx.amount)}</span></div>
            
            <div class="certified">🔒 SIGNED AND APPROVED BY VALORA FINANCIAL BANK AG, ZÜRICH</div>
          </div>
        </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `VFB_BillPayment_Receipt_${tx.id}.html`;
    link.click();
  };

  const handlePrintReceipt = () => {
    if (!latestReceipt) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Bill Voucher - ${latestReceipt.id}</title>
          <style>body { font-family: sans-serif; display:flex; justify-content:center; padding: 40px; background:#fff; color:#000; }</style>
        </head>
        <body onload="window.print()">
          <div style="border: 1px solid #000; padding: 40px; border-radius:8px; width:500px; text-align: center;">
            <svg viewBox="0 0 120 100" style="height: 48px; margin: 0 auto 10px auto; display: inline-block;" xmlns="http://www.w3.org/2000/svg">
              <path d="M 16 16 H 48 V 21 C 40 21, 38 24, 36 30 L 58 80 H 61 L 79 30 C 81 24, 82 21, 88 21 V 16 H 68 V 21 C 74 21, 75 24, 73 30 L 59 74 L 43 30 C 41 24, 38 21, 30 21 V 16 Z" fill="#0A2540"/>
              <path d="M 76 48 L 81 40 V 60 L 76 66 Z" fill="#B89765"/>
              <path d="M 85 34 L 90 26 V 53 L 85 59 Z" fill="#B89765"/>
              <path d="M 94 20 L 99 12 V 46 L 94 52 Z" fill="#B89765"/>
            </svg>
            <h2 style="margin: 10px 0 0 0; font-family: Georgia, serif; letter-spacing: 1px; color: #0A2540;">VALORA FINANCIAL BANK</h2>
            <hr/>
            <p><strong>Tracking Reference:</strong> ${latestReceipt.id}</p>
            <p><strong>Customer:</strong> ${latestReceipt.fromName}</p>
            <p><strong>Service Biller:</strong> ${latestReceipt.toName}</p>
            <p><strong>Biller System Account:</strong> ${latestReceipt.toAccountNumber}</p>
            <p><strong>Cleared Date:</strong> ${latestReceipt.date}</p>
            <p><strong>Principal Amount:</strong> ${fmtMoney(latestReceipt.amount)}</p>
            <p><strong>Status:</strong> Cleared ${latestReceipt.status}</p>
            <hr/>
            <p style="font-size:10px; text-align:center;">Vault US Clearance authorized entry.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Reset payment states for another transaction
  const handleResetFlow = () => {
    setSelectedCategory(null);
    setProvider("");
    setAccountNumber("");
    setAmount("");
    setDescription("");
    setValidatedAccountName(null);
    setValidationError(null);
    setPinValue("");
    setEnteredOtp("");
    setIsOtpSent(false);
    setPaymentStep("input");
  };

  // Derived filter calculations for Bill Payment History
  const billPaymentsHistory = useMemo(() => {
    return transactions.filter(t => {
      // Must be a Bill Pay transaction
      const isBill = t.transactionType?.toLowerCase().includes("bill pay") || t.id.startsWith("VFB-BP-");
      if (!isBill) return false;

      // Handle query filter
      const matchesSearch = 
        t.toName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.toAccountNumber.includes(searchQuery) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Handle specific category match
      if (filterCategory !== "all") {
        if (!t.transactionType?.toLowerCase().includes(filterCategory.replace("_", " "))) {
          return false;
        }
      }

      // Handle date range
      if (filterStartDate) {
        if (new Date(t.date) < new Date(filterStartDate)) return false;
      }
      if (filterEndDate) {
        const nextDay = new Date(filterEndDate);
        nextDay.setDate(nextDay.getDate() + 1); // include the full end day
        if (new Date(t.date) > nextDay) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, filterCategory, filterStartDate, filterEndDate]);

  // Handle manual additions to scheduler or favorites
  const handleDeleteSchedule = (id: string) => {
    setScheduledPayments(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteBiller = (id: string) => {
    setSavedBillers(prev => prev.filter(s => s.id !== id));
  };

  // Monthly Spending Analytics calculating total bill payments this calendar month
  const monthlyBillsSpending = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return transactions
      .filter(t => {
        const isBill = t.transactionType?.toLowerCase().includes("bill pay") || t.id.startsWith("VFB-BP-");
        if (!isBill) return false;
        const txDate = new Date(t.date);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth && t.status === "Successful";
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  return (
    <div className="px-5 pt-6 pb-28 min-h-[75vh] select-none">
      {/* Header section with monthly spending badge */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className={`text-2xl font-black tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
            Sovereign BillPay
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            Zürich Clearing Settlement Hub
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-right ${
          dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200/60 shadow-xs"
        }`}>
          <span className="block text-[8px] uppercase font-mono text-gray-700 font-bold tracking-wider">This Month</span>
          <span className="text-[11px] font-mono font-black text-[#C8102E]">
            {fmtMoney(monthlyBillsSpending)}
          </span>
        </div>
      </div>

      {/* Quick horizontal mini sub-tabs with counts */}
      <div className="flex gap-2.5 mb-6 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-800">
        {[
          { id: "pay", label: "Pay Bills", icon: Receipt },
          { id: "history", label: "History Panel", icon: Clock, count: billPaymentsHistory.length },
          { id: "scheduled", label: "Scheduled", icon: Calendar, count: scheduledPayments.length },
          { id: "beneficiaries", label: "Saved Billers", icon: Bookmark, count: savedBillers.length }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                if (tab.id === "pay" && paymentStep === "success") {
                  handleResetFlow();
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive 
                  ? "bg-[#C8102E] text-white border-red-500 shadow-md shadow-red-500/10" 
                  : dark
                    ? "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-white"
                    : "bg-white text-slate-600 border-slate-100 shadow-sm hover:bg-slate-50"
              }`}
            >
              <Icon size={13} className={isActive ? "text-slate-950" : "opacity-75"} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full ${
                  isActive ? "bg-red-900 text-white" : "bg-slate-800 text-slate-300"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. PAY BILLS MAIN APPLICATION FORM */}
      {activeSubTab === "pay" && (
        <div>
          {paymentStep === "input" && (
            <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
              {/* Recent shortcuts selection */}
              <div>
                <p className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  ⚡ Recent Billers & Favorites Shortcuts
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {savedBillers.slice(0, 3).map((b) => {
                    const matchedCat = BILL_CATEGORIES.find(c => c.id === b.categoryId) || BILL_CATEGORIES[0];
                    const BillerIcon = matchedCat.icon;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleQuickPayBiller(b)}
                        className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${
                          dark 
                            ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700" 
                            : "bg-white border-slate-100 shadow-xs hover:border-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className={`p-1 rounded-lg ${matchedCat.color}`}>
                            <BillerIcon size={12} />
                          </div>
                          {b.isFavorite && <Star size={10} className="fill-amber-400 text-amber-400" />}
                        </div>
                        <span className={`text-[10px] font-black tracking-tight mt-2 truncate ${dark ? "text-slate-200" : "text-slate-800"}`}>
                          {b.title}
                        </span>
                        <span className="text-[8px] text-slate-400 truncate mt-0.5 font-mono">
                          {b.account}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step A: Category Selector */}
              <div className={`p-4 rounded-3xl border ${
                dark ? "bg-slate-900/50 border-slate-800/80" : "bg-white border-slate-150 shadow-sm"
              }`}>
                <label className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2">
                  1. Bill Category Selection
                </label>
                {!selectedCategory ? (
                  <div className="grid grid-cols-4 gap-2">
                    {BILL_CATEGORIES.map((cat) => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setProvider("");
                          }}
                          className={`p-2.5 rounded-2xl border hover:scale-[1.03] transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer ${
                            dark 
                              ? "bg-slate-950/70 border-slate-900 hover:border-red-500/40 hover:bg-slate-900" 
                              : "bg-slate-50/50 border-slate-100 hover:border-red-300 hover:bg-red-50/10"
                          }`}
                        >
                          <div className={`p-2 rounded-xl scale-110 ${cat.color}`}>
                            <CatIcon size={15} />
                          </div>
                          <span className={`text-[9px] font-extrabold leading-tight tracking-tight line-clamp-2 ${
                            dark ? "text-slate-300" : "text-slate-700"
                          }`}>
                            {cat.label.replace(" Payments", "").replace(" Bills", "").replace(" Subscriptions", "")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={`flex items-center justify-between p-3 rounded-2xl border ${
                    dark ? "bg-slate-950/60 border-slate-850" : "bg-slate-100/50 border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${selectedCategory.color}`}>
                        <selectedCategory.icon size={18} />
                      </div>
                      <div>
                        <span className={`block text-xs font-black uppercase ${dark ? "text-white" : "text-slate-900"}`}>
                          {selectedCategory.label}
                        </span>
                        <span className="text-[10px] text-[#C8102E] font-black uppercase tracking-wider font-mono">Verified VFB Biller Partner</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(null);
                        setProvider("");
                        setValidatedAccountName(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-[#C8102E] hover:bg-red-500/20 text-[10px] font-black uppercase tracking-wider"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic form inputs if category chosen */}
              {selectedCategory && (
                <form onSubmit={handleInitiatePayment} className="space-y-4">
                  <div className={`p-4 rounded-3xl border space-y-3.5 ${
                    dark ? "bg-slate-900/50 border-slate-800/80" : "bg-white border-slate-150 shadow-sm"
                  }`}>
                    <p className="block text-[10px] uppercase font-black tracking-wider text-slate-400 border-b border-slate-800/50 pb-2">
                      2. Transaction Details
                    </p>

                    {/* Service Provider Pulldown */}
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Select Authorized Service Provider
                      </label>
                      <select
                        required
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className={`w-full p-3.5 rounded-2xl outline-none text-xs font-bold ${
                          dark ? "bg-slate-950 border border-slate-850 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"
                        }`}
                      >
                        <option value="">-- Choose Provider --</option>
                        {PROVIDERS_BY_CATEGORY[selectedCategory.id]?.map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>

                    {/* Customer Account Number Field with Online check */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400">
                          Biller Customer Account Reference
                        </label>
                        {isValidating && (
                          <span className="text-[9px] text-[#C8102E] font-mono font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] animate-ping" />
                            Validating ID...
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 11223344"
                        value={accountNumber}
                        onChange={handleAccountChange}
                        className={`w-full p-3.5 rounded-2xl outline-none text-xs font-bold font-mono tracking-wider border ${
                          dark ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />

                      {/* Validated Account name UI output card */}
                      {validatedAccountName && (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] flex items-center gap-2">
                          <CheckCircle2 size={12} className="stroke-[2.5]" />
                          <span>Validated Customer Ref name: <strong className="uppercase font-mono">{validatedAccountName}</strong></span>
                        </div>
                      )}
                      {validationError && (
                        <div className="mt-2.5 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] flex items-center gap-2">
                          <AlertTriangle size={12} />
                          <span>{validationError}</span>
                        </div>
                      )}
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Amount to Pay
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xs font-black text-slate-400">$</span>
                        <input
                          type="text"
                          required
                          placeholder="0.00"
                          value={amount}
                          onChange={handleAmountChange}
                          className={`w-full p-3.5 pl-8 rounded-2xl outline-none text-xs font-mono font-bold border ${
                            dark ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900 font-extrabold"
                          }`}
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 italic">
                        * Standard limit: Max $10,000.00 limits daily.
                      </p>
                    </div>

                    {/* Memo Description */}
                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                        Payment Reference Memo (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Invoice / Room Bill No"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full p-3.5 rounded-2xl outline-none text-xs ${
                          dark ? "bg-slate-950 border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Biller Save / Scheduler Configuration Options */}
                  <div className={`p-4 rounded-3xl border space-y-4 ${
                    dark ? "bg-slate-900/50 border-slate-800/80" : "bg-white border-slate-150 shadow-sm"
                  }`}>
                    <p className="block text-[10px] uppercase font-black tracking-wider text-slate-400">
                      3. Save Biller & Setup Recurring Payments
                    </p>

                    {/* Checkbox A: Save Beneficiary as shortcut icon */}
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="saveBillerChk"
                        checked={saveAsBiller}
                        onChange={(e) => setSaveAsBiller(e.target.checked)}
                        className="mt-1 cursor-pointer"
                      />
                      <label htmlFor="saveBillerChk" className="text-xs cursor-pointer select-none">
                        <span className={`font-black ${dark ? "text-slate-200" : "text-slate-800"}`}>Add to Favorite Biller Directory</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Saves this account as a quick access shortcut for future settlements.</p>
                      </label>
                    </div>

                    {saveAsBiller && (
                      <div className="pl-6 animate-[slideDown_0.2s_ease]">
                        <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                          Biller Nickname Alias
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. My Flat Power"
                          value={billerNickname}
                          onChange={(e) => setBillerNickname(e.target.value)}
                          className={`w-full p-3 rounded-xl outline-none text-xs ${
                            dark ? "bg-slate-950 border border-slate-850 text-white" : "bg-white border-slate-200 text-slate-900"
                          }`}
                        />
                      </div>
                    )}

                    <div className="h-px bg-slate-800/40" />

                    {/* Checkbox B: Set recurring schedule */}
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        id="recurringChk"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="mt-1 cursor-pointer"
                      />
                      <label htmlFor="recurringChk" className="text-xs cursor-pointer select-none">
                        <span className={`font-black ${dark ? "text-slate-200" : "text-slate-800"}`}>Schedule Future Recurring Billings</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Automatically pay this amount periodically from available account equity.</p>
                      </label>
                    </div>

                    {isRecurring && (
                      <div className="pl-6 grid grid-cols-2 gap-3.5 animate-[slideDown_0.2s_ease]">
                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                            Frequency Frequency
                          </label>
                          <select
                            value={recurringFrequency}
                            onChange={(e) => setRecurringFrequency(e.target.value)}
                            className={`w-full p-3 rounded-xl outline-none text-xs ${
                              dark ? "bg-slate-950 border border-slate-850 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"
                            }`}
                          >
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold tracking-wider text-gray-700 mb-1">
                            Clearance Day
                          </label>
                          <div className="p-3 rounded-xl text-xs font-mono font-black border bg-red-50 border-red-100 text-[#C8102E]">
                            Next: 28th of every cycle
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-[#C8102E] hover:bg-[#A93226] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-[0.98]"
                  >
                    <Send size={14} className="stroke-[2.5]" />
                    Proceed to Verification Approval
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Step B: Secure PIN & Email OTP verification */}
          {paymentStep === "security" && (
            <div className="p-5 rounded-3xl border space-y-5 animate-[fadeIn_0.2s_ease-out] relative overflow-hidden bg-slate-950 text-white border-slate-800">
              {/* SSL Handshake Certificate details */}
              <div className="absolute top-0 right-0 p-3 flex items-center gap-1 bg-red-500/10 text-red-500 rounded-bl-3xl font-mono text-[8px] font-black tracking-wider uppercase border-l border-b border-red-500/10">
                <Lock size={10} /> TLS 1.3 US Secure
              </div>

              <div className="text-center pt-3">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-3">
                  <Lock size={20} className="stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black tracking-tight uppercase">Security Vault Clearance</h3>
                <p className="text-[10px] text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Provide your transaction authorization credentials below to release checking holds.
                </p>
              </div>

              {/* Bill Details Summary Card */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 space-y-2.5 text-xs text-slate-300 font-medium">
                <span className="block text-[8px] uppercase font-bold tracking-widest text-[#C8102E]">Settlement Draft Summary</span>
                <div className="flex justify-between">
                  <span className="text-slate-450 text-[10.5px]">Recipient Beneficiary</span>
                  <span className="font-bold text-white text-[10.5px] font-mono">{provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-450 text-[10.5px]">Cust reference number</span>
                  <span className="font-bold text-white text-[10.5px] font-mono">{accountNumber}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/80 pt-2 font-mono text-sm font-bold text-red-500">
                  <span>Chargeable Value</span>
                  <span>{fmtMoney(parseFloat(amount))}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. PIN verification field */}
                <div>
                  <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400 mb-1.5">
                    1. Four-Digit Transaction PIN
                  </label>
                  <div className="relative">
                    <input
                      type={showPin ? "text" : "password"}
                      maxLength={4}
                      placeholder="••••"
                      required
                      value={pinValue}
                      onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                      className="w-full p-3 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-center outline-none focus:border-[#C8102E] font-extrabold text-lg font-mono text-red-500 tracking-[8px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors"
                      title={showPin ? "Hide PIN" : "Show PIN"}
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* 2. OTP email dispatch validation code */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[9px] uppercase font-extrabold tracking-wider text-slate-400">
                      2. Cryptographic Email Verification Key
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[9px] font-bold text-red-500 hover:underline uppercase"
                    >
                      Resend Code
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    required
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-center outline-none focus:border-sky-500 font-extrabold text-sm font-mono tracking-[4px]"
                  />
                  <p className="text-[8.5px] text-slate-400 text-center mt-1.5 leading-normal">
                    * The regulatory clearing protocol has dispatched high-security validation keys directly to your verified email dashboard payload inbox.
                  </p>
                </div>

                {securityError && (
                  <div className="p-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 font-bold text-[10px] flex items-center gap-2">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>{securityError}</span>
                  </div>
                )}

                <div className="flex gap-2 text-xs font-black">
                  <button
                    type="button"
                    onClick={handleResetFlow}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all uppercase tracking-wide cursor-pointer text-center"
                  >
                    Cancel Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleAuthorizePayment}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl transition-all uppercase tracking-wide cursor-pointer text-center"
                  >
                    Authorize Debit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step C: Successful bill payment receipt voucher */}
          {paymentStep === "success" && latestReceipt && (
            <div className="p-5 rounded-3xl border text-center space-y-4.5 animate-[fadeIn_0.2s_ease-out] relative bg-slate-950 text-white border-slate-800">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto ring-8 ring-emerald-500/5 mt-2 animate-bounce">
                <CheckCircle2 size={24} className="stroke-[2.5]" />
              </div>

              <div>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Settlement Completed
                </span>
                <h3 className="text-xl font-black tracking-tight uppercase mt-2.5">Funds Dispatched</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Reference: {finalTxId}
                </p>
              </div>

              {/* Success summary list */}
              <div className="text-left bg-slate-900/60 rounded-2xl border border-slate-850 p-4 space-y-2.5 text-xs text-slate-300 font-semibold font-mono">
                <div className="flex justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-slate-500 uppercase text-[9px]">Receipt Token</span>
                  <span className="text-white text-[10px]">{finalTxId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[9px]">Biller Merchant</span>
                  <span className="text-white text-[10px]">{provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[9px]">Reference Account</span>
                  <span className="text-white text-[10px]">{accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[9px]">Completed Time</span>
                  <span className="text-slate-300 text-[9.5px]">{new Date(finalTxTime).toLocaleString("en-US", { timeZone: "America/New_York" })}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/60 pt-2 text-[#C8102E] text-sm font-bold">
                  <span className="uppercase text-[9.5px]">Cash Disbursed</span>
                  <span>{fmtMoney(latestReceipt.amount)}</span>
                </div>
              </div>

              {/* PDF & Download Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => downloadReceipt(latestReceipt)}
                  className="w-full py-3.5 bg-[#C8102E] hover:bg-[#A93226] text-white font-black tracking-wide rounded-2xl text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download size={14} className="stroke-[2.5]" />
                  Download PDF Bill Voucher
                </button>
                <div className="grid grid-cols-2 gap-2 text-xs font-black">
                  <button
                    onClick={handlePrintReceipt}
                    className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition-all uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Printer size={13} />
                    Print Voucher
                  </button>
                  <button
                    onClick={handleResetFlow}
                    className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[#C8102E] rounded-xl transition-all uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1.5 font-bold"
                  >
                    <Plus size={13} />
                    New Payment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. HISTORY PANEL TAB */}
      {activeSubTab === "history" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          {/* Filters card */}
          <div className={`p-4 rounded-3xl border space-y-3 ${
            dark ? "bg-slate-900/50 border-slate-800/80" : "bg-white border-slate-150 shadow-sm"
          }`}>
            <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-2">
              Filter Bill Clearing Records
            </span>

            {/* Keyword Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-550" />
              <input
                type="text"
                placeholder="Search merchant name, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2.5 pl-9 rounded-xl outline-none text-xs border ${
                  dark ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-[9px] uppercase font-bold text-slate-400 mb-1">Filter by category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`w-full p-2 rounded-xl outline-none text-xs ${
                  dark ? "bg-slate-950 border border-slate-850 text-white" : "bg-slate-50 border border-slate-200 text-slate-900"
                }`}
              >
                <option value="all">All Billing Categories</option>
                {BILL_CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List of payments */}
          <div className="space-y-2.5">
            {billPaymentsHistory.length === 0 ? (
              <div className={`p-8 rounded-3xl text-center border ${
                dark ? "bg-slate-900/30 border-slate-900 text-slate-500" : "bg-slate-50 border-slate-100 text-slate-450"
              }`}>
                <Receipt className="mx-auto mb-2 opacity-50" size={24} />
                <p className="text-xs font-black">No Bill Clearance History Found</p>
                <p className="text-[10px] text-slate-400 mt-1">Adjust search metrics or filters above to check private ledgers.</p>
              </div>
            ) : (
              billPaymentsHistory.map(tx => {
                // Find matched category
                const catObj = BILL_CATEGORIES.find(c => tx.transactionType?.toLowerCase().includes(c.id.replace("_", ""))) || BILL_CATEGORIES[15];
                const CatIcon = catObj.icon;
                return (
                  <div
                    key={tx.id}
                    onClick={() => downloadReceipt(tx)}
                    className={`p-3.5 rounded-3xl border flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer ${
                      dark ? "bg-slate-900/40 border-slate-800/80 hover:border-slate-700" : "bg-white border-slate-100 shadow-xs hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${catObj.color}`}>
                        <CatIcon size={15} />
                      </div>
                      <div>
                        <span className={`block text-xs font-black ${dark ? "text-white" : "text-slate-900"}`}>
                          {tx.toName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-mono mt-0.5">
                          <span>Ref: {tx.toAccountNumber}</span>
                          <span>•</span>
                          <span>{fmtDay(tx.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-black font-mono text-emerald-400">
                        -{fmtMoney(tx.amount)}
                      </span>
                      <span className="text-[8.5px] text-emerald-400/90 font-mono font-bold tracking-wider uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. SCHEDULED TAB */}
      {activeSubTab === "scheduled" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className={`p-4 rounded-3xl border ${
            dark ? "bg-slate-900/50 border-slate-800/80" : "bg-white border-slate-150 shadow-sm"
          }`}>
            <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">
              Active Recurring Calendars
            </span>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              These recurring bills are paid automatically by the Valora ledger system on their next due calendar date.
            </p>
          </div>

          <div className="space-y-2.5">
            {scheduledPayments.length === 0 ? (
              <p className="text-xs text-center p-6 text-slate-500">No scheduled billing calendars linked.</p>
            ) : (
              scheduledPayments.map(sch => {
                const cat = BILL_CATEGORIES.find(c => c.id === sch.categoryId) || BILL_CATEGORIES[0];
                const CatIcon = cat.icon;
                return (
                  <div
                    key={sch.id}
                    className={`p-4 rounded-3xl border ${
                      dark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-100 shadow-xs"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${cat.color}`}>
                          <CatIcon size={15} />
                        </div>
                        <div>
                          <span className={`block text-xs font-black ${dark ? "text-white" : "text-slate-900"}`}>
                            {sch.provider}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">Account ID: <strong className="font-mono">{sch.account}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-black font-mono text-red-500">
                          {fmtMoney(sch.amount)}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                          {sch.frequency}
                        </span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-800/40 my-3" />

                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1 font-bold">
                        <Calendar size={11} /> Next Due: {sch.nextDate}
                      </span>
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="text-rose-500 hover:text-rose-450 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1 font-bold uppercase text-[9px]"
                      >
                        <Trash2 size={11} /> Deactivate
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. PRE-SAVED BILLERS */}
      {activeSubTab === "beneficiaries" && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex justify-between items-center">
            <span className={`text-[10px] uppercase font-bold tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
              Saved Favorite Beneficiary Directory
            </span>
          </div>

          <div className="space-y-2.5">
            {savedBillers.length === 0 ? (
              <p className="text-xs text-center p-6 text-slate-500">No saved favorites directories recorded.</p>
            ) : (
              savedBillers.map(b => {
                const cat = BILL_CATEGORIES.find(c => c.id === b.categoryId) || BILL_CATEGORIES[0];
                const CatIcon = cat.icon;
                return (
                  <div
                    key={b.id}
                    className={`p-3.5 rounded-3xl border flex items-center justify-between ${
                      dark ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-100 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${cat.color}`}>
                        <CatIcon size={14} />
                      </div>
                      <div>
                        <span className={`block text-xs font-black ${dark ? "text-white" : "text-slate-900"}`}>
                          {b.title}
                        </span>
                        <div className="flex items-center gap-2 text-[9px] text-slate-450 mt-0.5">
                          <span>{b.provider}</span>
                          <span>•</span>
                          <span className="font-mono">{b.account}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuickPayBiller(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#C8102E]/10 text-[#C8102E] hover:bg-[#C8102E]/20 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => handleDeleteBiller(b.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 transition-all cursor-pointer"
                        title="Delete biller"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
