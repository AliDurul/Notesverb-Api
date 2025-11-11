import { Request, Response } from "express";
import { UserService } from "./userService";
import { createErrorResponse, createSuccessResponse } from "@shared/utils";
import { asyncHandler } from "@shared/middlewares";

const userService = new UserService();

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json(createErrorResponse("User not authenticated"));
  }

  const profile = await userService.getProfile(userId);

  return res
    .status(200)
    .json(
      createSuccessResponse(profile, "User profile retrieved successfully")
    );
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res
      .status(401)
      .json(createErrorResponse("User not authenticated"));
  }

  const profile = await userService.updateProfile(userId, req.body);

  return res
    .status(200)
    .json(
      createSuccessResponse(profile, "User profile updated successfully")
    );
}
);

export const createProfile = asyncHandler(async (req: Request, res: Response) => {

    const profile = await userService.createProfile(req.body);

    res
      .status(201)
      .json(createSuccessResponse(profile, "User profile created successfully"));
  }
);

export const deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    console.log('userId', req.user);

    if (!userId) {
      return res
        .status(401)
        .json(createErrorResponse("User not authenticated"));
    }

    await userService.deleteProfile(userId);

    return res.status(204).json(createSuccessResponse(null, "Profile deleted")); // No content response
  }
);