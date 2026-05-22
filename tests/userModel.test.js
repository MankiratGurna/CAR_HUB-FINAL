jest.mock("../database/dbConnection", () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require("../database/dbConnection");
const User = require("../models/user");

describe("User model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("saves a new user in PostgreSQL", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          fullname: "Jack",
          email: "jack@example.com",
          password: "hashed-password",
          created_at: new Date("2026-05-21"),
        },
      ],
    });

    const user = new User({
      fullname: "Jack",
      email: "jack@example.com",
      password: "hashed-password",
    });

    const savedUser = await user.save();

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), [
      "Jack",
      "jack@example.com",
      "hashed-password",
    ]);
    expect(savedUser.id).toBe(1);
    expect(savedUser.fullname).toBe("Jack");
  });

  test("finds a user by email or fullname for login", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          fullname: "Jack",
          email: "jack@example.com",
          password: "hashed-password",
          created_at: new Date("2026-05-21"),
        },
      ],
    });

    const user = await User.findOne({
      $or: [{ email: "jack" }, { fullname: "jack" }],
    });

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM users WHERE email = $1 OR fullname = $2 LIMIT 1",
      ["jack", "jack"]
    );
    expect(user.email).toBe("jack@example.com");
  });

  test("returns null when user is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const user = await User.findOne({ email: "missing@example.com" });

    expect(user).toBeNull();
  });
});
