import { Request, Response } from "express";
import { asyncHandler } from "@shared/middlewares";
import { TagsService } from "./tagService";
import {
    createErrorResponse,
    createSuccessResponse,
} from "@shared/utils";

const tagsService = new TagsService();

export const createTag = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const tag = await tagsService.createTag(userId, req.body);

    return res
        .status(201)
        .json(createSuccessResponse(tag, "Tag created successfully"));
});

export const getTags = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const search = req.query.search as string;

    const result = await tagsService.getTagsByUser(page, limit, search, userId);

    return res.status(200).json(
        createSuccessResponse(
            {
                tags: result.tags,
                pagination: {
                    page: result.page,
                    limit,
                    total: result.total,
                    totalPages: result.totalPages,
                },
            },
            "Tags retrieved successfully"
        )
    );
});

export const getTagById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { tagId } = req.params;

    if (!userId) {
        return res.status(401).json(createErrorResponse("Unauthorized"));
    }

    const tag = await tagsService.getTagById(tagId, userId);

    return res
        .status(200)
        .json(createSuccessResponse(tag, "Tag retrieved successfully"));
});

export const validateTags = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json(createErrorResponse("Unauthorized"));
        }

        const { tagIds } = req.body;

        const result = await tagsService.validateTags(tagIds, userId);

        return res
            .status(200)
            .json(createSuccessResponse(result, "Tags validated successfully"));
    }
);