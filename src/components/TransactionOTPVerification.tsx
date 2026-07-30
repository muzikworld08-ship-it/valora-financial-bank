import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Mail, AlertTriangle, RefreshCw, KeyRound, Clock, AppWindow, ArrowRight, X } from "lucide-react";
import { BankTransaction } from "../types";
import { fmtMoney } from "../utils";

interface TransactionOTPVerificationProps {
  transaction: BankTransaction;
  userEmail: string;
  dark: boolean;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onCancel: () => void;
  attemptsCount: number;
  smtpConfigured: boolean | null;
  currentRawOtp: string;
}

export function TransactionOTPVerification({
  transaction,
  userEmail,
  dark,
  onVerify,
  onResend,
  onCancel,
  attemptsCount,
  smtpConfigured,
  currentRawOtp,
}: TransactionOTPVerificationProps) {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [errorCode, setErrorCode] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isShaking, setIsShaking] = useState(false);

  // Resend Cooldown Countdown Effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Focus helper
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) return;

    const newCode = [...code];
    newCode[index] = cleanVal.slice(-1);
    setCode(newCode);
    setErrorCode("");

    // Shift focus forward
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Automatically submit when all 6 digits are filled
  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 6 && !verifying && !success && !isExpired) {
      const triggerAutoSubmit = async () => {
        setVerifying(true);
        setErrorCode("");
        try {
          const isOK = await onVerify(fullCode);
          if (isOK) {
            setSuccess(true);
          } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            if (attemptsCount >= 4) {
              setErrorCode("Maximum verification attempts (5) exceeded. Transaction permanently locked.");
            } else {
              setErrorCode(`Invalid OTP code entered. Attempt ${attemptsCount + 1} of 5. Please check email.`);
              setCode(Array(6).fill(""));
              if (inputRefs.current[0]) inputRefs.current[0].focus();
            }
          }
        } catch (err) {
          setErrorCode("An unexpected error occurred during state sync. Try again.");
        } finally {
          setVerifying(false);
        }
      };
      triggerAutoSubmit();
    }
  }, [code, verifying, success, isExpired, onVerify, attemptsCount]);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      if (code[index]) {
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);
        if (inputRefs.current[index - 1]) {
          inputRefs.current[index - 1].focus();
        }
      }
      setErrorCode("");
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedText.length === 6) {
      const chars = pastedText.split("");
      setCode(chars);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setErrorCode("This verification code has expired. Please request a new code.");
      return;
    }

    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setErrorCode("Please enter the complete 6-digit security code.");
      return;
    }

    setVerifying(true);
    setErrorCode("");

    try {
      const isOK = await onVerify(fullCode);
      if (isOK) {
        setSuccess(true);
      } else {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        if (attemptsCount >= 4) {
          setErrorCode("Maximum verification attempts (5) exceeded. Transaction permanently locked.");
        } else {
          setErrorCode(`Invalid OTP code entered. Attempt ${attemptsCount + 1} of 5. Please check email.`);
          setCode(Array(6).fill(""));
          if (inputRefs.current[0]) inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      setErrorCode("An unexpected error occurred during state sync. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleTriggerResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setErrorCode("");
    setCode(Array(6).fill(""));
    try {
      await onResend();
      setTimeLeft(300);
      setIsExpired(false);
      setResendCooldown(60);
      // focus
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      setErrorCode("Could not deliver a new code. Check administration registers.");
    } finally {
      setResending(false);
    }
  };

  const cleanEmail = (em: string) => {
    if (!em) return "customer@privatevault.com";
    const [user, domain] = em.split("@");
    if (user.length <= 3) return `${user}***@${domain}`;
    return `${user.slice(0, 3)}***${user.slice(-1)}@${domain}`;
  };

  const lockedState = attemptsCount >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none animate-[fadeIn_0.2s_ease-out]">
      <div className={`relative w-full max-w-lg rounded-[2.5rem] border overflow-hidden shadow-2xl transition-all duration-300 ${
        dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        
        {/* Shield background glows */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-500">
              <ShieldCheck size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight">VFB Gateway Verification</h3>
              <p className="text-[10px] text-slate-400 font-bold tracking-wide">Multi-Factor Cryptographic Consent</p>
            </div>
          </div>
          {!success && !lockedState && (
            <button
              onClick={onCancel}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                dark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500"
              }`}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Success State Screen */}
        {success ? (
          <div className="p-8 text-center space-y-5 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto ring-8 ring-emerald-500/5 animate-bounce">
              <ShieldCheck size={32} className="stroke-[2.5]" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold tracking-tight">Security Code Approved</h4>
              <p className="text-xs text-slate-400 leading-normal max-w-sm mx-auto mt-1">
                Your sovereign outward transfer request of <span className="font-extrabold text-sky-500">{fmtMoney(transaction.amount)}</span> has been authorized, cryptographically signed, and completed successfully.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 inline-block font-mono text-[9px] font-bold text-emerald-500">
              STATE: COMPLETED &bullet; SECURE CLEARANCE SUCCESSFUL
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Outbound alert summary */}
            <div className={`p-4 rounded-3xl border flex items-center justify-between gap-4 ${
              dark ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200"
            }`}>
              <div>
                <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Outbound Request</p>
                <p className="text-xs font-extrabold text-slate-300 mt-0.5">{transaction.toName}</p>
                <p className="text-[10px] font-mono text-slate-500">{transaction.recipientBank} ({transaction.toAccountNumber})</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-sky-500 font-mono tracking-tight">{fmtMoney(transaction.amount)}</p>
                <p className="text-[9px] font-bold text-amber-500 uppercase flex items-center gap-0.5 mt-0.5 justify-end">
                  🔐 HELD LOCK
                </p>
              </div>
            </div>

            {lockedState ? (
              /* Locked / Fraud alert layout */
              <div className="space-y-4 text-center py-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h4 className="text-base font-black uppercase text-rose-500 tracking-wide">Ledger Request Suspended</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    This outbound transaction draft has been temporarily locked due to maximum failing attempts (5/5). Your assets remain protected. Please contact secure US support at support@valorafinancial.com to restore verification clearance keys.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={onCancel}
                    className="px-6 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-xs font-bold font-mono transition-all cursor-pointer"
                  >
                    Exits Dispatch
                  </button>
                </div>
              </div>
            ) : (
              /* Verification Inputs Form layout */
              <form onSubmit={handleVerifySubmit} className="space-y-6">
                
                {/* Delivery header */}
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/5 border border-sky-500/10 rounded-full">
                    <Mail size={11} className="text-sky-400" />
                    <span className="text-[10px] font-extrabold text-sky-400 uppercase tracking-widest font-mono">
                      Sent to: {cleanEmail(userEmail)}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                      A confidential 6-digit cryptographic security key has been dispatched to your registered email address. Please inspect your inbox (and spam or promotional folder) to retrieve the passcode and authorize this transfer.
                    </p>
                    <div className="p-3.5 bg-slate-950/60 border border-emerald-500/10 rounded-xl flex items-center justify-between gap-3 text-left">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">Secure Email Delivery Status</span>
                        <p className="text-[10px] text-slate-300 leading-normal">
                          The transaction authorization key is en route to <span className="font-mono text-sky-400 font-semibold">{cleanEmail(userEmail)}</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* OTP character entry containers */}
                <div className={`flex justify-center gap-2 md:gap-3 transition-transform duration-300 ${isShaking ? "animate-shake" : ""}`}>
                  {code.map((char, index) => (
                    <input
                      key={index}
                      type="text"
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={1}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      value={char}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-10 h-12 md:w-12 md:h-14 rounded-2xl outline-none text-center text-lg font-black font-mono border transition-all duration-300 focus:scale-110 focus:shadow-lg focus:shadow-red-500/25 ${
                        draftValueBorder(char, index)
                      }`}
                      autoComplete="off"
                    />
                  ))}
                </div>

                {/* Error Prompt Panel */}
                {errorCode && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/10 text-rose-400 font-bold text-xs flex items-start gap-2.5 leading-relaxed animate-[shake_0.4s_ease-in-out]">
                    <AlertTriangle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                    <span>{errorCode}</span>
                  </div>
                )}

                {/* Resend / Time Status row */}
                <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-500/10">
                  <span className="text-[10.5px] font-medium text-slate-400 flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-500" />
                    {isExpired ? (
                      <span className="text-rose-400 font-bold uppercase tracking-wider">CODE EXPIRED</span>
                    ) : (
                      <>Expires in: <strong className={`font-mono text-xs ${dark ? "text-white" : "text-slate-900"}`}>{formatTime(timeLeft)}</strong></>
                    )}
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleTriggerResend}
                    disabled={resending || resendCooldown > 0}
                    className="text-[10.5px] font-extrabold text-sky-400 hover:text-sky-300 hover:underline transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-40"
                  >
                    <RefreshCw size={11} className={resending ? "animate-spin" : ""} />
                    {resending ? "Dispatching..." : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
                  </button>
                </div>

                {/* Attempt Status row */}
                <div className="flex items-center justify-between text-[9.5px] text-slate-500 uppercase tracking-wider font-semibold font-mono bg-slate-950/20 px-3.5 py-2.5 rounded-xl border border-slate-500/5">
                  <span>🔒 Secure brute force defense active</span>
                  <span>Attempts: <strong className={dark ? "text-slate-200" : "text-slate-900"}>{attemptsCount}/5</strong></span>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      dark ? "bg-slate-800 text-slate-400 hover:bg-slate-705" : "bg-slate-200 text-slate-600 hover:bg-slate-250"
                    }`}
                  >
                    Cancel Transfer
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || code.some((c) => !c)}
                    className="flex-1 py-3.5 rounded-2xl bg-sky-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Validating...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Securely</span>
                        <ArrowRight size={13} className="stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );

  function draftValueBorder(char: string, index: number) {
    if (char) return "bg-red-500/10 border-[#C8102E] text-[#C8102E] shadow-md shadow-red-500/10";
    if (dark) return "bg-slate-950 border-slate-800 focus:border-[#C8102E]";
    return "bg-slate-50 border-slate-250 focus:border-[#C8102E] focus:bg-white";
  }
}
