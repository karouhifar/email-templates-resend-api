import type { IUserModel, UserModel } from "@/model/userModel";
import { isEmpty } from "@/utils/lib";

export type CreateMetadataPayload = {
  userId: string;
  name: string;
  email: string;
  ip: string;
};

type AIMetadata = {
  bio: string;
  tags: string[];
  insights: string;
  age: number;
  gender: string;
};

async function fetchLocation(ip: string): Promise<string> {
  if (ip === "unknown") return "Unknown";

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,region,city`,
    );
    const data = (await res.json()) as {
      status: string;
      city: string;
      region: string;
      country: string;
    };

    if (data.status !== "success") return "Unknown";
    return `${data.city}, ${data.region}, ${data.country}`;
  } catch {
    return "Unknown";
  }
}

async function fetchAIMetadata(payload: {
  name: string;
  email: string;
  location: string;
}): Promise<AIMetadata | null> {
  // Mock AI metadata generation
  const prompt = `
  You are a metadata generator. Given a user's basic info, generate structured metadata.

  User Info:
  - Name: ${payload.name}
  - Email: ${payload.email}
  - Location: ${payload.location}

  Respond ONLY in valid raw JSON (no markdown, no backticks) with this exact shape:
  {
    "bio": "A short 1-2 sentence bio based on name and location",
    "tags": ["tag1", "tag2", "tag3"],
    "insights": "One sentence behavioral or demographic insight based on the data"
    "age": "A random age between 18 and 65",
    "gender": "Male or Female based on the name (you can guess)"
  }
  `;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.statusText}`);
    }

    const data = (await res.json()) as {
      content: { type: string; text: string }[];
    };
    const rawText = data.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("");
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText) as AIMetadata;
  } catch (e) {
    return null;
  }
}

export async function createMetadataJob(
  payload: CreateMetadataPayload,
  model: UserModel,
): Promise<void> {
  const { userId, name, email, ip } = payload;
  const [location, aiMetadata] = await Promise.all([
    fetchLocation(ip),
    fetchAIMetadata({ name, email, location: "fetching..." }),
  ]);

  await model.createMetadata({
    userId,
    ipAddress: ip !== "unknown" ? ip : "Unknown",
    location,
    userDemo: {
      aiBio: aiMetadata?.bio ?? null,
      aiTags: aiMetadata?.tags?.join(", ") ?? null,
      aiInsights: aiMetadata?.insights ?? null,
      aiAge: aiMetadata?.age ?? null,
      aiGender: aiMetadata?.gender ?? null,
    },
  });

  console.log(`[MetadataJob] ✅ Metadata saved for user ${userId}`);
}
