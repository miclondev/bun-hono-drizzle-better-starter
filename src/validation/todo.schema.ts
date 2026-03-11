import Joi from "joi";

// Schema for creating a new todo
export const createTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least {#limit} characters",
    "string.max": "Title cannot exceed {#limit} characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(1).max(500).required().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least {#limit} characters",
    "string.max": "Description cannot exceed {#limit} characters",
    "any.required": "Description is required",
  }),
});

// Schema for updating a todo
export const updateTodoSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least {#limit} characters",
    "string.max": "Title cannot exceed {#limit} characters",
  }),
  description: Joi.string().trim().min(1).max(500).messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least {#limit} characters",
    "string.max": "Description cannot exceed {#limit} characters",
  }),
  completed: Joi.boolean().messages({
    "boolean.base": "Completed status must be a boolean",
  }),
}).min(1); // At least one field must be provided
