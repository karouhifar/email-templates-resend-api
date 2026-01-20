import express from "express";
import cors, { type CorsOptions } from "cors";
import { closeOnExit, initDb } from "@/db/database";
import { ownerRoute, emailRoute } from "./routes";

const app = express();
initDb();

// --- CORS: ONLY allow https://ritzshrivastav.com
const parsedOrigin = !!process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : "";

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, cb) => {
    // origin can be undefined for server-to-server/curl/postman
    if (!origin) return cb(null, true);

    if (parsedOrigin.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));
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
