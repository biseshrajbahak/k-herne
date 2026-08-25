const { validationResult } = require("express-validator");

// Middleware to check validation errors from express-validator
// Runs after express validator check() middlewares
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",

      // Return only the field name and validation error message
      // eg: field: email, message: Please provide a valid email
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }

  // If validation passes, continue to the next middleware
  next();
};

module.exports = validate;
