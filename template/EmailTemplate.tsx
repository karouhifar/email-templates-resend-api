// emails/MessageReceivedEmail.tsx
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
} from "@react-email/components";

type Props = {
  firstName: string;
  message: string;
  owner?: boolean;
  illustrationUrl?: string; // remote image URL for the header illustration
  linkedinUrl?: string;
  brandName?: string;
};

export default function EmailTemplate({
  firstName = "Friend",
  message,
  owner = false,
  illustrationUrl = "https://email.dreamsdigital.ca/emails/email-img-ritz.png", // replace with your asset
  linkedinUrl = "https://www.linkedin.com/in/hirteeka-shrivastav/",
  brandName = "DreamsDigital.ca",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Thanks {firstName}, Your message is in my inbox.</Preview>

      {/* Tailwind styles will be inlined for email clients */}
      <Tailwind>
        <Body className="bg-[#fbf1f4] m-0 p-0">
          <Container className="mx-auto max-w-[600px] px-6">
            <Section className="text-center pt-10">
              <Heading className="text-md leading-[1.2] font-extrabold text-[#103b39] m-0">
                Message received
              </Heading>

              <div className="mt-6">
                <Img
                  src={illustrationUrl}
                  width="220"
                  height="auto"
                  alt="Message received"
                  className="mx-auto rounded-lg"
                />
              </div>
            </Section>

            <Section className="text-center mt-8">
              {!owner && (
                <Text className="text-[16px] leading-6 text-[#0f172a] m-0">
                  Thanks <span className="font-semibold">{`${firstName}`}</span>{" "}
                  for reaching out and for your interest in my work! Your
                  message has been successfully delivered to my inbox.
                </Text>
              )}

              <Text className="text-[16px] leading-6 text-[#0f172a] mt-4">
                {owner
                  ? `you received message from ${firstName}`
                  : "I’ll be reviewing your message."}
              </Text>

              <Text className="text-[16px] leading-6 text-[#0f172a] mt-4 text-left">
                {owner ? "Your Client Message" : "Your Message"} :
              </Text>

              <div className="bg-gray-300 rounded-xl">
                <Text className="text-[16px] leading-6 text-[#0f172a] m-4">
                  {message}
                </Text>
              </div>

              <div className="mt-8 mb-2">
                <Button
                  href={linkedinUrl}
                  className="inline-block rounded-md px-6 py-3 text-[16px] font-semibold no-underline bg-[#6e4df5] text-white"
                >
                  Contact me through LinkedIn
                </Button>
              </div>
            </Section>

            <Section className="text-center mt-10">
              <Hr className="border-[#e2e8f0] my-6" />

              <Text className="text-[12px] text-[#94a3b8]">
                <span className="mr-1">💙</span> POWERED BY {brandName}
              </Text>

              <div className="h-8" />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
