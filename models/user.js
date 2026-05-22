const { pool } = require("../database/dbConnection");

const mapUser = (row) => ({
  _id: row.id,
  id: row.id,
  fullname: row.fullname,
  email: row.email,
  password: row.password,
  createdAt: row.created_at,
});

class User {
  constructor({ fullname, email, password }) {
    this.fullname = fullname;
    this.email = email;
    this.password = password;
  }

  async save() {
    const result = await pool.query(
      `INSERT INTO users (fullname, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [this.fullname, this.email, this.password]
    );
    Object.assign(this, mapUser(result.rows[0]));
    return this;
  }

  static async findOne(query) {
    let result;

    if (query.email) {
      result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [query.email]);
    } else if (query.$or) {
      const email = query.$or.find((item) => item.email)?.email;
      const fullname = query.$or.find((item) => item.fullname)?.fullname;
      result = await pool.query(
        "SELECT * FROM users WHERE email = $1 OR fullname = $2 LIMIT 1",
        [email, fullname]
      );
    } else {
      return null;
    }

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }
}

module.exports = User;
