import React from "react";
import { 
  Wallet, Coins, CreditCard, Calculator, Building2, Briefcase, 
  ShieldCheck, Smartphone, Zap, MessageSquare, BookOpen, Star 
} from "lucide-react";

export interface FeaturedProduct {
  readonly title: string;
  readonly desc: string;
  readonly feat: string;
  readonly img: string;
  readonly icon: React.ReactNode;
}

export interface ChoiceFeature {
  readonly title: string;
  readonly desc: string;
  readonly icon: React.ReactNode;
}

export interface FinancialSolution {
  readonly title: string;
  readonly subtitle: string;
  readonly desc: string;
  readonly img: string;
  readonly badge: string;
  readonly reverse?: boolean;
}

export interface Testimonial {
  readonly name: string;
  readonly role: string;
  readonly quote: string;
  readonly rating: number;
  readonly city: string;
}

export interface InsightArticle {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly readTime: string;
  readonly date: string;
  readonly summary: string;
  readonly author: string;
  readonly content: string;
  readonly imageUrl: string;
}

export const productsList: readonly FeaturedProduct[] = [
  {
    title: "Checking Accounts",
    desc: "Everyday secure checking with zero monthly fees, online debit controls, and instant digital wire transfers.",
    feat: "No Monthly Fees",
    img: "https://www.iaacu.org/images/default-source/campaign-ads/checking.png?sfvrsn=47aeab40_5",
    icon: <Wallet className="text-blue-500 w-5 h-5" />
  },
  {
    title: "Savings Accounts",
    desc: "Grow your reserve capital securely with high-yielding compound monthly rates and direct interest sweeps.",
    feat: "Up to 4.85% APY",
    img: "https://plus.unsplash.com/premium_photo-1661661480079-9c0cb4d3a8fc?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: <Coins className="text-emerald-500 w-5 h-5" />
  },
  {
    title: "Credit Cards",
    desc: "Premium titanium card models featuring zero annual charges, premier travel insurance, and uncapped rewards.",
    feat: "5% Uncapped Cash back",
    img: "https://mybank.com/wp-content/uploads/iStock-1461655919.jpg",
    icon: <CreditCard className="text-indigo-500 w-5 h-5" />
  },
  {
    title: "Personal Loans",
    desc: "Achieve life targets on your terms. Flexible amortization, clear guidelines, and decisions in 5 minutes.",
    feat: "Sovereign APR from 5.49%",
    img: "https://moneytrustmfb.com/wp-content/uploads/2025/04/Untitled-design.png",
    icon: <Calculator className="text-purple-500 w-5 h-5" />
  },
  {
    title: "Business Banking",
    desc: "Empower your business with direct merchant accounts, high checking limits, automated payroll, and term credit.",
    feat: "Full Business Suites",
    img: "https://www.td.com/us/en/small-business/online-banking/_jcr_content/root/container/responsivegrid/container_1125536934/tabs/item_1/container_420636917/image.coreimg.50.640.png/1654499981908/sbonlinebankpage13alerts-en.png",
    icon: <Building2 className="text-sky-500 w-5 h-5" />
  },
  {
    title: "Wealth Management",
    desc: "Preserve capital for generations with bespoke private vault trusts, bond placements, and expert wealth managers.",
    feat: "Generational Structuring",
    img: "https://framerusercontent.com/images/XZyWwSsZJepD5kQFRN4NYbjzFOU.jpg?width=4095&height=2776",
    icon: <Briefcase className="text-amber-500 w-5 h-5" />
  }
];

export const featuresList: readonly ChoiceFeature[] = [
  {
    title: "Bank Grade Security",
    desc: "Multi-signature validations, biometrics logins, certified 256-bit secure end-to-end encryption protocols.",
    icon: <ShieldCheck className="w-7 h-7 text-blue-500" />
  },
  {
    title: "24/7 Online Banking",
    desc: "Review transactional statements, schedule wire transfers, or protect physical cards at any time.",
    icon: <Smartphone className="w-7 h-7 text-indigo-500" />
  },
  {
    title: "Instant Transfers",
    desc: "Move liquidity, process check clearances, and handle direct deposits in seconds under safe systems.",
    icon: <Zap className="w-7 h-7 text-sky-500" />
  },
  {
    title: "Dedicated Support",
    desc: "Prompt digital assistance lines coupled with custom-assigned personal private banking officers.",
    icon: <MessageSquare className="w-7 h-7 text-emerald-500" />
  }
];

export const solutionsList: readonly FinancialSolution[] = [
  {
    title: "Personal Banking",
    subtitle: "Flexible Banking for Everyday Life",
    desc: "Access daily liquid checking profiles, automated direct deposits, and high-yield savings designed to streamline family budgeting and simplify transactions.",
    img: "https://images.unsplash.com/photo-1767128465859-34e9abfb501e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "For Individuals"
  },
  {
    title: "Business Banking",
    subtitle: "Fueling Enterprise Infrastructure",
    desc: "Equip your business with modern payroll sweeps, commercial cash reserves, heavy transaction clearing tiers, and dedicated lending channels.",
    img: "https://plus.unsplash.com/premium_photo-1722859377288-b486824d58b3?q=80&w=1271&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "For Enterprises",
    reverse: true
  },
  {
    title: "Investment Services",
    subtitle: "Tailored Professional Growth",
    desc: "Explore structured treasury indices, compounding mutual investments, and secure public/private bonds vetted by central banking advisors.",
    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=700&q=80",
    badge: "Wealth Preservation"
  },
  {
    title: "Retirement Planning",
    subtitle: "Secure Generational Transitions",
    desc: "Formulate resilient individual retirement profiles (IRAs), establish protective trusts, and curate long-term security structures to safeguard your legacy.",
    img: "https://plus.unsplash.com/premium_photo-1661407706070-3eca21b1320b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    badge: "Family Legacy",
    reverse: true
  }
];

export const testimonialsList: readonly Testimonial[] = [
  {
    name: "Sarah Davidson",
    role: "Merchant Founder, Core Group",
    quote: "Switching our enterprise treasury accounts back to Valora was our best strategic move. Account approvals cleared instantly, and standard merchant wire limits are zero-hassle.",
    rating: 5,
    city: "Boston, MA"
  },
  {
    name: "Marcus Vance",
    role: "Senior Corporate Strategist",
    quote: "The 4.85% high-yield savings engine is phenomenal, and the biometric dual locks provide total peace of mind for our family's liquid cash assets.",
    rating: 5,
    city: "Houston, TX"
  },
  {
    name: "Dr. Evelyn Ross",
    role: "Clinical Director",
    quote: "Their fixed-mortgage rate locks and high net wealth planning team are outstanding. Truly helpful, accessible customer assistance around the clock.",
    rating: 5,
    city: "Chicago, IL"
  }
];

export const articlesList: readonly InsightArticle[] = [
  {
    id: "compound-interest",
    category: "SAVINGS PRACTICE",
    title: "How to Maximize Compound Interest Yield Dividends in Higher-Rate Environments",
    readTime: "4 min read",
    date: "June 18, 2026",
    summary: "A practical roadmap by active wealth advisers on structuring deposit sweeps and laddering certificates of deposit (CD) to capture peak annual gains.",
    author: "Valora Financial Advisory Team",
    imageUrl: "https://shasroi.com/wp-content/uploads/2025/01/Smart-Savings-Techniques-for-a-Better-Future-1.png",
    content: "### Introduction to Peak Rate Harvesting\n\nIn high-yield monetary environments, leaving cash reserves in standard checked ledgers represents an active loss of purchasing power. Correctly positioned high-yield savings engines and certificate accounts represent the primary shields for family capital. By understanding interest sweep mechanics and certificate sequencing, investors can lock in peak returns with zero risk to principal.\n\n### 1. The Strategy of Certificate Laddering\n\nRather than locking all sovereign reserves into a single multi-year term certificate, seasoned custodians utilize a laddering structure. This minimizes liquidity constraints while capturing ascending yield offerings:\n\n*   **Divide Capital:** Split your investment capital into four equal portions.\n*   **Set Tiered Maturities:** Place Portion 1 into a 3-month certificate, Portion 2 into a 6-month, Portion 3 into a 9-month, and Portion 4 into a 12-month contract.\n*   **Create the Cycle:** As each shorter-term certificate matures, sweep the compound earnings and re-allocate it into a new 12-month term.\n\nThis system ensures you receive liquid cash payouts every 90 days while securing the maximum APY on mature brackets.\n\n### 2. High-Yield Savings Sweeps\n\nStandard checked accounts should strictly be reserved for immediate transaction clearances (usually 1-2 months of operating expenses). Any surplus beyond this threshold must be automatically 'swept' into your 4.85% APY High Yield Savings instrument. By coordinating monthly direct deposits to automatically stream surplus checking balances to interest accounts, you avoid 'idle cash drag' where money lies dormant without accruing compound returns.\n\n### 3. Understanding Interest Compounding Frequency\n\nWhen evaluating depository rates, remember that compounding frequency directly influences your aggregate annual percentage yield (APY). Monthly compound indices produce higher relative yields compared to semi-annual or annual structures because interest earned in Month 1 itself earns interest during Month 2. Valora guarantees daily compound rates paid out directly on the first of each business cycle, ensuring rapid compound acceleration."
  },
  {
    id: "mfa-lockdowns",
    category: "DIGITAL IDENTITY",
    title: "MFA Lockdowns: 5 Secure Practices Protecting Your Electronic Bank Ledgers",
    readTime: "6 min read",
    date: "June 12, 2026",
    summary: "As threat actors deploy predictive social engineering, discover 5 essential locking procedures to fully secure your online portals.",
    author: "Security Operations Center, Valora Sec",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi2C4VHCJyA5MahZlJtvQh6_Ru1ZzUicmPvx7FiK_cxg&s=10",
    content: "### Cybersecurity Priorities in Modern Retail Banking\n\nDigital convenience represents a tremendous leap for retail transactions, but it demands serious personal security parameters. Standard static passwords offer negligible defense against modern botnets. This audit outlines 5 hardened digital practices designed by computer engineers to lock down client credentials against sophisticated unauthorized probes.\n\n### 1. Shift from SMS OTP to App Authenticator Hooks\n\nSMS-based One-Time-Passcodes (OTPs) are highly vulnerable to SIM-swap attacks, where network carriers are deceived into linking your telephone number to a foreign device. Elevate your secure sign-in controls:\n\n*   **Deactivate SMS recovery pins:** Never utilize phone text keys for high-net-worth portal clearances.\n*   **Prefer Auth Apps:** Hook your Valora portal to certified multi-factor applications like Google Authenticator or Microsoft Authenticator which rely on local, time-based algorithms.\n*   **Deploy Biometric Passkeys:** Leverage localized device facial/fingerprint scans that never traverse public networks.\n*   **Hardware Tokens:** For supreme security, integrate physical cryptographic security keys (such as YubiKeys) for all administrative wire triggers.\n\n### 2. Isolate Financial Communication Channels\n\nNever share the email address associated with your secure banking portals for social networking, newsletters, or online shopping. Create a dedicated, highly private electronic mail inbox strictly reserved for authorized banking interactions. Ensure this email features distinct multi-factor verification keys unrelated to your primary daily devices.\n\n### 3. Evade Shared Wireless Nodes\n\nPublic airport, library, or hotel networks are highly susceptible to 'man-in-the-middle' software intercepts, allowing threat actors on the same local network to sniff outgoing data streams. If you must inspect your account balances while traveling, strictly use your mobile cellular data hot spots or double-wrap your connection inside a validated, encrypted virtual private network (VPN)."
  },
  {
    id: "mortgage-amortization",
    category: "REAL ESTATE MARKET",
    title: "Navigating Mortgage Amortization: Protecting Monthly Spans Against Rate Fluctuations",
    readTime: "5 min read",
    date: "June 05, 2026",
    summary: "Maximize your home credit clearance with clear calculations. A look into how index locks and amortization schedules safeguard private properties.",
    author: "Valora Underwriting & Credit Desk",
    imageUrl: "https://www.noradarealestate.com/wp-content/uploads/2023/11/best-places-to-invest-in-real-estate.jpg",
    content: "### Home Loans & Long-Term Capital Commitments\n\nFor most families, purchasing real estate represents their largest lifetime investment. However, fluctuation in interest rates can heavily influence monthly payments and lifetime amortization costs. Understanding the underlying structures of fixed versus adjustable loans allows home builders to make calculated capital decisions.\n\n### Fixed-Rate Mortgages vs. Adjustable Alternatives\n\n*   **Fixed-Rate Loans:** Your interest percentage remains completely locked for the entire life of the loan (e.g., 15 or 30 years). This yields total budget predictability and eliminates rate volatility risk.\n*   **Adjustable-Rate Mortgages (ARMs):** Offer lower introductory rates for an initial period (e.g., 5 or 7 years) after which the rate adjusts annually based on benchmark indices. While attractive for short-term residency, ARMs pose severe payment shock risks if economic rates escalate.\n\n### How Amortization Works to Build Home Equity\n\nIn the initial years of a standard mortgage, the vast majority of your monthly payments is directed towards interest charges, with only a minor portion reducing the actual principal loan balance. As the years progress, this balance slowly shifts towards faster principal reduction. This is known as amortization.\n\n### Pro Tips for Accelerated Home Amortization:\n\n*   **Make bi-weekly payments:** By splitting your monthly obligation into bi-weekly installments, you end up making 13 full payments per year instead of 12, trimming up to 5 years off a standard 30-year schedule.\n*   **Apply small direct principal top-ups:** Even adding an extra $100 monthly toward direct principal reduces lifetime compound interest charges immensely.\n*   **Utilize pre-approval locks:** Rates can shift while you search for a property. Valora offers a guaranteed 30-day pre-approval rate lock to protect your budget during home negotiations."
  },
  {
    id: "retirement-allocations",
    category: "INVESTMENT STRATEVIES",
    title: "Retirement Allocations: Building Resilient Tax-Deferred Generational Accounts",
    readTime: "3 min read",
    date: "May 28, 2026",
    summary: "Establish strong asset protection pools by leveraging compound earnings, structured trust profiles, and deferred interest indices.",
    author: "Valora Wealth Advisors",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwXAZir0cz8-KLybDpFKhdvcZpcjSSUOFmOltEZ9mvPXx8gx-rKLIbPHAg&s=10",
    content: "### Designing a Legacy for Future Generations\n\nWealth preservation requires a deliberate transition from high-risk growth pursuits to tax-advantageous asset protection schemes. Building structural security for retirement means mitigating the impacts of inflation, capital gains taxes, and market volatility through coordinated retirement accounts.\n\n### The Pillars of Tax-Advantaged Growth\n\n1.  **Individual Retirement Accounts (IRAs):**\n    *   **Traditional IRAs:** Contributions are made with pre-tax income, lowering your current taxable income. Investments grow tax-deferred, and taxes are only payable upon withdrawal in retirement.\n    *   **Roth IRAs:** Funded with post-tax accounts. While there is no immediate tax deduction, your investments accumulate and can be withdrawn completely tax-free after age 59½, offering supreme insulation against future legislative tax hikes.\n\n2.  **Generational Trust Allocations:**\n    To successfully pass on wealth without triggering heavy inheritance taxes or complex legal reviews, establish protective holding trusts. A Revocable Living Trust allows you to maintain control of your assets during your lifetime while guiding seamless, private succession to your beneficiaries upon transition.\n\n### Defensive Asset Diversification\n\nAs you approach retirement maturity, capital preservation becomes paramount. Advisors suggest moving from volatile equity trackers into diversified fixed income profiles, municipal bonds (often tax-free at federal levels), and high-yielding deposit instruments. This assures a reliable, predictable stream of liquid monthly dividends to support continuous lifestyle convenience."
  }
];
