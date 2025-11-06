import { Router } from "express";
import * as authController from "./authController";
import { authenticateToken, validateRequest } from "@shared/middlewares";
import { loginSchema, refreshTokenSchema, registerSchema } from "./validations";

const router = Router();

//public routes
router.post("/login", validateRequest(loginSchema), authController.login);

router.post("/register", validateRequest(registerSchema), authController.register);

router.post("/refresh", validateRequest(refreshTokenSchema), authController.refreshTokens);

router.post("/logout", authController.logout);

// Token validation endpoint ( for other services to validate tokens )
router.post("/validate", authController.validateToken);

// Protected routes
// router.get("/profile", authenticateToken, authController.getProfile);
router.delete("/", authenticateToken, authController.deleteAccount);

export default router;