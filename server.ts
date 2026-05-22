import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";

import { closeOnExit, initDb } from "@/db/database";
import { ownerRoute, emailRoute, userRoute } from "./routes";
import rateLimit from "express-rate-limit";

const app = express();
// initDb();

// --- 1. CORS Setup:
const parsedOrigin = !!process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  : "";

if (parsedOrigin.length === 0) {
  throw new Error("ALLOWED_ORIGINS env var is not set or empty!");
}

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, cb) => {
    // origin can be undefined for server-to-server/curl/postman
    if (!origin) return cb(null, true);

    if (parsedOrigin.includes(origin)) return cb(null, true);

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  methods: ["GET", "POST"],
  exposedHeaders: [],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400, // 24 hours
};
app.use(cors(corsOptions));
// ---  2. HELMET — secure HTTP headers
app.use(helmet());
// --- 3. JSON body parsing
app.use(express.json({ limit: "10kb" }));
// --- 4. RATE LIMITING:
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);
// --- 5. Owner routes
app.get("/", (_req, res) => res.send("OK"));
app.use("/owners", ownerRoute);
app.use("/user", userRoute);
app.use("/api", emailRoute);
// --- 6. Global error handler (must be last middleware):
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err); // log internally
    res.status(500).json({ error: "Something went wrong." }); // generic to client
  },
);

// ---7.  Start the server listening :
const PORT = Number(process.env.PORT || 3001);
const server = app.listen(PORT, () => {
  console.log(`✅ Bun/Express server listening on http://localhost:${PORT}`);
});

closeOnExit(server);
