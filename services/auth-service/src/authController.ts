import { Request, Response } from "express";
import { AuthService } from "./authService";
import {
  createServiceError,
  createSuccessResponse,
} from "@shared/utils";
import { asyncHandler } from "@shared/middlewares";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.register(email, password);

  res
    .status(201)
    .json(createSuccessResponse(tokens, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const tokens = await authService.login(email, password);

  res
    .status(200)
    .json(createSuccessResponse(tokens, "User logged in successfully"));
});

export const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res
    .status(200)
    .json(createSuccessResponse(tokens, "Tokens refreshed successfully"));
}
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logout(refreshToken);

  res
    .status(200)
    .json(createSuccessResponse(null, "User logged out successfully"));
});

export const validateToken = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw createServiceError("No token provided", 401);
  }

  const payload = await authService.validateToken(token);

  return res.status(200).json(createSuccessResponse(payload, "Token is valid"));
}
);

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const credentialId = req.user?.credentialId;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!credentialId) {
    throw createServiceError("Unauthorized", 401);
  }

  await authService.deleteUser(credentialId, token);

  return res
    .status(200)
    .json(createSuccessResponse(null, "Account deleted successfully"));
}
);