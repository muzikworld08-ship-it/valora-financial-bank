import React, { useState } from "react";
import { ShieldAlert, LogOut, Send, CheckCircle2, Lock, HelpCircle } from "lucide-react";
import { UserProfile } from "../types";

interface AccountStatusGateProps {
  user: UserProfile;
  onSignOut: () => void;
  onSubmitSupportTicket: (ticket: { name: string; email: string; subject: string; message: string }) => void;
  dark?: boolean;
}

export function AccountStatusGate({
  user,
  onSignOut,
  onSubmitSupportTicket,
  dark = false,
}: AccountStatusGateProps) {
  const isBlocked = user.accountStatus === "Blocked";
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketFeedback, setTicketFeedback] = useState("");

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    onSubmitSupportTicket({
      name: user.name,
      email: user.email,
      subject: `[Account Status Appeal - ${user.accountStatus}] ${ticketSubject}`,
      message: ticketMessage,
    });

    setTicketFeedback("Your appeal and support ticket have been lodged successfully. The compliance queue reviews submissions chronologically.");
    setTicketSubject("");
    setTicketMessage("");
    setTimeout(() => setTicketFeedback(""), 8000);
  };

  const statusLabel = isBlocked ? "Blocked" : "Frozen";
  const defaultReason = isBlocked
    ? "Your physical profile and trading accounts are disabled by administrative order under regulatory compliance code KYC-901."
    : "This account is temporarily frozen for transaction check clearances and card liability protocols.";

  const defaultUnblock = isBlocked
    ? "To dispute this directive, upload a clean scan of your national ID card and two utility bills, then complete secure biometric video calls with compliance representatives."
    : "The account will automatically resume normal operations after pending audits are verified. Alternatively, contact your advisory manager to fast-track verification.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-[2rem] p-6 max-w-lg w-full shadow-2xl space-y-6 my-8 animate-[scaleUp_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        
        {/* Header Alert & Badge */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500 animate-pulse">
            {isBlocked ? <ShieldAlert size={32} /> : <Lock size={32} />}
          </div>
          
          <div>
            <div className={`inline-flex px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest ${
              isBlocked ? "bg-rose-500/20 text-rose-400 border border-rose-500/35" : "bg-amber-500/20 text-amber-400 border border-amber-500/35"
            }`}>
              SYSTEM STATUS: {statusLabel.toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold tracking-tight text-white mt-2">
              Valora SecOps Restriction
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Ref: {user.accountNumber} · {user.name}
            </p>
          </div>
        </div>

        {/* Diagnostic Explanation Cards */}
        <div className="space-y-3">
          
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-left">
            <span className="text-slate-500 font-extrabold text-[9px] uppercase tracking-wider block">
              Reason For Restriction
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
              {user.accountStatusReason || defaultReason}
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-left">
            <span className="text-slate-500 font-extrabold text-[9px] uppercase tracking-wider block">
              Instructions To Resolve & Unblock
            </span>
            <p className="text-xs text-indigo-400 leading-relaxed font-semibold">
              {user.accountStatusUnblockInstruction || defaultUnblock}
            </p>
          </div>
          
        </div>

        {/* Support & Dispute Appeal Form */}
        <div className="bg-slate-950/30 p-4 rounded-2xl border border-slate-800 text-left space-y-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <HelpCircle size={14} />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              File Regulatory Appeal Ticket
            </h3>
          </div>
          
          <form onSubmit={handleSupportSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Dispute subject (e.g. Identity status verification)"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 outline-none font-semibold"
              />
            </div>
            <div>
              <textarea
                placeholder="Provide a detailed message referencing your account verification ID..."
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 outline-none leading-relaxed resize-none"
              ></textarea>
            </div>

            {ticketFeedback && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-semibold">{ticketFeedback}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!ticketSubject.trim() || !ticketMessage.trim()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Send size={11} /> Submit Appeal to Compliance Officers
            </button>
          </form>
        </div>

        {/* Sign Out & Dismiss Section */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onSignOut}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white text-[10.5px] font-black uppercase tracking-wider rounded-2xl cursor-pointer shadow-lg shadow-rose-950/20 transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={13} /> Exit Portal Session
          </button>
        </div>

      </div>
    </div>
  );
}
