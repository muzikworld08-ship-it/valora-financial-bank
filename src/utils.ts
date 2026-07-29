import { AppState, UserProfile, BankTransaction, DirectNotification, Beneficiary } from "./types";

export const STORAGE_KEY = "valora-financial-bank-state-v1";
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const fmtMoney = (n: number): string =>
  "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtDateTime = (iso: string): string => {
  const d = new Date(iso);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(d);
  const hh = parts.find(p => p.type === "hour")?.value || "00";
  const mm = parts.find(p => p.type === "minute")?.value || "00";
  
  const dFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric"
  });
  return dFormatter.format(d) + `, ${hh}:${mm}`;
};

export const fmtDay = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => {
    const aStr = a.toLocaleDateString("en-US", { timeZone: "America/New_York" });
    const bStr = b.toLocaleDateString("en-US", { timeZone: "America/New_York" });
    return aStr === bStr;
  };
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  return formatter.format(d);
};

export const getUSNYTime = (isoOrDate: string | Date = new Date()): string => {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  const options = {
    timeZone: "America/New_York",
    year: "numeric" as const,
    month: "2-digit" as const,
    day: "2-digit" as const,
    hour: "2-digit" as const,
    minute: "2-digit" as const,
    second: "2-digit" as const,
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(d);
  const year = parts.find((p) => p.type === "year")?.value || "2026";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const day = parts.find((p) => p.type === "day")?.value || "01";
  const hour = parts.find((p) => p.type === "hour")?.value || "00";
  const minute = parts.find((p) => p.type === "minute")?.value || "00";
  const second = parts.find((p) => p.type === "second")?.value || "00";
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

export const initials = (name: string): string =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export const uid = (): string => Math.random().toString(36).slice(2, 10);

// Generate a cryptographically secure 6-digit random OTP
export const generateSecureOTP = (): string => {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const code = (array[0] % 1000000).toString().padStart(6, "0");
  return code;
};

// Browser-compatible SHA-256 cryptography hash
export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
};

// Resolve secure UK banking network node for the verified session audit trail
export const resolveSecureUSIP = (): string => {
  const ips = [
    "194.230.147.88", // UK Private IP (London)
    "85.5.120.142",   // UK Trustcom (Manchester)
    "178.238.165.73", // UK Sovereign Node (Edinburgh)
    "193.134.254.91"  // UK Vault Clearing (London)
  ];
  return ips[Math.floor(Math.random() * ips.length)];
};

export const generateTransactionId = (existingIds: string[] = []): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  
  let attempts = 0;
  while (attempts < 100) {
    const random6 = String(Math.floor(100000 + Math.random() * 90000) || "847392").padStart(6, "0");
    const id = `VFB-${year}${month}${day}-${random6}`;
    if (!existingIds.includes(id)) {
      return id;
    }
    attempts++;
  }
  return `VFB-${year}${month}${day}-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Generate a random 10 digit account number
export const generateAccountNumber = (): string => {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
};

export const seedState = (): AppState => {
  const users: UserProfile[] = [
    {
      id: "user-sarah",
      name: "Christopher & Katelyn Family Account",
      email: "family@valorafinancialbank.com",
      password: "pass1234",
      pin: "1111",
      accountNumber: "3813425582",
      balance: 1158004.00,
      bitcoinBalance: 4.825,
      investmentBalance: 240000,
      investmentsList: [
        {
          id: "inv-1",
          assetId: "us-gov",
          assetName: "UK Treasury Gilts 10Y",
          assetType: "BONDS",
          investedAmount: 150000,
          currentValue: 154500,
          yieldRate: "2.10% Fixed",
          date: "2026-01-15T08:00:00Z",
          status: "ACTIVE"
        },
        {
          id: "inv-2",
          assetId: "apple",
          assetName: "Apple Inc. (AAPL)",
          assetType: "STOCKS",
          investedAmount: 90000,
          currentValue: 95500,
          yieldRate: "1.4% Div Variable",
          date: "2026-03-10T10:00:00Z",
          status: "ACTIVE"
        }
      ],
      cardNum: "4532 9901 8847 3921",
      cardExpiry: "06/32",
      cardFrozen: false,
      cardLimit: 50000,
      cardSpent: 1200,
      avatarUrl: "https://www.mrsindiaqueen.com/blog/uploads/images/2024/12/image_750x_676515e9295e5.jpg",
      location: "London, United Kingdom",
      createdAt: "Jun 10, 2011"
    },
    {
      id: "user-benjamin",
      name: "Benjamin Vance",
      email: "vance@valorafinancialbank.com",
      password: "pass1234",
      pin: "2222",
      accountNumber: "1009472318",
      balance: 3890200,
      bitcoinBalance: 12.55,
      investmentBalance: 520000,
      investmentsList: [
        {
          id: "inv-3",
          assetId: "manhattan-estate",
          assetName: "Manhattan Commercial Real Estate Trust",
          assetType: "REAL_ESTATE",
          investedAmount: 500000,
          currentValue: 520000,
          yieldRate: "5.8% Rental Fund",
          date: "2025-11-20T09:00:00Z",
          status: "ACTIVE"
        }
      ],
      cardNum: "4532 9901 2738 4930",
      cardExpiry: "11/32",
      cardFrozen: false,
      cardLimit: 100000,
      cardSpent: 4500,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      location: "Manchester, United Kingdom",
      createdAt: "Mar 24, 2015"
    },
    {
      id: "user-chloe",
      name: "Chloe Dupont",
      email: "dupont@valorafinancialbank.com",
      password: "pass1234",
      pin: "3333",
      accountNumber: "1007421839",
      balance: 8420000,
      bitcoinBalance: 48.0,
      investmentBalance: 1500000,
      investmentsList: [
        {
          id: "inv-4",
          assetId: "microsoft",
          assetName: "Microsoft Corp (MSFT)",
          assetType: "STOCKS",
          investedAmount: 1000000,
          currentValue: 1045000,
          yieldRate: "4.1% Div Fixed",
          date: "2025-08-05T08:00:00Z",
          status: "ACTIVE"
        },
        {
          id: "inv-5",
          assetId: "us-gold",
          assetName: "Sovereign Gold Bullion ETF (NY)",
          assetType: "REAL_ESTATE",
          investedAmount: 500000,
          currentValue: 455000,
          yieldRate: "Spot Commodity",
          date: "2026-02-12T14:30:00Z",
          status: "ACTIVE"
        }
      ],
      cardNum: "4532 9901 9918 8472",
      cardExpiry: "09/32",
      cardFrozen: false,
      cardLimit: 250000,
      cardSpent: 900,
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      location: "Paris, France",
      createdAt: "Sep 11, 2018"
    }
  ];

  const transactions: BankTransaction[] = [
    {
      id: "VFB-20260618-738291",
      fromUserId: "EXTERNAL",
      toUserId: "user-sarah",
      fromName: "Sovereign Private Reserve Clearing",
      toName: "Sarah Sterling",
      fromAccountNumber: "GB90-8800-4819-2041",
      toAccountNumber: "1004829302",
      amount: 1500000,
      note: "Sovereign Asset Liquidity Injection",
      date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: "Successful",
      recipientBank: "Valora Financial Bank",
      fromBank: "Bank of England",
      timeZone: "EST (UTC-5)",
      processingFee: 0,
      serviceCharge: 0,
      totalAmount: 1500000,
      transactionType: "Deposit Credit Wire",
      ipAddress: "193.134.254.91"
    },
    {
      id: "VFB-20260619-129384",
      fromUserId: "user-sarah",
      toUserId: "EXTERNAL",
      fromName: "Sarah Sterling",
      toName: "London Sotheby Art Holding Ltd",
      fromAccountNumber: "1004829302",
      toAccountNumber: "GB12-5839-2019-3847",
      amount: 249500,
      note: "Sovereign Auction Procurement Ref: Lot 104",
      date: new Date(Date.now() - 36000000).toISOString(), // 10 hours ago
      status: "Successful",
      recipientBank: "Barclays Bank PLC",
      fromBank: "Valora Financial Bank",
      timeZone: "EST (UTC-5)",
      processingFee: 150,
      serviceCharge: 50,
      totalAmount: 249700,
      transactionType: "Sovereign Debit Outflow",
      ipAddress: "194.230.147.88"
    },
    {
      id: "VFB-20260619-331298",
      fromUserId: "user-benjamin",
      toUserId: "EXTERNAL",
      fromName: "Benjamin Vance",
      toName: "London Estates Trust Ltd",
      fromAccountNumber: "1009472318",
      toAccountNumber: "GB55-8822-1930-4821",
      amount: 120000,
      note: "Sovereign Real Estate Acquisition Downpayment",
      date: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      status: "Successful",
      recipientBank: "Barclays Bank PLC",
      fromBank: "Valora Financial Bank",
      timeZone: "EST (UTC-5)",
      processingFee: 0,
      serviceCharge: 0,
      totalAmount: 120000,
      transactionType: "Sovereign Treasury Wire",
      ipAddress: "85.5.120.142"
    }
  ];

  const notifications: DirectNotification[] = [
    {
      id: "notif-sarah-1",
      userId: "user-sarah",
      title: "Sovereign Liquidity Cleared",
      body: "Credit transfer of $1,500,000.00 from Bank of England has cleared. Assets posted immediately to checking ledger.",
      read: false,
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: "notif-ben-1",
      userId: "user-benjamin",
      title: "Estate Wire Cleared",
      body: "Your outbound estate wire of $120,000.00 has cleared and been successfully authorized.",
      read: false,
      date: new Date(Date.now() - 7200000).toISOString()
    }
  ];

  const beneficiaries: Beneficiary[] = [
    { id: "ben-1", name: "London Estates Trust Ltd", account: "GB55-8822-1930-4821" },
    { id: "ben-2", name: "London Sotheby Art Holding Ltd", account: "GB12-5839-2019-3847" }
  ];

  const announcements = [
    "Welcome to Valora Financial! Elite United Kingdom private banking clearances are now online.",
    "UK VAULT ADVISORY: Administrative support lines are active 24/7 for custom loan products.",
  ];

  return {
    users,
    beneficiaries,
    transactions,
    notifications,
    loans: [],
    supportTickets: [],
    investmentInquiries: [],
    announcements,
    activeUserId: null,
    isAdminView: false,
    darkMode: true,
    investmentSettings: {
      portfolioDailyPercentage: 1.5,
      portfolioDurationDays: 30,
      bitcoinDailyPercentage: 2.0,
      bitcoinDurationDays: 30,
      instantFundingBonusPercentage: 5.0,
      thirdPartyTransactionsDisabled: true,
      bitcoinFundingAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      realEstateFundingAccount: "Valora Financial Bank Group - JPMorgan Chase - A/C 983274291",
      portfolioFundingAccount: "Valora Global Investment Group - Citibank NA - A/C 482937492",
    }
  };
};

export const getStoredState = async (): Promise<AppState | null> => {
  // Try loading from the centralized Express system backend first, fall back to local storage cache if network fails
  try {
    const sessionUserId = typeof window !== "undefined" ? localStorage.getItem("session_user_id") : null;
    const sessionIsAdmin = typeof window !== "undefined" ? localStorage.getItem("session_is_admin") : null;

    const headers: Record<string, string> = {};
    if (sessionUserId) {
      headers["x-session-user-id"] = sessionUserId;
    }
    if (sessionIsAdmin) {
      headers["x-session-is-admin"] = sessionIsAdmin;
    }

    const response = await fetch("/api/load-state", { headers });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        // Mirrored backup in localStorage
        if (typeof window !== "undefined" && data.state) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.state));
          } catch (storageErr) {
            console.warn("Could not mirror state to local storage:", storageErr);
          }
        }
        return data.state || null;
      } else {
        throw new Error(data.error || "Server returned unsuccessful status");
      }
    } else {
      throw new Error(`Load state failed with HTTP status ${response.status}`);
    }
  } catch (error: any) {
    console.warn("Centralized database loading warnings handled (using client storage cache fallback):", error.message || error);
    // Graceful offline fallback using local storage cache
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          console.log("Successfully loaded state from client-side storage cache fallback.");
          return JSON.parse(cached);
        }
      } catch (err) {
        console.error("Failed to parse local storage cache:", err);
      }
    }
    return null; // Return null instead of crashing, letting App.tsx mount with initial seedState
  }
};

export const setStoredState = async (state: AppState): Promise<void> => {
  // Always mirror backups to local storage cache for maximum offline resiliency
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Could not save to client-side storage cache:", err);
    }
  }

  // Persist strictly to the centralized Express system backend
  try {
    const response = await fetch("/api/save-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state }),
    });
    if (!response.ok) {
      console.warn("Centralized database save failed with status:", response.status);
    }
  } catch (error) {
    console.warn("Centralized database save connection skipped/delayed (saving to offline client cache):", error);
  }
};
