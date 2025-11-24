import { nanoid } from "nanoid";
import { prisma } from "@/utils/prisma";

const seedData = [
  {
    name: "Ritz Shrivastav",
    email: "hritika12245@gmail.com",
  },
  {
    name: "Kamyab Rouhifar",
    email: "karouhifar@gmail.com",
  },
  {
    name: "Mini",
    email: "support@dreamsdigital.ca",
  },
];

// Initialize the database with a sample table if it doesn't exist
// *
// Owners table to manage email owners
// **
export async function initDb() {
  await prisma.owner.createMany({
    data: seedData.map((KeyObject) => ({ ...KeyObject, key_id: nanoid(10) })),
    skipDuplicates: true,
  });
}

export async function closeDb() {
  try {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("SQLite connection closed.");
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to close DB:", e);
  }
}

/** Call this once in case of exiting node eventEmitter to close DB + server gracefully */
export function closeOnExit(server: import("http").Server) {
  const shutdown = (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received — shutting down...`);
    server.close(() => {
      closeDb();
      console.log(`\n${signal} received — Database closed...`);
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    shutdown("unhandledRejection");
  });
}
