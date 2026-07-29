import nodemailer from "nodemailer";

// Configuration from Environment Variables
const BREVO_API_KEY = (process.env.BREVO_API_KEY || "").trim();
const BREVO_SMTP_PASSWORD = (process.env.BREVO_SMTP_PASSWORD || "").trim();
const BREVO_SMTP_HOST = (process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com").trim();
const BREVO_SMTP_PORT = parseInt(process.env.BREVO_SMTP_PORT || "587", 10);
const BREVO_SENDER_NAME = (process.env.BREVO_SENDER_NAME || "Valora Financial Bank").trim();
const BREVO_SENDER_EMAIL = (process.env.BREVO_SENDER_EMAIL || "notifications@valorafinancialbank.com").trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "muzikworld08@gmail.com").trim();

export interface BrevoResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  method: "REST_API" | "SMTP_FALLBACK";
}

/**
 * Primary responsive dark-luxury email template wrapper for Valora Financial Bank
 */
export function getBrevoEmailLayout(title: string, subtitle: string, bodyContent: string): string {
  const currentYear = new Date().getFullYear();
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #020617;
          color: #f8fafc;
          margin: 0;
          padding: 0;
          -webkit-font-smoothing: antialiased;
        }
        .wrapper {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        .card {
          background-color: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 24px;
          padding: 40px;
          text-align: left;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }
        .logo {
          font-size: 18px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          color: #38bdf8;
          margin-bottom: 24px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 16px;
        }
        .logo-symbol {
          color: #10b981;
          margin-right: 6px;
          font-weight: 900;
        }
        .title {
          font-size: 24px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.5px;
          margin-top: 0;
          margin-bottom: 8px;
        }
        .subtitle {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 30px;
        }
        .content {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.6;
        }
        .content p {
          margin-top: 0;
          margin-bottom: 16px;
        }
        .content ul {
          margin-top: 0;
          margin-bottom: 20px;
          padding-left: 20px;
        }
        .content li {
          margin-bottom: 8px;
        }
        .footer {
          font-size: 10px;
          color: #475569;
          text-align: center;
          border-top: 1px solid #1e293b;
          padding-top: 24px;
          margin-top: 32px;
          letter-spacing: 0.5px;
          line-height: 1.5;
        }
        .footer a {
          color: #38bdf8;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          background-color: #38bdf8;
          color: #020617 !important;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 14px 28px;
          border-radius: 12px;
          margin: 24px 0;
          text-align: center;
        }
        .warning {
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 3px solid #ef4444;
          padding: 16px;
          font-size: 12px;
          color: #fca5a5;
          line-height: 1.5;
          border-radius: 8px;
          margin: 24px 0;
        }
        .info-box {
          background-color: #020617;
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 20px;
          margin: 24px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 12px;
        }
        .info-row:last-child {
          margin-bottom: 0;
        }
        .label {
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.5px;
        }
        .value {
          color: #e2e8f0;
          font-weight: 700;
          text-align: right;
        }
        .otp-box {
          background-color: #020617;
          border: 2px solid #38bdf8;
          border-radius: 20px;
          padding: 24px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-label {
          font-size: 10px;
          font-weight: 900;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 8px;
        }
        .otp-code {
          font-size: 38px;
          font-weight: 950;
          color: #10b981;
          letter-spacing: 8px;
          font-family: "Courier New", Courier, monospace;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="card">
          <div class="logo"><span class="logo-symbol">◆</span> VALORA FINANCIAL</div>
          <h2 class="title">${title}</h2>
          <div class="subtitle">${subtitle}</div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            VALORA FINANCIAL BANK &bullet; LOS ANGELES, CALIFORNIA, USA (Headquarters)<br>
            SECURE BREVO SMTP API SERVICE &bullet; CONFIDENTIAL &bullet; EST. 2002<br><br>
            This is a private transactional transmission. If you received this in error, notify <a href="mailto:support@valorafinancialbank.com">support@valorafinancialbank.com</a>.<br>
            &copy; ${currentYear} Valora Financial Bank. All sovereign rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends a transactional email using Brevo's REST API, falling back to SMTP on failure.
 */
export async function sendBrevoEmail(toEmail: string, subject: string, htmlContent: string): Promise<BrevoResponse> {
  const recipient = toEmail.trim().toLowerCase();
  
  // 1. Attempt sending via Brevo v3 REST API
  try {
    console.log(`[Brevo Engine] Dispatching email to ${recipient} via REST API...`);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [{ email: recipient }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json() as any;
    if (response.ok && data.messageId) {
      console.log(`[Brevo Engine] REST API delivery successful. MessageId: ${data.messageId}`);
      return {
        success: true,
        messageId: data.messageId,
        method: "REST_API"
      };
    } else {
      console.warn(`[Brevo Engine] REST API returned status ${response.status}:`, data);
      throw new Error(data.message || data.error || `HTTP Status ${response.status}`);
    }
  } catch (apiErr: any) {
    console.error(`[Brevo Engine] REST API transmission failed:`, apiErr.message);
    console.log(`[Brevo Engine] Activating fallback mechanism: Brevo Secure SMTP Relay...`);

    // 2. SMTP Fallback Transport Setup
    try {
      const transporter = nodemailer.createTransport({
        host: BREVO_SMTP_HOST,
        port: BREVO_SMTP_PORT,
        secure: BREVO_SMTP_PORT === 465, // True for 465, false for 587/25
        auth: {
          user: BREVO_SENDER_EMAIL,
          pass: BREVO_SMTP_PASSWORD
        }
      });

      const info = await transporter.sendMail({
        from: `"${BREVO_SENDER_NAME}" <${BREVO_SENDER_EMAIL}>`,
        to: recipient,
        subject: subject,
        html: htmlContent
      });

      console.log(`[Brevo Engine] Secure SMTP Fallback succeeded. MessageId: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        method: "SMTP_FALLBACK"
      };
    } catch (smtpErr: any) {
      console.error(`[Brevo Engine] Critical: Secure SMTP Fallback failed:`, smtpErr.message);
      return {
        success: false,
        error: `REST API error: ${apiErr.message} | SMTP Fallback error: ${smtpErr.message}`,
        method: "SMTP_FALLBACK"
      };
    }
  }
}

// =========================================================================
// Centralized, Reusable Transactional Mailers
// =========================================================================

/**
 * 1. Welcome Email (sendWelcomeEmail)
 */
export async function sendWelcomeEmail(toEmail: string, name: string, accountNumber?: string, password?: string, pin?: string): Promise<BrevoResponse> {
  const title = "Sovereign Account Clearance Granted";
  const subtitle = "Valora Onboarding Security Protocol";
  const body = `
    <p>Dear ${name},</p>
    <p>We are pleased to inform you that your executive sovereign account clearance has been successfully granted and certified by the Valora Financial Wealth desk handlers.</p>
    <p>Your premium digital portal is now active. As a Valora Financial Bank client, you now possess authorized access to specialized sovereign financial infrastructure, including:</p>
    <ul>
      <li>Direct ledger wire transfer clearance nodes</li>
      <li>Segregated physical-grade asset storage vaults</li>
      <li>Custom institutional borrowing lines and high-yield interest options</li>
      <li>Bespoke sovereign debit card accounts with zero global transaction boundaries</li>
    </ul>
    <p>To access your credentials, please navigate to the official Valora public portal. Input your registered email and your onboarding credentials to extract your official account coordinates.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Client Name</span>
        <span class="value">${name}</span>
      </div>
      ${accountNumber ? `
      <div class="info-row">
        <span class="label">Account Number</span>
        <span class="value" style="font-family: monospace; font-weight: 800; color: #38bdf8;">${accountNumber}</span>
      </div>` : ""}
      ${password ? `
      <div class="info-row">
        <span class="label">Default Password</span>
        <span class="value" style="font-family: monospace; color: #a5b4fc;">${password}</span>
      </div>` : ""}
      ${pin ? `
      <div class="info-row">
        <span class="label">Security PIN Code</span>
        <span class="value" style="font-family: monospace; color: #34d399; letter-spacing: 2px;">${pin}</span>
      </div>` : ""}
      <div class="info-row">
        <span class="label">Access Level</span>
        <span class="value" style="color: #10b981;">Executive Sovereign Portal</span>
      </div>
      <div class="info-row">
        <span class="label">Status</span>
        <span class="value" style="color: #38bdf8;">ACTIVE &amp; CERTIFIED</span>
      </div>
    </div>
    <div class="warning">
      <strong>Cybersecurity Notice:</strong> Valora will never prompt you for secure PIN codes, transaction coordinates, or private keys via phone, SMS, or chat corridors. Please ensure all sessions are conducted strictly through our secure TLS-encrypted portal gates.
    </div>
    <p>We welcome you to the world's most robust offline-first sovereign banking framework.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `${title} - Valora Financial Bank`, html);
}

/**
 * 2. General Verification Code Email (sendVerificationEmail)
 */
export async function sendVerificationEmail(toEmail: string, otp: string): Promise<BrevoResponse> {
  const title = "Portal Verification Dispatch";
  const subtitle = "Valora Secure Multi-Factor Gateway";
  const body = `
    <p>We received an authentication handshake request to verify your digital signature or identity. To sign and approve this action, use the confidential cryptographic code below.</p>
    <div class="otp-box">
      <div class="otp-label">Cryptographic Verification Code</div>
      <div class="otp-code">${otp}</div>
    </div>
    <div class="warning">
      <strong>Important Security Alert:</strong> This code remains valid for exactly 10 minutes. Never share this code with anyone. Valora representatives will never request this verification token via telephone, chat, or external platforms.
    </div>
    <p>If you did not initiate this authentication request, please secure your credentials immediately inside the sovereign portal dashboard.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[MFA Code: ${otp}] Valora Gate Verification`, html);
}

/**
 * 3. Secure OTP with transaction details (sendOTP)
 */
export async function sendOTP(
  toEmail: string, 
  otp: string, 
  details?: { amount?: number; toName?: string; toAccountNumber?: string; recipientBank?: string; transactionId?: string }
): Promise<BrevoResponse> {
  const title = "Sovereign Asset Transfer Authorization";
  const subtitle = "Multi-Factor Gateway Verification";
  
  const formattedAmount = details?.amount !== undefined ? new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount) : null;

  const body = `
    <p>We received a ledger clearance request for multi-factor authorization or sovereign asset transfer from your holdings. To sign and approve this action, use the confidential cryptographic OTP below.</p>
    
    ${details?.transactionId ? `
    <div class="info-box">
      <div class="info-row">
        <span class="label">Requested Action</span>
        <span class="value">Sovereign Outward Transfer</span>
      </div>
      ${details.toName ? `
      <div class="info-row">
        <span class="label">Beneficiary</span>
        <span class="value">${details.toName}</span>
      </div>
      ` : ""}
      ${details.toAccountNumber ? `
      <div class="info-row">
        <span class="label">Target Account</span>
        <span class="value">${details.toAccountNumber} (${details.recipientBank || "External"})</span>
      </div>
      ` : ""}
      ${formattedAmount ? `
      <div class="info-row">
        <span class="label">Requested Amount</span>
        <span class="value" style="color: #38bdf8; font-weight: 800;">${formattedAmount}</span>
      </div>
      ` : ""}
      <div class="info-row">
        <span class="label">Transaction Ref</span>
        <span class="value" style="font-family: monospace;">${details.transactionId}</span>
      </div>
    </div>
    ` : ""}

    <div class="otp-box">
      <div class="otp-label">Cryptographic Security Code</div>
      <div class="otp-code">${otp}</div>
    </div>

    <div class="warning">
      <strong>Security Warning:</strong> This authorization key remains valid for exactly 10 minutes. Never disclose this code to anyone. Valora will never request verification keys via telephone or unsecured channels.
    </div>
    <p>If you did not initiate this ledger request, please sign in to your dashboard immediately to cancel pending actions or freeze your checking accounts.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[Confidential Secure OTP: ${otp}] Valora Transaction Verification`, html);
}

/**
 * 4. Password Reset Link (sendPasswordReset)
 */
export async function sendPasswordReset(toEmail: string, name: string, resetLink: string): Promise<BrevoResponse> {
  const title = "Security Credentials Reset Link";
  const subtitle = "Valora Portal Security Desk";
  const body = `
    <p>Dear Client,</p>
    <p>We received a request to modify or reset the portal login security credentials associated with your account.</p>
    <p>To safely reconfigure your password and security PIN, click the secure action button below. This action node will bypass conventional parameters and grant temporary cryptographic access to the credential modification desk.</p>
    
    <div style="text-align: center;">
      <a href="${resetLink}" class="button" target="_blank">Reset Access Credentials</a>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span class="label">Request Node</span>
        <span class="value">Authorized Web Interface</span>
      </div>
      <div class="info-row">
        <span class="label">Link Expiration</span>
        <span class="value" style="color: #ef4444;">1 Hour from dispatch</span>
      </div>
    </div>

    <div class="warning">
      <strong>Important Security Action:</strong> If you did not request this modification, your current portal credentials might be compromised. Please access your dashboard console immediately or contact the Valora Executive Security Desk to place a regulatory lock on your assets.
    </div>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, "SecOps Security Notice - Access Credentials Reset", html);
}

/**
 * 5. Deposit Confirmation Email (sendDepositConfirmation)
 */
export async function sendDepositConfirmation(
  toEmail: string, 
  details: { name: string; amount: number; txId: string; date?: string; paymentType?: string }
): Promise<BrevoResponse> {
  const title = "Asset Deposit Confirmed";
  const subtitle = "Sovereign Ledger Settlement desk";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount);
  const dateStr = details.date || new Date().toLocaleString("en-US", { timeZoneName: "short" });

  const body = `
    <p>Dear ${details.name},</p>
    <p>We are pleased to confirm that an inbound asset deposit has cleared and settled successfully into your sovereign holdings ledger.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Sovereign Reference</span>
        <span class="value" style="font-family: monospace;">${details.txId}</span>
      </div>
      <div class="info-row">
        <span class="label">Deposit Route</span>
        <span class="value">${details.paymentType || "Direct Account Credit"}</span>
      </div>
      <div class="info-row">
        <span class="label">Settled Capital</span>
        <span class="value" style="color: #10b981; font-weight: 800;">${formattedAmount} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Cleared Timestamp</span>
        <span class="value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="label">Current Status</span>
        <span class="value" style="color: #10b981;">CLEARED &amp; COMPLETED</span>
      </div>
    </div>
    
    <p>Your adjusted ledger balance is active and ready for immediate deployment inside the sovereign asset market corridors.</p>
    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[Deposit Cleared] Inbound Ledger Settlement: ${formattedAmount}`, html);
}

/**
 * 6. Withdrawal Request / Status Notification (sendWithdrawalConfirmation)
 */
export async function sendWithdrawalConfirmation(
  toEmail: string, 
  details: { name: string; amount: number; txId: string; status: "Pending" | "Approved" | "Rejected"; destination: string; date?: string; comments?: string }
): Promise<BrevoResponse> {
  const title = `Withdrawal Clearance Notice`;
  const subtitle = "Sovereign Asset Liquidation Desk";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount);
  const dateStr = details.date || new Date().toLocaleString("en-US", { timeZoneName: "short" });

  let statusColor = "#38bdf8"; // Pending blue
  if (details.status === "Approved") statusColor = "#10b981"; // Approved green
  if (details.status === "Rejected") statusColor = "#ef4444"; // Rejected red

  const body = `
    <p>Dear ${details.name},</p>
    <p>This is an official transaction clearance status notification regarding your requested asset outward liquidation.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Liquidation Ref</span>
        <span class="value" style="font-family: monospace;">${details.txId}</span>
      </div>
      <div class="info-row">
        <span class="label">Outward Destination</span>
        <span class="value">${details.destination}</span>
      </div>
      <div class="info-row">
        <span class="label">Liquidated Capital</span>
        <span class="value" style="font-weight: 800;">${formattedAmount} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Execution Timestamp</span>
        <span class="value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="label">Status</span>
        <span class="value" style="color: ${statusColor}; font-weight: 800;">${details.status.toUpperCase()}</span>
      </div>
      ${details.comments ? `
      <div class="info-row">
        <span class="label">Auditor Comments</span>
        <span class="value" style="color: #94a3b8; font-style: italic;">"${details.comments}"</span>
      </div>
      ` : ""}
    </div>

    ${details.status === "Pending" ? `
    <div class="warning" style="background-color: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; color: #bae6fd;">
      <strong>Regulatory Processing:</strong> This outward liquidation is currently being vetted by the sovereign compliance handlers. Standard settlement windows range between 2 to 6 business hours.
    </div>
    ` : ""}

    <p>Full tracking coordinates and ledger details remain fully accessible within your secured client session panel.</p>
    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[Withdrawal Update: ${details.status}] Sovereign Capital Liquidation Desk`, html);
}

/**
 * 7. Investment Allocation Confirmation (sendInvestmentConfirmation)
 */
export async function sendInvestmentConfirmation(
  toEmail: string, 
  details: { name: string; amount: number; route: string; maturityDate: string; expectedYield: string; txId: string }
): Promise<BrevoResponse> {
  const title = "Sovereign Asset Allocation Secured";
  const subtitle = "Wealth Management & Capital Growth Desk";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount);

  const body = `
    <p>Dear ${details.name},</p>
    <p>We are pleased to confirm that your sovereign investment allocation has been successfully finalized and securely locked on our yield-generation nodes.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Allocation Reference</span>
        <span class="value" style="font-family: monospace;">${details.txId}</span>
      </div>
      <div class="info-row">
        <span class="label">Sovereign Asset Route</span>
        <span class="value" style="color: #10b981; font-weight: 800;">${details.route}</span>
      </div>
      <div class="info-row">
        <span class="label">Capital Committed</span>
        <span class="value" style="font-weight: 800;">${formattedAmount} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Expected APY Yield</span>
        <span class="value" style="color: #38bdf8;">${details.expectedYield}</span>
      </div>
      <div class="info-row">
        <span class="label">Contractual Maturity</span>
        <span class="value" style="font-family: monospace;">${details.maturityDate}</span>
      </div>
      <div class="info-row">
        <span class="label">Ledger State</span>
        <span class="value" style="color: #10b981;">SECURED &amp; ACCRUING</span>
      </div>
    </div>

    <div class="warning" style="background-color: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; color: #a7f3d0;">
      <strong>Smart Contract Active:</strong> Yield calculations began accumulating instantly upon node confirmation. Capital returns are governed strictly by sovereign lockup terms.
    </div>

    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[Investment Secured] ${details.route} Capital Allocation Confirmed`, html);
}

/**
 * 8. Security Alert Email (sendSecurityAlert)
 */
export async function sendSecurityAlert(
  toEmail: string, 
  details: { name: string; alertType: string; ipAddress: string; device: string; date?: string }
): Promise<BrevoResponse> {
  const title = `Security Handshake Alert: ${details.alertType}`;
  const subtitle = "Valora Cyber-SecOps Incident Response Desk";
  const dateStr = details.date || new Date().toLocaleString("en-US", { timeZoneName: "short" });

  const body = `
    <p>Dear ${details.name},</p>
    <p>This is an automated critical Security Notice. Our digital gatekeeper systems detected a security event associated with your client account access on <strong>${dateStr}</strong>.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Security Event</span>
        <span class="value" style="color: #ef4444; font-weight: 800;">${details.alertType}</span>
      </div>
      <div class="info-row">
        <span class="label">Network IP Address</span>
        <span class="value" style="font-family: monospace;">${details.ipAddress}</span>
      </div>
      <div class="info-row">
        <span class="label">Handshake Device</span>
        <span class="value">${details.device}</span>
      </div>
      <div class="info-row">
        <span class="label">Portal clearance</span>
        <span class="value" style="color: #ef4444;">VERIFICATION REQUIRED</span>
      </div>
    </div>

    <div class="warning">
      <strong>CRITICAL SECURITY ACTION REQUIRED:</strong> If this access, login, or credential handshake was NOT initiated by you, please protect your holdings immediately by requesting a lockout or contacting our emergency incident response center at <a href="mailto:secure@valorafinancialbank.com" style="color: #ef4444; font-weight: 800; text-decoration: underline;">secure@valorafinancialbank.com</a>.
    </div>

    <p>Thank you for your active security coordination. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[CRITICAL ALERT] Security Notice: ${details.alertType}`, html);
}

/**
 * 9. Administrative System/Operations Alert (sendAdminNotification)
 */
export async function sendAdminNotification(subject: string, htmlContent: string): Promise<BrevoResponse> {
  const title = "Valora Operations Command Desk";
  const subtitle = "Internal Server Administrative Dispatch";
  
  const body = `
    <p>This is an automated internal operational notification dispatched to authorized administrative desk handlers.</p>
    <div class="info-box" style="background-color: #0b1329; border: 1px dashed #38bdf8;">
      <h3 style="color: #38bdf8; margin-top: 0; font-size: 14px;">Internal Log Summary</h3>
      <div style="font-family: monospace; font-size: 12px; color: #94a3b8; line-height: 1.5; white-space: pre-wrap;">
        ${htmlContent}
      </div>
    </div>
    <p>Please audit relevant server security nodes and state mirrors to ensure perfect synchronization across the bank cluster.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(ADMIN_EMAIL, `[Operations Command] ${subject}`, html);
}

/**
 * 10. Support Ticket Reply (sendSupportReply)
 */
export async function sendSupportReply(
  toEmail: string, 
  details: { name: string; ticketId: string; subject: string; responseText: string; date?: string }
): Promise<BrevoResponse> {
  const title = "Client Support Resolution Desk";
  const subtitle = "Valora Operations and Handlers Support Channel";
  const dateStr = details.date || new Date().toLocaleString("en-US", { timeZoneName: "short" });

  const body = `
    <p>Dear ${details.name},</p>
    <p>An authorized Valora operations support representative has reviewed your support inquiry and issued the official response detailed below.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Ticket Reference</span>
        <span class="value" style="font-family: monospace;">${details.ticketId}</span>
      </div>
      <div class="info-row">
        <span class="label">Inquiry Subject</span>
        <span class="value" style="font-weight: 700;">${details.subject}</span>
      </div>
      <div class="info-row">
        <span class="label">Resolution Time</span>
        <span class="value">${dateStr}</span>
      </div>
    </div>

    <div style="background-color: #1e293b; border-radius: 16px; padding: 24px; border: 1px solid #334155; margin: 24px 0;">
      <h4 style="color: #38bdf8; margin-top: 0; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Official Resolution Response</h4>
      <div style="font-size: 13px; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap;">${details.responseText}</div>
    </div>

    <p>To follow up or add further annotations to this ticket corridor, please access the "Support and Security" panel from your executive client dashboard.</p>
    <p>Thank you for choosing Valora Financial Bank. We remain entirely at your service.</p>
  `;
  const html = getBrevoEmailLayout(title, subtitle, body);
  return sendBrevoEmail(toEmail, `[Support Ticket resolved: ${details.ticketId}] Valora Security Desk`, html);
}
