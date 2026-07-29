export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string; // Opting for optional or required. Let's make it optional/string for backward compatibility if needed, but required in our forms.
  pin: string;
  accountNumber: string;
  balance: number;
  bitcoinBalance?: number; // Added for Bitcoin balance
  investmentBalance?: number; // Added for Investments balance
  investmentsList?: UserInvestment[]; // List of user's active investments
  cardNum: string;
  cardExpiry: string;
  cardFrozen: boolean;
  cardLimit: number;
  cardSpent: number;
  avatarUrl?: string;
  location?: string;     // Custom location field added
  createdAt?: string;    // Custom profile creation date added
  accountStatus?: "Active" | "Frozen" | "Blocked"; // Account status integration
  accountStatusReason?: string; // Reason for freeze or block
  accountStatusUnblockInstruction?: string; // Action the user must take to unblock
  enabledAccounts?: ("checking" | "investment" | "bitcoin")[]; // Multi-account configurations
  checkingFrozen?: boolean; // Frozen status of Checking account
  investmentFrozen?: boolean; // Frozen status of Investment account
  bitcoinFrozen?: boolean; // Frozen status of Bitcoin account
  emailVerified?: boolean; // Email verification status
  isEmailVerified?: boolean; // Email verification status alias
  auditLog?: string[]; // Admin audit logs for user account and role manipulations
  notifications?: DirectNotification[]; // List of user's custom direct notifications
}

export interface UserInvestment {
  id: string;
  assetId: string;
  assetName: string;
  assetType: "STOCKS" | "BONDS" | "CRYPTO" | "REAL_ESTATE";
  investedAmount: number;
  currentValue: number;
  yieldRate: string;
  date: string;
  status: "ACTIVE" | "LIQUIDATED";
}

export interface BankTransaction {
  id: string;
  fromUserId: string; // user id or "EXTERNAL" / "ADMIN"
  toUserId: string;   // user id or "EXTERNAL"
  fromName: string;
  toName: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  note: string;
  date: string;
  status: "Pending" | "Approved" | "Declined" | "Failed" | "Reversed" | "Successful" | "Awaiting Verification" | "Pending OTP" | "OTP Verified" | "Completed";
  // Premium breakdown fields for dynamic receipts
  recipientBank?: string;
  fromBank?: string;
  timeZone?: string;
  processingFee?: number;
  serviceCharge?: number;
  totalAmount?: number;
  transactionType?: string;
  auditLog?: string[];
  
  // Secure Transaction Verification System
  verificationStatus?: "Awaiting Verification" | "Verified" | "Failed" | "Locked";
  verificationCodeHash?: string;
  verificationExpiresAt?: string;
  verificationAttempts?: number;
  verificationTime?: string;
  transactionTime?: string;
  ipAddress?: string;

  // Custom properties for Manual Investment Funding
  isInvestmentFunding?: boolean;
  fundingAssetType?: "BITCOIN" | "REAL_ESTATE" | "STOCKS" | "BONDS" | "CRYPTO";
  fundingAssetId?: string;
  fundingAssetName?: string;
  fundingYieldRate?: string;
  paymentReference?: string;
  receiptFileName?: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  account: string;
}

export interface DirectNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  date: string;
}

export type NotificationItem = DirectNotification;

export interface LoanApplication {
  id: string;
  userId?: string; // empty if guest
  name: string;
  email: string;
  loanType: string;
  amount: number;
  status: "Pending" | "Approved" | "Declined";
  date: string;
}

export interface SupportTicket {
  id: string;
  userId?: string; // empty if guest
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "Open" | "Resolved";
  date: string;
}

export interface InvestmentInquiry {
  id: string;
  name: string;
  email: string;
  location: string;
  pin: string;
  passwordText?: string;
  route: "Bitcoin" | "Real Estate" | "Standard Yield" | "Other";
  amount: number;
  status: "Pending" | "Approved";
  createdAccount?: {
    accountNumber: string;
    passwordText: string;
    pin: string;
  };
  date: string;
}

export interface InvestmentSettings {
  portfolioDailyPercentage: number;
  portfolioDurationDays: number;
  bitcoinDailyPercentage: number;
  bitcoinDurationDays: number;
  instantFundingBonusPercentage: number;
  thirdPartyTransactionsDisabled?: boolean;
  bitcoinFundingAddress?: string;
  realEstateFundingAccount?: string;
  portfolioFundingAccount?: string;
}

export interface AppState {
  users: UserProfile[];
  beneficiaries: Beneficiary[];
  transactions: BankTransaction[];
  notifications: DirectNotification[];
  loans: LoanApplication[];
  supportTickets: SupportTicket[];
  announcements: string[];
  activeUserId: string | null; // null represents signed out
  isAdminView: boolean;        // whether we are viewing the Admin Console
  darkMode: boolean;
  investmentSettings?: InvestmentSettings;
  investmentInquiries?: InvestmentInquiry[];
}
