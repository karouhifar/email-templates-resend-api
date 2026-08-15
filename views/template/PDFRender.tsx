import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingHorizontal: 40,
    paddingBottom: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid #e5e5e5",
  },
  brand: { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  brandSub: { fontSize: 9, color: "#64748b", marginTop: 2 },
  meta: { textAlign: "right", fontSize: 9, color: "#64748b" },
  metaLabel: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: 9 },
  logo: { width: 44, height: 44, objectFit: "contain", marginBottom: 3 },

  // Lead strip directly under the header
  leadStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  leadName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  leadSub: { fontSize: 9, color: "#cbd5e1", marginTop: 2 },
  badge: {
    backgroundColor: "#f8fafc",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  badgeValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 1,
  },

  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f172a",
    marginBottom: 5,
    paddingBottom: 2,
    borderBottom: "1px solid #e2e8f0",
  },

  // Two-column spec grid
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridCell: { width: "33.333%", paddingRight: 10, marginBottom: 5 },
  cellLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cellValue: { fontSize: 10, color: "#0f172a" },
  cellValueMuted: { fontSize: 10, color: "#94a3b8" },

  swatchRow: { flexDirection: "row", alignItems: "center" },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 2,
    border: "1px solid #cbd5e1",
    marginRight: 5,
  },

  statsBox: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  stat: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: "#e2e8f0" },
  statNum: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  statNumMuted: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#cbd5e1" },
  statLabel: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  notes: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: 8,
    color: "#334155",
    lineHeight: 1.4,
  },
  notesLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },

  consentYes: { fontSize: 10, color: "#047857" },
  consentNo: { fontSize: 10, color: "#b91c1c" },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTop: "1px solid #e5e5e5",
    paddingTop: 8,
  },
});

/* ------------------------------------------------------------------ */
/* Label maps — mirror the client-side zod enums                       */
/* ------------------------------------------------------------------ */

const UNSURE = "Not sure yet";
const UNSET = "Not specified";

const BUILDING_TYPE_LABELS: Record<string, string> = {
  industrial: "Industrial",
  commercial: "Commercial",
  agriculture: "Agriculture",
  workshop: "Workshop",
  warehouse: "Warehouse",
  storage: "Storage",
  garage: "Garage",
  quonset: "Quonset",
  other: "Other",
};

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1-3": "1–3 months",
  "3-6": "3–6 months",
  "6-12": "6–12 months",
  researching: "Just researching",
};

const ROOF_SHAPE_LABELS: Record<string, string> = {
  gable: "Gable",
  "single-slope": "Single slope",
  unsure: UNSURE,
};

const ROOF_PANEL_LABELS: Record<string, string> = {
  "screw-down": "Screw-down",
  "standing-seam": "Standing seam",
  unsure: UNSURE,
};

const ROOF_FINISH_LABELS: Record<string, string> = {
  galvalume: "Galvalume (bare)",
  painted: "Painted",
  unsure: UNSURE,
};

const GUTTERS_LABELS: Record<string, string> = {
  yes: "Yes — include gutters",
  no: "No gutters",
  unsure: UNSURE,
};

const PANEL_GAUGE_LABELS: Record<string, string> = {
  "29ga": "29 gauge",
  "26ga": "26 gauge",
  "24ga": "24 gauge",
};

const LINER_PANEL_LABELS: Record<string, string> = {
  none: "None",
  walls: "Walls only",
  ceiling: "Ceiling only",
  both: "Walls + ceiling",
};

const LAYOUT_SKETCH_LABELS: Record<string, string> = {
  have: "Client has a sketch / drawing to send",
  describe: "Described in the notes below",
  none: "No sketch — needs help with layout",
};

/** Common colour names clients type, so the PDF can show a swatch. */
const NAMED_COLORS: Record<string, string> = {
  white: "#ffffff",
  offwhite: "#f5f5f0",
  black: "#111111",
  charcoal: "#36454f",
  grey: "#808080",
  gray: "#808080",
  lightgrey: "#d3d3d3",
  lightgray: "#d3d3d3",
  silver: "#c0c0c0",
  red: "#c0392b",
  burgundy: "#800020",
  brown: "#795548",
  tan: "#d2b48c",
  beige: "#f5f5dc",
  ivory: "#fffff0",
  green: "#2e7d32",
  forestgreen: "#228b22",
  blue: "#1d4ed8",
  navy: "#001f5b",
  lightblue: "#8ab4d8",
  sandstone: "#d8caa8",
  copper: "#b87333",
  galvalume: "#c9ccce",
  bronze: "#6b4a2b",
};

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Resolve a free-text colour to a hex swatch, or null when unknown. */
const colorToHex = (input?: string): string | null => {
  if (!input) return null;
  const raw = input.trim();
  if (HEX_RE.test(raw)) return raw;
  return NAMED_COLORS[raw.toLowerCase().replace(/[\s_-]/g, "")] ?? null;
};

const labelOf = (map: Record<string, string>, value?: string) =>
  value ? (map[value] ?? value) : UNSET;

/** Print 10-digit North American numbers as (437) 984-5385; leave the rest as typed. */
const formatPhone = (input?: string): string | undefined => {
  if (!input) return undefined;
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10)
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  if (digits.length === 11 && digits.startsWith("1"))
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  return input;
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type QuoteData = {
  // Step 1–2
  buildingType: string;
  width: number;
  length: number;
  height: number;

  // Step 3 — roof & panels
  roofShape?: string;
  roofPitch?: string;
  roofPanel?: string;
  roofFinish?: string;
  gutters?: string;

  // Step 3 — optional detail
  roofColor?: string;
  wallColor?: string;
  panelGauge?: string;
  insulationRoof?: string;
  insulationWall?: string;
  linerPanel?: string;

  // Step 4 — framed openings
  layoutSketch?: string;
  overheadDoors?: number;
  manDoors?: number;
  windows?: number;
  louvers?: number;
  openingNotes?: string;

  // Step 5–7
  region: string;
  city: string;
  postalCode?: string;
  timeline: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
  smsConsent?: boolean;
};

type Props = {
  data: QuoteData;
  submittedAt?: Date;
  referenceId?: string;
};

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Cell({
  label,
  value,
  swatch,
  span,
}: {
  label: string;
  value?: string;
  swatch?: string | null;
  /** Grid columns to occupy — the grid is 3 wide. */
  span?: 2 | 3;
}) {
  const shown = value && value.length > 0 ? value : UNSET;
  const muted = shown === UNSET || shown === UNSURE;
  const width = span === 3 ? "100%" : span === 2 ? "66.666%" : undefined;
  return (
    <View style={[styles.gridCell, width ? { width } : {}]}>
      <Text style={styles.cellLabel}>{label}</Text>
      {swatch ? (
        <View style={styles.swatchRow}>
          <View style={[styles.swatch, { backgroundColor: swatch }]} />
          <Text style={styles.cellValue}>{shown}</Text>
        </View>
      ) : (
        <Text style={muted ? styles.cellValueMuted : styles.cellValue}>
          {shown}
        </Text>
      )}
    </View>
  );
}

function Stat({ num, label, muted }: { num: string; label: string; muted?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={muted ? styles.statNumMuted : styles.statNum}>{num}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function NoteBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={{ marginTop: 4 }}>
      <Text style={styles.notesLabel}>{label}</Text>
      <Text style={styles.notes}>{text}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Document                                                            */
/* ------------------------------------------------------------------ */

export function QuotePdfReact({
  data,
  submittedAt = new Date(),
  referenceId,
}: Props) {
  const baseUrl = process.env.S3_URL;

  const width = Number(data.width) || 0;
  const length = Number(data.length) || 0;
  const height = Number(data.height) || 0;
  const area = width * length;

  const overheadDoors = Number(data.overheadDoors) || 0;
  const manDoors = Number(data.manDoors) || 0;
  const windows = Number(data.windows) || 0;
  const louvers = Number(data.louvers) || 0;
  const totalOpenings = overheadDoors + manDoors + windows + louvers;

  const buildingType = labelOf(BUILDING_TYPE_LABELS, data.buildingType);
  const timeline = labelOf(TIMELINE_LABELS, data.timeline);

  // The "detail" step is optional — only print the section when it has content.
  const hasFinishDetail = Boolean(
    data.roofColor ||
      data.wallColor ||
      data.panelGauge ||
      data.insulationRoof ||
      data.insulationWall ||
      data.linerPanel,
  );

  const location = [data.city, data.region].filter(Boolean).join(", ");

  return (
    <Document
      title={`Quote Request — ${data.fullName}`}
      author="North GTA Steel Building"
      subject="Building quote request"
      keywords={[buildingType, timeline, data.city, data.region]
        .filter(Boolean)
        .join(", ")}
    >
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {baseUrl && (
              <Image
                src={`${baseUrl}/emails/Logomark.png`}
                style={styles.logo}
              />
            )}
            <Text style={styles.brand}>North GTA Steel Building</Text>
            <Text style={styles.brandSub}>Quote request summary</Text>
          </View>
          <View style={styles.meta}>
            {referenceId && (
              <>
                <Text style={styles.metaLabel}>Reference</Text>
                <Text>{referenceId}</Text>
              </>
            )}
            <Text style={[styles.metaLabel, { marginTop: 6 }]}>Submitted</Text>
            <Text>
              {submittedAt.toLocaleString("en-CA", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </Text>
          </View>
        </View>

        {/* Who + how urgent — the two things the reader needs first */}
        <View style={styles.leadStrip}>
          <View>
            <Text style={styles.leadName}>{data.fullName}</Text>
            <Text style={styles.leadSub}>
              {buildingType} building
              {location ? ` · ${location}` : ""}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>Timeline</Text>
            <Text style={styles.badgeValue}>{timeline}</Text>
          </View>
        </View>

        {/* Size */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.statsBox}>
            <Stat num={`${width}'`} label="Width" />
            <View style={styles.statDivider} />
            <Stat num={`${length}'`} label="Length" />
            <View style={styles.statDivider} />
            <Stat num={`${height}'`} label="Eave height" />
            <View style={styles.statDivider} />
            <Stat num={area.toLocaleString("en-CA")} label="Sq ft footprint" />
          </View>
        </View>

        {/* Roof, panels and the optional finish detail — one block */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Roof, panels & finishes</Text>
          <View style={styles.grid}>
            <Cell
              label="Roof shape"
              value={labelOf(ROOF_SHAPE_LABELS, data.roofShape)}
            />
            <Cell
              label="Roof pitch"
              value={
                data.roofPitch === "unsure"
                  ? UNSURE
                  : data.roofPitch
                    ? `${data.roofPitch} rise/run`
                    : undefined
              }
            />
            <Cell
              label="Roof panel"
              value={labelOf(ROOF_PANEL_LABELS, data.roofPanel)}
            />
            <Cell
              label="Roof finish"
              value={labelOf(ROOF_FINISH_LABELS, data.roofFinish)}
            />
            <Cell
              label="Gutters & downspouts"
              value={labelOf(GUTTERS_LABELS, data.gutters)}
            />
            <Cell
              label="Panel gauge"
              value={
                data.panelGauge
                  ? labelOf(PANEL_GAUGE_LABELS, data.panelGauge)
                  : undefined
              }
            />
            {/* Colours, insulation and liner come from the optional detail step */}
            {hasFinishDetail && (
              <>
                <Cell
                  label="Roof colour"
                  value={data.roofColor}
                  swatch={colorToHex(data.roofColor)}
                />
                <Cell
                  label="Wall colour"
                  value={data.wallColor}
                  swatch={colorToHex(data.wallColor)}
                />
                <Cell label="Roof insulation" value={data.insulationRoof} />
                <Cell label="Wall insulation" value={data.insulationWall} />
                <Cell
                  label="Liner panel"
                  value={
                    data.linerPanel
                      ? labelOf(LINER_PANEL_LABELS, data.linerPanel)
                      : undefined
                  }
                />
              </>
            )}
          </View>
        </View>

        {/* Framed openings */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            Framed openings ({totalOpenings} total)
          </Text>
          <View style={styles.statsBox}>
            <Stat
              num={String(overheadDoors)}
              label="Overhead doors"
              muted={overheadDoors === 0}
            />
            <View style={styles.statDivider} />
            <Stat num={String(manDoors)} label="Man doors" muted={manDoors === 0} />
            <View style={styles.statDivider} />
            <Stat num={String(windows)} label="Windows" muted={windows === 0} />
            <View style={styles.statDivider} />
            <Stat num={String(louvers)} label="Louvers" muted={louvers === 0} />
          </View>
          <View style={styles.grid}>
            <Cell
              label="Layout / sketch"
              value={
                data.layoutSketch
                  ? labelOf(LAYOUT_SKETCH_LABELS, data.layoutSketch)
                  : undefined
              }
              span={3}
            />
          </View>
          {data.openingNotes && (
            <NoteBlock label="Placement notes" text={data.openingNotes} />
          )}
        </View>

        {/* Site + contact — kept together so the reader gets the lead in one block */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client & site</Text>
          <View style={styles.grid}>
            <Cell label="Name" value={data.fullName} />
            <Cell label="Email" value={data.email} span={2} />
            <Cell label="Phone" value={formatPhone(data.phone)} />
            <View style={styles.gridCell}>
              <Text style={styles.cellLabel}>SMS consent</Text>
              <Text
                style={data.smsConsent ? styles.consentYes : styles.consentNo}
              >
                {data.smsConsent ? "Yes — may text" : "No — do not text"}
              </Text>
            </View>
            <Cell label="City / town" value={data.city} />
            <Cell label="Region" value={data.region} span={2} />
            <Cell label="Postal code" value={data.postalCode} />
          </View>
          {data.notes && <NoteBlock label="Client notes" text={data.notes} />}
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `Quote request${referenceId ? ` ${referenceId}` : ""} · ${data.fullName} · submitted on northgtasteel.ca · page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}

export async function QuotePdf({
  data,
  submittedAt,
  referenceId,
}: Props): Promise<Buffer> {
  return await renderToBuffer(
    QuotePdfReact({ data, submittedAt, referenceId }),
  );
}
