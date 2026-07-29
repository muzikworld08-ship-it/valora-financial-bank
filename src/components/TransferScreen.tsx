import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, Check, Users, ShieldAlert, CheckCircle2, AlertCircle, 
  Search, ShieldCheck, ArrowRight, Landmark, Coins, FastForward, Info, Globe, HelpCircle, Phone, Mail, Sparkles, Loader2, X,
  KeyRound, Eye, EyeOff
} from "lucide-react";
import { UserProfile, Beneficiary } from "../types";
import { fmtMoney, initials } from "../utils";
import { PrimaryButton } from "./PrimaryButton";

interface TransferScreenProps {
  currentUser: UserProfile;
  users: UserProfile[];
  beneficiaries: Beneficiary[];
  onSend: (params: { 
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
  }) => void;
  dark: boolean;
  preselectedPayee?: Beneficiary | null;
  onClearPreselectedPayee?: () => void;
  investmentSettings?: any;
}

interface UsBank {
  id: string;
  name: string;
  logo: string;
  swift: string;
  routingPrefix?: string;
}

// Beautiful Vector Brand Logos rendering for US Banks & Payment systems
export function BrandLogoIcon({ brandId, className = "w-7 h-7" }: { brandId: string; className?: string }) {
  const normId = brandId.toLowerCase().trim();

  // 1. CHASE BANK (Official Blue Octagon Hexagon geometric representation)
  if (normId === "chase") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#1172EC" />
        <g transform="translate(50,50) scale(0.6) translate(-50,-50)">
          <path d="M50 20 L80 20 L80 50 L65 50 L65 35 L50 35 Z" fill="#ffffff" />
          <path d="M80 50 L80 80 L50 80 L50 65 L65 65 L65 50 Z" fill="#ffffff" />
          <path d="M50 80 L20 80 L20 50 L35 50 L35 65 L50 65 Z" fill="#ffffff" />
          <path d="M20 50 L20 20 L50 20 L50 35 L35 35 L35 50 Z" fill="#ffffff" />
        </g>
      </svg>
    );
  }

  // 2. BANK OF AMERICA (Official Red & Blue graphic stripe flag representation)
  if (normId === "bofA" || normId === "bofaa" || normId === "bofa") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#002677" />
        <g transform="translate(50,50) scale(0.6) translate(-50,-50)">
          <path d="M15 25 L45 25 L45 40 L15 40 Z" fill="#ffffff" />
          <path d="M15 46 L45 46 L45 61 L15 61 Z" fill="#ffffff" />
          <path d="M15 67 L45 67 L45 82 L15 82 Z" fill="#ffffff" />
          <path d="M55 25 L85 25 L85 40 L55 40 Z" fill="#E20613" />
          <path d="M55 46 L85 46 L85 61 L55 61 Z" fill="#E20613" />
          <path d="M55 67 L85 67 L85 82 L55 82 Z" fill="#E20613" />
        </g>
      </svg>
    );
  }

  // 3. CITIBANK (Official Citibank Arch curved over classic typography)
  if (normId === "citi") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#00457C" />
        <path d="M22 56 C22 30, 78 30, 78 56" fill="none" stroke="#E61A27" strokeWidth="8" strokeLinecap="round" />
        <text x="50" y="66" fill="#ffffff" fontSize="24" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">citi</text>
      </svg>
    );
  }

  // 4. WELLS FARGO (Official Red & Golden yellow initial representation)
  if (normId === "wells-fargo") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#B30E2F" />
        <text x="50" y="60" fill="#F3A721" fontSize="32" fontWeight="950" textAnchor="middle" fontFamily="serif" letterSpacing="1">WF</text>
      </svg>
    );
  }

  // 5. CAPITAL ONE (Corporate Dark Navy with signature red curve swoosh)
  if (normId === "capital-one") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#002147" />
        <path d="M20 70 C35 68, 80 40, 85 25 C75 40, 35 55, 20 70 Z" fill="#D22630" />
        <text x="44" y="55" fill="white" fontSize="18" fontWeight="bold" fontFamily="sans-serif">CO</text>
      </svg>
    );
  }

  // 6. PNC BANK (Iconic bold corporate blue with orange logo element)
  if (normId === "pnc") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#0061AC" />
        <text x="50" y="59" fill="white" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">PNC</text>
      </svg>
    );
  }

  // 7. TD BANK (Vibrant green box shield enclosing white initials)
  if (normId === "td-bank") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#15A81A" />
        <rect x="25" y="25" width="50" height="50" fill="none" stroke="white" strokeWidth="5.5" />
        <text x="50" y="59" fill="white" fontSize="24" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">TD</text>
      </svg>
    );
  }

  // 8. US BANK (Official blue shield-like style with bottom validation line)
  if (normId === "us-bank") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#0C2340" />
        <text x="50" y="58" fill="white" fontSize="26" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">us</text>
        <line x1="25" y1="66" x2="75" y2="66" stroke="#E4002B" strokeWidth="4.5" />
      </svg>
    );
  }

  // 9. TRUIST (Deep purple badge with the dual structural beam blocks)
  if (normId === "truist") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#240A5E" />
        <g transform="translate(50,50) scale(0.9) translate(-50,-50)">
          <rect x="36" y="30" width="10" height="40" rx="3.5" fill="white" />
          <rect x="54" y="30" width="10" height="40" rx="3.5" fill="white" />
        </g>
      </svg>
    );
  }

  // 10. GOLDMAN SACHS (Silver luxury circle)
  if (normId === "goldman") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#6B92C2" />
        <text x="50" y="59" fill="white" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="serif">GS</text>
      </svg>
    );
  }

  // 11. MORGAN STANLEY (Midnight navy with thin modern block lettering)
  if (normId === "morgan-stanley") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#002A54" />
        <text x="50" y="59" fill="white" fontSize="26" fontWeight="bold" textAnchor="middle" fontFamily="serif">MS</text>
      </svg>
    );
  }

  // 12. HSBC (Iconic geometric red and white unfolding hexagon)
  if (normId === "hsbc") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#DB0011" />
        <polygon points="50,50 28,28 28,72" fill="white" />
        <polygon points="50,50 72,28 72,72" fill="white" />
        <polygon points="53,47 31,25 69,25" fill="#DB0011" />
        <polygon points="53,53 31,75 69,75" fill="#DB0011" />
      </svg>
    );
  }

  // 13. ALLY BANK (Deep rich cherry plum colored brand badge)
  if (normId === "ally") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#500050" />
        <text x="50" y="59" fill="white" fontSize="26" fontWeight="semibold" textAnchor="middle" fontFamily="sans-serif">ally</text>
      </svg>
    );
  }

  // 14. SILICON VALLEY BANK (Classic teal modern technology square/triangle check)
  if (normId === "svb") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#00A2E1" />
        <path d="M25 45 L50 22 L75 45 L60 45 L60 78 L40 78 L40 45 Z" fill="white" />
      </svg>
    );
  }

  // 15. ZELLE (Official glowing violet with signature double-bar cross 'z' logo)
  if (normId === "zelle") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#7414CA" />
        <path d="M30 30 L70 30 L38 70 L70 70" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Intersecting vertical flow lines for Zelle trademark look */}
        <line x1="43" y1="20" x2="43" y2="80" stroke="#7414CA" strokeWidth="4" />
        <line x1="57" y1="20" x2="57" y2="80" stroke="#7414CA" strokeWidth="4" />
        {/* Real purple slashes */}
        <line x1="44" y1="36" x2="34" y2="48" stroke="white" strokeWidth="5" strokeLinecap="round" />
        <line x1="66" y1="52" x2="56" y2="64" stroke="white" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  // 16. VENMO (Official vibrant blue sky bubble with classic bold italic letter 'V')
  if (normId === "venmo" || normId === "venom") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#008CFF" />
        <text x="47" y="66" fill="white" fontSize="48" fontWeight="bold" fontStyle="italic" textAnchor="middle" fontFamily="sans-serif">V</text>
      </svg>
    );
  }

  // 17. DISCOVER BANK (Vibrant bright orange circle)
  if (normId === "discover") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#FF6B00" />
        <text x="50" y="58" fill="white" fontSize="22" fontWeight="black" textAnchor="middle" fontFamily="sans-serif">DISC</text>
      </svg>
    );
  }

  // 18. CITIZENS BANK (Leafy organic green circle with triple shield lines)
  if (normId === "citizens") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#008559" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="4.5" />
        <path d="M50 22 C55 35, 45 35, 50 78" stroke="white" strokeWidth="4" fill="none" />
      </svg>
    );
  }

  // 19. REVOLUT (Slick modern silver circle representing instant interbank clearance)
  if (normId === "revolut") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#000000" />
        <text x="50" y="58" fill="white" fontSize="24" fontWeight="black" textAnchor="middle" fontFamily="serif" letterSpacing="0.5">R</text>
        <line x1="25" y1="64" x2="75" y2="64" stroke="#008CFF" strokeWidth="3" />
      </svg>
    );
  }

  // 20. BARCLAYS
  if (normId === "barclays") {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <circle cx="50" cy="50" r="48" fill="#00AEEF" />
        <path d="M50 25 L70 42 L62 70 L38 70 L30 42 Z" fill="white" />
      </svg>
    );
  }

  // Default fallback graphic: elegant circle initials of the bank
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-full font-bold text-[10px] text-white bg-slate-500 ${className}`}>
      {brandId.slice(0, 2).toUpperCase()}
    </div>
  );
}


export function TransferScreen({
  currentUser,
  users,
  beneficiaries,
  onSend,
  dark,
  preselectedPayee,
  onClearPreselectedPayee,
  investmentSettings,
}: TransferScreenProps) {
  const isThirdPartyDisabled = investmentSettings?.thirdPartyTransactionsDisabled ?? true;

  // Transfer method state: NULL means Selection, else wire, crypto, paypal, wise, zelle, venmo, valora
  const [selectedMethod, setSelectedMethod] = useState<"wire" | "crypto" | "paypal" | "wise" | "zelle" | "venmo" | "valora" | null>(null);
  const [blockedMethod, setBlockedMethod] = useState<string | null>(null);
  
  const [step, setStep] = useState(1);
  const [backendBanks, setBackendBanks] = useState<UsBank[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form Fields States
  // 1. Wire transfer states
  const [selectedBank, setSelectedBank] = useState<UsBank | null>(null);
  const [customBankName, setCustomBankName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  
  // 2. Crypto states
  const [cryptoNetwork, setCryptoNetwork] = useState("bitcoin"); 
  const [walletAddress, setWalletAddress] = useState("");
  
  // 3. Paypal states
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalRecipient, setPaypalRecipient] = useState("");

  // 4. Wise states
  const [wiseEmail, setWiseEmail] = useState("");
  const [wiseIban, setWiseIban] = useState("");
  const [wiseCurrency, setWiseCurrency] = useState("EUR");

  // 5. Zelle states
  const [zelleContact, setZelleContact] = useState(""); // Email or Phone Number
  const [zelleRecipientName, setZelleRecipientName] = useState("");
  const [zelleTargetBank, setZelleTargetBank] = useState<UsBank | null>(null);

  // 6. Venmo states
  const [venmoUsername, setVenmoUsername] = useState(""); // starts with @
  const [venmoRecipientName, setVenmoRecipientName] = useState("");
  const [venmoMemo, setVenmoMemo] = useState("");

  // 7. Valora to Valora states
  const [valoraSelectedUser, setValoraSelectedUser] = useState<UserProfile | null>(null);
  const [valoraManualAccountNumber, setValoraManualAccountNumber] = useState("");
  const [valoraManualName, setValoraManualName] = useState("");
  const [isValoraManual, setIsValoraManual] = useState(true);

  // Shared state
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [done, setDone] = useState(false);

  // Security PIN states
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPinValue, setShowPinValue] = useState(false);

  // Expanded list of 20+ prominent US Banks, synced perfectly with SVG brand renderers
  const FALLBACK_US_BANKS: UsBank[] = [
    { id: "chase", name: "JPMorgan Chase & Co. (Chase Bank)", logo: "🏦", swift: "CHASUS33XX", routingPrefix: "02100" },
    { id: "bofa", name: "Bank of America", logo: "🏛️", swift: "BOFAUS3NXXX", routingPrefix: "02600" },
    { id: "citi", name: "Citibank (Citigroup)", logo: "💳", swift: "CITIUS33XXX", routingPrefix: "02100" },
    { id: "wells-fargo", name: "Wells Fargo & Co.", logo: "🐎", swift: "WFCUUS33XXX", routingPrefix: "12100" },
    { id: "goldman", name: "Goldman Sachs Group & Co.", logo: "💰", swift: "GSCOUS33XXX", routingPrefix: "02100" },
    { id: "morgan-stanley", name: "Morgan Stanley Private Bank", logo: "📈", swift: "MRGNUS33XXX", routingPrefix: "02100" },
    { id: "us-bank", name: "U.S. Bancorp (U.S. Bank)", logo: "🦅", swift: "USBKUS33XXX", routingPrefix: "09100" },
    { id: "pnc", name: "PNC Financial Services", logo: "🪙", swift: "PNBPUS33XXX", routingPrefix: "04300" },
    { id: "truist", name: "Truist Financial Corp.", logo: "🛠️", swift: "TRUIUS33XXX", routingPrefix: "05310" },
    { id: "capital-one", name: "Capital One Financial Corp.", logo: "🦁", swift: "COFCUS33XXX", routingPrefix: "05140" },
    { id: "td-bank", name: "TD Bank, N.A.", logo: "🟢", swift: "TDBKUS33XXX", routingPrefix: "01110" },
    { id: "citizens", name: "Citizens Financial Group", logo: "👥", swift: "CFGUS33XXX", routingPrefix: "01150" },
    { id: "ally", name: "Ally Financial Inc.", logo: "🤝", swift: "ALLYUS33XXX", routingPrefix: "03130" },
    { id: "hsbc", name: "HSBC Bank USA", logo: "🌍", swift: "HSBCUS33XXX", routingPrefix: "02100" },
    { id: "svb", name: "Silicon Valley Bank (SVB)", logo: "💻", swift: "SIVBUS33XXX", routingPrefix: "12110" },
    { id: "discover", name: "Discover Bank", logo: "🟠", swift: "DSCVUS33XXX", routingPrefix: "03110" },
    { id: "revolut", name: "Revolut United States Office", logo: "🪙", swift: "REVOUS33XXX", routingPrefix: "02100" },
    { id: "barclays", name: "Barclays Bank Delaware", logo: "🦅", swift: "BARCUS33XXX", routingPrefix: "02100" }
  ];

  // Fetch US banks from full-stack backend
  useEffect(() => {
    fetch("/api/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.banks) {
          setBackendBanks(data.banks);
        } else {
          setBackendBanks(FALLBACK_US_BANKS);
        }
      })
      .catch(() => {
        setBackendBanks(FALLBACK_US_BANKS);
      });
  }, []);

  // Recipient pre-selection handler
  useEffect(() => {
    if (preselectedPayee) {
      setSelectedMethod("wire");
      setAccountNumber(preselectedPayee.account || "");
      setRecipientName(preselectedPayee.name || "");
      setStep(1);
    }
  }, [preselectedPayee]);

  const activeBanks = backendBanks.length > 0 ? backendBanks : FALLBACK_US_BANKS;

  const filteredBanks = activeBanks.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.swift.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: UsBank) => {
    setSelectedBank(bank);
    setSwiftCode(bank.swift);
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    setRoutingNumber((bank.routingPrefix || "02100") + randSuffix);
    setCustomBankName(bank.name);
    setIsDropdownOpen(false);
  };

  const handleSelectZelleBank = (bank: UsBank) => {
    setZelleTargetBank(bank);
    setIsDropdownOpen(false);
  };

  const getCryptoEquivalent = () => {
    const amtNum = parseFloat(amount) || 0;
    if (cryptoNetwork === "bitcoin") return `${(amtNum / 68500).toFixed(6)} BTC`;
    if (cryptoNetwork === "ethereum") return `${(amtNum / 3550).toFixed(5)} ETH`;
    if (cryptoNetwork === "solana") return `${(amtNum / 145).toFixed(3)} SOL`;
    return `${(amtNum / 1.002).toFixed(2)} USDT`;
  };

  const getWiseConversion = () => {
    const amtNum = parseFloat(amount) || 0;
    if (wiseCurrency === "EUR") return `${(amtNum * 0.93).toFixed(2)} EUR`;
    if (wiseCurrency === "GBP") return `${(amtNum * 0.79).toFixed(2)} GBP`;
    if (wiseCurrency === "CHF") return `${(amtNum * 0.89).toFixed(2)} CHF`;
    if (wiseCurrency === "CAD") return `${(amtNum * 1.37).toFixed(2)} CAD`;
    return `${(amtNum * 1.49).toFixed(2)} AUD`;
  };

  const getMethodFee = () => {
    if (!selectedMethod) return 0;
    if (selectedMethod === "wire") return 25.00; 
    if (selectedMethod === "crypto") return 2.50; 
    if (selectedMethod === "paypal") return 4.50; 
    if (selectedMethod === "wise") return 1.80;
    if (selectedMethod === "zelle") return 0.00; // Free FedNow instant transfer
    if (selectedMethod === "venmo") return 1.00; // Flat micro debit fee
    if (selectedMethod === "valora") return 0.00; // Free book clearance transfer
    return 0;
  };

  const currentFee = getMethodFee();
  const rawAmt = parseFloat(amount) || 0;
  const isSufficientFunds = (rawAmt + currentFee + 0.50) <= currentUser.balance;

  // Form validators
  const isRoutingValid = /^\d{9}$/.test(routingNumber);
  const isSwiftValid = /^[A-Z0-9]{8,11}$/i.test(swiftCode);
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const isPhoneValid = (p: string) => /^\+?[1-9]\d{1,14}$/.test(p.replace(/[^0-9+]/g, ""));

  const isCurrentFormValid = () => {
    if (rawAmt <= 0 || !isSufficientFunds) return false;

    if (selectedMethod === "wire") {
      return (
        customBankName.trim().length >= 3 &&
        recipientName.trim().length >= 3 &&
        accountNumber.trim().length >= 4 &&
        isRoutingValid &&
        isSwiftValid
      );
    }
    if (selectedMethod === "crypto") {
      return walletAddress.trim().length >= 26;
    }
    if (selectedMethod === "paypal") {
      return isEmailValid(paypalEmail) && paypalRecipient.trim().length >= 3;
    }
    if (selectedMethod === "wise") {
      return isEmailValid(wiseEmail) && wiseIban.trim().length >= 10;
    }
    if (selectedMethod === "zelle") {
      const contact = zelleContact.trim();
      return (
        (isEmailValid(contact) || contact.length >= 7) &&
        zelleRecipientName.trim().length >= 2 &&
        zelleTargetBank !== null
      );
    }
    if (selectedMethod === "venmo") {
      return (
        venmoUsername.trim().startsWith("@") &&
        venmoUsername.trim().length >= 3 &&
        venmoRecipientName.trim().length >= 2
      );
    }
    if (selectedMethod === "valora") {
      if (isValoraManual) {
        return (
          valoraManualAccountNumber.trim().length >= 4 &&
          valoraManualName.trim().length >= 2
        );
      } else {
        return valoraSelectedUser !== null;
      }
    }
    return false;
  };

  const handleSelectMethod = (method: "wire" | "crypto" | "paypal" | "wise" | "zelle" | "venmo" | "valora") => {
    setSelectedMethod(method);
    setStep(1);
    setAmount("");
    setNote("");
  };

  const handleBackToMethods = () => {
    setSelectedMethod(null);
    onClearPreselectedPayee?.();
    setStep(1);
  };

  const handleConfirmAction = async () => {
    if (currentUser.checkingFrozen) {
      alert("Transaction Blocked: Your Premium Liquid Checking Account is currently frozen. All outbound checking transfers are temporarily locked.");
      return;
    }
    if (!isCurrentFormValid()) return;

    let finalName = "";
    let finalAccountNumber = "";
    let finalBank = "";
    let finalType = "Sovereign Wire Transfer";
    let customAudit: string[] = [];
    let destinationUserId = "EXTERNAL";

    const dateStr = new Date().toISOString().replace("T", " ").slice(0, 19);
    const ip = "185.128.156." + Math.floor(10 + Math.random() * 240); // Secure node routing

    if (selectedMethod === "wire") {
      finalName = recipientName.trim();
      finalAccountNumber = accountNumber.trim();
      finalBank = customBankName.trim();
      finalType = "US Federal Trust Wire";
      customAudit = [
        `${dateStr} | Proposed outgoing international wire via Los Angeles router.`,
        `${dateStr} | Bank Resolved: ${finalBank} (SWIFT: ${swiftCode}).`,
        `${dateStr} | Settlement Code: Fedwire Routing RTNo ${routingNumber}.`,
        `${dateStr} | Security Status: [AWAITING VERIFICATION]. Funds secured and locked.`,
        `${dateStr} | IP coordinates verified securely via private proxy node ${ip}.`
      ];
    } else if (selectedMethod === "crypto") {
      const netLabel = cryptoNetwork.toUpperCase();
      finalName = `Crypto Wallet (${netLabel})`;
      finalAccountNumber = walletAddress.trim().slice(0, 8) + "..." + walletAddress.trim().slice(-6);
      finalBank = `${netLabel} Blockchain Ledgers`;
      finalType = "Sovereign Crypto Clearance";
      customAudit = [
        `${dateStr} | Outbound Blockchain transfer initiated on ${netLabel} network.`,
        `${dateStr} | Destination Address Checked: ${walletAddress}.`,
        `${dateStr} | Calculation Engine: ${getCryptoEquivalent()} equivalence compiled.`,
        `${dateStr} | Status: Pending verification.`,
        `${dateStr} | Authorized hash dispatched for secure Multi-Factor clearance.`
      ];
    } else if (selectedMethod === "paypal") {
      finalName = paypalRecipient.trim();
      finalAccountNumber = paypalEmail.trim();
      finalBank = "PayPal International Clearing";
      finalType = "Secure PayPal Clearing";
      customAudit = [
        `${dateStr} | Proposed PayPal secure payout clearance via master node.`,
        `${dateStr} | Associated Email: ${paypalEmail}.`,
        `${dateStr} | Secondary account holder validation: ${paypalRecipient}.`,
        `${dateStr} | Settlement Fee: $4.50.`,
        `${dateStr} | Status: Pending validation.`
      ];
    } else if (selectedMethod === "wise") {
      finalName = "Wise Interbank Recipient";
      finalAccountNumber = wiseIban.trim();
      finalBank = `Wise Fast Clearance (${wiseCurrency})`;
      finalType = "Wise Interbank Wire";
      customAudit = [
        `${dateStr} | Swift Union / Wise Fast clearing requested.`,
        `${dateStr} | Recipient Local ID: ${wiseEmail}.`,
        `${dateStr} | Destination IBAN: ${finalAccountNumber}.`,
        `${dateStr} | Local Conversion: ${getWiseConversion()}.`,
        `${dateStr} | Regulatory Clearance: US-Wise integration node verified.`
      ];
    } else if (selectedMethod === "zelle") {
      finalName = zelleRecipientName.trim();
      finalAccountNumber = zelleContact.trim();
      finalBank = zelleTargetBank ? zelleTargetBank.name : "Zelle US Trust Network";
      finalType = "Zelle Instant Remittance";
      customAudit = [
        `${dateStr} | Authorized instant Zelle outward clearance request.`,
        `${dateStr} | Registered ID/Mobile linked: ${zelleContact}.`,
        `${dateStr} | Target clearing institution: ${finalBank}.`,
        `${dateStr} | Fee Surcharge: $0.00 (Standard FedNow complimentary tier).`,
        `${dateStr} | Status: [AWAITING ONE TIME PASSWORD CHALLENGE].`
      ];
    } else if (selectedMethod === "venmo") {
      finalName = venmoRecipientName.trim();
      finalAccountNumber = venmoUsername.trim();
      finalBank = "Venmo LLC P2P Settlement Engine";
      finalType = "Venmo Outward Flow";
      customAudit = [
        `${dateStr} | Enqueued outbound peer-to-peer Venmo displacement.`,
        `${dateStr} | Target ID: ${venmoUsername} (${finalName}).`,
        `${dateStr} | Memo Line Attachments: "${venmoMemo || "Outward payment"}" parsed successfully.`,
        `${dateStr} | Network Fee: $1.00 instant clearance charge.`,
        `${dateStr} | Status: Securely enqueued.`
      ];
    } else if (selectedMethod === "valora") {
      if (isValoraManual) {
        const found = users.find((u) => u.accountNumber.trim() === valoraManualAccountNumber.trim());
        destinationUserId = found ? found.id : "EXTERNAL";
        finalName = valoraManualName.trim();
        finalAccountNumber = valoraManualAccountNumber.trim();
      } else {
        destinationUserId = valoraSelectedUser ? valoraSelectedUser.id : "EXTERNAL";
        finalName = valoraSelectedUser ? valoraSelectedUser.name : "Valora Recipient";
        finalAccountNumber = valoraSelectedUser ? valoraSelectedUser.accountNumber : "";
      }
      finalBank = "Valora Financial Bank";
      finalType = "Valora Book Transfer";
      customAudit = [
        `${dateStr} | Proposed Valora Financial Bank to Valora Financial Bank internal book transfer requested.`,
        `${dateStr} | Origin: ${currentUser.name} (${currentUser.accountNumber})`,
        `${dateStr} | Target: ${finalName} (${finalAccountNumber})`,
        `${dateStr} | Settlement Code: Valora Internal Ledger Clearance VFB-${Math.floor(100000 + Math.random() * 900000)}.`,
        `${dateStr} | Fee Surcharge: $0.00 (Standard Valora to Valora complementary tier).`,
        `${dateStr} | Status: Cleared for delivery.`
      ];
    }

    setIsProcessing(true);
    setProcessingStage("Initiating secure connection...");
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStage("Verifying routing coordinates...");
    await new Promise((r) => setTimeout(r, 1100));

    setProcessingStage("Securing transaction channel...");
    await new Promise((r) => setTimeout(r, 900));

    setIsProcessing(false);

    onSend({
      toUserId: destinationUserId,
      toName: finalName,
      toAccountNumber: finalAccountNumber,
      amount: rawAmt,
      note: note.trim() || `Sovereign outgoing ${selectedMethod} transfer`,
      save: saveBeneficiary,
      recipientBank: finalBank,
      customType: finalType,
      customFee: currentFee,
      customAuditLog: customAudit
    });

    setDone(true);

    setTimeout(() => {
      setDone(false);
      setSelectedMethod(null);
      setStep(1);
      setAmount("");
      setNote("");
      onClearPreselectedPayee?.();
    }, 4500);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 px-8 pb-32 animate-[fadeIn_0.3s_ease-out]">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-red-500/10 flex items-center justify-center">
            <Loader2 size={36} className="text-[#C8102E] animate-spin" />
          </div>
        </div>
        <p className={`text-base font-extrabold tracking-tight text-center ${dark ? "text-white" : "text-slate-900"}`}>
          Authorizing Sovereign Clearing Route
        </p>
        <p className={`text-[11px] font-mono mt-2.5 text-center px-4 max-w-sm ${dark ? "text-red-400" : "text-[#C8102E]"} animate-pulse`}>
          {processingStage}
        </p>
        <div className="flex gap-1.5 mt-8 items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-[bounce_1s_infinite_100ms]" />
          <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-[bounce_1s_infinite_200ms]" />
          <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-[bounce_1s_infinite_300ms]" />
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center pt-24 px-8 pb-32 animate-[fadeIn_0.3s_ease-out]">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center mb-6 ring-8 ring-amber-500/5">
          <KeyRound size={40} className="text-amber-500 stroke-[2] animate-pulse" />
        </div>
        <p className={`text-xl font-bold tracking-tight text-center ${dark ? "text-white" : "text-slate-900"}`}>
          MFA Verification Required
        </p>
        <div className={`p-5 rounded-2xl border text-center text-xs mt-4 leading-relaxed max-w-sm ${
          dark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
        }`}>
          <p>
            Your outward sovereign transfer of <span className="font-extrabold text-amber-500">{fmtMoney(rawAmt)}</span> is proposed and currently enqueued on our central ledger.
          </p>
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-ping mx-1 mt-3" />
          <span className="font-bold text-[10px] text-amber-500 uppercase tracking-widest block mt-2">
            Awaiting Security Clearance
          </span>
        </div>
        <p className={`text-[10px] mt-4 text-center max-w-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>
          Please input the 6-digit cryptographic security code dispatched to your registered address inside the security gateway modal to complete the transfer.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-28 min-h-[60vh]">
      
      {/* NAVIGATION CRUMBS */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mb-1">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="text-[#C8102E] font-medium">International Transfer</span>
        </div>
        <h2 className={`text-2xl font-black uppercase tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          International Transfer
        </h2>
      </div>

      {/* SELECT PAYEE METHOD STEP */}
      {selectedMethod === null ? (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          
          <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800">
            <h3 className={`text-sm font-bold uppercase tracking-wide ${dark ? "text-slate-400" : "text-slate-600"}`}>
              Select Transfer Method
            </h3>
            {isThirdPartyDisabled ? (
              <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded font-mono font-bold animate-pulse">
                1 Active Gateway &bull; 6 Under Maintenance
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-500/15 text-emerald-500 px-2 py-0.5 rounded font-mono font-bold">
                7 Active Gateways &bull; 0 Under Maintenance
              </span>
            )}
          </div>

          {/* SYSTEM MAINTENANCE NOTICE BANNER */}
          {isThirdPartyDisabled && (
            <div className={`p-4 rounded-3xl border ${
              dark ? "bg-amber-950/20 border-amber-500/30 text-slate-300" : "bg-amber-50 border-amber-500/30 text-slate-700"
            }`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                  <ShieldAlert size={20} className="stroke-[2.5]" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <h4 className="text-xs font-black uppercase tracking-tight text-amber-500">
                    Third-Party Transfer Outage Alert
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Due to an exceptionally <strong>high rate of transaction volume and network load</strong> over the past few days, all outbound third-party routes have been temporarily placed under scheduled synchronization and security maintenance.
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Only internal Valora Financial Bank to Valora Financial Bank book transfers are active.
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* VALORA INTERNAL BOOK TRANSFER */}
            <button
              onClick={() => handleSelectMethod("valora")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all hover:scale-[1.01] cursor-pointer group col-span-1 md:col-span-2 ${
                dark 
                  ? "bg-slate-900/60 border-slate-800 hover:border-red-500/40" 
                  : "bg-white border-slate-100 shadow-sm hover:border-red-300"
              }`}
            >
              <div className="mr-4 p-3 rounded-2xl bg-[#C8102E]/20 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white transition-colors relative">
                <Landmark size={22} className="stroke-[2.5]" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-black uppercase text-[10px] tracking-wider text-[#C8102E]">
                    VALORA BOOK TRANSFER
                  </p>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase animate-pulse">
                    Fully Active
                  </span>
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                  Valora to Valora Transfer
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Settle transactions instantly with another Valora Financial Bank account with 0.00% fee.
                </p>
              </div>
              <ArrowRight size={14} className="ml-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#C8102E] self-center" />
            </button>

            {/* WIRE TRANSFER MODULE */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("Wire Transfer & SWIFT") : handleSelectMethod("wire")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-red-500/40" : "bg-white border-slate-100 shadow-sm hover:border-red-300"}`
              }`}
            >
              <div className={`mr-4 p-3 rounded-2xl transition-all ${
                isThirdPartyDisabled
                  ? "bg-slate-500/10 text-slate-500"
                  : "bg-[#C8102E]/10 text-[#C8102E] group-hover:bg-[#C8102E] group-hover:text-white"
              }`}>
                <Landmark size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  Wire Transfer & SWIFT
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Direct multi-currency outbound routing into any official US bank institution.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-[#C8102E]"
              }`} />
            </button>

            {/* ZELLE INSTANT PAYMENT ROUTE */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("Zellē Fast Clear") : handleSelectMethod("zelle")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-purple-500/40" : "bg-white border-slate-100 shadow-sm hover:border-purple-300"}`
              }`}
            >
              <div className={`mr-4 shrink-0 transition-all ${isThirdPartyDisabled ? "grayscale" : ""}`}>
                <BrandLogoIcon brandId="zelle" className="w-11 h-11" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  Zelle&reg; Recipient
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Send money instantly using a mobile number or email address. $0.00 fee.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-purple-500"
              }`} />
            </button>

            {/* VENMO INSTANT OUTLAY */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("Venmo Instant") : handleSelectMethod("venmo")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-sky-400/40" : "bg-white border-slate-100 shadow-sm hover:border-sky-300"}`
              }`}
            >
              <div className={`mr-4 shrink-0 transition-all ${isThirdPartyDisabled ? "grayscale" : ""}`}>
                <BrandLogoIcon brandId="venmo" className="w-11 h-11" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  Venmo Handle
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Displace sovereign ledger sheets to standard @username handles. $1.00 fee.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-[#C8102E]"
              }`} />
            </button>

            {/* CRYPTO BLOCKCHAIN LEDGER */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("Cryptocurrency Net") : handleSelectMethod("crypto")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-amber-500/40" : "bg-white border-slate-100 shadow-sm hover:border-amber-300"}`
              }`}
            >
              <div className={`mr-4 p-3 rounded-2xl transition-all ${
                isThirdPartyDisabled
                  ? "bg-slate-500/10 text-slate-500"
                  : "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white"
              }`}>
                <Coins size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  Cryptocurrency Net
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Authorize gas fees and settle on high throughput blockchain.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-amber-500"
              }`} />
            </button>

            {/* PAYPAL COMMERCE OUTFLOW */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("PayPal Global") : handleSelectMethod("paypal")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-indigo-500/40" : "bg-white border-slate-100 shadow-sm hover:border-indigo-300"}`
              }`}
            >
              <div className={`mr-4 p-3 rounded-2xl transition-all ${
                isThirdPartyDisabled
                  ? "bg-slate-500/10 text-slate-500"
                  : "bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"
              }`}>
                <FastForward size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm mt-0.5 tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  PayPal Global
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Submit commercial payouts using linked business or personal emails.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-indigo-500"
              }`} />
            </button>

            {/* WISE CLEARED REMITTANCE */}
            <button
              onClick={() => isThirdPartyDisabled ? setBlockedMethod("Wise Interbank") : handleSelectMethod("wise")}
              className={`flex items-start text-left p-4.5 rounded-3xl border transition-all cursor-pointer group ${
                isThirdPartyDisabled
                  ? `opacity-60 hover:opacity-80 ${dark ? "bg-slate-950/40 border-slate-900" : "bg-slate-50 border-slate-100"}`
                  : `hover:scale-[1.01] ${dark ? "bg-slate-900/60 border-slate-800 hover:border-emerald-500/40" : "bg-white border-slate-100 shadow-sm hover:border-emerald-300"}`
              }`}
            >
              <div className={`mr-4 p-3 rounded-2xl transition-all ${
                isThirdPartyDisabled
                  ? "bg-slate-500/10 text-slate-500"
                  : "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
              }`}>
                <Globe size={22} className="stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {isThirdPartyDisabled ? (
                    <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase">
                      Under Maintenance
                    </span>
                  ) : (
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-500 px-1.5 py-0.5 rounded font-black uppercase whitespace-nowrap">
                      Fully Active
                    </span>
                  )}
                </div>
                <p className={`font-bold text-sm tracking-tight ${
                  isThirdPartyDisabled 
                    ? (dark ? "text-slate-400" : "text-slate-700") 
                    : (dark ? "text-white" : "text-slate-900")
                }`}>
                  Wise Interbank
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${dark ? "text-slate-500" : "text-slate-550"}`}>
                  Low margin exchange rates on interbank cross-border clearances.
                </p>
              </div>
              <ArrowRight size={14} className={`ml-2 mt-1 self-center transition-all ${
                isThirdPartyDisabled ? "text-slate-450" : "opacity-0 group-hover:opacity-100 text-emerald-500"
              }`} />
            </button>

          </div>

          <div className={`p-4 rounded-3xl border text-xs leading-relaxed flex items-start gap-3 mt-4 ${
            dark ? "bg-slate-950/60 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-500"
          }`}>
            <Info size={16} className="text-[#C8102E] shrink-0 mt-0.5" />
            <p>
              Outbound transfers are processed securely. Limits of up to <strong>$100,000,000 USD</strong> daily are available for private clients.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          
          {/* NAVIGATION HEADING FOR SELECTED FORM */}
          <button
            onClick={handleBackToMethods}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              dark ? "text-slate-400 text-white" : "text-slate-500"
            }`}
          >
            <ChevronLeft size={16} className="stroke-[2.5]" /> Back to Selection Method
          </button>

          {/* DYNAMIC FORM HEADER STATUS COMPONENT */}
          <div className="p-4 rounded-3xl border bg-gradient-to-r from-red-500/5 to-red-600/5 border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
            <div className={`p-1`}>
              {selectedMethod === "wire" && <Landmark size={22} className="text-[#C8102E]" />}
              {selectedMethod === "crypto" && <Coins size={22} className="text-amber-500" />}
              {selectedMethod === "paypal" && <FastForward size={22} className="text-indigo-500" />}
              {selectedMethod === "wise" && <Globe size={22} className="text-emerald-500" />}
              {selectedMethod === "zelle" && <BrandLogoIcon brandId="zelle" className="w-9 h-9" />}
              {selectedMethod === "venmo" && <BrandLogoIcon brandId="venmo" className="w-9 h-9" />}
              {selectedMethod === "valora" && <Landmark size={22} className="text-emerald-500" />}
            </div>
            <div>
              <p className={`font-black uppercase text-xs tracking-wider ${dark ? "text-white" : "text-slate-900"}`}>
                Settling via {selectedMethod === "valora" ? "Valora Book Clearance" : `${selectedMethod.toUpperCase()} Gateway`}
              </p>
              <p className="text-[10px] text-slate-400">
                Outbound Fee: <span className="font-bold text-[#C8102E]">${getMethodFee().toFixed(2)} USD</span> &bull; Status: Real-Time Active
              </p>
            </div>
          </div>

          {/* DYNAMIC FORMS ACCORDING TO USER SELECTION */}
          {/*===========================================*/}

          {/* METHOD 1: WIRE TRANSFER */}
          {selectedMethod === "wire" && (
            <div className="space-y-4">
              
              {/* BRANDED BANK DROPDOWN SELECTION */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-slate-400">
                  Select US Clearing Bank (Rendered with Live Corporate Logos)
                </label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer outline-none ${
                    dark 
                      ? "bg-slate-900 border-slate-800 text-white" 
                      : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {selectedBank ? (
                      <BrandLogoIcon brandId={selectedBank.id} className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-xs">🏦</div>
                    )}
                    <span className="text-xs font-bold truncate max-w-xs block">
                      {selectedBank ? selectedBank.name : "Choose popular United States bank..."}
                    </span>
                  </div>
                  <ChevronLeft size={16} className={`transform -rotate-90 transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} />
                </div>

                {isDropdownOpen && (
                  <div className={`absolute z-20 w-full mt-2 rounded-2xl border shadow-xl p-3 max-h-60 overflow-y-auto ${
                    dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search Chase, BofA, Wells Fargo, PNC, Capital One..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full p-2 pl-8 rounded-lg text-xs outline-none ${
                          dark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleSelectBank(bank)}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer text-xs font-bold ${
                            selectedBank?.id === bank.id 
                              ? "bg-[#C8102E] text-white" 
                              : dark ? "hover:bg-slate-900 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <BrandLogoIcon brandId={bank.id} className="w-6 h-6" />
                            <span>{bank.name}</span>
                          </span>
                          <span className="font-mono text-[9px] opacity-60 uppercase">{bank.swift}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ROUTING DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Bank Title Or Alternate Institution
                  </span>
                  <input
                    type="text"
                    placeholder="E.g. J.P. Morgan Chase Trust"
                    value={customBankName}
                    onChange={(e) => {
                      setCustomBankName(e.target.value);
                      if (selectedBank && e.target.value !== selectedBank.name) {
                        setSelectedBank(null);
                      }
                    }}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    }`}
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Beneficiary Full Name
                  </span>
                  <input
                    type="text"
                    placeholder="Recipient Corporate or Individual name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Sovereign Account Number (Direct deposit)
                  </span>
                  <input
                    type="text"
                    placeholder="Enter alphanumeric account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={`w-full p-3.5 rounded-2xl outline-none text-xs font-bold font-mono tracking-wider border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1 relative">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                      Fedwire Routing Number (9-Digit)
                    </span>
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="E.g. 021000021"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ""))}
                      className={`w-full p-3 rounded-2xl outline-none text-xs font-bold font-mono tracking-wider border ${
                        routingNumber ? (isRoutingValid ? "border-emerald-500/40 focus:border-emerald-500" : "border-rose-500/40 focus:border-rose-500") : ""
                      } ${
                        dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                    {routingNumber && (
                      <span className="absolute right-3.5 bottom-3 text-xs">
                        {isRoutingValid ? "✔️" : "❌"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 relative">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                      SWIFT / BIC Bank Code
                    </span>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="E.g. CHASUS33XXX"
                      value={swiftCode}
                      onChange={(e) => setSwiftCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/ig, ""))}
                      className={`w-full p-3 rounded-2xl outline-none text-xs font-bold font-mono tracking-wider border ${
                        swiftCode ? (isSwiftValid ? "border-emerald-500/40 focus:border-emerald-500" : "border-rose-500/40 focus:border-rose-500") : ""
                      } ${
                        dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                      }`}
                    />
                    {swiftCode && (
                      <span className="absolute right-3.5 bottom-3 text-xs">
                        {isSwiftValid ? "✔️" : "❌"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* METHOD 2: CRYPTOCURRENCY */}
          {selectedMethod === "crypto" && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-2 text-slate-400">
                  Select Blockchain Settlement Ledger
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "bitcoin", name: "Bitcoin Mainnet", sym: "BTC", col: "border-orange-500/40 text-orange-500" },
                    { id: "ethereum", name: "Ethereum ERC-20", sym: "ETH", col: "border-indigo-500/40 text-purple-400" },
                    { id: "solana", name: "Solana SPL", sym: "SOL", col: "border-pink-500/40 text-pink-400" },
                    { id: "usdt", name: "Tether (USDT-TRC20)", sym: "USDT", col: "border-teal-500/40 text-emerald-400" }
                  ].map((net) => (
                    <button
                      key={net.id}
                      onClick={() => setCryptoNetwork(net.id)}
                      className={`p-3 rounded-2xl border text-xs font-black text-left cursor-pointer transition-all ${
                        cryptoNetwork === net.id 
                          ? `bg-red-500/10 ${net.col} border-2` 
                          : dark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-600 shadow-sm"
                      }`}
                    >
                      <p className="font-bold text-xs">{net.name}</p>
                      <p className="font-mono text-[9px] opacity-60 uppercase">{net.sym} Core</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 relative">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                  Target Crypto Wallet Address
                </span>
                <input
                  type="text"
                  placeholder="Enter secure wallet dispatch destination"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value.replace(/[^A-Za-z0-9]/g, ""))}
                  className={`w-full p-4 rounded-2xl outline-none text-xs font-bold font-mono tracking-wide border ${
                    dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>
          )}

          {/* METHOD 3: PAYPAL */}
          {selectedMethod === "paypal" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                  PayPal Registered Account Email
                </span>
                <input
                  type="email"
                  placeholder="E.g. client@paypal.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className={`w-full p-3 rounded-2xl outline-none text-xs font-bold border ${
                    paypalEmail ? (isEmailValid(paypalEmail) ? "border-emerald-500/40 focus:border-emerald-500" : "border-rose-500/40 focus:border-rose-500") : ""
                  } ${
                    dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                  Recipient Legal Entity / Full Name
                </span>
                <input
                  type="text"
                  placeholder="Legal name of recipient holding the PayPal profile"
                  value={paypalRecipient}
                  onChange={(e) => setPaypalRecipient(e.target.value)}
                  className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                    dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                />
              </div>
            </div>
          )}

          {/* METHOD 4: WISE */}
          {selectedMethod === "wise" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Wise Profile Account Email
                  </span>
                  <input
                    type="email"
                    placeholder="E.g. recipient@wise.com"
                    value={wiseEmail}
                    onChange={(e) => setWiseEmail(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-bold border ${
                      wiseEmail ? (isEmailValid(wiseEmail) ? "border-emerald-500/40 focus:border-emerald-500" : "border-rose-500/40 focus:border-rose-500") : ""
                    } ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Currency Settlement Target
                  </span>
                  <select
                    value={wiseCurrency}
                    onChange={(e) => setWiseCurrency(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-bold border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <option value="EUR">Euro (EUR) &bull; Core Union</option>
                    <option value="GBP">British Pound (GBP) &bull; SEPA</option>
                    <option value="CHF">Swiss Franc (CHF) &bull; US-Swiss Corridor</option>
                    <option value="AUD">Australian Dollar (AUD) &bull; East</option>
                    <option value="CAD">Canadian Dollar (CAD) &bull; Interac</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                  Recipient Account IBAN / ID
                </span>
                <input
                  type="text"
                  placeholder="CH930024021204810141"
                  value={wiseIban}
                  onChange={(e) => setWiseIban(e.target.value.toUpperCase().replace(/[^A-Z0-9]/ig, ""))}
                  className={`w-full p-3.5 rounded-2xl outline-none text-xs font-bold font-mono tracking-wider border ${
                    dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                />
              </div>
            </div>
          )}

          {/* METHOD 5: ZELLE INSTANT PAYMENT FORM */}
          {selectedMethod === "zelle" && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              
              {/* Select target bank linked to Zelle for realistic look */}
              <div className="relative">
                <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-slate-400">
                  Recipient Linked Zelle US Bank
                </label>
                
                <div 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer outline-none ${
                    dark 
                      ? "bg-slate-900 border-slate-800 text-white" 
                      : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {zelleTargetBank ? (
                      <BrandLogoIcon brandId={zelleTargetBank.id} className="w-6 h-6" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center text-xs">🏦</div>
                    )}
                    <span className="text-xs font-bold truncate max-w-xs block">
                      {zelleTargetBank ? zelleTargetBank.name : "Choose recipient's linked US bank..."}
                    </span>
                  </div>
                  <ChevronLeft size={16} className={`transform -rotate-90 transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} />
                </div>

                {isDropdownOpen && (
                  <div className={`absolute z-20 w-full mt-2 rounded-2xl border shadow-xl p-3 max-h-60 overflow-y-auto ${
                    dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                  }`}>
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search linked banks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full p-2 pl-8 rounded-lg text-xs outline-none ${
                          dark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="space-y-1">
                      {filteredBanks.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => handleSelectZelleBank(bank)}
                          className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer text-xs font-bold ${
                            zelleTargetBank?.id === bank.id 
                              ? "bg-purple-600 text-white" 
                              : dark ? "hover:bg-slate-900 text-slate-300" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <BrandLogoIcon brandId={bank.id} className="w-6 h-6" />
                            <span>{bank.name}</span>
                          </span>
                          <span className="font-mono text-[9px] opacity-60 uppercase">{bank.swift}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Linked Email Or US Mobile Number
                  </span>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      {isEmailValid(zelleContact) ? <Mail size={14} /> : <Phone size={14} />}
                    </span>
                    <input
                      type="text"
                      placeholder="recipient@email.com or +1 (555) 0192"
                      value={zelleContact}
                      onChange={(e) => setZelleContact(e.target.value)}
                      className={`w-full p-3 pl-9 rounded-2xl outline-none text-xs font-bold border ${
                        dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Beneficiary Full Name
                  </span>
                  <input
                    type="text"
                    placeholder="Enter recipient's real legal name"
                    value={zelleRecipientName}
                    onChange={(e) => setZelleRecipientName(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* METHOD 6: VENMO INSTANT FORM */}
          {selectedMethod === "venmo" && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Venmo Handle (@username)
                  </span>
                  <input
                    type="text"
                    placeholder="@RecipientHandle"
                    value={venmoUsername}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && !val.startsWith("@")) val = "@" + val;
                      setVenmoUsername(val);
                    }}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-bold tracking-wide border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Recipient legal Name
                  </span>
                  <input
                    type="text"
                    placeholder="E.g. Jennifer Smith"
                    value={venmoRecipientName}
                    onChange={(e) => setVenmoRecipientName(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                      dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                  Venmo Public / Private Story Memo
                </span>
                <input
                  type="text"
                  placeholder="Add classic Venmo note: 🍕 dinner last night or 🚗 uber split"
                  value={venmoMemo}
                  onChange={(e) => setVenmoMemo(e.target.value)}
                  className={`w-full p-3 rounded-2xl outline-none text-xs border ${
                    dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                />
              </div>
            </div>
          )}

          {/* METHOD 7: VALORA BOOK TRANSFER FORM */}
          {selectedMethod === "valora" && (
            <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Valora Recipient Coordinates
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Valora Account Number
                  </span>
                  <input
                    type="text"
                    placeholder="Enter VFB account number"
                    value={valoraManualAccountNumber}
                    onChange={(e) => {
                      const acc = e.target.value;
                      setValoraManualAccountNumber(acc);
                      
                      // Live lookup of matching member!
                      const found = users.find((u) => u.accountNumber.trim() === acc.trim());
                      if (found) {
                        setValoraManualName(found.name);
                      }
                    }}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-bold font-mono tracking-wide border ${
                      dark 
                        ? "bg-slate-900 border-slate-800 text-white focus:border-sky-500" 
                        : "bg-white border-slate-200 text-slate-900 focus:border-sky-300"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">
                    Account Owner Name
                  </span>
                  <input
                    type="text"
                    placeholder="Official account owner name"
                    value={valoraManualName}
                    onChange={(e) => setValoraManualName(e.target.value)}
                    className={`w-full p-3 rounded-2xl outline-none text-xs font-semibold border ${
                      dark 
                        ? "bg-slate-900 border-slate-800 text-white focus:border-sky-500" 
                        : "bg-white border-slate-200 text-slate-900 focus:border-sky-300 shadow-sm"
                    }`}
                  />
                </div>
                
                {/* Verified account indicator */}
                {(() => {
                  const matchedUser = users.find((u) => u.accountNumber.trim() === valoraManualAccountNumber.trim());
                  if (matchedUser) {
                    return (
                      <div className="col-span-1 md:col-span-2 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-500 flex items-center gap-1.5 animate-pulse mt-1">
                        ✓ Certified Valora Sovereign Account: <strong className="font-extrabold uppercase">{matchedUser.name}</strong> ({matchedUser.email})
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          {/*=========================================*/}
          {/* COMMON FIELDS: TRANSACTION SPECIFIC VALUES */}
          <div className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Amount to Dispatch ($ USD)
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 font-mono">$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full p-3 pl-8 rounded-2xl outline-none text-base font-bold font-mono border ${
                      amount && !isSufficientFunds ? "border-rose-500/40 focus:border-rose-500" : ""
                    } ${
                      dark
                        ? "bg-slate-900 border-slate-800 text-white focus:border-sky-500"
                        : "bg-white border-slate-200 text-slate-900 focus:border-sky-500"
                    }`}
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-slate-400">
                  Private Reference Notes
                </p>
                <input
                  type="text"
                  placeholder="Invoices, private clearance, or tax receipts memo"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl outline-none text-xs font-semibold border ${
                    dark
                      ? "bg-slate-900 border-slate-800 text-white"
                      : "bg-white border-slate-200 text-slate-900 shadow-sm"
                  }`}
                />
              </div>
            </div>

            {/* INTERACTIVE CURRENCY CALCULATIONS EQUIVALENCE */}
            {amount && parseFloat(amount) > 0 && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-between text-xs font-bold text-[#C8102E]">
                <span className="flex items-center gap-1.5 uppercase tracking-wide text-[9px] font-black">
                  <FastForward size={14} className="animate-pulse" /> Settle Conversion Status
                </span>
                <span className="font-mono text-xs">
                  {selectedMethod === "crypto" && getCryptoEquivalent()}
                  {selectedMethod === "wise" && getWiseConversion()}
                  {selectedMethod === "zelle" && "Instant USD FedNow Wire"}
                  {selectedMethod === "venmo" && `Remitted instantly to wallet`}
                  {selectedMethod === "valora" && `Instant internal book transfer (VFB to VFB)`}
                  {(selectedMethod === "wire" || selectedMethod === "paypal") && `$${parseFloat(amount).toLocaleString()} USD`}
                </span>
              </div>
            )}

            {/* STATE WARNINGS OR SUCCESS METERS */}
            {!isSufficientFunds && amount && (
              <div className="flex items-center gap-1.5 text-rose-500 bg-rose-500/5 p-3 rounded-2xl border border-rose-500/10">
                <ShieldAlert size={14} className="shrink-0" />
                <span className="text-[10px] font-bold">
                  Surcharge Exception. Transfer of {fmtMoney(rawAmt)} with flat ${currentFee} gateway fee exceeds total balance of {fmtMoney(currentUser.balance)}.
                </span>
              </div>
            )}

            {isSufficientFunds && amount && parseFloat(amount) > 0 && (
              <div className="p-3 bg-emerald-500/5 text-emerald-400 text-[10px] rounded-2xl border border-emerald-500/10 flex items-center gap-2">
                <CheckCircle2 size={12} className="shrink-0" />
                <span>
                  Cleared. Fee: <strong>${currentFee.toFixed(2)} USD</strong> &bull; Total debit: <strong>${(rawAmt + currentFee + 0.50).toLocaleString()} USD</strong>
                </span>
              </div>
            )}
          </div>

          {/* BENEFICIARY PREFERENCE */}
          <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
            <input
              type="checkbox"
              checked={saveBeneficiary}
              onChange={(e) => setSaveBeneficiary(e.target.checked)}
              className="accent-red-500 rounded text-red-500 cursor-pointer"
            />
            <span className={`text-[11px] font-bold ${
              dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
            }`}>
              Save this recipient as a secured verified payee bookmark
            </span>
          </label>

          {/* DYNAMIC ACTION DIRECT OUTFLOW SUBMITTER */}
          <PrimaryButton
            disabled={!isCurrentFormValid()}
            onClick={() => {
              setEnteredPin("");
              setPinError("");
              setIsPinModalOpen(true);
            }}
          >
            Sovereign {selectedMethod.toUpperCase()} Clearance &bull; {fmtMoney(rawAmt || 0)}
          </PrimaryButton>
        </div>
      )}

      {/* BLOCKED METHOD UNDER MAINTENANCE OVERLAY MODAL */}
      {blockedMethod !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl relative ${
            dark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-900"
          }`}>
            <button
              onClick={() => setBlockedMethod(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl ring-4 ring-amber-500/5">
                <ShieldAlert size={32} className="stroke-[2.5] animate-pulse" />
              </div>
              
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-amber-500">
                  Gateway Under Maintenance
                </h3>
                <p className={`text-[10px] font-mono font-bold uppercase mt-1 px-2.5 py-0.5 rounded-full inline-block ${
                  dark ? "bg-slate-800 text-slate-400" : "bg-slate-105 text-slate-500"
                }`}>
                  {blockedMethod} System
                </p>
              </div>

              <div className={`text-xs space-y-3 leading-relaxed py-2 ${
                dark ? "text-slate-300" : "text-slate-600"
              }`}>
                <p>
                  To protect public and institutional assets, outward third-party settlement networks are currently undergoing <strong>priority infrastructure maintenance</strong>.
                </p>
                <p className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-2xl text-[11px] text-left">
                  <strong>Reason:</strong> A highly elevated rate of transaction requests over the past few days has exceeded active outbound relay thresholds, prompting temporary security locks.
                </p>
                <p className={`font-bold ${dark ? "text-emerald-400" : "text-emerald-600"}`}>
                  Real-time transfer clearing is currently restricted to direct Valora Financial Bank to Valora Financial Bank accounts.
                </p>
              </div>

              <div className="w-full pt-2">
                <button
                  onClick={() => {
                    setBlockedMethod(null);
                    handleSelectMethod("valora");
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Use Valora Book Transfer
                </button>
                <button
                  onClick={() => setBlockedMethod(null)}
                  className={`w-full py-3 mt-2 text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    dark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURE TRANSACTION PIN CHALLENGE OVERLAY MODAL */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl relative ${
            dark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-900"
          }`}>
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3.5 bg-red-500/10 text-red-500 rounded-full ring-4 ring-red-500/5">
                <KeyRound size={28} className="stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-[#C8102E]">
                  Security PIN Required
                </h3>
                <p className={`text-xs mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  Enter your 4-digit security PIN to authorize the transaction of <span className="font-bold text-red-500">{fmtMoney(rawAmt)}</span>.
                </p>
              </div>

              <div className="w-full space-y-3">
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
                    className={`w-full p-3.5 rounded-2xl text-center text-lg font-bold tracking-[0.5em] font-mono outline-none border ${
                      pinError 
                        ? "border-rose-500/50 focus:border-rose-500 bg-rose-500/5 text-rose-500" 
                        : dark 
                          ? "bg-slate-950 border-slate-800 text-white focus:border-[#C8102E]" 
                          : "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#C8102E]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinValue(!showPinValue)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                    title={showPinValue ? "Hide PIN" : "Show PIN"}
                  >
                    {showPinValue ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {pinError && (
                  <p className="text-[11px] font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-xl animate-pulse">
                    {pinError}
                  </p>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setIsPinModalOpen(false)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-2xl border transition-colors cursor-pointer ${
                      dark ? "border-slate-800 text-slate-400 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (enteredPin.length < 4) {
                        setPinError("Please enter your complete 4-digit PIN.");
                        return;
                      }
                      if (enteredPin !== currentUser.pin) {
                        setPinError("Security clearance error: Transaction PIN invalid.");
                        return;
                      }
                      setIsPinModalOpen(false);
                      handleConfirmAction();
                    }}
                    className="flex-1 py-3 bg-[#C8102E] hover:bg-[#A93226] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-red-500/25 cursor-pointer"
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
