import * as userController from "./userController";
import { Router } from "express";
import { createProfileSchema, updateProfileSchema } from "./validations";
import { authenticateToken, validateRequest } from "@shared/middlewares";

const router = Router();

// Protected routes (requires authentication)
router.get("/", authenticateToken, userController.getProfile);
router.post("/", validateRequest(createProfileSchema), userController.createProfile);
router.put("/", authenticateToken, validateRequest(updateProfileSchema), userController.updateProfile);
router.delete("/", authenticateToken, userController.deleteProfile);

export default router;