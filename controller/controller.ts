import type { Request, Response } from "express";
import { OwnerDTO, type ICreateUser, UserModel } from "../model";
import { prisma } from "@/utils/prisma";
import { Resend } from "resend";
import { getClientIp, isEmpty } from "../utils/lib";
import React from "react";
import { EmailTemplate } from "../views/template";

export const OwnerController = {
  list: async (req: Request, res: Response) => {
    const ownerDTO = new OwnerDTO();
    const owners = await ownerDTO.findAll();
    res.json({ ok: true, data: owners });
  },

  get: async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) return res.status(400).json({ ok: false, error: "Missing key" });
    const ownerDTO = new OwnerDTO();
    const owner = await ownerDTO.findByKeyId(key);
    if (!owner)
      return res.status(404).json({ ok: false, error: "Owner not found" });
    res.json({ ok: true, data: owner });
  },

  upsert: async (req: Request, res: Response) => {
    try {
      const { isOwner, name, email } = req.body ?? {};
      const ownerDTO = new OwnerDTO();

      await ownerDTO.create({ isOwner, name, email });
      res.status(201).json({ ok: true });
    } catch (error) {
      res.status(400).json({ error: "Please use unique key" });
    }
  },

  remove: async (req: Request, res: Response) => {
    const { key } = req.params;
    if (!key) return res.status(400).json({ ok: false, error: "Missing key" });
    const ownerDTO = new OwnerDTO();
    const exists = await ownerDTO.findByKeyId(key);
    if (!exists)
      return res.status(404).json({ ok: false, error: "Owner not found" });
    await ownerDTO.remove({ key_id: key });
    res.json({ ok: true });
  },
};

export const EmailController = {
  send: async (req: Request, res: Response) => {
    const { key } = req.params;
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const { toEmail, firstName, message, subject } = req.body ?? {};
      if (!key)
        return res.status(400).json({ ok: false, error: "Missing key" });

      const owner = await new OwnerDTO().findByKeyId(key);

      // Basic guard
      if (!toEmail || isEmpty(owner) || !owner?.getEmail) {
        return res.status(400).json({ ok: false, error: "Missing toEmail" });
      }

      const recipients = [
        {
          clientEmail: toEmail,
          ownerEmail: owner.getEmail,
          clientName: firstName,
          owner: false,
          ownerName: owner.getName,
          message,
        },
        {
          clientEmail: owner.getEmail,
          ownerEmail: toEmail,
          clientName: firstName,
          owner: true,
          ownerName: firstName,
          message,
        },
      ];

      //   {
      //     from: `${owner?.getName} <${String(process.env.FROM_EMAIL)}>`,
      //     to: [toEmail],

      //     subject: subject ?? "Thanks for reaching out!",
      //     // You can pass a React element directly:
      //     react: React.createElement(EmailTemplate, {
      //       firstName: firstName ?? "Friend",
      //       message: message ?? "It works! 🎉",
      //       email: owner?.getEmail,
      //     }),
      //   },
      //   {
      //     from: `${firstName} <${String(process.env.FROM_EMAIL)}>`,
      //     to: [owner?.getEmail],
      //     subject: subject ?? "Thanks for reaching out!",
      //     react: React.createElement(EmailTemplate, {
      //       firstName: firstName ?? "Friend",
      //       owner: true,
      //       email: toEmail,
      //       message: message ?? "It works! 🎉",
      //     }),
      //     attachments: [
      //       {
      //         path: "https://email.dreamsdigital.ca/emails/email-img-ritz.png",
      //         filename: "email-img-ritz.png",
      //         contentId: "logo-image",
      //         contentType: "image/png",
      //       },
      //     ],
      //   },
      // ]);
      const [email1, email2] = await Promise.all(
        recipients.map(
          ({
            clientEmail,
            ownerEmail,
            clientName,
            owner,
            ownerName,
            message,
          }) =>
            resend.emails.send({
              from: `${ownerName} <${String(process.env.FROM_EMAIL)}>`,
              to: [clientEmail],
              subject: subject ?? "Thanks for reaching out!",
              react: React.createElement(EmailTemplate, {
                firstName: clientName ?? "Friend",
                owner,
                email: ownerEmail,
                message: message ?? "It works! 🎉",
              }),
              attachments: [
                {
                  path: "https://email.dreamsdigital.ca/emails/email-img-ritz.png",
                  filename: "email-img-ritz.png",
                  contentId: "logo-image",
                  contentType: "image/png",
                },
              ],
            }),
        ),
      );

      if (email1?.error || email1?.error) {
        return res
          .status(500)
          .json({ ok: false, error: [email1?.error, email2?.error] });
      }

      return res
        .status(200)
        .json({ ok: true, ids: [email1?.data, email2?.data] });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: "Unexpected error" });
    }
  },
};

export const UserController = {
  create: async (req: Request, res: Response) => {
    try {
      const model = new UserModel(prisma);
      const { name, email, isOwner, message } = (req.body ?? {}) as ICreateUser;

      if (!name || !email) {
        return res
          .status(400)
          .json({ ok: false, error: "Missing required fields" });
      }
      const ip = getClientIp(req);

      const isOwnerBoolean = Boolean(isOwner);
      let location = null;
      if (ip !== "unknown") {
        location = (await fetch(
          `http://ip-api.com/json/${ip}?fields=status,message,country,region,city`,
        ).then((r) => r.json())) as {
          city: string;
          region: string;
          country: string;
        };
      }
      const user = await model.create({
        name,
        email,
        location:
          location && !isEmpty(location)
            ? `${location.city}, ${location.region}, ${location.country}`
            : "Unknown",
        isOwner: isOwnerBoolean,
        message,
      });
      res.status(201).json({ ok: true, data: user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ ok: false, error: "Internal server error" });
    }
  },
};
