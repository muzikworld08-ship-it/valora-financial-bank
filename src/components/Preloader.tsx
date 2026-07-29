import React, { useEffect, useState } from "react";
import { Landmark, ShieldCheck } from "lucide-react";
import { ValoraLogo } from "./ValoraLogo";

interface PreloaderProps {
  onComplete?: () => void;
  duration?: number; // optional custom duration in ms
  message?: string;
  subMessage?: string;
}

const SECURE_MESSAGES = [
  "Establishing secure ledger handshake...",
  "Applying multi-layer TLS token checks...",
  "Syncing private custody transactions...",
  "Verifying sovereign credit balances...",
  "Authorizing hardware security modules...",
  "Compiling audit clearances...",
  "Readying elite banking workspace..."
];

export function Preloader({
  onComplete,
  duration = 1500,
  message = "Loading Secure Banking Services...",
  subMessage = "Your trusted financial partner."
}: PreloaderProps) {
  const [visible, setVisible] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(SECURE_MESSAGES[0]);

  useEffect(() => {
    // Progress bar increment
    const intervalTime = duration / 100;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, intervalTime);

    // Status message cycling
    let msgIdx = 0;
    const messageInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % SECURE_MESSAGES.length;
      setStatusText(SECURE_MESSAGES[msgIdx]);
    }, Math.max(300, duration / 4));

    // Complete loader
    const timeout = setTimeout(() => {
      setFadingOut(true);
      const fadeTimeout = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 500); // 500ms fade transition
      return () => clearTimeout(fadeTimeout);
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete]);

  // Handle reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Valora Financial Bank Loading Screen"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center p-6 bg-slate-50 transition-all duration-500 select-none ${
        fadingOut ? "opacity-0 pointer-events-none scale-105" : "opacity-100"
      }`}
    >
      <div className="max-w-md w-full text-center space-y-8 flex flex-col items-center">
        
        {/* Glowing Bank Brand Seal */}
        <div className="relative flex flex-col items-center justify-center space-y-4">
          {/* Subtle outer glow circle */}
          <div 
            className={`absolute w-36 h-36 rounded-full bg-amber-500/10 blur-2xl ${
              prefersReducedMotion ? "" : "animate-pulse"
            }`} 
          />
          
          {/* Main Logo Container */}
          <div className="relative p-6 rounded-3xl bg-white flex flex-col items-center justify-center shadow-2xl border border-brand-red/20">
            <ValoraLogo iconOnly={true} dark={false} className="w-24 h-24" />
          </div>
        </div>

        {/* Bank Brand Text */}
        <div className="space-y-1">
          <h2 className="text-2xl font-serif font-black tracking-widest uppercase" style={{ color: "#0A2540" }}>
            VALORA
          </h2>
          <p className="text-[9px] font-mono tracking-[0.3em] font-extrabold uppercase" style={{ color: "#B89765" }}>
            FINANCIAL BANK • SOVEREIGN PRIVATE CUSTODY
          </p>
        </div>

        {/* Circular Spinner & Progress */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Base track circular spinner */}
            <svg 
              className={`w-14 h-14 ${prefersReducedMotion ? "" : "animate-spin"}`}
              viewBox="0 0 100 100"
              style={{ transform: "rotate(-90deg)" }}
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#red_gradient)"
                strokeWidth="6"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-150"
              />
              
              {/* Grand gradient accents */}
              <defs>
                <linearGradient id="red_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C0392B" />
                  <stop offset="100%" stopColor="#E74C3C" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center percentage value for tracking */}
            <span className="absolute text-[10px] font-black font-mono text-slate-800">
              {progress}%
            </span>
          </div>

          {/* Primary & Secondary Messages */}
          <div className="space-y-2 max-w-xs">
            <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-wide">
              {message}
            </h3>
            <p className="text-[10.5px] text-slate-500 font-bold leading-normal">
              {subMessage}
            </p>
            <p className="text-[9.5px] text-brand-red font-mono font-medium tracking-wide h-4">
              {statusText}
            </p>
          </div>
        </div>

        {/* Lower Security Seal */}
        <div className="pt-4 border-t border-slate-200/50 w-3/4 flex items-center justify-center gap-1.5">
          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
            🛡️ SECURE 256-BIT ENCRYPTED SYSTEM
          </span>
        </div>

      </div>
    </div>
  );
}
