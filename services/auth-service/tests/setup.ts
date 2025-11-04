// Test setup: set env vars for JWT and bcrypt to deterministic, fast values
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_jwt_refresh_secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || "1";

// Optional: increase test timeout if CI is slow
jest.setTimeout(10000);
