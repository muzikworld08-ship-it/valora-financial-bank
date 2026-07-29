import React, { useState } from "react";
import { Eye, EyeOff, Snowflake, Receipt } from "lucide-react";
import { UserProfile, BankTransaction } from "../types";
import { fmtMoney } from "../utils";
import { ValoraLogo } from "./ValoraLogo";

interface CardsScreenProps {
  user: UserProfile;
  onToggleFreeze: () => void;
  transactions: BankTransaction[];
  dark: boolean;
}

export function CardsScreen({ user, onToggleFreeze, transactions, dark }: CardsScreenProps) {
  const [reveal, setReveal] = useState(false);
  const pct = Math.min(100, Math.round((user.cardSpent / user.cardLimit) * 100));
  
  // Show only card transactions relating to this user
  const cardTx = transactions.filter((t) => t.fromUserId === user.id).slice(0, 4);

  return (
    <div className="px-5 pt-6 pb-28 min-h-[60vh] select-none">
      <h2 className={`text-2xl font-bold tracking-tight mb-5 ${dark ? "text-white" : "text-slate-900"}`}>
        My Cards
      </h2>

      {/* Styled Physical Virtual Card */}
      <div
        className="relative rounded-3xl p-6 overflow-hidden mb-6 shadow-xl transition-all duration-300"
        style={{
          background: user.cardFrozen
            ? "linear-gradient(135deg, #475569, #1e293b)"
            : "linear-gradient(135deg, #090d16, #C8102E)",
          border: user.cardFrozen ? "1px solid #64748b" : "1px solid rgba(200, 16, 46, 0.2)"
        }}
      >
        {/* Accent concentric orbits */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/5 pointer-events-none border border-white/10" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 rounded-full bg-white/5 pointer-events-none border border-white/5" />

        <div className="flex justify-between items-center relative z-10">
          <ValoraLogo dark={true} className="h-6" />
          <span className="text-white font-black italic text-lg tracking-wider">VISA</span>
        </div>

        {/* Card Number Layout */}
        <p className="text-white text-lg font-mono tracking-widest mt-11 relative z-10">
          {reveal ? user.cardNum : user.cardNum.replace(/\d(?=\d{4})/g, "•")}
        </p>

        <div className="flex justify-between items-end mt-8 relative z-10">
          <div>
            <p className="text-white/50 text-[8px] uppercase tracking-wider font-semibold">Card holder</p>
            <p className="text-white text-[11px] font-bold tracking-wide mt-0.5 uppercase">{user.name}</p>
          </div>
          <div className="text-right">
            <p className="text-white/50 text-[8px] uppercase tracking-wider font-semibold">Expires</p>
            <p className="text-white text-[11px] font-bold tracking-wide mt-0.5 font-mono">{user.cardExpiry}</p>
          </div>
        </div>

        {user.cardFrozen && (
          <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center backdrop-blur-[2px] z-20 animate-[fadeIn_0.2s_ease-out]">
            <span className="bg-white text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border border-slate-200">
              <Snowflake size={14} className="text-[#C8102E] animate-spin" style={{ animationDuration: "12s" }} /> Card Frozen
            </span>
          </div>
        )}
      </div>

      {/* Primary Card Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setReveal((r) => !r)}
          className={`flex-1 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
            dark
              ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-white"
              : "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 shadow-sm"
          }`}
        >
          {reveal ? <EyeOff size={15} /> : <Eye size={15} />}
          {reveal ? "Hide Secret Info" : "Reveal Details"}
        </button>
        <button
          onClick={onToggleFreeze}
          className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            user.cardFrozen
              ? "bg-[#C8102E] hover:bg-[#A93226] text-white"
              : "bg-white hover:bg-rose-50 border border-rose-100 text-rose-600"
          }`}
        >
          <Snowflake size={15} />
          {user.cardFrozen ? "Activate Card" : "Freeze Card"}
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-6 border bg-white border-gray-200 shadow-sm">
        <div className="flex justify-between items-center text-xs mb-2.5">
          <span className="text-gray-700 font-bold uppercase tracking-wide">Monthly limit utilized</span>
          <span className="font-black text-slate-900">
            {fmtMoney(user.cardSpent)} / <span className="opacity-70 font-bold">{fmtMoney(user.cardLimit)}</span>
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-gray-100">
          <div
            className="h-full bg-[#C8102E] rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-700 mt-2 font-mono font-black uppercase tracking-wider">
          <span>{pct}% Used</span>
          <span>{fmtMoney(user.cardLimit - user.cardSpent)} Available limit</span>
        </div>
      </div>

      <p className="text-xs font-black uppercase tracking-widest mb-2.5 text-gray-800">
        Recent Card Activity
      </p>

      {cardTx.length === 0 ? (
        <p className="text-xs text-center p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-700 font-bold uppercase">
          No active card payments reported.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden border bg-white border-gray-200 shadow-sm">
          {cardTx.map((t, i) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-4 ${
                i !== cardTx.length - 1
                  ? dark
                    ? "border-b border-slate-800/80"
                    : "border-b border-slate-100"
                  : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-700 border border-gray-200">
                <Receipt size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate text-slate-900">
                  {t.toName}
                </p>
                <span className={`text-[10px] font-black uppercase tracking-wider font-mono ${
                  (t.status === "Approved" || t.status === "Successful" || t.status === "Completed") ? "text-emerald-600" : "text-amber-600"
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="font-black text-sm font-mono text-slate-900">
                {fmtMoney(t.amount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
