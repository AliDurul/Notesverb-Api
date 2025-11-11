import { Router } from "express";
import * as tagController from "./tagController";
import { authenticateToken, validateRequest } from "@shared/middlewares";
import { createTagSchema, validateTagsSchema } from "./validations";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Tags CRUD Operations
router.post("/", validateRequest(createTagSchema), tagController.createTag);
router.get("/", tagController.getTags);
router.post("/:tagId", validateRequest(validateTagsSchema), tagController.validateTags);

export default router;