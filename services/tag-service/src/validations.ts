import Joi from "joi";

export const createTagSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required()
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .messages({
      "string.min": "Tag name must be at least 1 character long",
      "string.max": "Tag name must not exceed 50 characters",
      "string.pattern.base":
        "Tag name can only contain letters, numbers, spaces, hyphens, and underscores",
      "any.required": "Tag name is required",
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "Color must be a valid hex color format (e.g., #FF5733 or #F73)",
    }),
});

export const updateTagSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .optional()
    .messages({
      "string.min": "Tag name must be at least 1 character long",
      "string.max": "Tag name must not exceed 50 characters",
      "string.pattern.base":
        "Tag name can only contain letters, numbers, spaces, hyphens, and underscores",
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "Color must be a valid hex color format (e.g., #FF5733 or #F73)",
    }),
});

export const getTagsByUserSchema = Joi.object({
  page: Joi.number().integer().min(1).optional().default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit must not exceed 100",
    }),
  search: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Search term must be at least 1 character long",
    "string.max": "Search term must not exceed 100 characters",
  }),
});

export const validateTagsSchema = Joi.object({
  tagIds: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    "array.base": "Tag IDs must be an array",
    "array.min": "At least one tag ID is required",
    "string.uuid": "Each tag ID must be a valid UUID",
    "any.required": "Tag IDs are required",
  }),
});

export const tagIdParamSchema = Joi.object({
  tagId: Joi.string().uuid().required().messages({
    "string.uuid": "Tag ID must be a valid UUID",
    "any.required": "Tag ID is required",
  }),
});