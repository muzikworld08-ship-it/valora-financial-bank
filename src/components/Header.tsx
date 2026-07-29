import React from "react";
import { Bell, LogOut, Landmark, ShieldCheck } from "lucide-react";
import { DirectNotification } from "../types";
import { initials } from "../utils";
import { ValoraLogo } from "./ValoraLogo";
import { LanguageSelector } from "./LanguageSelector";

interface HeaderProps {
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  notifications: DirectNotification[];
  onOpenNotifs: () => void;
  onSignOut: () => void;
  isAdmin: boolean;
  onSwitchPerspective?: () => void;
  onOpenMenu?: () => void;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}

export function Header({
  userName,
  userEmail,
  avatarUrl,
  darkMode,
  setDarkMode,
  notifications,
  onOpenNotifs,
  onSignOut,
  isAdmin,
  onSwitchPerspective,
  onOpenMenu,
}: HeaderProps) {
  // Filter notifications belonging to the logged state
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4 select-none animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          disabled={isAdmin}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm ${
            isAdmin ? "" : "hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          }`}
          style={{
            background: "linear-gradient(135deg, #FF5252, #FF1744)",
            border: "2px solid #FFFFFF"
          }}
          title={isAdmin ? "Security Console" : "Open Sovereign Banking Menu"}
        >
          {isAdmin ? (
            <ShieldCheck size={18} className="text-white" />
          ) : avatarUrl ? (
            <img 
               src={avatarUrl} 
               alt={userName} 
               className="w-11 h-11 rounded-2xl object-cover border-2 border-white" 
              referrerPolicy="no-referrer"
            />
          ) : (
            initials(userName)
          )}
        </button>
        <div>
          <div className="flex items-center gap-1.5">
            <ValoraLogo iconOnly={true} className="w-5 h-5 shrink-0 invert brightness-200" />
            <span className="text-[7.5px] tracking-[0.28em] font-black uppercase font-sans text-white/90">
              VALORA FINANCIAL
            </span>
          </div>
          <p 
            className="text-sm font-extrabold uppercase tracking-wide leading-tight mt-0.5 text-white"
            style={{ fontFamily: "'Inter', 'Georgia', serif" }}
          >
            {isAdmin ? "Admin Workspace" : userName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 font-bold">
        {/* Dynamic Global Translation selector */}
        <LanguageSelector dark={true} />

        {isAdmin && onSwitchPerspective && (
          <button
            onClick={onSwitchPerspective}
            className="text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border bg-white/10 hover:bg-white/20 text-white border-white/20"
            title="Swap perspective instantly"
          >
            Swap View
          </button>
        )}

        {!isAdmin && (
          <button
            onClick={onOpenNotifs}
            className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-colors cursor-pointer border bg-white/10 hover:bg-white/20 text-white border-white/20"
            title="Bank Alerts Feed"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-white w-2.5 h-2.5 rounded-full animate-pulse" />
            )}
          </button>
        )}

        <button
          onClick={onSignOut}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border bg-white/10 hover:bg-white/20 text-white border-white/20"
          title="Sign Out of Terminal"
        >
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}
