import React from "react";
import { TrendingUp, ArrowLeftRight, Home as HomeIcon, CreditCard, Users, Coins } from "lucide-react";
import { UserProfile } from "../types";

interface BottomNavProps {
  tab: string;
  setTab: (t: string) => void;
  dark: boolean;
  avatarUrl?: string;
  user?: UserProfile;
}

export function BottomNav({ tab, setTab, dark, avatarUrl, user }: BottomNavProps) {
  let accounts = user?.enabledAccounts || [];
  if (accounts.length === 0) {
    accounts = ["checking", "investment", "bitcoin"];
  }
  
  const items = [];

  // Home/Checking Dashboard
  if (accounts.includes("checking")) {
    items.push({ id: "home", label: "Checking", icon: HomeIcon });
  }



  // Investments Dashboard
  if (accounts.includes("investment")) {
    items.push({ id: "investments", label: "Investment", icon: TrendingUp });
  }

  // Cards and Transfer features (underpin Checking operations)
  if (accounts.includes("checking")) {
    items.push({ id: "transfer", label: "Transfer", icon: ArrowLeftRight });
    items.push({ id: "cards", label: "Cards", icon: CreditCard });
  }

  // Profile is universally accessible
  items.push({ id: "profile", label: "Profile", icon: Users });

  return (
    <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-[#C8102E] border-t border-white/20 rounded-t-3xl shadow-[0_-8px_30px_rgba(200,16,46,0.15)] px-2 pt-3 pb-6">
      <div className="flex justify-between items-center relative">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
               key={it.id}
               onClick={() => setTab(it.id)}
               className="flex flex-col items-center gap-1 flex-1 relative cursor-pointer group"
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-150 ${
                active
                  ? "bg-white text-[#C8102E] shadow-md shadow-black/10"
                  : "text-white/70 group-hover:bg-white/10"
              }`}>
                {it.id === "profile" && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                     className={`w-8 h-8 rounded-full object-cover transition-transform ${
                      active ? "border-2 border-[#C8102E] scale-110" : "border border-white/40"
                    }`}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Icon size={20} className={active ? "text-[#C8102E]" : "text-white"} />
                )}
              </div>
              <span className={`text-[9px] tracking-wide transition-colors ${
                active ? "text-white font-black uppercase" : "text-white/80 font-bold uppercase"
              }`}>
                {it.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
