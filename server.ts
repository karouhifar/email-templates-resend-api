import express from "express";
import cors from "cors";
import { Resend } from "resend";
import React from "react";
import { EmailTemplate } from "./views/template";
import ownerRoutes from "./routes/owner.routes";
import { closeOnExit, initDb } from "./db/database";
import { OwnerDTO } from "./model";
import { isEmpty } from "./utils/lib";

const app = express();
initDb();
const resend = new Resend(Bun.env.RESEND_API_KEY);
// --- CORS: ONLY allow https://ritzshrivastav.com
const parsedOrigin = !!Bun.env.AllowedOrigins
  ? Bun.env.AllowedOrigins?.split(",")
  : "";
app.use(
  cors({
    origin: parsedOrigin,
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 86400,
  })
);

// (Optional) If you want to handle preflight explicitly:
app.options("/api/send", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", parsedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});
// --- JSON body parsing
app.use(express.json());
// --- Owner routes
app.get("/", (_req, res) => res.send("OK"));
app.use("/owners", ownerRoutes);

// --- Ported Next.js handler -> Express route
app.post("/api/send/:key", async (req, res) => {
  const { key } = req.params;

  try {
    const { toEmail, firstName, message, subject } = req.body ?? {};

    const owner = new OwnerDTO().findByKeyId(key);

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
    //     from: `${owner?.getName} <${String(Bun.env.FROM_EMAIL)}>`,
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
    //     from: `${firstName} <${String(Bun.env.FROM_EMAIL)}>`,
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
        ({ clientEmail, ownerEmail, clientName, owner, ownerName, message }) =>
          resend.emails.send({
            from: `${ownerName} <${String(Bun.env.FROM_EMAIL)}>`,
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
          })
      )
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
});

// --- Start the server listening :
const PORT = Number(Bun.env.PORT || 3001);
const server = app.listen(PORT, () => {
  console.log(`✅ Bun/Express server listening on http://localhost:${PORT}`);
});

closeOnExit(server);
