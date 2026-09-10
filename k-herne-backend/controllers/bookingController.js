const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const generateBookingCode = require("../utils/generateBookingCode");

const createBooking = asyncHandler(async (req, res) => {
  const { eventId, sectionName, quantity } = req.body;

  if (!eventId || !sectionName || !quantity) {
    res.status(400);
    throw new Error("eventId, sectionName and quantity are required");
  }

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  // MongoDB transaction - used when you want several database operations to behave as one unit
  // If one operation fails, all previously completed operations are rolled back
  // .session(session) means put this database operation inside that transaction

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const event = await Event.findById(eventId).session(session);

    if (!event || !event.isActive) {
      res.status(404);
      throw new Error("Event not found");
    }

    const section = event.sections.find((s) => s.name === sectionName);

    if (!section) {
      res.status(404);
      throw new Error("Enter valid section");
    }

    const availableSeats = section.totalSeats - section.bookedSeats;

    if (quantity > availableSeats) {
      res.status(400);
      throw new Error(
        `Only ${availableSeats} seats available in ${sectionName}`,
      );
    }

    const totalPrice = quantity * section.price;
    section.bookedSeats += quantity;

    // Save the changes in event to MongoDB, as part of the current transaction
    await event.save({ session });

    const [booking] = await Booking.create(
      [
        {
          user: req.user._id,
          event: eventId,
          sectionName,
          quantity,
          totalPrice,
          bookingCode: generateBookingCode(),
          status: "pending",
          paymentStatus: "pending",
        },
      ],
      { session },
    );
    // Transaction successful, so permanently apply all the database changes
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    // Transaction failed. Undo all the database changes made during this transaction
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

// Mock payment for bookings

const payForBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("User not authorized to pay this booking");
  }

  if (booking.status === "cancelled") {
    res.status(400);
    throw new Error("Can't pay for a cancelled booking");
  }

  if (booking.paymentStatus === "paid") {
    res.status(400);
    throw new Error("Payment already confirmed");
  }

  // Mock payment
  booking.paymentStatus = "paid";
  booking.status = "confirmed";
  await booking.save();

  res.json({
    success: true,
    data: booking,
  });
});

// Get logged in user's all bookings

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("event", "title date time venue location")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// Get logged in user's single booking by id (only admin and owner can access)

const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("event", "title date time venue location")
    .populate("user", "name email phone");

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found");
  }

  const isOwner = booking.user._id.toString() === req.user._id.toString();

  if (!isOwner && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this booking");
  }

  res.json({
    success: true,
    data: booking,
  });
});

// Cancel the booking (soft delete)

const cancelBooking = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    const isOwner = booking.user.toString() === req.user._id.toString();

    if (!isOwner && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to cancel the booking");
    }

    if (booking.status === "cancelled") {
      res.status(400);
      throw new Error("Booking already cancelled");
    }

    // Find the event related to this booking
    const event = await Event.findById(booking.event).session(session);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    // Find the booked section
    const section = event.sections.find((s) => s.name === booking.sectionName);

    if (!section) {
      res.status(404);
      throw new Error("Section not found");
    }

    // Release seats
    section.bookedSeats = Math.max(0, section.bookedSeats - booking.quantity);

    // Save updated event
    await event.save({ session });

    booking.status = "cancelled";
    booking.cancelledAt = new Date();

    await booking.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    // Undo all changes if any error occurs
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
});

module.exports = {
  createBooking,
  payForBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
