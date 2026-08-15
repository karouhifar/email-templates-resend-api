import type { QuoteData } from "../views/template";
import {
  LIMITS,
  safeBody,
  sanitizeEmail,
  sanitizeLine,
  sanitizeMultiline,
} from "./sanitizer";

/**
 * Server-side mirror of the client `quoteFormSchema` (zod). The front-end
 * validates for UX; this validates for trust — never render the raw body.
 */

const BUILDING_TYPES = [
  "industrial",
  "commercial",
  "agriculture",
  "workshop",
  "warehouse",
  "storage",
  "garage",
  "quonset",
  "other",
] as const;
const ROOF_SHAPES = ["gable", "single-slope", "unsure"] as const;
const ROOF_PITCHES = [
  "1:12",
  "2:12",
  "3:12",
  "4:12",
  "6:12",
  "unsure",
] as const;
const ROOF_PANELS = ["screw-down", "standing-seam", "unsure"] as const;
const ROOF_FINISHES = ["galvalume", "painted", "unsure"] as const;
const GUTTERS = ["yes", "no", "unsure"] as const;
const PANEL_GAUGES = ["29ga", "26ga", "24ga"] as const;
const LINER_PANELS = ["none", "walls", "ceiling", "both"] as const;
const LAYOUT_SKETCHES = ["have", "describe", "none"] as const;
const TIMELINES = ["asap", "1-3", "3-6", "6-12", "researching"] as const;

const POSTAL_CODE_RE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const PHONE_RE = /^[\d\s()+\-.]{7,20}$/;

const QUOTE_LIMITS = {
  COLOR: 40,
  INSULATION: 40,
  CITY: 80,
  REGION: 80,
  OPENING_NOTES: 500,
  NOTES: 1000,
} as const;

const pickEnum = <T extends readonly string[]>(
  value: unknown,
  allowed: T,
): T[number] | undefined =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : undefined;

/** Clamp to the schema range; returns undefined when not a usable number. */
const pickInt = (
  value: unknown,
  min: number,
  max: number,
): number | undefined => {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.trunc(n)));
};

export type NormalizedQuote =
  | { ok: true; data: QuoteData }
  | { ok: false; error: string };

export function normalizeQuotePayload(body: unknown): NormalizedQuote {
  const raw = safeBody(body);

  // Required — a quote without these is not actionable for the sales team.
  const buildingType = pickEnum(raw.buildingType, BUILDING_TYPES);
  const width = pickInt(raw.width, 10, 500);
  const length = pickInt(raw.length, 10, 1000);
  const height = pickInt(raw.height, 8, 80);
  const timeline = pickEnum(raw.timeline, TIMELINES);
  const region = sanitizeLine(raw.region, QUOTE_LIMITS.REGION);
  const city = sanitizeLine(raw.city, QUOTE_LIMITS.CITY);
  const fullName = sanitizeLine(raw.fullName, LIMITS.NAME);
  const email = sanitizeEmail(raw.email);

  const missing: string[] = [];
  if (!buildingType) missing.push("buildingType");
  if (width === undefined) missing.push("width");
  if (length === undefined) missing.push("length");
  if (height === undefined) missing.push("height");
  if (!timeline) missing.push("timeline");
  if (!region) missing.push("region");
  if (!city || city.length < 2) missing.push("city");
  if (!fullName || fullName.length < 2) missing.push("fullName");
  if (!email) missing.push("email");

  if (missing.length > 0) {
    return { ok: false, error: `Invalid or missing fields: ${missing.join(", ")}` };
  }

  const phoneRaw = sanitizeLine(raw.phone, 20);
  const postalRaw = sanitizeLine(raw.postalCode, 10);

  return {
    ok: true,
    data: {
      buildingType: buildingType!,
      width: width!,
      length: length!,
      height: height!,

      roofShape: pickEnum(raw.roofShape, ROOF_SHAPES),
      roofPitch: pickEnum(raw.roofPitch, ROOF_PITCHES),
      roofPanel: pickEnum(raw.roofPanel, ROOF_PANELS),
      roofFinish: pickEnum(raw.roofFinish, ROOF_FINISHES),
      gutters: pickEnum(raw.gutters, GUTTERS),

      roofColor: sanitizeLine(raw.roofColor, QUOTE_LIMITS.COLOR) ?? undefined,
      wallColor: sanitizeLine(raw.wallColor, QUOTE_LIMITS.COLOR) ?? undefined,
      panelGauge: pickEnum(raw.panelGauge, PANEL_GAUGES),
      insulationRoof:
        sanitizeLine(raw.insulationRoof, QUOTE_LIMITS.INSULATION) ?? undefined,
      insulationWall:
        sanitizeLine(raw.insulationWall, QUOTE_LIMITS.INSULATION) ?? undefined,
      linerPanel: pickEnum(raw.linerPanel, LINER_PANELS),

      layoutSketch: pickEnum(raw.layoutSketch, LAYOUT_SKETCHES),
      overheadDoors: pickInt(raw.overheadDoors, 0, 99) ?? 0,
      manDoors: pickInt(raw.manDoors, 0, 99) ?? 0,
      windows: pickInt(raw.windows, 0, 99) ?? 0,
      louvers: pickInt(raw.louvers, 0, 99) ?? 0,
      openingNotes:
        sanitizeMultiline(raw.openingNotes, QUOTE_LIMITS.OPENING_NOTES) ??
        undefined,

      region: region!,
      city: city!,
      postalCode:
        postalRaw && POSTAL_CODE_RE.test(postalRaw)
          ? postalRaw.toUpperCase()
          : undefined,
      timeline: timeline!,
      fullName: fullName!,
      email: email!,
      phone: phoneRaw && PHONE_RE.test(phoneRaw) ? phoneRaw : undefined,
      notes: sanitizeMultiline(raw.notes, QUOTE_LIMITS.NOTES) ?? undefined,
      smsConsent: raw.smsConsent === true || raw.smsConsent === "true",
    },
  };
}
