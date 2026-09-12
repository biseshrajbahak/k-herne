const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Event = require("../models/Event");

// Get all bookings

const getAllBookings = asyncHandler(async (req, res) => {
  const { event, user, status, paymentStatus } = req.query;

  const filter = {};

  if (event) filter.event = event;
  if (user) filter.user = user;
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const bookings = await Booking.find(filter)
    .populate("user", "name email phone")
    .populate("event", "title date time venue location")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// Get all user

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users,
  });
});

// Get user by id

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    data: user,
  });
});

// Update user's profile

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { role, isActive, name, phone } = req.body;

  if (role && !["admin", "user"].includes(role)) {
    res.status(400);
    throw new Error("Role can only be user or admin");
  }

  // Preventing an admin from locking themselves out by demoting/deactivating

  if (
    user._id.toString() === req.user._id.toString() &&
    (role === "user" || isActive === false)
  ) {
    res.status(400);
    throw new Error("Admins can't demote or deactivate their own account");
  }

  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;

  const updated = await user.save();

  res.json({
    success: true,
    data: updated,
  });
});

// Delete a user

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Preventing an admin from deleting their own account

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Admin can't delete their own account");
  }
  await user.deleteOne();
  res.json({
    success: true,
    message: "Accound deleted successfully",
  });
});

module.exports = {
  getAllBookings,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
