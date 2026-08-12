import { EmailTemplate as EmailTemplateEnum } from "@/generated/prisma/client";
import type { Request } from "express";
import {
  EmailTemplate,
  NGSTemplate,
  QuotePdf,
  DesignQuotePdf,
  type DesignQuoteData,
} from "../views/template";
import type { NullsOrder } from "@/generated/prisma/internal/prismaNamespaceBrowser";

export const isEmpty = function (data: any): boolean {
  return Object.keys(data).length === 0;
};

export function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"]?.toString() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

type TemplateArgs = {
  firstName: string;
  message: string | null;
  clientEmail: string;
  ownerEmail: string;
  ownerName: string;
  isOwner: boolean;
};

type Attachment = {
  path?: string;
  content?: Buffer;
  filename: string;
  contentId?: string;
  contentType: string;
};

type TemplateRegistryEntry = {
  component: (props: any) => React.ReactElement;
  buildProps: (args: TemplateArgs) => Record<string, unknown>;
  attachments?: Attachment[];
};

export function resolveTemplate(
  template: EmailTemplateEnum,
): TemplateRegistryEntry {
  return TEMPLATE_REGISTRY[template];
}

export const TEMPLATE_REGISTRY = {
  [EmailTemplateEnum.NGS]: {
    component: NGSTemplate,
    buildProps: (a: TemplateArgs) => ({
      firstName: a.firstName ?? "Friend",
      owner: a.isOwner,
      email: a.isOwner ? a.clientEmail : a.ownerEmail,
      message: a.message ?? "It works! 🎉",
    }),
  },
  [EmailTemplateEnum.LEGACY]: {
    component: EmailTemplate,
    buildProps: (a: TemplateArgs) => ({
      firstName: a.firstName ?? "Friend",
      email: a.isOwner ? a.clientEmail : a.ownerEmail,
      message: a.message ?? "It works! 🎉",
    }),
    attachments: [
      {
        path: "https://email.dreamsdigital.ca/emails/email-img-ritz.png",
        filename: "email-img-ritz.png",
        contentId: "logo-image",
        contentType: "image/png",
      },
    ],
  },
} satisfies Record<
  EmailTemplateEnum,
  {
    component: unknown;
    buildProps: (a: TemplateArgs) => Record<string, unknown>;
    attachments?: unknown[];
  }
>;
