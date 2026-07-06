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
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottom: "1px solid #e5e5e5",
  },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  brandSub: { fontSize: 10, color: "#64748b", marginTop: 2 },
  meta: { textAlign: "right", fontSize: 9, color: "#64748b" },
  metaLabel: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: 10 },

  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#0f172a",
    marginBottom: 8,
  },

  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 110, color: "#64748b" },
  value: { flex: 1, color: "#111" },

  dimsBox: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: 12,
    marginTop: 4,
  },
  dim: { flex: 1, alignItems: "center" },
  dimNum: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  dimLabel: { fontSize: 9, color: "#64748b", marginTop: 2 },

  swatchRow: { flex: 1, flexDirection: "row", alignItems: "center" },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
    border: "1px solid #cbd5e1",
    marginRight: 6,
  },

  imagesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  snapshot: {
    flex: 1,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: 6,
  },
  snapshotImg: { width: "100%", height: 150, objectFit: "contain" },

  table: {
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1px solid #f1f5f9",
  },
  cell: { flex: 1 },

  notes: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: 10,
    color: "#334155",
    lineHeight: 1.4,
  },

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
  logo: {
    width: 80,
    height: 80,
    objectFit: "contain",
  },
});

const OPENING_LABELS: Record<string, string> = {
  garage: "Garage door",
  man: "Man door",
  window: "Window",
};

export type DesignQuoteData = {
  lead: {
    name: string;
    email: string;
    phone?: string;
    postal?: string;
    notes?: string;
  };
  config: {
    width: number;
    length: number;
    height: number;
    roofPitch: number;
    roofStyle: string;
    wallColor: string;
    roofColor: string;
    trimColor: string;
    wainscot: boolean;
    wainscotColor?: string;
    openings: { id: string; type: string; side: string; offset: number }[];
    addons: {
      leanTo: boolean;
      skylights: number;
      vents: number;
      gutters: boolean;
      insulation: boolean;
    };
  };
  summary: {
    footprintSqFt: number;
    roofAreaSqFt: number;
    garageDoors: number;
    manDoors: number;
    windows: number;
  };
  images?: {
    imgType: string;
    imgURL: string;
  }[];
  meta?: {
    source?: string;
    submittedAt?: string;
  };
};

type Props = {
  data: DesignQuoteData;
  referenceId?: string;
};

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const safeHex = (c?: string) => (c && HEX_RE.test(c) ? c : "#000000");
const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

function ColorRow({ label, hex }: { label: string; hex?: string }) {
  const color = safeHex(hex);
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.swatchRow}>
        <View style={[styles.swatch, { backgroundColor: color }]} />
        <Text style={styles.value}>{color.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const ALLOWED_IMG_TYPES = new Set(["png", "jpg", "jpeg"]);
const isSafeImgUrl = (url: unknown): url is string =>
  typeof url === "string" && /^https:\/\//.test(url);

export function DesignQuotePdfReact({ data, referenceId }: Props) {
  const { lead, config, summary, meta } = data;
  const baseUrl = process.env.S3_URL;
  const submittedAt = meta?.submittedAt
    ? new Date(meta.submittedAt)
    : new Date();

  const images = (data.images ?? [])
    .filter(
      (img) =>
        ALLOWED_IMG_TYPES.has(String(img?.imgType).toLowerCase()) &&
        isSafeImgUrl(img?.imgURL),
    )
    .slice(0, 4);

  const addons: string[] = [];
  if (config.addons.leanTo) addons.push("Lean-to");
  if (config.addons.skylights > 0)
    addons.push(`${config.addons.skylights} skylight(s)`);
  if (config.addons.vents > 0) addons.push(`${config.addons.vents} vent(s)`);
  if (config.addons.gutters) addons.push("Gutters");
  if (config.addons.insulation) addons.push("Insulation");

  return (
    <Document
      title={`3D Design Quote — ${lead.name}`}
      author="North GTA Steel Building"
      subject="3D designer quote request"
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
            <Text style={styles.brandSub}>3D designer quote request</Text>
          </View>
          <View style={styles.meta}>
            {referenceId && (
              <>
                <Text style={styles.metaLabel}>Ref</Text>
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

        {/* Building */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Building</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Roof style</Text>
            <Text style={styles.value}>{capitalize(config.roofStyle)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Roof pitch</Text>
            <Text style={styles.value}>{config.roofPitch}:12</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Roof area</Text>
            <Text style={styles.value}>
              {summary.roofAreaSqFt.toLocaleString()} sq ft
            </Text>
          </View>

          <View style={styles.dimsBox}>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{config.width}'</Text>
              <Text style={styles.dimLabel}>WIDTH</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{config.length}'</Text>
              <Text style={styles.dimLabel}>LENGTH</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{config.height}'</Text>
              <Text style={styles.dimLabel}>HEIGHT</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>
                {summary.footprintSqFt.toLocaleString()}
              </Text>
              <Text style={styles.dimLabel}>SQ FT</Text>
            </View>
          </View>
        </View>

        {/* Design previews */}
        {images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Design previews</Text>
            <View style={styles.imagesRow}>
              {images.map((img, i) => (
                <View key={i} style={styles.snapshot}>
                  <Image src={img.imgURL} style={styles.snapshotImg} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Colors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>
          <ColorRow label="Walls" hex={config.wallColor} />
          <ColorRow label="Roof" hex={config.roofColor} />
          <ColorRow label="Trim" hex={config.trimColor} />
          {config.wainscot && (
            <ColorRow label="Wainscot" hex={config.wainscotColor} />
          )}
        </View>

        {/* Openings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Openings ({summary.garageDoors} garage · {summary.manDoors} man ·{" "}
            {summary.windows} window)
          </Text>
          {config.openings.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.cell}>Type</Text>
                <Text style={styles.cell}>Side</Text>
                <Text style={styles.cell}>Position</Text>
              </View>
              {config.openings.map((op) => (
                <View key={op.id} style={styles.tableRow}>
                  <Text style={styles.cell}>
                    {OPENING_LABELS[op.type] ?? capitalize(op.type)}
                  </Text>
                  <Text style={styles.cell}>{capitalize(op.side)}</Text>
                  <Text style={styles.cell}>
                    {Math.round(op.offset * 100)}% along wall
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>None</Text>
          )}
        </View>

        {/* Add-ons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add-ons</Text>
          <Text style={styles.value}>
            {addons.length > 0 ? addons.join(", ") : "None"}
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{lead.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{lead.email}</Text>
          </View>
          {lead.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{lead.phone}</Text>
            </View>
          )}
          {lead.postal && (
            <View style={styles.row}>
              <Text style={styles.label}>Postal code</Text>
              <Text style={styles.value}>{lead.postal}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {lead.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{lead.notes}</Text>
          </View>
        )}

        <Text style={styles.footer} fixed>
          This document was generated from the 3D building designer on
          northgtasteel.ca.
        </Text>
      </Page>
    </Document>
  );
}

export async function DesignQuotePdf({
  data,
  referenceId,
}: Props): Promise<Buffer> {
  return await renderToBuffer(DesignQuotePdfReact({ data, referenceId }));
}
