// lib/sanitizers.ts
import validator from "validator";

// Field length caps (tune per your needs)
export const LIMITS = {
  EMAIL: 254, // RFC 5321
  NAME: 100,
  SUBJECT: 200,
  MESSAGE: 5000,
  KEY: 128,
} as const;

// Type guard: non-empty string
const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// Strip ALL control chars (including \r \n \0 \x7F) — kills header injection
const stripControl = (s: string): string => s.replace(/[\x00-\x1F\x7F]/g, "");

// Strip control chars but preserve newlines + tabs (for message body)
const stripControlExceptNewlines = (s: string): string =>
  s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

// Collapse runs of whitespace into a single space
const collapseWhitespace = (s: string): string => s.replace(/\s+/g, " ").trim();

// Normalize Unicode (defeats some homograph + zero-width tricks)
const normalize = (s: string): string => s.normalize("NFKC");

/** Single-line text: name, subject, etc. Returns null if invalid. */
export const sanitizeLine = (input: unknown, maxLen: number): string | null => {
  if (!isNonEmptyString(input)) return null;
  const cleaned = collapseWhitespace(stripControl(normalize(input)));
  if (cleaned.length === 0 || cleaned.length > maxLen) return null;
  return cleaned;
};

/** Multi-line text: message bodies. Preserves \n. Returns null if invalid. */
export const sanitizeMultiline = (
  input: unknown,
  maxLen: number,
): string | null => {
  if (!isNonEmptyString(input)) return null;
  const cleaned = stripControlExceptNewlines(normalize(input)).trim();
  if (cleaned.length === 0 || cleaned.length > maxLen) return null;
  return cleaned;
};

/** Email address. Validates format AND blocks CRLF (header injection). */
export const sanitizeEmail = (input: unknown): string | null => {
  if (!isNonEmptyString(input)) return null;
  const cleaned = stripControl(input).trim().toLowerCase();
  if (cleaned.length === 0 || cleaned.length > LIMITS.EMAIL) return null;
  if (/[\r\n,;<>]/.test(cleaned)) return null; // belt + suspenders
  if (!validator.isEmail(cleaned)) return null;
  return cleaned;
};

/** DB lookup key. Restricts charset to defeat NoSQL operator injection. */
export const sanitizeKey = (input: unknown): string | null => {
  if (!isNonEmptyString(input as string)) return null;

  const cleaned = (input as string).trim();
  if (cleaned.length === 0 || cleaned.length > LIMITS.KEY) return null;
  // Allow only safe chars — no $, ., {, }, etc. that DB engines treat specially
  if (!/^[A-Za-z0-9_-]+$/.test(cleaned)) return null;
  return cleaned;
};

/** Safely parse req.body — rejects arrays, primitives, and prototype-poisoned objects. */
export const safeBody = (body: unknown): Record<string, unknown> => {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return {};
  }
  // Drop dangerous keys that could pollute prototypes downstream
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    out[k] = v;
  }
  return out;
};

/** Optional URL sanitizer if you ever pass user-supplied URLs into href/src. */
export const sanitizeHttpUrl = (input: unknown): string | null => {
  if (!isNonEmptyString(input)) return null;
  const cleaned = stripControl(input).trim();
  try {
    const u = new URL(cleaned);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
};
