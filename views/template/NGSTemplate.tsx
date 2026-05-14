// emails/NGSTemplate.tsx
import {
  Html,
  Head,
  Preview,
  Tailwind,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Button,
  Link,
  Hr,
  Row,
  Column,
} from "@react-email/components";

type Props = {
  firstName?: string;
  message: string;
  email: string;
  phone?: string;
  projectType?: string;
  owner?: boolean;
  websiteUrl?: string;
  brandName?: string;
  supportEmail?: string;
  unsubscribeUrl?: string;
  mailingAddress?: string;
};

const baseUrl = process.env.S3_URL;

export default function NGSTemplate({
  firstName = "Friend",
  message,
  email,
  phone,
  projectType,
  owner = false,
  websiteUrl = "https://northgtasteel.ca",
  brandName = "North GTA Steel Buildings",
  supportEmail = "info@ngsbuildings.ca",
  unsubscribeUrl,
  mailingAddress = "Ontario, Canada",
}: Props) {
  const previewText = owner
    ? `New inquiry from ${firstName} for ${brandName}`
    : `Hi ${firstName}, we received your steel building request.`;

  return (
    <Html lang="en">
      <Head />

      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body
          className="bg-[#F5F5F5] m-0 p-0"
          style={{
            fontFamily:
              "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          }}
        >
          <Container className="mx-auto max-w-[600px] bg-white">
            <Section className="bg-[#CC0000] h-[6px] p-0 m-0">
              <Text className="m-0 p-0 leading-none">&nbsp;</Text>
            </Section>

            <Section className="px-8 pt-8 pb-2">
              <Row>
                {baseUrl && (
                  <Column
                    className="w-[96px] align-middle"
                    style={{ paddingRight: "20px" }}
                  >
                    <Img
                      src={`${baseUrl}/emails/Logomark.png`}
                      width="96"
                      height="96"
                      alt={brandName}
                      className="mx-auto"
                    />
                  </Column>
                )}

                <Column className="align-middle">
                  <Heading
                    className="text-[26px] leading-[1.15] font-bold text-[#111111] m-0 tracking-tight"
                    style={{
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {owner ? "New Project Inquiry" : "Message Received"}
                  </Heading>

                  <div className="mt-3 h-[3px] w-[56px] bg-[#CC0000]" />
                </Column>
              </Row>
            </Section>

            <Section className="px-8 pt-6 pb-2">
              {owner ? (
                <Text className="text-[15px] leading-[24px] text-[#111111] m-0">
                  You received a new project inquiry from{" "}
                  <span className="font-semibold">{firstName}</span>. The
                  contact details and message are included below.
                </Text>
              ) : (
                <Text className="text-[15px] leading-[24px] text-[#111111] m-0">
                  Hi <span className="font-semibold">{firstName}</span>, thank
                  you for contacting{" "}
                  <span className="font-semibold">{brandName}</span>. We
                  received your request and our team will review your project
                  details.
                </Text>
              )}
            </Section>

            {(owner || projectType || phone) && (
              <Section className="px-8 pt-6">
                <div className="border border-solid border-[#EAEAEA] rounded-[6px] bg-[#F7F7F7] px-5 py-4">
                  <Text className="text-[11px] leading-[14px] font-semibold uppercase tracking-[0.08em] text-[#CC0000] m-0">
                    {owner ? "Client Details" : "Your Submission"}
                  </Text>

                  <div className="mt-3">
                    <Row>
                      <Column className="w-[110px] align-top">
                        <Text className="text-[13px] leading-[20px] text-[#111111] font-semibold m-0">
                          Name
                        </Text>
                      </Column>
                      <Column className="align-top">
                        <Text className="text-[13px] leading-[20px] text-[#111111] m-0">
                          {firstName}
                        </Text>
                      </Column>
                    </Row>

                    <Row>
                      <Column className="w-[110px] align-top pt-2">
                        <Text className="text-[13px] leading-[20px] text-[#111111] font-semibold m-0">
                          Email
                        </Text>
                      </Column>
                      <Column className="align-top pt-2">
                        <Link
                          href={`mailto:${email}`}
                          className="text-[13px] leading-[20px] text-[#CC0000] no-underline"
                        >
                          {email}
                        </Link>
                      </Column>
                    </Row>

                    {phone && (
                      <Row>
                        <Column className="w-[110px] align-top pt-2">
                          <Text className="text-[13px] leading-[20px] text-[#111111] font-semibold m-0">
                            Phone
                          </Text>
                        </Column>
                        <Column className="align-top pt-2">
                          <Link
                            href={`tel:${phone}`}
                            className="text-[13px] leading-[20px] text-[#111111] no-underline"
                          >
                            {phone}
                          </Link>
                        </Column>
                      </Row>
                    )}

                    {projectType && (
                      <Row>
                        <Column className="w-[110px] align-top pt-2">
                          <Text className="text-[13px] leading-[20px] text-[#111111] font-semibold m-0">
                            Project
                          </Text>
                        </Column>
                        <Column className="align-top pt-2">
                          <Text className="text-[13px] leading-[20px] text-[#111111] m-0">
                            {projectType}
                          </Text>
                        </Column>
                      </Row>
                    )}
                  </div>
                </div>
              </Section>
            )}

            <Section className="px-8 pt-6">
              <Text className="text-[11px] leading-[14px] font-semibold uppercase tracking-[0.08em] text-[#CC0000] m-0">
                {owner ? "Client Message" : "Your Message"}
              </Text>

              <div className="mt-3 border-l-[3px] border-solid border-[#CC0000] bg-[#F7F7F7] px-5 py-4 rounded-r-[6px]">
                <Text className="text-[14px] leading-[22px] text-[#111111] m-0 whitespace-pre-wrap">
                  {message}
                </Text>
              </div>
            </Section>

            <Section className="px-8 pt-8 pb-2 text-center">
              {owner ? (
                <Button
                  href={`mailto:${email}`}
                  className="inline-block rounded-[4px] px-8 py-3 text-[14px] font-bold no-underline bg-[#CC0000] text-white"
                >
                  Reply to {firstName}
                </Button>
              ) : (
                <Button
                  href={websiteUrl}
                  className="inline-block rounded-[4px] px-8 py-3 text-[14px] font-bold no-underline bg-[#CC0000] text-white"
                >
                  Visit our website
                </Button>
              )}
            </Section>

            <Section className="px-8 pt-6 pb-2 text-center">
              <Text className="text-[13px] leading-[20px] text-[#111111] m-0 font-semibold">
                Built for Ontario
              </Text>
              <Text className="text-[12px] leading-[18px] text-[#111111] opacity-70 m-0 mt-1">
                Commercial · Agricultural · Industrial · Residential
              </Text>
            </Section>

            <Section className="px-8 pt-8 pb-10">
              <Hr className="border-[#EAEAEA] my-0" />

              <div className="text-center pt-6">
                <Text className="text-[12px] leading-[18px] text-[#111111] m-0 font-semibold">
                  {brandName}
                </Text>

                <Text className="text-[11px] leading-[16px] text-[#111111] opacity-70 m-0 mt-1">
                  High-quality steel buildings built with precision and trusted
                  across Ontario.
                </Text>

                <Text className="text-[11px] leading-[16px] text-[#111111] opacity-70 m-0 mt-3">
                  <Link
                    href={websiteUrl}
                    className="text-[#CC0000] no-underline"
                  >
                    northgtasteel.ca
                  </Link>
                  {"  ·  "}
                  <Link
                    href={`mailto:${supportEmail}`}
                    className="text-[#111111] no-underline"
                  >
                    {supportEmail}
                  </Link>
                </Text>

                <Text className="text-[10px] leading-[15px] text-[#111111] opacity-60 m-0 mt-4">
                  {mailingAddress}
                </Text>

                {!owner && unsubscribeUrl && (
                  <Text className="text-[10px] leading-[15px] text-[#111111] opacity-60 m-0 mt-4">
                    You are receiving this email because you submitted a request
                    through {brandName}. If you no longer want project follow-up
                    emails, you can{" "}
                    <Link
                      href={unsubscribeUrl}
                      className="text-[#CC0000] no-underline"
                    >
                      unsubscribe here
                    </Link>
                    .
                  </Text>
                )}

                <Text className="text-[10px] leading-[14px] text-[#111111] opacity-40 m-0 mt-4">
                  © {new Date().getFullYear()} {brandName}. All rights
                  reserved.
                </Text>
              </div>
            </Section>

            <Section className="bg-[#CC0000] h-[6px] p-0 m-0">
              <Text className="m-0 p-0 leading-none">&nbsp;</Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
