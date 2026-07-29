import React, { useState } from "react";
import { 
  X, Printer, Download, Clock, CheckCircle2, AlertTriangle, 
  RefreshCw, Shield, HelpCircle, ArrowDownLeft, ArrowUpRight, 
  MapPin, Landmark, Calendar, FileText, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { BankTransaction } from "../types";
import { fmtMoney, initials } from "../utils";
import { ValoraLogo } from "./ValoraLogo";

interface TransactionReceiptModalProps {
  transaction: BankTransaction;
  onClose: () => void;
  dark: boolean;
}

export function TransactionReceiptModal({ transaction, onClose, dark }: TransactionReceiptModalProps) {
  const [showAuditLogs, setShowAuditLogs] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Default values check to support all transactional formats
  const senderBank = transaction.fromBank || "Valora Financial Bank";
  const recipientBank = transaction.recipientBank || "Valora Financial Bank";
  const pFee = transaction.processingFee !== undefined ? transaction.processingFee : Math.round(transaction.amount * 0.001 * 100) / 100 || 1.50;
  const sCharge = transaction.serviceCharge !== undefined ? transaction.serviceCharge : 0.50;
  const totalAmt = transaction.totalAmount !== undefined ? transaction.totalAmount : transaction.amount + pFee + sCharge;
  const userTz = "America/New_York (US Eastern Time)";
  const txType = transaction.transactionType || "Sovereign Wire Transfer";
  
  // Format transaction timestamp
  const dateObj = new Date(transaction.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  // Unique status badge styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Approved":
      case "Successful":
      case "Completed":
        return {
          bg: "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30",
          text: "text-emerald-500 dark:text-emerald-400",
          label: "SUCCESSFUL / CLEARED",
          icon: <CheckCircle2 className="w-5 h-5" />
        };
      case "Pending":
      case "Pending OTP":
        return {
          bg: "bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30",
          text: "text-amber-500 dark:text-amber-400",
          label: "PENDING SECURE SETTLEMENT",
          icon: <Clock className="w-5 h-5 animate-pulse" />
        };
      case "Failed":
        return {
          bg: "bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30",
          text: "text-rose-500 dark:text-rose-400",
          label: "FAILED / VOID",
          icon: <AlertTriangle className="w-5 h-5" />
        };
      case "Declined":
        return {
          bg: "bg-red-500/10 dark:bg-red-500/20 border-red-500/30",
          text: "text-red-600 dark:text-red-400",
          label: "DECLINED BY SECURE AUDIT",
          icon: <X className="w-5 h-5" />
        };
      case "Reversed":
        return {
          bg: "bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/30",
          text: "text-indigo-550 dark:text-indigo-400",
          label: "REVERSED",
          icon: <RefreshCw className="w-5 h-5" />
        };
      default:
        return {
          bg: "bg-slate-500/10 border-slate-500/30",
          text: "text-slate-400",
          label: status.toUpperCase(),
          icon: <HelpCircle className="w-5 h-5" />
        };
    }
  };

  const statusConfig = getStatusConfig(transaction.status);

  // Generate audit logs if empty
  const defaultAuditTimeline = transaction.auditLog && transaction.auditLog.length > 0 
    ? transaction.auditLog 
    : [
        `${new Date(dateObj.getTime() - 1000 * 2).toISOString().replace("T", " ").slice(0, 19)} | Authorized via private biometric security checkpoint.`,
        `${new Date(dateObj.getTime() - 1000 * 1).toISOString().replace("T", " ").slice(0, 19)} | Enqueued in secure settlement ledger: status VERIFIED.`,
        transaction.status === "Approved" || transaction.status === "Successful" || transaction.status === "Completed"
          ? `${new Date(dateObj.getTime()).toISOString().replace("T", " ").slice(0, 19)} | Automated clearance confirmed. Funds routed and settled.`
          : transaction.status === "Pending" || transaction.status === "Pending OTP"
          ? `${new Date(dateObj.getTime()).toISOString().replace("T", " ").slice(0, 19)} | Awaiting final electronic settlement clearance.`
          : `${new Date(dateObj.getTime()).toISOString().replace("T", " ").slice(0, 19)} | Operational exit under status: ${transaction.status.toUpperCase()}.`
      ];

  const handleCopyTxId = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print your security transaction receipt.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VFB Receipt - ${transaction.id}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              border-radius: 24px;
              padding: 40px;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #e2e8f0;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .logo {
              font-family: 'Georgia', serif;
              font-weight: 800;
              font-size: 20px;
              letter-spacing: 0.1em;
              color: #0A2540;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .logo span {
              color: #B89765;
              font-weight: 900;
            }
            .tagline {
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-top: -6px;
              display: block;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.05em;
              margin-top: 12px;
              text-transform: uppercase;
              border: 1px solid;
            }
            .status-Approved, .status-Successful {
              background-color: #ecfdf5;
              color: #059669;
              border-color: #10b981;
            }
            .status-Pending {
              background-color: #fffbeb;
              color: #d97706;
              border-color: #f59e0b;
            }
            .status-Failed, .status-Declined {
              background-color: #fef2f2;
              color: #dc2626;
              border-color: #ef4444;
            }
            .status-Reversed {
              background-color: #f5f3ff;
              color: #4f46e5;
              border-color: #6366f1;
            }
            .amount-block {
              text-align: center;
              margin: 24px 0;
            }
            .amount-title {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .amount-val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 42px;
              font-weight: 800;
              letter-spacing: -0.02em;
              margin: 4px 0;
            }
            .recipient-block {
              text-align: center;
              font-size: 13px;
              color: #475569;
            }
            .grid-details {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
              font-size: 12px;
              border-top: 1px solid #f1f5f9;
              padding-top: 24px;
              margin-top: 24px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .detail-label {
              color: #64748b;
              font-weight: 500;
            }
            .detail-value {
              font-weight: 600;
              color: #0f172a;
              text-align: right;
            }
            .detail-value.mono {
              font-family: 'JetBrains Mono', monospace;
            }
            .breakdown-section {
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              margin-top: 20px;
            }
            .breakdown-section h4 {
              margin: 0 0 12px 0;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
            }
            .total-row {
              font-size: 15px;
              font-weight: 800;
              border-top: 2px solid #0f172a;
              padding-top: 12px;
              margin-top: 8px;
            }
            .total-row .detail-value {
              font-family: 'JetBrains Mono', monospace;
              color: #C8102E;
              font-size: 18px;
            }
            .audit-section {
              border-top: 1px solid #f1f5f9;
              padding-top: 20px;
              margin-top: 20px;
            }
            .audit-section h4 {
              margin: 0 0 12px 0;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
            }
            .audit-logs {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 12px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              color: #475569;
              line-height: 1.6;
              white-space: pre-wrap;
              text-align: left;
            }
            .footer-sig {
              text-align: center;
              margin-top: 40px;
              font-size: 9px;
              color: #94a3b8;
              font-weight: 500;
              letter-spacing: 0.02em;
              line-height: 1.5;
            }
            .action-hide {
              text-align: center;
              margin-top: 30px;
            }
            .btn-print {
              background: #C8102E;
              color: #ffffff;
              padding: 10px 24px;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            @media print {
              .action-hide {
                display: none;
              }
              body {
                padding: 10px;
              }
              .container {
                border: none;
                box-shadow: none;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg viewBox="0 0 120 100" style="height: 48px; margin: 0 auto 10px auto; display: block;" xmlns="http://www.w3.org/2000/svg">
                <path d="M 16 16 H 48 V 21 C 40 21, 38 24, 36 30 L 58 80 H 61 L 79 30 C 81 24, 82 21, 88 21 V 16 H 68 V 21 C 74 21, 75 24, 73 30 L 59 74 L 43 30 C 41 24, 38 21, 30 21 V 16 Z" fill="#0A2540"/>
                <path d="M 76 48 L 81 40 V 60 L 76 66 Z" fill="#B89765"/>
                <path d="M 85 34 L 90 26 V 53 L 85 59 Z" fill="#B89765"/>
                <path d="M 94 20 L 99 12 V 46 L 94 52 Z" fill="#B89765"/>
              </svg>
              <div class="logo">VALORA<span>FINANCIAL</span></div>
              <span class="tagline">Sovereign Custody & Wealth Clearance</span>
              <div class="status-badge status-${transaction.status}">${statusConfig.label}</div>
            </div>

            <div class="amount-block">
              <span class="amount-title">Total Transaction Amount</span>
              <h2 class="amount-val">${fmtMoney(transaction.amount)}</h2>
              <div class="recipient-block">
                <strong>To:</strong> ${transaction.toName} &middot; <span style="font-family: monospace;">${transaction.toAccountNumber}</span>
              </div>
            </div>

            <div class="grid-details">
              <div class="detail-row">
                <span class="detail-label">Sender Name</span>
                <span class="detail-value">${transaction.fromName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender Account</span>
                <span class="detail-value mono">${transaction.fromAccountNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender Origin Institution</span>
                <span class="detail-value">${senderBank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Name</span>
                <span class="detail-value">${transaction.toName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Account</span>
                <span class="detail-value mono">${transaction.toAccountNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Institution</span>
                <span class="detail-value">${recipientBank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value mono" style="color: #0369a1;">${transaction.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valora Settlement Reference</span>
                <span class="detail-value mono" style="text-transform: uppercase;">REF-${transaction.id.slice(-6)}-VERIFY</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Type</span>
                <span class="detail-value">${txType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp (Server Coordinate)</span>
                <span class="detail-value">${formattedDate} ${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Client Time Zone</span>
                <span class="detail-value">${userTz}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Status</span>
                <span class="detail-value" style="font-weight: 800; color: #C8102E;">${transaction.status}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Authorized Description</span>
                <span class="detail-value italic">"${transaction.note || "Digital Asset Settlement Dispatch"}"</span>
              </div>
            </div>

            <div class="breakdown-section">
              <h4>Amount Breakdown</h4>
              <div class="detail-row">
                <span class="detail-label">Transfer Principal Sum</span>
                <span class="detail-value mono">${fmtMoney(transaction.amount)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sovereign Processing Fee</span>
                <span class="detail-value mono">${fmtMoney(pFee)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Regulatory Service Charge</span>
                <span class="detail-value mono">${fmtMoney(sCharge)}</span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total Settled Balance</span>
                <span class="detail-value">${fmtMoney(totalAmt)}</span>
              </div>
            </div>

            <div class="footer-sig">
              CERTIFIED SECURE TRANSACTION REPORT &middot; VALORA FINANCIAL BANK PLC<br/>
              Authorised by the Prudential Regulation Authority (PRA) and Regulated by the FCA & Member FSCS Compliance ID No. 4930-VFB<br/>
              Security Verification Reference: SHA256-${transaction.id}-CRYPTO-LEGER-CLEARED
            </div>

            <div class="action-hide">
              <button class="btn-print" onclick="window.print()">Print This Certified Receipt</button>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownload = () => {
    // Generate a downloadable beautiful HTML receipt that they can view offline complete with premium styles!
    const htmlFileContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>VFB Receipt - ${transaction.id}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #020617;
              color: #f1f5f9;
              margin: 0;
              padding: 40px;
              line-height: 1.5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #1e293b;
              background-color: #0f172a;
              border-radius: 32px;
              padding: 40px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #1e293b;
              padding-bottom: 24px;
              margin-bottom: 24px;
            }
            .logo {
              font-family: 'Georgia', serif;
              font-weight: 850;
              font-size: 22px;
              letter-spacing: 0.1em;
              color: #FFFFFF;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            .logo span {
              color: #B89765;
              font-weight: 900;
            }
            .tagline {
              font-size: 10px;
              color: #94a3b8;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.15em;
              margin-top: -6px;
              display: block;
            }
            .status-badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 14px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.08em;
              margin-top: 12px;
              text-transform: uppercase;
              border: 1px solid;
            }
            .status-Approved, .status-Successful {
              background-color: rgba(16, 185, 129, 0.15);
              color: #34d399;
              border-color: rgba(16, 185, 129, 0.3);
            }
            .status-Pending {
              background-color: rgba(245, 158, 11, 0.15);
              color: #fbbf24;
              border-color: rgba(245, 158, 11, 0.3);
            }
            .status-Failed, .status-Declined {
              background-color: rgba(239, 68, 68, 0.15);
              color: #f87171;
              border-color: rgba(239, 68, 68, 0.3);
            }
            .status-Reversed {
              background-color: rgba(99, 102, 241, 0.15);
              color: #818cf8;
              border-color: rgba(99, 102, 241, 0.3);
            }
            .amount-block {
              text-align: center;
              margin: 28px 0;
            }
            .amount-title {
              font-size: 11px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .amount-val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 44px;
              font-weight: 800;
              color: #ffffff;
              letter-spacing: -0.02em;
              margin: 4px 0;
            }
            .recipient-block {
              text-align: center;
              font-size: 13px;
              color: #94a3b8;
            }
            .grid-details {
              display: grid;
              grid-template-columns: 1fr;
              gap: 12px;
              font-size: 12px;
              border-top: 1px solid #1e293b;
              padding-top: 24px;
              margin-top: 24px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 4px 0;
            }
            .detail-label {
              color: #94a3b8;
              font-weight: 500;
            }
            .detail-value {
              font-weight: 600;
              color: #f1f5f9;
              text-align: right;
            }
            .detail-value.mono {
              font-family: 'JetBrains Mono', monospace;
              color: #e2e8f0;
            }
            .breakdown-section {
              border-top: 1px solid #1e293b;
              padding-top: 20px;
              margin-top: 20px;
            }
            .breakdown-section h4 {
              margin: 0 0 12px 0;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #94a3b8;
            }
            .total-row {
              font-size: 15px;
              font-weight: 800;
              border-top: 2px solid #38bdf8;
              padding-top: 12px;
              margin-top: 8px;
            }
            .total-row .detail-value {
              font-family: 'JetBrains Mono', monospace;
              color: #38bdf8;
              font-size: 19px;
            }
            .audit-section {
              border-top: 1px solid #1e293b;
              padding-top: 20px;
              margin-top: 20px;
            }
            .audit-section h4 {
              margin: 0 0 12px 0;
              font-size: 10px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #94a3b8;
            }
            .audit-logs {
              background-color: #020617;
              border: 1px solid #1e293b;
              border-radius: 12px;
              padding: 14px;
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              color: #94a3b8;
              line-height: 1.6;
              white-space: pre-wrap;
              text-align: left;
            }
            .footer-sig {
              text-align: center;
              margin-top: 40px;
              font-size: 9px;
              color: #64748b;
              font-weight: 500;
              letter-spacing: 0.02em;
              line-height: 1.5;
            }
            .btn-action-block {
              margin-top: 30px;
              text-align: center;
            }
            .btn-action {
              background: #C8102E;
              color: #ffffff;
              padding: 10px 24px;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <svg viewBox="0 0 120 100" style="height: 48px; margin: 0 auto 10px auto; display: block;" xmlns="http://www.w3.org/2000/svg">
                <path d="M 16 16 H 48 V 21 C 40 21, 38 24, 36 30 L 58 80 H 61 L 79 30 C 81 24, 82 21, 88 21 V 16 H 68 V 21 C 74 21, 75 24, 73 30 L 59 74 L 43 30 C 41 24, 38 21, 30 21 V 16 Z" fill="#FFFFFF"/>
                <path d="M 76 48 L 81 40 V 60 L 76 66 Z" fill="#B89765"/>
                <path d="M 85 34 L 90 26 V 53 L 85 59 Z" fill="#B89765"/>
                <path d="M 94 20 L 99 12 V 46 L 94 52 Z" fill="#B89765"/>
              </svg>
              <div class="logo">VALORA<span>FINANCIAL</span></div>
              <span class="tagline">Sovereign Custody & Wealth Clearance</span>
              <div class="status-badge status-${transaction.status}">${statusConfig.label}</div>
            </div>

            <div class="amount-block">
              <span class="amount-title">Total Transaction Amount</span>
              <h2 class="amount-val">${fmtMoney(transaction.amount)}</h2>
              <div class="recipient-block">
                <strong>To:</strong> ${transaction.toName} &middot; <span style="font-family: monospace; color:#38bdf8;">${transaction.toAccountNumber}</span>
              </div>
            </div>

            <div class="grid-details">
              <div class="detail-row">
                <span class="detail-label">Sender Name</span>
                <span class="detail-value">${transaction.fromName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender Account</span>
                <span class="detail-value mono">${transaction.fromAccountNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sender Origin Institution</span>
                <span class="detail-value">${senderBank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Name</span>
                <span class="detail-value">${transaction.toName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Account</span>
                <span class="detail-value mono">${transaction.toAccountNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Recipient Institution</span>
                <span class="detail-value">${recipientBank}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value mono" style="color: #38bdf8;">${transaction.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Verification Reference</span>
                <span class="detail-value mono" style="text-transform: uppercase;">REF-${transaction.id.slice(-6)}-VERIFY</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Type</span>
                <span class="detail-value">${txType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Timestamp (Server Coordinate)</span>
                <span class="detail-value">${formattedDate} ${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Client Time Zone</span>
                <span class="detail-value">${userTz}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transaction Status</span>
                <span class="detail-value" style="font-weight: 800; color: #38bdf8;">${transaction.status}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sovereign Reference Note</span>
                <span class="detail-value italic">"${transaction.note || "Digital Asset Settlement Dispatch"}"</span>
              </div>
            </div>

            <div class="breakdown-section">
              <h4>Amount Breakdown</h4>
              <div class="detail-row">
                <span class="detail-label">Transfer Principal Sum</span>
                <span class="detail-value mono">${fmtMoney(transaction.amount)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Sovereign Processing Fee</span>
                <span class="detail-value mono">${fmtMoney(pFee)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Regulatory Service Charge</span>
                <span class="detail-value mono">${fmtMoney(sCharge)}</span>
              </div>
              <div class="detail-row total-row">
                <span class="detail-label">Total Settled Balance</span>
                <span class="detail-value">${fmtMoney(totalAmt)}</span>
              </div>
            </div>

            <div class="footer-sig">
              CERTIFIED SECURE TRANSACTION REPORT &middot; VALORA FINANCIAL BANK PLC<br/>
              Authorised by the Prudential Regulation Authority (PRA) and Regulated by the FCA & Member FSCS Compliance ID No. 4930-VFB<br/>
              Security Verification Reference: SHA256-${transaction.id}-CRYPTO-LEGER-CLEARED
            </div>

            <div class="btn-action-block">
              <button class="btn-action" onclick="window.print()">Print Receipt</button>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlFileContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `VFB_Digital_Receipt_${transaction.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-[fadeIn_0.25s_ease-out]">
      <div 
        id="receipt-print-area" 
        className={`w-full max-w-md rounded-[2.5rem] border overflow-hidden shadow-2xl flex flex-col max-h-[92vh] ${
          dark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Modal Header Tab */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-500/10 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="text-[#C8102E] w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black tracking-widest uppercase text-[#C8102E]">Certified Receipt</span>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              dark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Logo & Status Badge Block */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-1">
              <ValoraLogo className="h-9" dark={dark} />
            </div>
            
            <div className={`mx-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black tracking-wider uppercase ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </div>

            {(transaction.status === "Approved" || transaction.status === "Successful" || transaction.status === "Completed") && (
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm animate-[bounce_2s_infinite] mb-1">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest font-mono">
                  TRANSACTION SUCCESSFUL
                </span>
              </div>
            )}

            {/* Prominent Amount */}
            <div className="py-2">
              <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 block">Settlement Value</span>
              <h2 className={`font-mono text-4xl lg:text-5xl font-black mt-1 select-all ${
                dark ? "text-white" : "text-slate-950"
              }`}>
                {fmtMoney(transaction.amount)}
              </h2>
            </div>

            {/* Target information preview */}
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-400">To Payee:</span>
              <strong className="uppercase font-semibold">{transaction.toName}</strong>
              <span className="font-mono text-slate-400 border-l border-slate-500/20 pl-2">{transaction.toAccountNumber}</span>
            </div>
          </div>

          {/* Amount Breakdown Section */}
          <div className={`p-5 rounded-3xl border ${
            dark ? "bg-slate-950/50 border-slate-800/60" : "bg-slate-50 border-slate-150"
          }`}>
            <h4 className="text-[9px] font-bold uppercase tracking-wider text-[#C8102E] mb-3.5">Amount Breakdown</h4>
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Transfer Principal Sum</span>
                <span className="font-mono">{fmtMoney(transaction.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sovereign Processing Fee</span>
                <span className="font-mono">{fmtMoney(pFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Regulatory Service Charge</span>
                <span className="font-mono">{fmtMoney(sCharge)}</span>
              </div>
              
              <div className="border-t border-dashed border-slate-500/20 my-2.5" />
              
              <div className="flex justify-between text-base font-extrabold items-center">
                <span className="text-[#C8102E]">Grand Total Settled</span>
                <span className="font-mono text-[#C8102E] underline decoration-double">{fmtMoney(totalAmt)}</span>
              </div>
            </div>
          </div>

          {/* Transaction Structured Details */}
          <div className="space-y-3.5 text-xs">
            <h4 className="text-[9.5px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-500/10 pb-1.5">
              Secure Ledger Parameters
            </h4>

            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Sender Full Name</span>
                <span className="font-semibold">{transaction.fromName}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Sender Account</span>
                <span className="font-semibold font-mono">{transaction.fromAccountNumber}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Sender Institution</span>
                <span className="font-semibold text-slate-400">{senderBank}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Recipient Full Name</span>
                <span className="font-semibold uppercase">{transaction.toName}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Recipient Account</span>
                <span className="font-semibold font-mono">{transaction.toAccountNumber}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Recipient Institution</span>
                <span className="font-semibold text-slate-400">{recipientBank}</span>
              </div>

              <div className="col-span-2 border-t border-slate-500/10 my-1" />

              <div className="col-span-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Unique Transaction ID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono font-bold text-[#C8102E] text-sm select-all">{transaction.id}</span>
                  <button 
                    onClick={handleCopyTxId}
                    className="p-1 rounded bg-[#C8102E]/10 hover:bg-[#C8102E]/20 text-[#C8102E] cursor-pointer"
                    title="Copy Transaction ID"
                  >
                    {copiedId ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Verification Ref</span>
                <span className={`font-mono text-[10.5px] font-bold ${dark ? "text-slate-300" : "text-slate-800"}`}>REF-{transaction.id.slice(-6).toUpperCase()}-VERIFY</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Transaction Type</span>
                <span className="font-semibold">{txType}</span>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Execution Date</span>
                <span className="font-semibold">{formattedDate}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Execution Time</span>
                <span className="font-semibold font-mono">{formattedTime}</span>
              </div>

              <div className="col-span-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">User System Time Zone</span>
                <span className="font-mono text-[11px] text-slate-400">{userTz}</span>
              </div>

              <div className="col-span-2">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Sovereign Reference Note</span>
                <span className={`italic block mt-1 py-1.5 px-3 rounded-xl bg-slate-500/5 border border-slate-500/10 ${dark ? "text-slate-300" : "text-slate-700 font-medium"}`}>
                  "{transaction.note || "Digital Asset Settlement Dispatch"}"
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer Block */}
        <div className="p-6 border-t border-slate-500/10 shrink-0 flex gap-3 bg-slate-950/45">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-2xl bg-[#C8102E] hover:bg-[#A93226] text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer size={14} className="stroke-[2.5]" />
            Print Receipt
          </button>
          <button
            onClick={handleDownload}
            className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
              dark 
                ? "border-slate-850 hover:bg-slate-800 text-slate-200" 
                : "border-slate-200 hover:bg-slate-55 text-slate-700 bg-white shadow-sm"
            }`}
          >
            <Download size={14} className="stroke-[2.5]" />
            Download HTML
          </button>
        </div>
      </div>
    </div>
  );
}
