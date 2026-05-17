import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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

const TIMELINE_LABELS: Record<string, string> = {
  asap: "ASAP",
  "1-3": "1–3 months",
  "3-6": "3–6 months",
  "6-12": "6–12 months",
  researching: "Just researching",
};

type Props = {
  data: {
    buildingType: string;
    timeline: string;
    width: number;
    length: number;
    height: number;
    city: string;
    region: string;
    postalCode?: string;
    fullName: string;
    email: string;
    phone?: string;
    notes?: string;
  };
  submittedAt?: Date;
  referenceId?: string;
};

export function QuotePdfReact({
  data,
  submittedAt = new Date(),
  referenceId,
}: Props) {
  const area = data.width * data.length;
  const baseUrl = process.env.S3_URL;

  return (
    <Document
      title={`Quote Request — ${data.fullName}`}
      author="Your Company"
      subject="Building quote request"
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
            <Text style={styles.brand}>Your Company</Text>
            <Text style={styles.brandSub}>Quote request summary</Text>
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
            <Text style={styles.label}>Type</Text>
            <Text style={[styles.value, { textTransform: "capitalize" }]}>
              {data.buildingType}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Timeline</Text>
            <Text style={styles.value}>{TIMELINE_LABELS[data.timeline]}</Text>
          </View>

          <View style={styles.dimsBox}>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{data.width}'</Text>
              <Text style={styles.dimLabel}>WIDTH</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{data.length}'</Text>
              <Text style={styles.dimLabel}>LENGTH</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{data.height}'</Text>
              <Text style={styles.dimLabel}>HEIGHT</Text>
            </View>
            <View style={styles.dim}>
              <Text style={styles.dimNum}>{area.toLocaleString()}</Text>
              <Text style={styles.dimLabel}>SQ FT</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.row}>
            <Text style={styles.label}>City</Text>
            <Text style={styles.value}>{data.city}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Region</Text>
            <Text style={styles.value}>{data.region}</Text>
          </View>
          {data.postalCode && (
            <View style={styles.row}>
              <Text style={styles.label}>Postal code</Text>
              <Text style={styles.value}>{data.postalCode}</Text>
            </View>
          )}
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{data.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{data.email}</Text>
          </View>
          {data.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{data.phone}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>SMS consent</Text>
            <Text style={styles.value}>Yes</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{data.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          This document was generated from a quote request submitted on
          northgtasteel.ca.
        </Text>
      </Page>
    </Document>
  );
}

export async function QuotePdf({ data, referenceId }: Props): Promise<Buffer> {
  return await renderToBuffer(QuotePdfReact({ data, referenceId }));
}
