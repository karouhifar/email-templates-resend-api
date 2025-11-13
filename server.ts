import express from "express";
import cors from "cors";
import { Resend } from "resend";
import React from "react";
import EmailTemplate from "./template/EmailTemplate";
import ownerRoutes from "./routes/owner.routes";
import { closeOnExit, initDb } from "./db/database";
import { OwnerDTO } from "./model";

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
    if (!toEmail || !owner) {
      return res.status(400).json({ ok: false, error: "Missing toEmail" });
    }

    const { data, error } = await resend.batch.send([
      {
        from: `${owner.getName} <${String(Bun.env.FROM_EMAIL)}>`,
        to: [toEmail],
        subject: subject ?? "Thanks for reaching out!",
        // You can pass a React element directly:
        react: React.createElement(EmailTemplate, {
          firstName: firstName ?? "Friend",
          message: message ?? "It works! 🎉",
        }),
      },
      {
        from: `${firstName} <${String(Bun.env.FROM_EMAIL)}>`,
        to: [owner.getEmail],
        subject: subject ?? "Thanks for reaching out!",
        react: React.createElement(EmailTemplate, {
          firstName: firstName ?? "Friend",
          owner: owner.getIsOwner === 1,
          message: message ?? "It works! 🎉",
        }),
      },
    ]);

    if (error) {
      return res.status(500).json({ ok: false, error });
    }

    return res.status(200).json({ ok: true, data });
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
