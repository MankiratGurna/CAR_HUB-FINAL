const { pool } = require("../database/dbConnection");

const mapBooking = (row) => ({
  _id: row.id,
  id: row.id,
  serviceType: row.service_type,
  date: row.date,
  location: row.location,
  washType: row.wash_type,
  userId: row.user_id,
  createdAt: row.created_at,
});

class ServiceBooking {
  constructor({ serviceType, date, location, washType, userId }) {
    this.serviceType = serviceType;
    this.date = date;
    this.location = location;
    this.washType = washType;
    this.userId = userId;
  }

  async save() {
    const result = await pool.query(
      `INSERT INTO service_bookings (service_type, date, location, wash_type, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [this.serviceType, this.date, this.location || null, this.washType || null, this.userId]
    );
    Object.assign(this, mapBooking(result.rows[0]));
    return this;
  }

  static async find(query = {}) {
    const hasUserId = Object.prototype.hasOwnProperty.call(query, "userId");
    const result = hasUserId
      ? await pool.query("SELECT * FROM service_bookings WHERE user_id = $1 ORDER BY created_at DESC", [
          query.userId,
        ])
      : await pool.query("SELECT * FROM service_bookings ORDER BY created_at DESC");

    return result.rows.map(mapBooking);
  }
}

module.exports = ServiceBooking;
