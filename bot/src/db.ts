import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  pool.on("error", (err) => {
    console.error("[db] pool error:", err);
  });
}

export async function initDb(): Promise<void> {
  if (!pool) {
    console.warn("[db] DATABASE_URL not set — persistence disabled");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      telegram_id BIGINT PRIMARY KEY,
      username    TEXT,
      first_name  TEXT,
      last_name   TEXT,
      language    TEXT,
      first_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  console.log("[db] ready");
}

export interface TgUser {
  id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language_code?: string;
}

export async function recordUser(user: TgUser): Promise<void> {
  if (!pool) return;

  await pool.query(
    `INSERT INTO users (telegram_id, username, first_name, last_name, language)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (telegram_id) DO UPDATE SET
       username   = EXCLUDED.username,
       first_name = EXCLUDED.first_name,
       last_name  = EXCLUDED.last_name,
       language   = EXCLUDED.language,
       last_seen  = NOW()`,
    [user.id, user.username ?? null, user.first_name ?? null, user.last_name ?? null, user.language_code ?? null],
  );
}
