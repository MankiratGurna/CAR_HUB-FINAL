const { pool } = require("../database/dbConnection");

const mapCar = (row) => ({
  _id: row.id,
  id: row.id,
  carName: row.car_name,
  model: row.model,
  fuelType: row.fuel_type,
  bodyType: row.body_type,
  rate: Number(row.rate),
  documentPhoto: row.document_photo,
  carPhotos: row.car_photos || [],
  userId: row.user_id,
  isSold: row.is_sold,
  createdAt: row.created_at,
  toObject() {
    return {
      _id: this._id,
      id: this.id,
      carName: this.carName,
      model: this.model,
      fuelType: this.fuelType,
      bodyType: this.bodyType,
      rate: this.rate,
      documentPhoto: this.documentPhoto,
      carPhotos: this.carPhotos,
      userId: this.userId,
      isSold: this.isSold,
      createdAt: this.createdAt,
    };
  },
});

class SellCar {
  constructor({ carName, model, fuelType, bodyType, rate, documentPhoto, carPhotos, userId }) {
    this.carName = carName;
    this.model = model;
    this.fuelType = fuelType;
    this.bodyType = bodyType;
    this.rate = rate;
    this.documentPhoto = documentPhoto;
    this.carPhotos = carPhotos;
    this.userId = userId;
  }

  async save() {
    const result = await pool.query(
      `INSERT INTO sell_cars
        (car_name, model, fuel_type, body_type, rate, document_photo, car_photos, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        this.carName,
        this.model,
        this.fuelType,
        this.bodyType,
        this.rate,
        this.documentPhoto,
        this.carPhotos,
        this.userId,
      ]
    );
    Object.assign(this, mapCar(result.rows[0]));
    return this;
  }

  static async find(query = {}) {
    const hasUserId = Object.prototype.hasOwnProperty.call(query, "userId");
    const result = hasUserId
      ? await pool.query("SELECT * FROM sell_cars WHERE user_id = $1 ORDER BY created_at DESC", [query.userId])
      : await pool.query("SELECT * FROM sell_cars WHERE is_sold = FALSE ORDER BY created_at DESC");

    return result.rows.map(mapCar);
  }

  static async findById(id) {
    const result = await pool.query("SELECT * FROM sell_cars WHERE id = $1 LIMIT 1", [id]);
    return result.rows[0] ? mapCar(result.rows[0]) : null;
  }

  static async findByIdAndDelete(id) {
    await pool.query("DELETE FROM sell_cars WHERE id = $1", [id]);
  }

  static async markAsSold(id) {
    await pool.query("UPDATE sell_cars SET is_sold = TRUE WHERE id = $1", [id]);
  }
}

module.exports = SellCar;
