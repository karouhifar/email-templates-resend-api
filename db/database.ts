import { Database } from "bun:sqlite";
import { nanoid } from "nanoid";

const DB_PATH = Bun.env.DB_PATH;

export const db = new Database(DB_PATH, { create: true, strict: true });

// Initialize the database with a sample table if it doesn't exist
// *
// Owners table to manage email owners
// **
export function initDb() {
  db.run(`
  CREATE TABLE IF NOT EXISTS owners (
    key_id     TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    IsOwner    INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);
  const seed = db.prepare(`
    INSERT OR IGNORE INTO owners (key_id, name, email)
    VALUES (?, ?, ?)
`);

  const seedData = [
    {
      key_id: nanoid(10),
      name: "Ritz Shrivastav",
      email: "hritika12245@gmail.com",
    },
    {
      key_id: nanoid(10),
      name: "Kamyab Rouhifar",
      email: "karouhifar@gmail.com",
    },
    {
      key_id: nanoid(10),
      name: "Mini",
      email: "mini@dreamsdigital.ca",
    },
  ];
  db.transaction((data: typeof seedData) => {
    console.log(data);
    for (const row of data) seed.run(row.key_id, row.name, row.email);
    console.log("Database initialized and seeded !!!!");
  })(seedData);
  // eslint-disable-next-line no-console
}

export function closeDb() {
  try {
    db.close();
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
