// Route-level validation for the admin endpoints (create/update)
// Could be easily done inline like in authRoutes.js
// But created separate file since createEvent alone needed 10+ rules

const { body } = require("express-validator");
const {
  isValidDateFormat,
  isValidTimeFormat,
} = require("../utils/dateTimeValidators");

const categories = ["concert", "comedy", "conference", "sports", "other"];

// Used by POST /admin/events while creating the event
// Every required field must be present and valid
const createEventValidators = [
  body("title").trim().notEmpty().withMessage("Event title is required"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(categories)
    .withMessage("Invalid category"),

  body("venue").trim().notEmpty().withMessage("Event venue is required"),

  body("location").trim().notEmpty().withMessage("Event location is required"),

  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .custom(isValidDateFormat)
    .withMessage("Date must be in YYYY-MM-DD format and a real date"),

  body("time")
    .notEmpty()
    .withMessage("Time is required")
    .custom(isValidTimeFormat)
    .withMessage("Time must be in HH:mm 24-hour format"),

  body("performers")
    .optional()
    .isArray()
    .withMessage("Performers must be an array"),

  body("sections")
    .isArray({ min: 1 })
    .withMessage("At least one section is required"),

  body("sections.*.name")
    .trim()
    .notEmpty()
    .withMessage("Each section must have a name"),

  body("sections.*.price")
    .isFloat({ min: 0 })
    .withMessage("Each section's price must be a positive number"),

  body("sections.*.totalSeats")
    .isInt({ min: 0 })
    .withMessage("Each section's totalSeats must be a positive whole number"),
];

// Used in PATCH /admin/events/:id while updating the event
// Every field is optional (partial update)
// But if a field is sent, it still has to be valid
const updateEventValidators = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty")
    .isIn(categories)
    .withMessage("Invalid category"),

  body("venue")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Venue cannot be empty"),

  body("location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Location cannot be empty"),

  body("date")
    .optional()
    .custom(isValidDateFormat)
    .withMessage("Date must be in YYYY-MM-DD format and a real date"),

  body("time")
    .optional()
    .custom(isValidTimeFormat)
    .withMessage("Time must be in HH:mm 24-hour format"),

  body("performers")
    .optional()
    .isArray()
    .withMessage("Performers must be an array"),

  body("sections")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one section is required"),

  body("sections.*.name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Each section must have a name"),

  body("sections.*.price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Each section's price must be a positive number"),

  body("sections.*.totalSeats")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Each section's totalSeats must be a positive whole number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),
];

module.exports = {
  createEventValidators,
  updateEventValidators,
};
