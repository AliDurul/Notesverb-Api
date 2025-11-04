import bcrypt from "bcryptjs";

// Mock the prisma database module first; return an object we can later access via require().
jest.mock("../src/database", () => {
  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  } as any;
  return { __esModule: true, default: prismaMock };
});

// Import after mocks are set up
const { AuthService } = require("../src/authService");
const mockPrisma = require("../src/database").default as any;

describe("AuthService - unit tests (prisma mocked)", () => {
  beforeEach(() => {
    // reset mocks between tests
    jest.clearAllMocks();
  });

  test("register: creates a new user and returns tokens", async () => {
    const service = new AuthService();

    // No existing user
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);

    // Simulate prisma creating a new user record
    mockPrisma.user.create.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
      password: "hashed_password",
    });

    // refresh token creation
    mockPrisma.refreshToken.create.mockResolvedValueOnce({
      id: "rt-1",
      token: "some-refresh-token",
      userId: "user-1",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const tokens = await service.register("alice@example.com", "secret123");

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");

    // Ensure prisma create was called with the provided email
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ email: "alice@example.com" }),
      })
    );
  });

  test("register: throws if user already exists", async () => {
    const service = new AuthService();

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-1",
      email: "alice@example.com",
    });

    await expect(
      service.register("alice@example.com", "secret123")
    ).rejects.toMatchObject({ message: "User already exists", statusCode: 409 });
  });

  test("login: successful returns tokens", async () => {
    const service = new AuthService();

    const plain = "password1";
    const hashed = await bcrypt.hash(plain, parseInt(process.env.BCRYPT_ROUNDS || "1", 10));

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-99",
      email: "bob@example.com",
      password: hashed,
    });

    mockPrisma.refreshToken.create.mockResolvedValueOnce({
      id: "rt-99",
      token: "rt-99",
      userId: "user-99",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const tokens = await service.login("bob@example.com", plain);

    expect(tokens).toHaveProperty("accessToken");
    expect(tokens).toHaveProperty("refreshToken");
  });

  test("login: invalid password throws", async () => {
    const service = new AuthService();

    const hashed = await bcrypt.hash("some-other-pass", 1);

    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: "user-100",
      email: "charlie@example.com",
      password: hashed,
    });

    await expect(
      service.login("charlie@example.com", "wrong-password")
    ).rejects.toMatchObject({ message: "Invalid email or password", statusCode: 401 });
  });

  test("validateToken: valid access token returns payload", async () => {
    const service = new AuthService();

    // Prepare a user and ensure prisma returns it when validateToken checks
    const userId = "user-777";
    const email = "dave@example.com";

    // Mock findUnique for login
    const hashed = await bcrypt.hash("pwd777", 1);
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: userId, email, password: hashed });
    mockPrisma.refreshToken.create.mockResolvedValueOnce({ id: "rt-777", token: "r777", userId, expiresAt: new Date() });

    // Login to get tokens
    const tokens = await service.login(email, "pwd777");

    // Now when validateToken calls prisma.user.findUnique it should find the user
    mockPrisma.user.findUnique.mockResolvedValueOnce({ id: userId, email });

    const payload = await service.validateToken(tokens.accessToken);

    expect(payload).toHaveProperty("userId", userId);
    expect(payload).toHaveProperty("email", email);
  });
});
