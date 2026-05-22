import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { closeOnExit } from "@/db/database";
import { ownerRoute, emailRoute, userRoute } from "./routes";

const app = express();

app.set("trust proxy", 1);

const parsedOrigin =
  process.env.ALLOWED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];

if (parsedOrigin.length === 0) {
  throw new Error("ALLOWED_ORIGINS env var is not set or empty!");
}

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);

    if (parsedOrigin.includes(origin)) {
      return cb(null, true);
    }

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(helmet());
app.use(express.json({ limit: "10kb" }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

app.use(globalLimiter);

app.get("/", (_req, res) => res.status(200).send("OK"));
app.get("/health", (_req, res) => res.status(200).json({ status: "healthy" }));

app.use("/owners", ownerRoute);
app.use("/user", userRoute);
app.use("/api", emailRoute);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: "Something went wrong." });
  },
);

const PORT = Number(process.env.PORT || 8080);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Bun/Express server listening on port ${PORT}`);
});

closeOnExit(server);
