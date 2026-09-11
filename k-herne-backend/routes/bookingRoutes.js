const express = require("express");
const { body } = require("express-validator");

const {
  createBooking,
  payForBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");

const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("eventId")
      .trim()
      .notEmpty()
      .withMessage("Event ID is required")
      .isMongoId()
      .withMessage("Invalid event id"),
    body("sectionName")
      .trim()
      .notEmpty()
      .withMessage("Section name is required"),
    body("quantity")
      .notEmpty()
      .withMessage("Quantity is required")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
  ],
  validate,
  createBooking,
);

router.get("/mine", protect, getMyBookings);
router.get("/:id", protect, getBookingById);
router.patch("/:id/pay", protect, payForBooking);
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;
