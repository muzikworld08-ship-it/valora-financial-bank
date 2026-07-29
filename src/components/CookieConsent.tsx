import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a preference selection via standard document.cookie
    const consent = document.cookie.split("; ").find(row => row.startsWith("valora_cookie_consent="));
    if (!consent) {
      // Small professional load latency/entrance delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = "valora_cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  };

  const handleDecline = () => {
    document.cookie = "valora_cookie_consent=declined; path=/; max-age=31536000; SameSite=Lax";
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xl z-50 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-[#C8102E] shrink-0 border border-red-100/40">
          <Cookie size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-905 uppercase tracking-wider">
              Sovereign Data Protection
            </h4>
            <button 
              onClick={handleDecline}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full transition-colors"
              title="Close Panel"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 mt-2">
            Valora Financial Bank uses cookies to secure your UK HM Treasury clearances, comply with FSCS audit regulations, and ensure consistent account persistence.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <button 
              onClick={handleAccept}
              className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
            >
              Accept Essential Cookies
            </button>
            <button 
              onClick={handleDecline}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-slate-200/30"
            >
              Decline
            </button>
          </div>
          <div className="flex items-center gap-1 mt-3 text-[9px] text-slate-400 font-medium">
            <ShieldCheck size={10} className="text-emerald-500" />
            <span>Complies with FCA, PRA, FSCS & UK-GDPR security directives</span>
          </div>
        </div>
      </div>
    </div>
  );
}
