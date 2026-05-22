const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "car_hub",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

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
  `);
};

const dbConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    await createTables();
    console.log("PostgreSQL connected");
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
};

module.exports = dbConnection;
module.exports.pool = pool;
