const express = require("express");
const { body } = require("express-validator");
const {
  registerUser,
  loginUser,
  getMe,
  updateMe,
} = require("../controllers/authController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

// registration route
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("phone")
      .optional()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be 10 digits"),
  ],
  validate,
  registerUser,
);

// login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser,
);

// PATCH is used instead of PUT because updateMe is a partial update
router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);

module.exports = router;
