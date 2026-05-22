import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";

import { closeOnExit } from "@/db/database";
import { ownerRoute, emailRoute, userRoute } from "./routes";
import rateLimit from "express-rate-limit";

const app = express();

// ... everything in sections 1–6 stays exactly the same ...

// --- 7. Start the server listening (the adapter forwards requests to this port)
const PORT = Number(process.env.PORT || 3001);

const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on :${PORT}`);
});

closeOnExit(server);
