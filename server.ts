import express from "express";
import cors from "cors";
import { closeOnExit, initDb } from "@/db/database";
import { ownerRoute, emailRoute } from "./routes";

const app = express();
initDb();

// --- CORS: ONLY allow https://ritzshrivastav.com
const parsedOrigin = !!process.env.AllowedOrigins
  ? process.env.AllowedOrigins?.split(",")
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
app.use("/owners", ownerRoute);
app.use("/api", emailRoute);

// --- Start the server listening :
const PORT = Number(process.env.PORT || 3001);
const server = app.listen(PORT, () => {
  console.log(`✅ Bun/Express server listening on http://localhost:${PORT}`);
});

closeOnExit(server);
