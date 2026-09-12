const express = require("express");
const { protect, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
  createEventValidators,
  updateEventValidators,
} = require("../validators/eventValidators");

const {
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const {
  getAllBookings,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

const router = express.Router();

// Admin Authentication
router.use(protect, adminOnly);

// Event Management
router.post("/events", createEventValidators, validate, createEvent);
router.patch("/events/:id", updateEventValidators, validate, updateEvent);
router.delete("/events/:id", deleteEvent);

// Booking management
router.get("/bookings", getAllBookings);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;
