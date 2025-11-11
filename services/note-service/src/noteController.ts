import { Request, Response } from "express";
import { NotesService } from "./noteService";
import {
    createErrorResponse,
    createSuccessResponse,
    parseEnvInt,
} from "@shared/utils";
import { asyncHandler } from "@shared/middlewares";

const noteService = new NotesService();

export const createNote = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    // Extract JWT token from auth he
    const authHeader = req.headers.authorization;
    const authToken = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : undefined;

    const note = await noteService.createNote(userId, req.body, authToken);

    return res
        .status(201)
        .json(createSuccessResponse(note, "Note created successfully"));
});

export const getNotes = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const page = parseEnvInt(req.query.page as string, 1);
    const limit = parseEnvInt(req.query.limit as string, 50);
    const search = req.query.search as string;

    const result = await noteService.getNotesByUser(userId, page, limit, search);

    return res
        .status(200)
        .json(createSuccessResponse(result, "Notes retrieved successfully"));
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { noteId } = req.params;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const note = await noteService.getNoteById(noteId, userId);

    return res
        .status(200)
        .json(createSuccessResponse(note, "Note retrieved successfully"));
});