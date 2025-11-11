import { Router } from "express";
import * as noteController from "./noteController";
import { createNoteSchema, getNotesByUserSchema } from "./validations";
import { authenticateToken, validateRequest } from "@shared/middlewares";

const router = Router();

//All routes require authentication
router.use(authenticateToken);

//Notes CRUD Operations
router.post("/", validateRequest(createNoteSchema), noteController.createNote);
router.get("/", validateRequest(getNotesByUserSchema), noteController.getNotes);
router.get("/:noteId", noteController.getNoteById);

export default router;