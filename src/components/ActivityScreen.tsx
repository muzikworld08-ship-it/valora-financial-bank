import React, { useState } from "react";
import { 
  ArrowDownLeft, ArrowUpRight, Clock, AlertTriangle, 
  CheckCircle, Search, X, Calendar, Filter, HelpCircle 
} from "lucide-react";
import { BankTransaction } from "../types";
import { fmtMoney, fmtDay } from "../utils";
import { TransactionReceiptModal } from "./TransactionReceiptModal";

interface ActivityScreenProps {
  currentUserId: string;
  transactions: BankTransaction[];
  dark: boolean;
}

export function ActivityScreen({ currentUserId, transactions, dark }: ActivityScreenProps) {
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<BankTransaction | null>(null);

  // Filter for transactions pertaining to this user
  const userTx = transactions.filter(
    (t) => t.fromUserId === currentUserId || t.toUserId === currentUserId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply Search Query filter across all required parameters: Date, Amount, Account Number, Transaction ID, Status, etc.
  const searchedTx = userTx.filter((t) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();

    const isReceived = t.toUserId === currentUserId;
    const partnerName = isReceived ? t.fromName : t.toName;
    const partnerAccount = isReceived ? t.fromAccountNumber : t.toAccountNumber;
    const originBank = t.fromBank || "Valora Financial Bank";
    const destBank = t.recipientBank || "Valora Financial Bank";

    const idMatches = t.id.toLowerCase().includes(q);
    const selfNameMatches = t.fromName.toLowerCase().includes(q) || t.toName.toLowerCase().includes(q);
    const partnerNameMatches = partnerName.toLowerCase().includes(q);
    const accountMatches = t.fromAccountNumber.includes(q) || t.toAccountNumber.includes(q) || partnerAccount.includes(q);
    const statusMatches = t.status.toLowerCase().includes(q) || (t.status === "Approved" && "successful".includes(q));
    const amountMatches = String(t.amount).includes(q) || fmtMoney(t.amount).toLowerCase().includes(q);
    const noteMatches = (t.note || "").toLowerCase().includes(q);
    const dateMatches = fmtDay(t.date).toLowerCase().includes(q) || new Date(t.date).toLocaleDateString().includes(q);
    const bankMatches = originBank.toLowerCase().includes(q) || destBank.toLowerCase().includes(q);

    return (
      idMatches ||
      selfNameMatches ||
      partnerNameMatches ||
      accountMatches ||
      statusMatches ||
      amountMatches ||
      noteMatches ||
      dateMatches ||
      bankMatches
    );
  });

  // Apply visual category filter
  const filtered = searchedTx.filter((t) => {
    const isReceived = t.toUserId === currentUserId;
    if (filter === "all") return true;
    if (filter === "in") return isReceived;
    if (filter === "out") return !isReceived;
    return true;
  });

  // Group by Date for cleaner presentation
  const groups: { [key: string]: BankTransaction[] } = {};
  filtered.forEach((t) => {
    const k = fmtDay(t.date);
    groups[k] = groups[k] || [];
    groups[k].push(t);
  });

  return (
    <div className="px-5 pt-6 pb-28 min-h-[60vh] select-none">
      
      {/* Title & Count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-2xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          Activity Log
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full font-mono font-black bg-red-50 text-[#C8102E]">
          {filtered.length} of {userTx.length} items
        </span>
      </div>

      {/* Advanced Lookup / Search Engine */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-700">
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search Code, Payee name, ID, Status, Bank or Date..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-3 rounded-2xl text-xs font-semibold outline-none border border-gray-300 transition-all bg-white text-slate-900 placeholder:text-gray-500 focus:border-[#C8102E] shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700 hover:text-[#C8102E] transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category Pills Filters */}
      <div className="flex gap-2 mb-5">
        {(["all", "in", "out"] as const).map((k) => {
          const label = k === "all" ? "All Activity" : k === "in" ? "Deposits" : "Payments";
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
                filter === k
                  ? "bg-[#C8102E] text-white shadow-sm shadow-[#C8102E]/20"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Instructions callout */}
      <p className="text-[10px] mb-4 flex items-center gap-1 text-gray-700 font-bold uppercase tracking-wider">
        <span>ℹ️</span> Click on any transaction below to view, download, or print its certified VFB receipt.
      </p>

      {/* Group listings */}
      {Object.keys(groups).length === 0 && (
        <div className={`flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed p-6 ${
          dark ? "bg-slate-900/10 border-slate-850" : "bg-slate-50 border-slate-150"
        }`}>
          <Filter size={24} className="text-slate-600 mb-2.5 stroke-[1.5]" />
          <p className="text-xs font-black uppercase text-gray-800">
            No matching transactions found.
          </p>
          <p className="text-[10px] text-gray-750 font-bold mt-1 uppercase">
            Try adjusting your search terms or checking another category.
          </p>
        </div>
      )}

      {Object.entries(groups).map(([day, items]) => (
        <div key={day} className="mb-6 animate-[fadeIn_0.15s_ease-out]">
          <p className="text-xs font-black uppercase tracking-wider mb-2.5 text-gray-700">
            {day}
          </p>
          <div className="rounded-3xl overflow-hidden border bg-white border-gray-200 shadow-sm">
            {items.map((t, i) => {
              const isReceived = t.toUserId === currentUserId;
              const titleName = isReceived ? t.fromName : t.toName;
              const partnerAccount = isReceived ? t.fromAccountNumber : t.toAccountNumber;
              const partnerBank = isReceived ? (t.fromBank || "Valora Financial Bank") : (t.recipientBank || "Valora Financial Bank");
              
              // Status formatting
              let statusLabel: string = t.status;
              let statusColor = "text-amber-500";
              let StatusIcon = Clock;

              if (t.status === "Approved" || t.status === "Successful" || t.status === "Completed") {
                statusColor = "text-emerald-500";
                statusLabel = "CLEARED";
                StatusIcon = CheckCircle;
              } else if (t.status === "Declined" || t.status === "Failed") {
                statusColor = "text-rose-500";
                statusLabel = "VOIDED";
                StatusIcon = AlertTriangle;
              } else if (t.status === "Reversed") {
                statusColor = "text-indigo-400";
                statusLabel = "REVERSED";
                StatusIcon = Clock;
              }

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTx(t)}
                  className={`flex items-center gap-3 p-4 transition-all cursor-pointer ${
                    dark ? "hover:bg-slate-850" : "hover:bg-slate-50"
                  } ${
                    i !== items.length - 1
                      ? dark
                        ? "border-b border-slate-800"
                        : "border-b border-slate-100"
                      : ""
                  }`}
                  title="View Secure Receipt Details"
                >
                  {/* Directional Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isReceived
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-red-50 text-[#C8102E] border border-red-200"
                  }`}>
                    {isReceived ? (
                      <ArrowDownLeft size={18} className="stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight size={18} className="stroke-[2.5]" />
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate text-slate-900">
                      {titleName}
                    </p>
                    <p className="text-[10.5px] mt-0.5 truncate flex items-center gap-1 font-bold text-gray-850">
                      <span>{partnerBank}</span>
                      <span className="opacity-70 font-mono">({partnerAccount})</span>
                      {t.note && (
                        <span className="opacity-80 truncate"> &bull; "{t.note}"</span>
                      )}
                    </p>
                    <p className="text-[9px] font-mono text-[#C8102E] mt-0.5 uppercase tracking-tight font-black">
                      ID: {t.id}
                    </p>
                  </div>
                  
                  {/* Amount / Status Display */}
                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm font-mono ${
                      isReceived ? "text-emerald-600" : "text-[#C8102E]"
                    }`}>
                      {isReceived ? "+" : "-"}{fmtMoney(t.amount)}
                    </p>
                    <span className={`text-[8.5px] font-extrabold uppercase tracking-wide flex items-center justify-end gap-0.5 ${statusColor} mt-1`}>
                      <StatusIcon size={9} /> {statusLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Transaction Receipt Details Drawer Overlay Modal */}
      {selectedTx && (
        <TransactionReceiptModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          dark={dark}
        />
      )}
    </div>
  );
}
