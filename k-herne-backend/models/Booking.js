const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sectionName: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    bookingCode: {
      type: String,
      required: true,
      unique: true,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// To make queries involving these fields faster...
// compound index to check how many tickets are already booked...
// checking follows order event->sectionName->status
// 1 means data are stored in db in increasing order
bookingSchema.index({
  event: 1,
  sectionName: 1,
  status: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);
