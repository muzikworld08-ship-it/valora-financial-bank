import React, { useState, useRef } from "react";
import { Eye, EyeOff, Landmark, TrendingUp, Coins } from "lucide-react";
import { UserProfile } from "../types";
import { fmtMoney } from "../utils";
import { ValoraLogo } from "./ValoraLogo";

interface BalanceCardProps {
  user: UserProfile;
  balanceVisible: boolean;
  setBalanceVisible: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export function BalanceCard({
  user,
  balanceVisible,
  setBalanceVisible,
}: BalanceCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);

  const onStart = (clientX: number) => {
    startX.current = clientX;
  };

  const onMove = (clientX: number) => {
    if (startX.current !== null) {
      setDrag(clientX - startX.current);
    }
  };

  const btcValueInUsd = 68500;
  const userBtcBalance = user.bitcoinBalance ?? 0;
  const btcUsdValuation = Math.round(userBtcBalance * btcValueInUsd * 100) / 100;
  const userInvestmentBalance = user.investmentBalance ?? 0;

  const accounts = (user.enabledAccounts && user.enabledAccounts.length > 0)
    ? user.enabledAccounts
    : ["checking", "investment", "bitcoin"];

  const cards = [];

  if (accounts.includes("checking")) {
    cards.push({
      id: "checking",
      label: "Checking Route Account",
      name: user.name,
      balance: user.balance,
      number: user.accountNumber,
      tag: "Available Balance",
      isCrypto: false,
      isInvestment: false,
      statusTag: user.checkingFrozen ? "Frozen" : "Active"
    });
  }

  if (accounts.includes("bitcoin")) {
    cards.push({
      id: "bitcoin",
      label: "Bitcoin Cold Vault",
      name: "Bitcoin Wallet",
      balance: btcUsdValuation,
      number: "BTC-SOV-" + user.accountNumber.slice(-4),
      tag: "Vault BTC Balance",
      isCrypto: true,
      isInvestment: false,
      cryptoBalance: userBtcBalance.toFixed(4),
      statusTag: user.bitcoinFrozen ? "Frozen" : "Cold Storage"
    });
  }

  if (accounts.includes("investment")) {
    cards.push({
      id: "investments",
      label: "Wealth Investment Account",
      name: "Investment Wallet",
      balance: userInvestmentBalance,
      number: "INV-PORT-" + user.accountNumber.slice(-4),
      tag: "Portfolio Yield Balance",
      isCrypto: false,
      isInvestment: true,
      statusTag: user.investmentFrozen ? "Frozen" : "Yield Balance"
    });
  }

  // Handle boundary errors nicely if accounts get reconfigured live
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, cards.length - 1));

  const onEnd = () => {
    if (startX.current !== null) {
      if (drag < -60 && safeActiveIndex < cards.length - 1) {
        setActiveIndex((prev) => Math.min(prev + 1, cards.length - 1));
      } else if (drag > 60 && safeActiveIndex > 0) {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      setDrag(0);
      startX.current = null;
    }
  };

  return (
    <div className="px-4">
      <div
        className="overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing select-none"
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={(e) => onStart(e.clientX)}
        onMouseMove={(e) => startX.current !== null && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
      >
        <div
          className="flex transition-transform ease-out"
          style={{
            transform: `translateX(calc(${-safeActiveIndex * 100}% + ${drag}px))`,
            transitionDuration: startX.current !== null ? "0ms" : "250ms",
          }}
        >
          {cards.map((c) => (
            <div key={c.id} className="w-full shrink-0 px-0.5">
              <div 
                className="rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden text-white"
                style={{
                  background: "linear-gradient(135deg, #C8102E, #9A0D22)",
                  height: "260px",
                  border: "1px solid rgba(255, 255, 255, 0.15)"
                }}
              >
                {/* Visual curves/circles from the screenshot background */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none" />

                {/* Top Section */}
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <ValoraLogo iconOnly={true} className="h-6 w-auto invert brightness-200" />
                    <span className="text-[10px] tracking-[0.15em] font-black uppercase font-sans text-white/95">
                      VALORA FINANCIAL BANK
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase">
                      {c.isCrypto ? "BITCOIN ROUTE" : c.isInvestment ? "INVESTMENT ROUTE" : "CHECKING ROUTE"}
                    </div>
                    <span className="text-[10px] text-white/80 font-mono mt-1">
                      Acc: •••• {c.number.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Card Title (Account Name) */}
                <div className="z-10 mt-3">
                  <h3 className="text-lg font-extrabold tracking-tight text-white leading-tight max-w-[85%]">
                    {c.name}
                  </h3>
                </div>

                {/* Center Section: Available Funds & Big Balance */}
                <div className="z-10 text-center flex flex-col items-center justify-center my-auto">
                  <span className="text-[10.5px] text-white/80 font-black tracking-[0.2em] uppercase">
                    AVAILABLE FUNDS
                  </span>
                  <div className="flex items-center justify-center gap-2.5 mt-1.5">
                    <span className="text-4xl font-black tracking-tight font-sans">
                      {balanceVisible ? (
                        c.isCrypto ? `${c.cryptoBalance} BTC` : fmtMoney(c.balance)
                      ) : (
                        "••••••"
                      )}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setBalanceVisible(!balanceVisible);
                      }}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer"
                      title={balanceVisible ? "Hide balance" : "Show balance"}
                    >
                      {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                  {c.isCrypto && balanceVisible && (
                    <span className="text-[10px] text-white/90 font-mono mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                      Valuation: {fmtMoney(c.balance)} USD
                    </span>
                  )}
                </div>

                {/* Bottom Section */}
                <div className="flex items-center justify-between z-10 mt-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {c.statusTag.toLowerCase().includes("frozen") ? "Account Frozen" : "Active Liquid"}
                  </div>
                  <span className="text-[10px] text-white/90 font-mono font-bold">
                    Acc Number: {c.number}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots controller */}
      <div className="flex justify-center gap-1.5 mt-3">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === safeActiveIndex ? "w-4 bg-[#C8102E]" : "bg-gray-300 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
