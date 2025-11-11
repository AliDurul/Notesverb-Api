import {
  createServiceError,
  isValidUUID,
  sanitizeInput,
} from "@shared/utils";
import { CreateTagRequest, Tag } from "@shared/types";
import prisma from "./database";

export class TagsService {
  async createTag(userId: string, tagData: CreateTagRequest): Promise<Tag> {
    // Sanitize and validate the tag data
    const sanitizedName = sanitizeInput(tagData.name);
    const sanitizedColor = tagData.color
      ? sanitizeInput(tagData.color)
      : undefined;

    // Validate color format if provided ( hex color format )
    if (sanitizedColor && !this.isValidHexColor(sanitizedColor)) {
      throw createServiceError(
        "Invalid color format, Use hex color format (eg: #FF5733 or #F73)",
        400
      );
    }

    try {
      // create tag
      const tag = await prisma.tag.create({
        data: {
          userId,
          name: sanitizedName,
          color: sanitizedColor,
        },
      });

      return tag as Tag;
    } catch (error) {
      // handle unique constaraint violation error
      if (error.code === "P2002") {
        throw createServiceError("Tag name already exists", 409);
      }
      throw createServiceError("Failed to create tag", 500);
    }
  }

  async getTagById(tagId: string, userId: string): Promise<Tag> {
    if (!isValidUUID(tagId)) {
      throw createServiceError("Invalid tag id", 400);
    }

    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });

    if (!tag) {
      throw createServiceError("Tag not found", 404);
    }

    return tag as Tag;
  }

  async getTagsByUser(
    page: number = 1,
    limit: number = 50,
    search?: string,
    userId?: string
  ): Promise<{
    tags: Tag[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // build where clause
    const whereClause: any = {
      userId,
    };

    // add search functionality
    if (search) {
      const sanitizedSearch = sanitizeInput(search);
      whereClause.name = {
        contains: sanitizedSearch,
        mode: "insensitive",
      };
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: "asc" }, // sorct tags alphebetically
      }),
      prisma.tag.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      tags: tags as Tag[],
      total,
      page,
      totalPages,
    };
  }

  async validateTags(
    tagIds: string[],
    userId: string
  ): Promise<{
    validTags: Tag[];
    invalidTagIds: string[];
  }> {
    const validTags: Tag[] = [];
    const invalidTagIds: string[] = [];

    for (const tagId of tagIds) {
      if (!isValidUUID(tagId)) {
        invalidTagIds.push(tagId);
        continue;
      }

      try {
        const tag = await this.getTagById(tagId, userId);
        validTags.push(tag);
      } catch (error) {
        invalidTagIds.push(tagId);
      }
    }

    return { validTags, invalidTagIds };
  }

  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }
}