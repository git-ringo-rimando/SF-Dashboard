import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const CREDS_FILE = path.join(DATA_DIR, "credentials.enc");
const CACHE_FILE = path.join(DATA_DIR, "cache.json");

const ALGORITHM = "aes-256-gcm";
const SECRET = crypto
  .createHash("sha256")
  .update(`sf-dashboard-${process.platform}-${process.env.USERNAME ?? "user"}`)
  .digest();

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), encrypted.toString("hex")].join(":");
}

function decrypt(encoded: string): string {
  const [ivHex, tagHex, encHex] = encoded.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export function saveCredentials(username: string, password: string): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CREDS_FILE, encrypt(JSON.stringify({ username, password })), "utf8");
}

export function loadCredentials(): { username: string; password: string } | null {
  if (!fs.existsSync(CREDS_FILE)) return null;
  try {
    return JSON.parse(decrypt(fs.readFileSync(CREDS_FILE, "utf8")));
  } catch {
    return null;
  }
}

export function hasCredentials(): boolean {
  return fs.existsSync(CREDS_FILE);
}

// ── Data shapes ─────────────────────────────────────────────────────────────

export interface TicketRow {
  documentNo: string;
  project: string;
  type: string;
  status: string;
  reportedDate: string;
}

export interface ModuleRow {
  module: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  open: number;
  responded: number;
  reopen: number;
  fixed: number;
  closed: number;
  cancelled: number;
}

export interface SeverityRow {
  severity: string;
  open: number;
  responded: number;
  reopen: number;
  fixed: number;
  closed: number;
  cancelled: number;
}

export interface RecentTicket {
  task: string;
  ticketNo: string;
  createdDate: string;
  reportedDate: string;
  fixedDate: string;
  project: string;
  module: string;
  subject: string;
  severity: string;
  completion: string;
  status: string;
}

export interface DashboardCache {
  scrapedAt: string;
  error: string | null;
  // Summary counts (from statistic totals)
  totals: {
    all: number;
    open: number;
    responded: number;
    reopen: number;
    fixed: number;
    closed: number;
    cancelled: number;
    unresolved: number;
    unresponded: number;
  };
  statisticPeriod: string;
  partnerPeriod: string;
  // Partner dashboard tables
  unresolvedTickets: TicketRow[];
  unrespondedTickets: TicketRow[];
  // Statistic page tables
  moduleBreakdown: ModuleRow[];
  severityBreakdown: SeverityRow[];
  // Recent tickets
  recentTickets: RecentTicket[];
}

export function saveCache(data: DashboardCache): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data), "utf8");
}

export function loadCache(): DashboardCache | null {
  if (!fs.existsSync(CACHE_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}

// ── Tag storage ──────────────────────────────────────────────────────────────

export type ProductTag = "Sunfish 6" | "Sunfish 7" | "Greatday";
export type TagMap = Record<string, ProductTag>;

const TAGS_FILE = path.join(DATA_DIR, "tags.json");

export function loadTags(): TagMap {
  if (!fs.existsSync(TAGS_FILE)) return {};
  try { return JSON.parse(fs.readFileSync(TAGS_FILE, "utf8")); }
  catch { return {}; }
}

export function saveTags(tags: TagMap): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2), "utf8");
}
