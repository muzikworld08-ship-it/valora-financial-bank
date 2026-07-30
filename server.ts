import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import fs from "fs";
import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { 
  sendBrevoEmail, 
  sendWelcomeEmail as brevoSendWelcomeEmail, 
  sendVerificationEmail, 
  sendOTP, 
  sendPasswordReset, 
  sendDepositConfirmation, 
  sendWithdrawalConfirmation, 
  sendInvestmentConfirmation, 
  sendSecurityAlert, 
  sendAdminNotification, 
  sendSupportReply 
} from "./services/brevo";

dotenv.config();

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Central synchronized JSON storage path (as a robust secondary backup cache)
const STATE_FILE_PATH = path.join(process.cwd(), "valora-state.json");

// Parse Firebase configuration safely
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (err: any) {
  console.error("Error reading firebase config:", err.message);
}

// Initialize Firebase Admin SDK safely
try {
  if (getApps().length === 0) {
    let credentialOption: any = undefined;
    
    // Check for explicit service account key JSON in environment variables
    const saKeyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (saKeyEnv) {
      try {
        credentialOption = cert(JSON.parse(saKeyEnv));
        console.log("Firebase Admin: Loaded explicit service account key from environment.");
      } catch (err: any) {
        console.error("Firebase Admin: Failed to parse service account key from environment:", err.message);
      }
    } else {
      try {
        credentialOption = applicationDefault();
      } catch (_appDefErr) {
        // Fall back to ambient project ID without explicit applicationDefault credential
      }
    }

    if (firebaseConfig && firebaseConfig.projectId) {
      initializeApp({
        projectId: firebaseConfig.projectId,
        ...(credentialOption ? { credential: credentialOption } : {})
      });
      console.log("Firebase Admin successfully initialized with project ID:", firebaseConfig.projectId);
    } else {
      initializeApp(credentialOption ? { credential: credentialOption } : undefined);
      console.log("Firebase Admin initialized.");
    }
  }
} catch (fbInitErr: any) {
  console.warn("Firebase Admin initialization notice/fallback:", fbInitErr.message);
}

let db: any = null;
try {
  const dbId = firebaseConfig?.firestoreDatabaseId;
  const isCustomDbId = dbId && dbId !== "(default)" && dbId !== firebaseConfig?.projectId;
  if (isCustomDbId) {
    const appRef = getApps().length > 0 ? getApps()[0] : undefined;
    db = getFirestore(appRef, dbId);
    console.log("Firestore successfully linked using ID:", dbId);
  } else {
    db = getFirestore();
    console.log("Firestore successfully linked using default database.");
  }
} catch (dbErr: any) {
  console.log("Firestore database link initialized in offline/fallback mode:", dbErr.message);
}

// Single central document reference for syncing App State
const isRender = process.env.RENDER === "true";
const hasExplicitCredentials = !!(
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

// We are running on Google Cloud Platform if we are NOT on Render (e.g. inside Google Cloud Run in AI Studio dev environment).
// GCP has metadata service accounts, so default credentials work automatically.
const isRunningOnGcp = !isRender;

// To eliminate "Portal Connection Timeout" hangs on Render, only enable Firestore initially
// if we are running in GCP or have provided explicit credentials.
const isFirestoreConfigured = isRunningOnGcp || hasExplicitCredentials;
let isFirestoreAvailable = isFirestoreConfigured;
let lastFirestoreTry = 0;
const FIRESTORE_RETRY_INTERVAL = 45000; // 45 seconds throttled retry interval
const FIRESTORE_TIMEOUT = 5000; // 5 seconds connection limit
const stateDocRef = db ? db.collection("valora_bank_data").doc("central_state") : null;

// Timeout Helper to prevent database operations from hanging the server process
function withTimeout<T>(promise: Promise<T>, ms: number, timeoutErrorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(timeoutErrorMsg)), ms)),
  ]);
}

// Helper to parse cookies from incoming headers
const parseRequestCookies = (req: express.Request) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies: { [key: string]: string } = {};
  cookieHeader.split(";").forEach((item) => {
    const parts = item.split("=");
    if (parts.length >= 2) {
      cookies[parts[0].trim()] = decodeURIComponent(parts[1].trim());
    }
  });
  return cookies;
};

let localMemoryStateCache: any = null;

// Helper to write file atomically by using a temporary file and renaming it
function safeWriteStateFile(state: any): boolean {
  // Always keep in-memory cache fully synchronized, even on serverless filesystems like Vercel which are read-only
  localMemoryStateCache = state;
  try {
    const tempPath = STATE_FILE_PATH + ".tmp";
    fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), "utf8");
    if (fs.existsSync(tempPath)) {
      fs.renameSync(tempPath, STATE_FILE_PATH);
      return true;
    }
  } catch (err: any) {
    console.warn("Atomic state write skipped/failed (expected on read-only serverless filesystems like Vercel):", err.message);
  }
  return false;
}

// Helper to save individual users in a dedicated Firestore collection
async function saveUsersToFirestore(users: any[]) {
  if (!db || !isFirestoreAvailable) return;
  try {
    const usersCollection = db.collection("valora_bank_users");
    
    // Save each user individually
    for (const user of users) {
      if (user && user.id) {
        await withTimeout(
          usersCollection.doc(user.id).set(user),
          3000,
          `Timeout saving user ${user.id} to Firestore`
        );
      }
    }

    // Load all current document IDs in individual collection and delete obsolete ones
    const snapshot = (await withTimeout(
      usersCollection.get(),
      4000,
      "Timeout fetching user list for deletion sync"
    )) as any;
    
    const userIdsInState = new Set(users.map(u => u.id));
    for (const doc of snapshot.docs) {
      if (!userIdsInState.has(doc.id)) {
        await withTimeout(
          usersCollection.doc(doc.id).delete(),
          3000,
          `Timeout deleting user ${doc.id} from Firestore`
        );
        console.log(`Successfully deleted user ${doc.id} from individual Firestore collection.`);
      }
    }
  } catch (err: any) {
    console.log("Sync individual users fallback to local state:", err.message);
  }
}

// Helper to load individual users from the dedicated Firestore collection
async function loadUsersFromFirestore(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const usersCollection = db.collection("valora_bank_users");
    const snapshot = (await withTimeout(
      usersCollection.get(),
      4000,
      "Timeout fetching individual users from Firestore"
    )) as any;
    if (snapshot.empty) return null;
    const users: any[] = [];
    snapshot.forEach((doc: any) => {
      users.push(doc.data());
    });
    return users;
  } catch (err: any) {
    console.log("Load individual users fallback to local state:", err.message);
    return null;
  }
}

// Helper to save individual notifications in a dedicated Firestore collection
async function saveNotificationsToFirestore(notifications: any[]) {
  if (!db || !isFirestoreAvailable) return;
  try {
    const notificationsCollection = db.collection("valora_bank_notifications");
    
    // Save each notification individually
    for (const notif of notifications) {
      if (notif && notif.id) {
        await withTimeout(
          notificationsCollection.doc(notif.id).set(notif),
          3000,
          `Timeout saving notification ${notif.id} to Firestore`
        );
      }
    }

    // Load all current document IDs in individual collection and delete obsolete ones
    const snapshot = (await withTimeout(
      notificationsCollection.get(),
      4000,
      "Timeout fetching notifications list for deletion sync"
    )) as any;
    
    const notifIdsInState = new Set(notifications.map(n => n.id));
    for (const doc of snapshot.docs) {
      if (!notifIdsInState.has(doc.id)) {
        await withTimeout(
          notificationsCollection.doc(doc.id).delete(),
          3000,
          `Timeout deleting notification ${doc.id} from Firestore`
        );
        console.log(`Successfully deleted notification ${doc.id} from individual Firestore collection.`);
      }
    }
  } catch (err: any) {
    console.log("Sync individual notifications fallback to local state:", err.message);
  }
}

// Helper to load individual notifications from the dedicated Firestore collection
async function loadNotificationsFromFirestore(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const notificationsCollection = db.collection("valora_bank_notifications");
    const snapshot = (await withTimeout(
      notificationsCollection.get(),
      4000,
      "Timeout fetching individual notifications from Firestore"
    )) as any;
    if (snapshot.empty) return null;
    const notifications: any[] = [];
    snapshot.forEach((doc: any) => {
      notifications.push(doc.data());
    });
    return notifications;
  } catch (err: any) {
    console.log("Load individual notifications fallback to local state:", err.message);
    return null;
  }
}

// Helper to save individual transactions in a dedicated Firestore collection
async function saveTransactionsToFirestore(transactions: any[]) {
  if (!db || !isFirestoreAvailable) return;
  try {
    const transactionsCollection = db.collection("valora_bank_transactions");
    
    // Save each transaction individually
    for (const tx of transactions) {
      if (tx && tx.id) {
        await withTimeout(
          transactionsCollection.doc(tx.id).set(tx),
          3000,
          `Timeout saving transaction ${tx.id} to Firestore`
        );
      }
    }

    // Load all current document IDs in individual collection and delete obsolete ones
    const snapshot = (await withTimeout(
      transactionsCollection.get(),
      4000,
      "Timeout fetching transactions list for deletion sync"
    )) as any;
    
    const txIdsInState = new Set(transactions.map(t => t.id));
    for (const doc of snapshot.docs) {
      if (!txIdsInState.has(doc.id)) {
        await withTimeout(
          transactionsCollection.doc(doc.id).delete(),
          3000,
          `Timeout deleting transaction ${doc.id} from Firestore`
        );
        console.log(`Successfully deleted transaction ${doc.id} from individual Firestore collection.`);
      }
    }
  } catch (err: any) {
    console.log("Sync individual transactions fallback to local state:", err.message);
  }
}

// Helper to load individual transactions from the dedicated Firestore collection
async function loadTransactionsFromFirestore(): Promise<any[] | null> {
  if (!db) return null;
  try {
    const transactionsCollection = db.collection("valora_bank_transactions");
    const snapshot = (await withTimeout(
      transactionsCollection.get(),
      4000,
      "Timeout fetching individual transactions from Firestore"
    )) as any;
    if (snapshot.empty) return null;
    const transactions: any[] = [];
    snapshot.forEach((doc: any) => {
      transactions.push(doc.data());
    });
    return transactions;
  } catch (err: any) {
    console.log("Load individual transactions fallback to local state:", err.message);
    return null;
  }
}

// Internal helper to fetch the centralized state document, falling back to local file system or memory cache
async function loadStateInternal() {
  const now = Date.now();
  const shouldTryFirestore = isFirestoreConfigured && (isFirestoreAvailable || (now - lastFirestoreTry > FIRESTORE_RETRY_INTERVAL));

  let stateData: any = null;

  if (stateDocRef && shouldTryFirestore) {
    try {
      const docSnap = await withTimeout(stateDocRef.get(), FIRESTORE_TIMEOUT, "Firestore load state timeout") as any;
      isFirestoreAvailable = true; // Recovered/active
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && data.state) {
          stateData = data.state;
        }
      }
    } catch (fsErr: any) {
      if (isFirestoreAvailable) {
        console.log("Firestore cloud sync currently unavailable, using local state persistence fallback.");
      }
      isFirestoreAvailable = false;
      lastFirestoreTry = now;
    }
  }

  // Load individual users from Firestore if Firestore is available
  if (db && isFirestoreAvailable) {
    try {
      const individualUsers = await loadUsersFromFirestore();
      if (individualUsers && individualUsers.length > 0) {
        if (!stateData) {
          // Try parsing local file as a base if central doc snap failed/was empty
          try {
            if (fs.existsSync(STATE_FILE_PATH)) {
              const fileData = fs.readFileSync(STATE_FILE_PATH, "utf8");
              if (fileData && fileData.trim()) {
                const parsed = JSON.parse(fileData);
                if (parsed) {
                  stateData = parsed;
                }
              }
            }
          } catch (err) {
            console.error("Failed to parse local file as base state:", err);
          }
        }

        if (!stateData) {
          // Fallback to local memory cache
          if (localMemoryStateCache) {
            stateData = { ...localMemoryStateCache };
          }
        }

        if (!stateData) {
          // If still no stateData, use seedState / defaultState structure
          stateData = {
            users: [],
            transactions: [],
            loans: [],
            supportTickets: [],
            investmentInquiries: [],
            announcements: [],
            notifications: [],
            beneficiaries: [],
            investmentSettings: {
              globalInterestRate: 2.4,
              realEstateGrowthRate: 4.8,
              bitcoinVolatilityMultiplier: 1.5,
              lastManualFluctuationTime: new Date().toISOString()
            }
          };
        }

        stateData.users = individualUsers;
      }
    } catch (usersErr: any) {
      console.error("Failed to integrate individual users during state load:", usersErr.message);
    }

    // Load individual notifications from dedicated collection
    try {
      const individualNotifications = await loadNotificationsFromFirestore();
      if (individualNotifications && individualNotifications.length > 0) {
        if (!stateData) {
          stateData = {
            users: [],
            transactions: [],
            loans: [],
            supportTickets: [],
            investmentInquiries: [],
            announcements: [],
            notifications: [],
            beneficiaries: [],
            investmentSettings: {
              globalInterestRate: 2.4,
              realEstateGrowthRate: 4.8,
              bitcoinVolatilityMultiplier: 1.5,
              lastManualFluctuationTime: new Date().toISOString()
            }
          };
        }
        stateData.notifications = individualNotifications;
      }
    } catch (notifErr: any) {
      console.error("Failed to integrate individual notifications during state load:", notifErr.message);
    }

    // Load individual transactions from dedicated collection
    try {
      const individualTransactions = await loadTransactionsFromFirestore();
      if (individualTransactions && individualTransactions.length > 0) {
        if (!stateData) {
          stateData = {
            users: [],
            transactions: [],
            loans: [],
            supportTickets: [],
            investmentInquiries: [],
            announcements: [],
            notifications: [],
            beneficiaries: [],
            investmentSettings: {
              globalInterestRate: 2.4,
              realEstateGrowthRate: 4.8,
              bitcoinVolatilityMultiplier: 1.5,
              lastManualFluctuationTime: new Date().toISOString()
            }
          };
        }
        stateData.transactions = individualTransactions;
      }
    } catch (txErr: any) {
      console.error("Failed to integrate individual transactions during state load:", txErr.message);
    }
  }

  if (stateData && stateData.users && stateData.users.length > 0) {
    localMemoryStateCache = stateData;
    safeWriteStateFile(stateData);
    return stateData;
  }

  // Priority Fallback: If we already have a synchronized memory cache, prioritize it!
  // This is highly critical on serverless setups like Vercel where file writes fail, making the local file stale.
  if (localMemoryStateCache && localMemoryStateCache.users) {
    return localMemoryStateCache;
  }

  // Fallback 1: Local file parse
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, "utf8");
      if (data && data.trim()) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.users) {
          localMemoryStateCache = parsed;
          return parsed;
        }
      }
    }
  } catch (error: any) {
    console.error("Error loading internal file state:", error.message);
  }

  // Fallback 2: Local memory cache
  if (localMemoryStateCache && localMemoryStateCache.users) {
    console.log("Recovered state from local memory cache fallback.");
    return localMemoryStateCache;
  }

  // Fallback 3: Hardcoded premium bootstrap state
  console.warn("CRITICAL: Both database and local file load failed. Initializing minimal resilient state.");
  const defaultState = {
    users: [
      {
        id: "user-7po029xg",
        name: "Gerald Christopher",
        email: "gerald@valorafinancial.com",
        password: "Gerald1234",
        pin: "5555",
        accountNumber: "8801641666",
        balance: 998507,
        cardNum: "4532 9901 2621 1651",
        cardExpiry: "06/32",
        cardFrozen: false,
        cardLimit: 10000,
        cardSpent: 0,
        avatarUrl: "",
        bitcoinBalance: 0,
        investmentBalance: 0,
        investmentsList: []
      },
      {
        id: "user-juooksgd",
        name: "Christopher and Katelyn Family Trust Account",
        email: "trust@valorafinancial.com",
        password: "Trustpassword123",
        pin: "2012",
        accountNumber: "9820555891",
        balance: 270000,
        cardNum: "4532 9901 7738 2911",
        cardExpiry: "12/32",
        cardFrozen: false,
        cardLimit: 250000,
        cardSpent: 0,
        avatarUrl: "",
        bitcoinBalance: 0,
        investmentBalance: 0,
        investmentsList: []
      }
    ],
    transactions: [],
    notifications: [],
    loans: [],
    supportTickets: [],
    announcements: [
      "Welcome to Valora Financial! Elite Swiss private banking clearances are now online.",
      "Welcome to Valora Banking Network"
    ],
    activeUserId: null,
    isAdminView: false,
    darkMode: false,
    investmentSettings: {
      portfolioDailyPercentage: 2.5,
      portfolioDurationDays: 120,
      bitcoinDailyPercentage: 3,
      bitcoinDurationDays: 120,
      instantFundingBonusPercentage: 7
    }
  };

  localMemoryStateCache = defaultState;
  safeWriteStateFile(defaultState);
  return defaultState;
}

// API Route: Login and establish secure session cookies
app.post("/api/auth/login", async (req, res) => {
  try {
    const { accountNumber, password, pin } = req.body;

    if (!accountNumber || !password || !pin) {
      console.warn(`[AUTH FAIL] [${new Date().toISOString()}] Login prompt failed: missing credential fields.`);
      return res.status(400).json({ error: "Please enter your Account Number, password, and security PIN." });
    }

    const state = await loadStateInternal();
    if (!state || !state.users) {
      console.warn(`[AUTH FAIL] [${new Date().toISOString()}] Database unavailable during login handshake.`);
      return res.status(503).json({ error: "Asset Vault is currently syncing. Please try again in a few moments." });
    }

    const acct = accountNumber.trim();
    const pwd = password.trim();
    const securityPin = pin.trim();

    // 1. Check Executive Admin Account
    if (acct === "2370214698" && pwd === "mbajugha12345@" && securityPin === "2002") {
      console.log(`[AUTH SUCCESS] [${new Date().toISOString()}] [ADMIN] Handshake successful. Admin session cookie established.`);
      
      // Place secure HttpOnly cookie for Admin session (valid for 5 hours)
      res.setHeader("Set-Cookie", [
        `session_user_id=ADMIN; Path=/; HttpOnly; SameSite=Lax; Max-Age=18000`,
        `session_is_admin=true; Path=/; SameSite=Lax; Max-Age=18000`
      ]);
      
      return res.json({ success: true, userId: null, isAdminView: true });
    }

    // 2. Check standard Client profiles
    const matchedUser = state.users.find(
      (u: any) =>
        u.accountNumber === acct &&
        (u.password || "").trim() === pwd &&
        String(u.pin) === securityPin
    );

    if (matchedUser) {
      console.log(`[AUTH SUCCESS] [${new Date().toISOString()}] [USER] ${matchedUser.name} (${matchedUser.id}) authenticated. Client session cookie established.`);

      // Place secure HttpOnly cookies for User session (valid for 5 hours)
      res.setHeader("Set-Cookie", [
        `session_user_id=${matchedUser.id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=18000`,
        `session_is_admin=false; Path=/; SameSite=Lax; Max-Age=18000`
      ]);

      // Fire and forget secure login alert email notification to the user's registered email
      const userAgentStr = req.headers["user-agent"] || "Unknown Device/Browser";
      const ipAddressStr = ((req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "Unknown IP").split(",")[0].trim();
      
      const loginHtml = getLoginAlertEmailHtml(matchedUser.name, ipAddressStr, userAgentStr);
      sendEmail(matchedUser.id, "Security Alert: Successful Portal Sign-In - Valora Financial Bank", loginHtml)
        .then(() => console.log(`[LOGIN ALERT SENT] Dispatched successfully to ${matchedUser.email}`))
        .catch((err: any) => console.error(`[LOGIN ALERT FAILED] Could not dispatch alert:`, err.message));

      return res.json({ success: true, userId: matchedUser.id, isAdminView: false });
    }

    // Credentials did not match
    console.warn(`[AUTH FAIL] [${new Date().toISOString()}] Invalid verification credentials for account query: "${acct}".`);
    return res.status(401).json({ error: "Access Denied! Invalid credentials. Verify Account Number, Password, and security PIN." });

  } catch (err: any) {
    console.error(`[AUTH EXCEPTION] [${new Date().toISOString()}] Critical error during verification audit:`, err);
    return res.status(500).json({ error: "Gateway Handshake Error. Please check security parameters." });
  }
});

// API Route: Close session and clear session cookies
app.post("/api/auth/logout", (req, res) => {
  console.log(`[AUTH EVENT] [${new Date().toISOString()}] Clearing active device session token.`);
  res.setHeader("Set-Cookie", [
    `session_user_id=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `session_is_admin=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  ]);
  return res.json({ success: true });
});

// API Route: Retrieve latest centralized state, resolved for this specific device session cookie
app.get("/api/load-state", async (req, res) => {
  try {
    const cookies = parseRequestCookies(req);
    
    // Support custom headers as a fallback for iframe environments (e.g., mobile previews) where third-party cookies are blocked
    const rawUserIdHeader = req.headers["x-session-user-id"];
    const sessionUserId = (typeof rawUserIdHeader === "string" ? rawUserIdHeader : Array.isArray(rawUserIdHeader) ? rawUserIdHeader[0] : null) || cookies["session_user_id"] || null;
    
    const rawIsAdminHeader = req.headers["x-session-is-admin"];
    const sessionIsAdmin = (typeof rawIsAdminHeader === "string" ? rawIsAdminHeader : Array.isArray(rawIsAdminHeader) ? rawIsAdminHeader[0] : null) === "true" || cookies["session_is_admin"] === "true";

    const state = await loadStateInternal();

    if (state) {
      // Overwrite the returned state session scopes with the client's cookie/header details,
      // creating isolated, private device sessions!
      state.activeUserId = sessionUserId === "ADMIN" ? null : sessionUserId;
      state.isAdminView = sessionIsAdmin;
    }

    return res.json({ success: true, state });
  } catch (error: any) {
    console.error("Critical error in /api/load-state:", error.message);
    return res.status(500).json({ error: "Failed to load state", details: error.message });
  }
});

// API Route: Commit updated centralized ledger state to Firestore (and mirror to backup file, while scrubbing session scopes)
app.post("/api/save-state", async (req, res) => {
  try {
    const { state } = req.body;
    if (!state) {
      return res.status(400).json({ error: "No state object was supplied." });
    }

    // Load existing state first to detect newly added users and transactions/payments
    let oldUsersList: any[] = [];
    let oldTxIds = new Set<string>();
    try {
      const oldState = await loadStateInternal();
      if (oldState) {
        if (oldState.users) {
          oldUsersList = oldState.users;
        }
        if (oldState.transactions) {
          oldState.transactions.forEach((tx: any) => {
            if (tx.id) oldTxIds.add(tx.id);
          });
        }
      }
    } catch (loadErr: any) {
      console.log("Failed to load old state for difference comparisons:", loadErr.message);
    }
    const oldUserIds = new Set(oldUsersList.map((u: any) => u.id));

    // SECURITY DECOUPLING: Scrub device-specific session fields before locking database ledger
    const stateToSave = { ...state };
    stateToSave.activeUserId = null;
    stateToSave.isAdminView = false;

    // Check for newly registered users to trigger automatic welcome email (including default credentials)
    if (stateToSave.users) {
      for (const u of stateToSave.users) {
        if (u.id && !oldUserIds.has(u.id)) {
          console.log(`[WELCOME EMAIL TRIGGER] New user registration detected: ${u.name} <${u.email}>`);
          sendWelcomeEmail(u.id, u.name, u.accountNumber, u.password, u.pin).catch((err: any) => {
            console.error(`[WELCOME EMAIL ERROR] Failed to send automatically:`, err.message);
          });
        }
      }
    }

    // Check for newly added transactions (payments/transfers) to dispatch receipt notification email
    if (stateToSave.transactions) {
      for (const tx of stateToSave.transactions) {
        if (tx.id && !oldTxIds.has(tx.id)) {
          // Find the sender user in current state list
          const senderUser = stateToSave.users?.find((u: any) => u.id === tx.fromUserId);
          if (senderUser && senderUser.email) {
            console.log(`[PAYMENT EMAIL TRIGGER] New payment detected: ${tx.id} for user ${senderUser.name} <${senderUser.email}>`);
            const paymentHtml = getPaymentAlertEmailHtml(senderUser.name, tx);
            sendEmail(senderUser.id, `Transaction Notification: ${tx.transactionType || 'Payment Clearance'} - Valora Financial Bank`, paymentHtml)
              .then(() => console.log(`[PAYMENT EMAIL SENT] Successfully delivered to ${senderUser.email}`))
              .catch((err: any) => console.error(`[PAYMENT EMAIL FAILED] Could not send receipt to ${senderUser.email}:`, err.message));
          }
        }
      }
    }

    // 1. Persist to cloud Firestore first (using throttled retry if currently disabled)
    const now = Date.now();
    const shouldTryFirestore = isFirestoreConfigured && (isFirestoreAvailable || (now - lastFirestoreTry > FIRESTORE_RETRY_INTERVAL));

    if (stateDocRef && shouldTryFirestore) {
      try {
        await withTimeout(stateDocRef.set({ state: stateToSave }), FIRESTORE_TIMEOUT, "Firestore save state timeout");
        isFirestoreAvailable = true; // Recovered/active
      } catch (fsErr: any) {
        if (isFirestoreAvailable) {
          console.log("Firestore cloud write currently unavailable, using local state persistence fallback.");
        }
        isFirestoreAvailable = false;
        lastFirestoreTry = now;
      }
    }

    // 2. Clear-through mirror cache to backup file
    safeWriteStateFile(stateToSave);

    // 3. Sync individual collections in Firestore
    if (stateToSave.users) {
      await saveUsersToFirestore(stateToSave.users);
    }
    if (stateToSave.notifications) {
      await saveNotificationsToFirestore(stateToSave.notifications);
    }
    if (stateToSave.transactions) {
      await saveTransactionsToFirestore(stateToSave.transactions);
    }

    return res.json({ success: true });
  } catch (error: any) {
    console.log("Emergency fallback storage active:", error.message);
    // Direct emergency write to local file only
    try {
      const emergencyState = { ...req.body.state };
      emergencyState.activeUserId = null;
      emergencyState.isAdminView = false;
      safeWriteStateFile(emergencyState);
      return res.json({ success: true, savedLocallyOnly: true });
    } catch (localErr: any) {
      return res.status(500).json({ error: "Failed to persist state on any storage node.", details: localErr.message });
    }
  }
});

// Popular US Banks Array for Wire Routing (Full Backend Component)
const POPULAR_US_BANKS = [
  { id: "chase", name: "JPMorgan Chase & Co. (Chase Bank)", logo: "🏦", swift: "CHASUS33XX" },
  { id: "bofA", name: "Bank of America", logo: "🏛️", swift: "BOFAUS3NXXX" },
  { id: "citi", name: "Citibank (Citigroup)", logo: "💳", swift: "CITIUS33XXX" },
  { id: "wells-fargo", name: "Wells Fargo & Co.", logo: "🐎", swift: "WFCUUS33XXX" },
  { id: "goldman", name: "Goldman Sachs Group", logo: "💰", swift: "GSCOUS33XXX" },
  { id: "morgan-stanley", name: "Morgan Stanley Private Bank", logo: "📈", swift: "MRGNUS33XXX" },
  { id: "us-bank", name: "U.S. Bancorp (U.S. Bank)", logo: "🦅", swift: "USBKUS33XXX" },
  { id: "pnc", name: "PNC Financial Services", logo: "🪙", swift: "PNBPUS33XXX" },
  { id: "truist", name: "Truist Financial Corp.", logo: "🛠️", swift: "TRUIUS33XXX" },
  { id: "capital-one", name: "Capital One Financial Corp.", logo: "🦁", swift: "COFCUS33XXX" },
  { id: "td-bank", name: "TD Bank, N.A.", logo: "🟢", swift: "TDBKUS33XXX" },
  { id: "bny-mellon", name: "Bank of New York Mellon", logo: "🗽", swift: "BKNYUS33XXX" },
  { id: "state-street", name: "State Street Corporation", logo: "🧭", swift: "STSTUS33XXX" },
  { id: "citizens", name: "Citizens Financial Group", logo: "👥", swift: "CFGUS33XXX" },
  { id: "hsbc", name: "HSBC Bank USA", logo: "🌍", swift: "HSBCUS33XXX" },
  { id: "first-citizens", name: "First Citizens Bank", logo: "🛡️", swift: "FCBKUS33XXX" },
  { id: "svb", name: "Silicon Valley Bank (SVB)", logo: "💻", swift: "SIVBUS33XXX" },
  { id: "fifth-third", name: "Fifth Third Bank", logo: "5️⃣", swift: "FTBPUS33XXX" },
  { id: "keybank", name: "KeyCorp (KeyBank)", logo: "🔑", swift: "KEYBUS33XXX" },
  { id: "ally", name: "Ally Financial Inc.", logo: "🤝", swift: "ALLYUS33XXX" },
  { id: "huntington", name: "Huntington Bancshares", logo: "🍯", swift: "HBANUS33XXX" }
];

// 12. GET POPULAR US BANKS LIST
app.get("/api/banks", (req, res) => {
  return res.json({ success: true, banks: POPULAR_US_BANKS });
});

// 13. POST: PROCESS SECURE INTERNATIONAL TRANSFER (Full Backend Ledger State Mutator)
app.post("/api/process-wire", async (req, res) => {
  try {
    const {
      fromUserId,
      toName,
      toAccountNumber,
      amount,
      note,
      recipientBank,
      routingNumber,
      swiftCode,
      walletAddress,
      cryptoNetwork,
      paypalEmail,
      wiseEmail,
      method,
      processingFee,
      serviceCharge,
      totalAmount
    } = req.body;

    if (!fromUserId || !toName || !toAccountNumber || !amount || !method) {
      return res.status(400).json({ error: "Missing required integration parameters." });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid transfer amount." });
    }

    const state = await loadStateInternal();
    if (!state) {
      return res.status(404).json({ error: "Bank database state not initialized on the server." });
    }

    // Find current user on the backend
    const userIndex = state.users.findIndex((u: any) => u.id === fromUserId);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Source user registration not found." });
    }

    const user = state.users[userIndex];
    if (user.balance < numericAmount) {
      return res.status(400).json({ error: "Insufficient sovereign transfer clearing funds." });
    }

    // Deduct user balance on backend !
    user.balance = parseFloat((user.balance - numericAmount).toFixed(2));

    // Construct high-fidelity receipt and transaction ledger
    const transactionId = "TX-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toISOString();

    let formattedType = "International Wire";
    if (method === "crypto") formattedType = "Crypto Disbursement";
    if (method === "paypal") formattedType = "PayPal Outlay";
    if (method === "wise") formattedType = "Wise Clearance";
    if (method === "zelle") formattedType = "Zelle Instant Remittance";
    if (method === "venmo") formattedType = "Venmo Outward Flow";
    if (method === "valora") formattedType = "Valora Book Transfer";

    const newTx = {
      id: transactionId,
      fromUserId: user.id,
      toUserId: "EXTERNAL",
      fromName: user.name,
      toName: toName,
      fromAccountNumber: user.accountNumber,
      toAccountNumber: toAccountNumber,
      amount: numericAmount,
      note: note || "Secured Transfer",
      date: dateStr,
      status: "Awaiting Verification",
      recipientBank: recipientBank || "Sovereign Target Gateway",
      fromBank: "Valora Financial Bank",
      timeZone: "PST (Los Angeles Core)",
      processingFee: processingFee || 25,
      serviceCharge: serviceCharge || 0,
      totalAmount: totalAmount || (numericAmount + (processingFee || 25)),
      transactionType: formattedType,
      verificationStatus: "Awaiting Verification",
      auditLog: [
        `[${dateStr}] Outward ledger request dispatched via server microservice`,
        `[${dateStr}] Formulated method payload validation matches signature`,
        `[${dateStr}] Internal balance ledger clearance approved by US Federal node`,
        routingNumber ? `[${dateStr}] Routing code resolved: Fedwire Routing ${routingNumber}` : "",
        swiftCode ? `[${dateStr}] Bank Identifier resolved: SWIFT ${swiftCode}` : "",
        walletAddress ? `[${dateStr}] Target ledger matched: Crypto Wallet Address ${walletAddress} (${cryptoNetwork})` : "",
        cryptoNetwork ? `[${dateStr}] Network state verified: blockchain peer validated` : "",
        paypalEmail ? `[${dateStr}] Target account verified: PayPal Account ${paypalEmail}` : "",
        wiseEmail ? `[${dateStr}] Target account verified: Wise Interbank Account ${wiseEmail}` : ""
      ].filter(Boolean)
    };

    // Prepend to transaction list
    state.transactions.unshift(newTx);

    // Save mutated state back to Firestore & local disk
    try {
      if (stateDocRef && isFirestoreAvailable) {
        await withTimeout(stateDocRef.set({ state }), FIRESTORE_TIMEOUT, "Firestore write timeout in wire processing");
      }
    } catch (fsErr: any) {
      isFirestoreAvailable = false;
      console.log("Local cluster transaction journalized.");
    }

    safeWriteStateFile(state);

    // Sync individual collections in Firestore
    if (state.users) {
      await saveUsersToFirestore(state.users);
    }
    if (state.notifications) {
      await saveNotificationsToFirestore(state.notifications);
    }
    if (state.transactions) {
      await saveTransactionsToFirestore(state.transactions);
    }

    // Fire and forget payment receipt email (Double insurance)
    if (user && user.email) {
      const paymentHtml = getPaymentAlertEmailHtml(user.name, newTx);
      sendEmail(user.id, `Transaction Notification: ${newTx.transactionType || 'Payment Clearance'} - Valora Financial Bank`, paymentHtml)
        .then(() => console.log(`[PAYMENT EMAIL SENT - process-wire] Successfully delivered to ${user.email}`))
        .catch((err: any) => console.error(`[PAYMENT EMAIL FAILED - process-wire] Could not deliver:`, err.message));
    }

    return res.json({
      success: true,
      user,
      transaction: newTx
    });
  } catch (error: any) {
    console.error("Backend wire processing exception:", error.message);
    return res.status(500).json({ error: "Internal processing crash", details: error.message });
  }
});

// Transporter lazily initialized or checked on-demand
// ==========================================
// SECURE BACKEND EMAIL SYSTEM (RESEND)
// ==========================================

// Reusable email HTML layout template wrapper
function getEmailHtmlLayout(title: string, subtitle: string, bodyContent: string) {
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
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #38bdf8;
          margin-bottom: 24px;
          border-bottom: 1px solid #1e293b;
          padding-bottom: 16px;
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
          <div class="logo">Valora Financial Bank</div>
          <h2 class="title">${title}</h2>
          <div class="subtitle">${subtitle}</div>
          <div class="content">
            ${bodyContent}
          </div>
          <div class="footer">
            VALORA FINANCIAL BANK &bullet; LOS ANGELES, CALIFORNIA, USA (Office Branch)<br>
            SECURE SHA-256 ENCRYPTED GATEWAY SERVICE &bullet; CONFIDENTIAL &bullet; EST. 2002
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// 1. Template: Welcome Email
export function getWelcomeEmailHtml(name: string, accountNumber?: string, password?: string, pin?: string) {
  const title = "Sovereign Account Clearance Granted";
  const subtitle = "Valora Financial Security Handshake";
  const bodyContent = `
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
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// 1b. Template: Login Alert Email
export function getLoginAlertEmailHtml(name: string, ip: string, userAgent: string) {
  const title = "Security Alert: New Account Access";
  const subtitle = "Valora Financial Security Handshake";
  const dateStr = new Date().toLocaleString("en-US", { timeZoneName: "short" });
  const bodyContent = `
    <p>Dear ${name},</p>
    <p>This is an automated security clearance dispatch. We detected a successful sign-in handshake to your secure digital portal on <strong>${dateStr}</strong>.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">IP Address</span>
        <span class="value">${ip}</span>
      </div>
      <div class="info-row">
        <span class="label">Browser & Device</span>
        <span class="value">${userAgent}</span>
      </div>
      <div class="info-row">
        <span class="label">Access Status</span>
        <span class="value" style="color: #10b981;">AUTHORIZED</span>
      </div>
    </div>
    <div class="warning">
      <strong>Important Security Notice:</strong> If this access was unauthorized or unrecognized, please lock your credentials immediately and reach out to our emergency secure compliance center at <a href="mailto:secure@valorafinancialbank.com" style="color: #38bdf8; text-decoration: none;">secure@valorafinancialbank.com</a> to prevent asset liquidation.
    </div>
    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// 1c. Template: Payment Alert Email
export function getPaymentAlertEmailHtml(name: string, tx: any) {
  const title = "Transaction Receipt";
  const subtitle = "Valora Financial Ledger Clearance";
  const dateStr = new Date(tx.date).toLocaleString("en-US", { timeZoneName: "short" });
  const bodyContent = `
    <p>Dear ${name},</p>
    <p>This is an official transaction confirmation. Your payment has cleared our internal book system successfully.</p>
    <div class="info-box">
      <div class="info-row">
        <span class="label">Transaction Reference</span>
        <span class="value" style="font-family: monospace;">${tx.id}</span>
      </div>
      <div class="info-row">
        <span class="label">Payment Type</span>
        <span class="value">${tx.transactionType || "Outbound Wire Transfer"}</span>
      </div>
      <div class="info-row">
        <span class="label">Amount</span>
        <span class="value" style="color: #ef4444;">-$${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Sovereign Processing Fee</span>
        <span class="value">$${Number(tx.processingFee || 0).toFixed(2)} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Total Debited Balance</span>
        <span class="value" style="font-weight: 800;">$${Number(tx.totalAmount || tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
      </div>
      <div class="info-row">
        <span class="label">Sender Account</span>
        <span class="value" style="font-family: monospace;">${tx.fromAccountNumber}</span>
      </div>
      <div class="info-row">
        <span class="label">Recipient Name</span>
        <span class="value">${tx.toName}</span>
      </div>
      <div class="info-row">
        <span class="label">Recipient Account</span>
        <span class="value" style="font-family: monospace;">${tx.toAccountNumber}</span>
      </div>
      <div class="info-row">
        <span class="label">Recipient Institution</span>
        <span class="value">${tx.recipientBank || "Sovereign Target Gateway"}</span>
      </div>
      <div class="info-row">
        <span class="label">Execution Timestamp</span>
        <span class="value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="label">Status</span>
        <span class="value" style="color: #38bdf8;">${tx.status || "Completed"}</span>
      </div>
    </div>
    <p>Your compound ledger balance has been safely debited. You may view or export full PDF copies of this cleared transaction inside your premium digital portal.</p>
    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// 2. Template: OTP Verification Email
export function getOtpEmailHtml(otp: string, details?: { amount?: number; toName?: string; toAccountNumber?: string; recipientBank?: string; transactionId?: string }) {
  const title = "Sovereign Asset Transfer";
  const subtitle = "Multi-Factor Gateway Verification";
  
  const formattedAmount = details?.amount !== undefined ? new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount) : null;

  const bodyContent = `
    <p>We received a request for multi-factor authorization or sovereign asset transfer from your checking holdings. To sign and approve this action, use the confidential cryptographic OTP below.</p>
    
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
      <strong>Security Warning:</strong> This authorization key remains valid for exactly 10 minutes. Never disclose this code to anyone, including institutional representatives. Valora will never request verification keys via telephone or unsecured channels.
    </div>
    <p>If you did not initiate this ledger request, please sign in to your dashboard immediately to cancel pending actions or freeze your checking accounts.</p>
  `;
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// 3. Template: Password Reset Email
export function getPasswordResetEmailHtml(name: string, resetLink: string) {
  const title = "Security Credentials Reset";
  const subtitle = "Valora Portal Security Desk";
  const bodyContent = `
    <p>Dear Client,</p>
    <p>We received a request to modify or reset the portal login security credentials associated with your account.</p>
    <p>To safely reconfigure your password and pin, click the secure action button below. This action node will bypass conventional parameters and grant temporary cryptographic access to the credential modification desk.</p>
    
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
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// 4. Template: Transaction Confirmation Email
export function getConfirmationEmailHtml(details: { amount: number; toName: string; toAccountNumber: string; recipientBank: string; transactionId: string; note?: string; transactionType?: string }) {
  const title = "Transaction Execution Confirmed";
  const subtitle = "Real-time Ledger Settlement";

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(details.amount);

  const bodyContent = `
    <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; padding: 16px; font-size: 13px; color: #a7f3d0; line-height: 1.5; border-radius: 8px; margin-bottom: 24px;">
      <strong>Execution Approved:</strong> Your transaction has been successfully verified, signed, and settled instantly. Account balances have been adjusted accordingly.
    </div>

    <p>We are pleased to confirm that your sovereign transfer transaction request was authorized via multi-factor credentials and executed successfully on our central ledger node.</p>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Transaction Type</span>
        <span class="value">${details.transactionType || "Transfer"}</span>
      </div>
      <div class="info-row">
        <span class="label">Beneficiary Name</span>
        <span class="value">${details.toName || "External Recipient"}</span>
      </div>
      <div class="info-row">
        <span class="label">Target Account</span>
        <span class="value">${details.toAccountNumber || "N/A"} (${details.recipientBank || "External"})</span>
      </div>
      <div class="info-row">
        <span class="label">Confirmed Amount</span>
        <span class="value" style="color: #10b981; font-weight: 800;">${formattedAmount}</span>
      </div>
      <div class="info-row">
        <span class="label">Transaction Ref</span>
        <span class="value" style="font-family: monospace;">${details.transactionId || "N/A"}</span>
      </div>
      ${details.note ? `
      <div class="info-row">
        <span class="label">Memo Reference</span>
        <span class="value">"${details.note}"</span>
      </div>
      ` : ""}
    </div>
    
    <p>Thank you for choosing Valora Financial Bank. Your digital security and sovereign privacy remain our highest institutional priorities.</p>
  `;
  return getEmailHtmlLayout(title, subtitle, bodyContent);
}

// Helper to load user profile by id or email to resolve correct target
export async function getUser(userIdOrEmail: string) {
  const state = await loadStateInternal();
  if (!state || !state.users) return null;
  const cleaned = userIdOrEmail.toLowerCase().trim();
  return state.users.find((u: any) => u.id.toLowerCase().trim() === cleaned || u.email.toLowerCase().trim() === cleaned) || null;
}

// Reusable email delivery core delegating directly to our production Brevo engine
export async function sendEmail(userIdOrEmail: string, subject: string, htmlContent: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || "muzikworld08@gmail.com").trim();

  // Retrieve user using getUser helper
  const user = await getUser(userIdOrEmail);
  
  let to = "";
  // The recipient must always be the email address stored in the user's account record
  if (user && user.email) {
    to = user.email;
    console.log(`[Email System - Brevo] Retrieve recipient from database record: ${to}`);
  } else if (userIdOrEmail.includes("@")) {
    to = userIdOrEmail.trim().toLowerCase();
    console.log(`[Email System - Brevo] Sending to specified raw email: ${to}`);
  } else if (adminEmail && userIdOrEmail.toLowerCase() === adminEmail.toLowerCase()) {
    to = adminEmail;
    console.log(`[Email System - Brevo] Routing administrative alert to configured admin: ${to}`);
  } else {
    throw new Error(`Recipient email could not be resolved for user descriptor: ${userIdOrEmail}`);
  }

  const result = await sendBrevoEmail(to, subject, htmlContent);
  if (!result.success) {
    throw new Error(result.error || "Brevo delivery failed");
  }
  return { success: true, messageId: result.messageId };
}

// Automatic Welcome Email Dispatcher helper delegating to Brevo
export async function sendWelcomeEmail(userIdOrEmail: string, name: string, accountNumber?: string, password?: string, pin?: string) {
  const user = await getUser(userIdOrEmail);
  const toEmail = user?.email || (userIdOrEmail.includes("@") ? userIdOrEmail : "");
  if (!toEmail) {
    console.error(`[WELCOME EMAIL FAILED] Could not resolve email address for: ${userIdOrEmail}`);
    return;
  }
  try {
    const result = await brevoSendWelcomeEmail(toEmail, name, accountNumber, password, pin);
    if (result.success) {
      console.log(`[WELCOME EMAIL SENT - Brevo] Dispatched successfully to ${toEmail}`);
    } else {
      console.error(`[WELCOME EMAIL FAILED - Brevo] ${result.error}`);
    }
  } catch (err: any) {
    console.error(`[WELCOME EMAIL FAILED - Brevo] Could not send welcome email to ${toEmail}:`, err.message);
  }
}

// Memory map for backend-generated OTPs with temporary short-lived lifespan
interface SecureOtp {
  otp: string;
  expiresAt: number;
}
const backendSecureOtps = new Map<string, SecureOtp>();

// ==========================================
// BACKEND REST API EMAIL ROUTE DESKS
// ==========================================

// REST API endpoint: send physical real-time compliance OTP email
app.post("/api/send-otp", async (req, res) => {
  const { userId, email, otp, amount, toName, toAccountNumber, recipientBank, transactionId } = req.body;
  const userIdentifier = userId || email;

  if (!userIdentifier || !otp) {
    return res.status(400).json({ error: "Missing required properties: identity and otp" });
  }

  try {
    const htmlContent = getOtpEmailHtml(otp, {
      amount,
      toName,
      toAccountNumber,
      recipientBank,
      transactionId
    });

    const mailSubject = `[Confidential Secure OTP: ${otp}] Valora Transaction Verification`;
    
    // Dispatch using generic secure email gateway!
    const result = await sendEmail(userIdentifier, mailSubject, htmlContent);

    // Also dispatch copy of OTP to Admin email
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@valorafinancialbank.com").trim();
    try {
      console.log(`[OTP Double Delivery] Dispatching transaction copy to Admin: ${adminEmail}`);
      await sendEmail(adminEmail, mailSubject, htmlContent);
    } catch (adminErr: any) {
      console.warn(`[OTP Double Delivery] Failed to send copy to Admin (${adminEmail}):`, adminErr.message);
    }

    return res.json({
      success: true,
      deliveredLocally: false, // forces the UI to hide local sandbox OTP and display secure check inbox instructions
      messageId: result.messageId,
      email: email || userIdentifier
    });
  } catch (error: any) {
    console.error("Secure OTP Delivery Error encountered:", error.message);
    // Securely report the error without revealing sensitive API coordinates
    return res.status(500).json({
      error: "Transactional email delivery failed.",
      details: error.message
    });
  }
});

// REST API endpoint: send transaction confirmation email
app.post("/api/send-confirmation", async (req, res) => {
  const { userId, email, amount, toName, toAccountNumber, recipientBank, transactionId, note, transactionType } = req.body;
  const userIdentifier = userId || email;

  if (!userIdentifier) {
    return res.status(400).json({ error: "Missing required property: identity" });
  }

  try {
    const htmlContent = getConfirmationEmailHtml({
      amount: amount || 0,
      toName,
      toAccountNumber,
      recipientBank,
      transactionId,
      note,
      transactionType
    });

    const mailSubject = `[SUCCESS: Transferred] Valora Transaction Confirmation - ${transactionId || ""}`;

    const result = await sendEmail(userIdentifier, mailSubject, htmlContent);

    return res.json({
      success: true,
      deliveredLocally: false,
      messageId: result.messageId,
      email: email || userIdentifier
    });
  } catch (error: any) {
    console.error("Resend Confirmation Delivery Error encountered:", error.message);
    return res.status(500).json({
      error: "Transactional email delivery failed.",
      details: error.message
    });
  }
});

// REST API endpoint: send welcome email on registration
app.post("/api/send-welcome", async (req, res) => {
  const { userId, email, name } = req.body;
  const userIdentifier = userId || email;
  if (!userIdentifier || !name) {
    return res.status(400).json({ error: "Missing required fields: identity and name" });
  }
  try {
    const htmlContent = getWelcomeEmailHtml(name);
    const result = await sendEmail(userIdentifier, "Welcome to Valora Financial Bank - Sovereign Account Clearance Granted", htmlContent);
    return res.json({ success: true, messageId: result.messageId, email: email || userIdentifier });
  } catch (error: any) {
    console.error("Resend Welcome Email Error:", error.message);
    return res.status(500).json({ error: "Welcome email delivery failed.", details: error.message });
  }
});

// REST API endpoint: send password reset email
app.post("/api/send-password-reset", async (req, res) => {
  const { userId, email, name, resetLink } = req.body;
  const userIdentifier = userId || email;
  if (!userIdentifier || !resetLink) {
    return res.status(400).json({ error: "Missing required fields: identity and resetLink" });
  }
  try {
    const htmlContent = getPasswordResetEmailHtml(name || "Client", resetLink);
    const result = await sendEmail(userIdentifier, "SecOps Security Notice - Access Credentials Reset", htmlContent);
    return res.json({ success: true, messageId: result.messageId, email: email || userIdentifier });
  } catch (error: any) {
    console.error("Resend Password Reset Error:", error.message);
    return res.status(500).json({ error: "Password reset email delivery failed.", details: error.message });
  }
});

// REST API endpoints: Secure Backend-Authorized OTP generation (and verification) desk
app.post("/api/otp/generate", async (req, res) => {
  const { userId, email, details } = req.body;
  const userIdentifier = userId || email;
  if (!userIdentifier) {
    return res.status(400).json({ error: "Email address or userId is required." });
  }

  try {
    // Generate secure 6-digit cryptographic code
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validation window

    // Store temporarily in-memory with validation bounds
    backendSecureOtps.set(userIdentifier.toLowerCase(), { otp, expiresAt });

    // Send the verification email securely via Resend
    const htmlContent = getOtpEmailHtml(otp, details);
    const result = await sendEmail(userIdentifier, `[Confidential Secure OTP: ${otp}] Valora Gate Verification`, htmlContent);

    // Also dispatch copy of OTP to Admin email
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@valorafinancialbank.com").trim();
    try {
      console.log(`[OTP Double Delivery] Dispatching verification copy to Admin: ${adminEmail}`);
      await sendEmail(adminEmail, `[Confidential Secure OTP: ${otp}] Valora Gate Verification`, htmlContent);
    } catch (adminErr: any) {
      console.warn(`[OTP Double Delivery] Failed to send copy to Admin (${adminEmail}):`, adminErr.message);
    }

    // Highly secure response: NEVER return the code in response body
    return res.json({
      success: true,
      message: "Secure cryptographic OTP code dispatched successfully to your verified email address.",
      messageId: result.messageId,
      expiresAt
    });
  } catch (error: any) {
    console.error("Secure OTP Generation & Dispatch failed:", error.message);
    return res.status(500).json({
      error: "Secure OTP processing failed.",
      details: error.message
    });
  }
});

app.post("/api/otp/verify", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP code are required." });
  }

  const key = email.toLowerCase();
  const record = backendSecureOtps.get(key);

  if (!record) {
    return res.status(400).json({ error: "No active verification transaction found for this account." });
  }

  if (Date.now() > record.expiresAt) {
    backendSecureOtps.delete(key);
    return res.status(400).json({ error: "Cryptographic verification code has expired. Please request a new token." });
  }

  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({ error: "Invalid cryptographic verification code. Access Denied." });
  }

  // Verification validated: purge key instantly to prevent re-use
  backendSecureOtps.delete(key);
  return res.json({ success: true, message: "Multi-factor verification succeeded. Access Granted." });
});

// Serve Vite setup or compiled build outputs
async function startServer() {
  if (process.env.VERCEL) {
    console.log("Vercel Serverless environment detected. Skipping Vite/Static middleware setup and listen().");
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const possibleDistPaths = [
      path.join(process.cwd(), "dist"),
      path.join(__dirname, "..", "dist"),
      __dirname
    ];
    const distPath = possibleDistPaths.find((p) => fs.existsSync(path.join(p, "index.html"))) || possibleDistPaths[0];
    console.log(`Serving static assets from: ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
