const session = require("express-session");
const { pool } = require("./dbConnection");

let tablePromise;

const ensureSessionTable = () => {
  if (!tablePromise) {
    tablePromise = pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMPTZ NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_sessions_expire ON user_sessions(expire);
    `);
  }

  return tablePromise;
};

class PgSessionStore extends session.Store {
  get(sid, callback) {
    ensureSessionTable()
      .then(() =>
        pool
      .query("SELECT sess FROM user_sessions WHERE sid = $1 AND expire > NOW()", [sid])
      )
      .then((result) => callback(null, result.rows[0]?.sess || null))
      .catch((err) => callback(err));
  }

  set(sid, sess, callback) {
    const maxAge = sess.cookie?.maxAge || 1000 * 60 * 60 * 24;
    const expire = new Date(Date.now() + maxAge);

    ensureSessionTable()
      .then(() =>
        pool
      .query(
        `INSERT INTO user_sessions (sid, sess, expire)
         VALUES ($1, $2, $3)
         ON CONFLICT (sid)
         DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`,
        [sid, sess, expire]
      )
      )
      .then(() => callback?.(null))
      .catch((err) => callback?.(err));
  }

  destroy(sid, callback) {
    ensureSessionTable()
      .then(() => pool
      .query("DELETE FROM user_sessions WHERE sid = $1", [sid])
      )
      .then(() => callback?.(null))
      .catch((err) => callback?.(err));
  }

  touch(sid, sess, callback) {
    const maxAge = sess.cookie?.maxAge || 1000 * 60 * 60 * 24;
    const expire = new Date(Date.now() + maxAge);

    ensureSessionTable()
      .then(() =>
        pool
      .query("UPDATE user_sessions SET expire = $2 WHERE sid = $1", [sid, expire])
      )
      .then(() => callback?.(null))
      .catch((err) => callback?.(err));
  }
}

module.exports = PgSessionStore;
