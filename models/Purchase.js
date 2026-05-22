const { pool } = require("../database/dbConnection");

const mapPurchase = (row) => ({
  _id: row.id,
  id: row.id,
  fullname: row.fullname,
  email: row.email,
  bankAccount: row.bank_account,
  paymentMethod: row.payment_method,
  carDetails: row.car_details,
  userId: row.user_id,
  createdAt: row.created_at,
});

class Purchase {
  constructor({ fullname, email, bankAccount, paymentMethod, carDetails, userId }) {
    this.fullname = fullname;
    this.email = email;
    this.bankAccount = bankAccount;
    this.paymentMethod = paymentMethod;
    this.carDetails = carDetails;
    this.userId = userId;
  }

  async save() {
    const result = await pool.query(
      `INSERT INTO purchases
        (fullname, email, bank_account, payment_method, car_details, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        this.fullname,
        this.email,
        this.bankAccount,
        this.paymentMethod,
        JSON.stringify(this.carDetails),
        this.userId,
      ]
    );
    Object.assign(this, mapPurchase(result.rows[0]));
    return this;
  }

  static async find(query = {}) {
    const hasUserId = Object.prototype.hasOwnProperty.call(query, "userId");
    const result = hasUserId
      ? await pool.query("SELECT * FROM purchases WHERE user_id = $1 ORDER BY created_at DESC", [query.userId])
      : await pool.query("SELECT * FROM purchases ORDER BY created_at DESC");

    return result.rows.map(mapPurchase);
  }
}

module.exports = Purchase;
