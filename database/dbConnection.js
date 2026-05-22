const { Pool } = require("pg");

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME || "car_hub",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    };

const pool = new Pool(poolConfig);
let initPromise;

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullname VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sell_cars (
      id SERIAL PRIMARY KEY,
      car_name VARCHAR(150) NOT NULL,
      model VARCHAR(100) NOT NULL,
      fuel_type VARCHAR(50) NOT NULL,
      body_type VARCHAR(50) NOT NULL,
      rate NUMERIC(12, 2) NOT NULL,
      document_photo TEXT NOT NULL,
      car_photos TEXT[] NOT NULL DEFAULT '{}',
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_sold BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE sell_cars
    ADD COLUMN IF NOT EXISTS is_sold BOOLEAN NOT NULL DEFAULT FALSE;

    CREATE TABLE IF NOT EXISTS service_bookings (
      id SERIAL PRIMARY KEY,
      service_type VARCHAR(100) NOT NULL,
      date VARCHAR(50) NOT NULL,
      location TEXT,
      wash_type VARCHAR(100),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id SERIAL PRIMARY KEY,
      fullname VARCHAR(150) NOT NULL,
      email VARCHAR(255) NOT NULL,
      bank_account VARCHAR(100) NOT NULL,
      payment_method VARCHAR(100) NOT NULL,
      car_details JSONB NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS user_sessions (
      sid VARCHAR PRIMARY KEY,
      sess JSONB NOT NULL,
      expire TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);
  `);
};

const dbConnection = async ({ exitOnFail = true } = {}) => {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await pool.query("SELECT NOW()");
    await createTables();
    console.log("PostgreSQL connected");
  })();

  try {
    return await initPromise;
  } catch (err) {
    initPromise = null;
    console.error("PostgreSQL connection error:", err.message);
    if (exitOnFail) {
      process.exit(1);
    }
    throw err;
  }
};

const ensureDatabase = async (req, res, next) => {
  try {
    await dbConnection({ exitOnFail: false });
    next();
  } catch (err) {
    const message = "Database connection failed. Check the deployed database environment variables.";

    if (req.accepts("html")) {
      return res.status(500).send(message);
    }

    return res.status(500).json({ error: message });
  }
};

module.exports = dbConnection;
module.exports.pool = pool;
module.exports.ensureDatabase = ensureDatabase;
