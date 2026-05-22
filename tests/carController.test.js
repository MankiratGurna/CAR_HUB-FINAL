const mockSavePurchase = jest.fn();
const mockFindById = jest.fn();
const mockMarkAsSold = jest.fn();

jest.mock("../models/SellCar", () => ({
  findById: mockFindById,
  markAsSold: mockMarkAsSold,
}));

jest.mock("../models/Purchase", () =>
  jest.fn().mockImplementation((data) => ({
    ...data,
    save: mockSavePurchase,
  }))
);

const Purchase = require("../models/Purchase");
const carController = require("../controller/carController");

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("carController.buyCar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("saves purchase and marks car as sold without deleting sell_cars record", async () => {
    const car = {
      id: 12,
      carName: "Thar",
      toObject: jest.fn().mockReturnValue({ id: 12, carName: "Thar" }),
    };
    mockFindById.mockResolvedValueOnce(car);
    mockSavePurchase.mockResolvedValueOnce();
    mockMarkAsSold.mockResolvedValueOnce();

    const req = {
      params: { id: "12" },
      body: {
        fullname: "Jack",
        email: "jack@example.com",
        bankAccount: "123456789",
        paymentMethod: "card",
      },
      session: { userId: 7 },
    };
    const res = createResponse();

    await carController.buyCar(req, res);

    expect(mockFindById).toHaveBeenCalledWith("12");
    expect(Purchase).toHaveBeenCalledWith({
      fullname: "Jack",
      email: "jack@example.com",
      bankAccount: "123456789",
      paymentMethod: "card",
      carDetails: { id: 12, carName: "Thar" },
      userId: 7,
    });
    expect(mockSavePurchase).toHaveBeenCalled();
    expect(mockMarkAsSold).toHaveBeenCalledWith("12");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Car purchased successfully!" });
  });

  test("returns 404 when car is not found", async () => {
    mockFindById.mockResolvedValueOnce(null);

    const req = {
      params: { id: "999" },
      body: {},
      session: { userId: 7 },
    };
    const res = createResponse();

    await carController.buyCar(req, res);

    expect(mockSavePurchase).not.toHaveBeenCalled();
    expect(mockMarkAsSold).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Car not found or already sold" });
  });
});
