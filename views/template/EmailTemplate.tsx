// emails/MessageReceivedEmail.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Column,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type Props = {
  firstName: string;
  message: string;
  email: string;
  owner?: boolean;
  linkedinUrl?: string;
  brandName?: string;
  logoSrc?: string;
  siteUrl?: string;
};

/**
 * Palette derived from kamyabrouhifar.ca
 * - bg      : site theme-color (#04041b)
 * - accent  : violet CTA used across the portfolio
 */
const brand = {
  bg: "#04041b",
  surface: "#0c0c26",
  surfaceAlt: "#131333",
  border: "#26264f",
  accent: "#6e4df5",
  accentSoft: "#9a83fa",
  heading: "#f5f6ff",
  text: "#c3c6e0",
  muted: "#7c7fa3",
};

const FONT_STACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default function EmailTemplate({
  firstName = "Friend",
  message,
  email,
  owner = false,
  linkedinUrl = "https://www.linkedin.com/in/kamyab-rouhifar/",
  brandName = "DreamsDigital.ca",
  siteUrl = "https://www.kamyabrouhifar.ca",
}: Props) {
  const preview = owner
    ? `New enquiry from ${firstName} — ${email}`
    : `Thanks ${firstName}, your message is in my inbox.`;

  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
      </Head>
      <Preview>{preview}</Preview>

      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                bg: brand.bg,
                surface: brand.surface,
                surfaceAlt: brand.surfaceAlt,
                brdr: brand.border,
                accent: brand.accent,
                accentSoft: brand.accentSoft,
                heading: brand.heading,
                bodytext: brand.text,
                muted: brand.muted,
              },
            },
          },
        }}
      >
        <Body
          className="bg-bg m-0 p-0"
          style={{ backgroundColor: brand.bg, fontFamily: FONT_STACK }}
        >
          {/* Full-bleed wrapper — Outlook ignores <body> background, this catches it */}
          <Section
            className="bg-bg w-full py-[32px]"
            style={{ backgroundColor: brand.bg }}
          >
            <Container className="mx-auto w-full max-w-[600px] px-[24px]">
              {/* ── Header ─────────────────────────────────────────── */}
              <Section className="pb-[24px]">
                <Row>
                  <Column style={{ width: "40px", verticalAlign: "middle" }}>
                    <Link href={siteUrl}>
                      <Img
                        src={"cid:logo-image"}
                        width="32"
                        height="32"
                        alt="Kamyab Rouhifar"
                        style={{ display: "block", border: "0" }}
                      />
                    </Link>
                  </Column>
                  <Column style={{ verticalAlign: "middle" }}>
                    <Text className="text-heading text-[15px] font-bold m-0 leading-[20px]">
                      Kamyab Rouhifar
                    </Text>
                    <Text className="text-muted text-[12px] m-0 leading-[16px]">
                      Cloud &amp; Full-Stack Developer
                    </Text>
                  </Column>
                </Row>
              </Section>

              {/* ── Card ───────────────────────────────────────────── */}
              <Section
                className="bg-surface rounded-[14px] px-[28px] py-[32px]"
                style={{
                  backgroundColor: brand.surface,
                  border: `1px solid ${brand.border}`,
                }}
              >
                {/* Eyebrow */}
                <Text
                  className="text-accentSoft text-[11px] font-bold uppercase m-0 mb-[10px]"
                  style={{ letterSpacing: "1.5px" }}
                >
                  {owner ? "New enquiry" : "Message received"}
                </Text>

                <Heading className="text-heading text-[26px] font-extrabold leading-[32px] m-0 mb-[16px]">
                  {owner
                    ? `${firstName} just reached out`
                    : `Thanks, ${firstName}.`}
                </Heading>

                <Text className="text-bodytext text-[15px] leading-[24px] m-0 mb-[8px]">
                  {owner ? (
                    <>
                      A new message landed through the contact form on your
                      site. Sender details and the full message are below.
                    </>
                  ) : (
                    <>
                      Your message has been delivered straight to my inbox —
                      thanks for your interest in my work. I&apos;ll review it
                      and get back to you shortly.
                    </>
                  )}
                </Text>

                {/* Sender chip (owner view) */}
                {owner && (
                  <Section
                    className="rounded-[10px] px-[16px] py-[14px] mt-[20px]"
                    style={{
                      backgroundColor: brand.surfaceAlt,
                      border: `1px solid ${brand.border}`,
                    }}
                  >
                    <Text
                      className="text-muted text-[11px] font-bold uppercase m-0 mb-[4px]"
                      style={{ letterSpacing: "1px" }}
                    >
                      From
                    </Text>
                    <Text className="text-heading text-[15px] font-semibold m-0 leading-[20px]">
                      {firstName}
                    </Text>
                    <Link
                      href={`mailto:${email}`}
                      className="text-accentSoft text-[13px] no-underline"
                    >
                      {email}
                    </Link>
                  </Section>
                )}

                {/* Message */}
                <Text
                  className="text-muted text-[11px] font-bold uppercase mt-[24px] mb-[10px]"
                  style={{ letterSpacing: "1px" }}
                >
                  {owner ? "Their message" : "Your message"}
                </Text>

                <Section
                  className="rounded-[10px] px-[18px] py-[16px]"
                  style={{
                    backgroundColor: brand.surfaceAlt,
                    borderLeft: `3px solid ${brand.accent}`,
                  }}
                >
                  <Text
                    className="text-bodytext text-[15px] leading-[24px] m-0"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {message}
                  </Text>
                </Section>

                {/* CTA */}
                <Section className="mt-[28px]">
                  <Button
                    href={owner ? `mailto:${email}` : linkedinUrl}
                    className="rounded-[8px] px-[24px] py-[13px] text-[14px] font-semibold text-white no-underline"
                    style={{
                      backgroundColor: brand.accent,
                      display: "inline-block",
                    }}
                  >
                    {owner ? `Reply to ${firstName}` : "Connect on LinkedIn"}
                  </Button>
                </Section>
              </Section>

              {/* ── Footer ─────────────────────────────────────────── */}
              <Section className="pt-[28px]">
                <Row>
                  <Column>
                    <Link
                      href="https://www.linkedin.com/in/kamyab-rouhifar/"
                      className="text-muted text-[12px] no-underline mr-[16px]"
                    >
                      LinkedIn
                    </Link>
                    <Link
                      href="https://github.com/karouhifar"
                      className="text-muted text-[12px] no-underline mr-[16px]"
                    >
                      GitHub
                    </Link>
                    <Link
                      href="https://medium.com/@karouhifar"
                      className="text-muted text-[12px] no-underline mr-[16px]"
                    >
                      Medium
                    </Link>
                    <Link
                      href="https://x.com/KRouhifar"
                      className="text-muted text-[12px] no-underline"
                    >
                      X
                    </Link>
                  </Column>
                </Row>

                <Hr
                  className="my-[20px]"
                  style={{ borderColor: brand.border, borderTopWidth: "1px" }}
                />

                <Text className="text-muted text-[11px] leading-[18px] m-0">
                  Sent from{" "}
                  <Link href={siteUrl} className="text-muted underline">
                    kamyabrouhifar.ca
                  </Link>{" "}
                  · Toronto, Canada
                </Text>
                <Text className="text-muted text-[11px] leading-[18px] m-0 mt-[4px]">
                  Powered by{" "}
                  <Link
                    href="https://dreamsdigital.ca"
                    className="text-accentSoft underline"
                  >
                    {brandName}
                  </Link>
                </Text>
              </Section>
            </Container>
          </Section>
        </Body>
      </Tailwind>
    </Html>
  );
}
