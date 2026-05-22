jest.mock("../database/dbConnection", () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require("../database/dbConnection");
const SellCar = require("../models/SellCar");

const carRow = {
  id: 10,
  car_name: "Fortuner",
  model: "2024",
  fuel_type: "Diesel",
  body_type: "SUV",
  rate: "3500000.00",
  document_photo: "/uploads/doc.pdf",
  car_photos: ["/uploads/car.jpg"],
  user_id: 4,
  is_sold: false,
  created_at: new Date("2026-05-21"),
};

describe("SellCar model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("saves a car listing with uploaded file paths", async () => {
    pool.query.mockResolvedValueOnce({ rows: [carRow] });

    const car = new SellCar({
      carName: "Fortuner",
      model: "2024",
      fuelType: "Diesel",
      bodyType: "SUV",
      rate: 3500000,
      documentPhoto: "/uploads/doc.pdf",
      carPhotos: ["/uploads/car.jpg"],
      userId: 4,
    });

    const savedCar = await car.save();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO sell_cars"), [
      "Fortuner",
      "2024",
      "Diesel",
      "SUV",
      3500000,
      "/uploads/doc.pdf",
      ["/uploads/car.jpg"],
      4,
    ]);
    expect(savedCar.id).toBe(10);
    expect(savedCar.carPhotos).toEqual(["/uploads/car.jpg"]);
  });

  test("lists only unsold cars for stock page", async () => {
    pool.query.mockResolvedValueOnce({ rows: [carRow] });

    const cars = await SellCar.find({});

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM sell_cars WHERE is_sold = FALSE ORDER BY created_at DESC");
    expect(cars[0].isSold).toBe(false);
  });

  test("keeps purchased car in sell_cars by marking it sold", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    await SellCar.markAsSold(10);

    expect(pool.query).toHaveBeenCalledWith("UPDATE sell_cars SET is_sold = TRUE WHERE id = $1", [10]);
  });
});
