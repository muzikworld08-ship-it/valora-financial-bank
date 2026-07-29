import React from "react";
import { 
  X, Home as HomeIcon, TrendingUp, CreditCard, Send, Globe, 
  Download, Landmark, Award, Settings as SettingsIcon, HelpCircle, 
  LogOut, ShieldAlert, BadgeInfo, CheckCircle2, Receipt
} from "lucide-react";
import { UserProfile } from "../types";
import { initials } from "../utils";

interface BankingMenuProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  dark: boolean;
  onSelectTab: (tab: string) => void;
  onOpenTopUp: () => void;
  onOpenLoan: () => void;
  onOpenIrsRefund: () => void;
  onSignOut: () => void;
}

export function BankingMenu({
  open,
  onClose,
  user,
  dark,
  onSelectTab,
  onOpenTopUp,
  onOpenLoan,
  onOpenIrsRefund,
  onSignOut,
}: BankingMenuProps) {
  if (!open) return null;

  const menuItems = [
    {
      id: "home",
      label: "Home",
      icon: HomeIcon,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("home");
        onClose();
      }
    },
    {
      id: "activity",
      label: "Activity",
      icon: TrendingUp,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("activity");
        onClose();
      }
    },
    {
      id: "cards",
      label: "Cards",
      icon: CreditCard,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("cards");
        onClose();
      }
    },
    {
      id: "transfer",
      label: "Transfer",
      icon: Send,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("transfer");
        onClose();
      }
    },
    {
      id: "intl-wire",
      label: "Int'l Wire",
      icon: Globe,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("transfer");
        // We will trigger a nice window alert confirming wire connection
        setTimeout(() => {
          alert("Valora Financial Bank Secure Wire Gateway has been established. Funds destination will clear instantly through Sovereign US clearing nodes.");
        }, 150);
        onClose();
      }
    },
    {
      id: "paybills",
      label: "Pay Bills",
      icon: Receipt,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("paybills");
        onClose();
      }
    },
    {
      id: "deposit",
      label: "Deposit",
      icon: Download,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onClose();
        onOpenTopUp();
      }
    },
    {
      id: "loan",
      label: "Loan",
      icon: Landmark,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onClose();
        onOpenLoan();
      }
    },
    {
      id: "irs-refund",
      label: "HMRC Refund",
      icon: Award,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onClose();
        onOpenIrsRefund();
      }
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      bgColor: "bg-red-50 hover:bg-red-100 text-[#C8102E]",
      iconBg: "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20",
      action: () => {
        onSelectTab("profile");
        onClose();
      }
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      bgColor: "bg-rose-50 hover:bg-rose-100 text-rose-600",
      iconBg: "bg-gradient-to-tr from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-600/20",
      action: () => {
        onClose();
        onSignOut();
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div 
        className="w-full max-w-sm rounded-[2rem] border overflow-hidden p-6 relative transition-all shadow-2xl bg-white border-gray-150 text-slate-900"
      >
        {/* Modal close icon */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full transition-colors cursor-pointer hover:bg-red-50 text-gray-500 hover:text-[#C8102E]"
        >
          <X size={18} />
        </button>

        {/* Top Header Section with User details matching the photograph closely */}
        <div className="flex items-center gap-3.5 pb-5 border-b border-gray-200 mb-6">
          <div className="relative">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-[#C8102E]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-extrabold text-base shadow-md"
                style={{ background: "linear-gradient(135deg, #C8102E, #A93226)" }}
              >
                {initials(user.name)}
              </div>
            )}
            {/* Green Badge online status */}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="min-w-0 pr-6">
            <h3 className="font-extrabold text-lg leading-tight tracking-tight text-ellipsis overflow-hidden whitespace-nowrap text-gray-900">
              {user.name}
            </h3>
            <p className="text-xs font-bold tracking-wide mt-0.5 text-gray-750">
              Account: {user.accountNumber}
            </p>
            {/* Verified badge */}
            <div className="inline-flex items-center gap-1 mt-1 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              <CheckCircle2 size={10} className="stroke-[3]" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Banking Menu title text matching photograph */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tight text-[#C8102E]">Banking Menu</h2>
          <p className="text-xs font-bold tracking-wide text-gray-750">
            Select an option to continue
          </p>
        </div>

        {/* Menu Grid section with highly-styled responsive touch targets */}
        <div className="grid grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-0.5 scrollbar-thin">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl cursor-pointer transition-all duration-150 active:scale-95 group border-transparent ${item.bgColor}`}
                style={{ contentVisibility: "auto" }}
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${item.iconBg}`}>
                  <IconComponent size={20} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black tracking-wide text-center uppercase leading-none mt-1 text-gray-900 group-hover:text-[#C8102E]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-gray-700 text-center font-mono font-black tracking-widest uppercase mt-6 pt-3 border-t border-gray-200">
          Valora Secure Sovereign Node
        </p>
      </div>
    </div>
  );
}
