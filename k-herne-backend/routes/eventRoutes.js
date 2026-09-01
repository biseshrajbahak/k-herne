const express = require("express");
const {
  getAllEvents,
  getEventById,
} = require("../controllers/eventController");

const router = express.Router();

// Public routes
router.get("/", getAllEvents);
router.get("/:id", getEventById);

module.exports = router;
