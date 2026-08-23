const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["concert", "comedy", "conference", "sports", "other"],
      required: [true, "Category is required"],
    },

    // Some events like conferences may not have performers
    performers: {
      type: [String],
      default: [],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: [true, "Date is required"],
    },
    time: {
      type: String, // "HH:mm"
      required: [true, "Time is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    posterImage: {
      type: String,
      default: "",
    },
    sections: [
      {
        name: {
          type: String,
          required: [true, "Section name is required"],
        },
        price: {
          type: Number,
          required: [true, "Section price is required"],
          min: 0,
        },
        totalSeats: {
          type: Number,
          required: [true, "Total seats is required"],
          min: 0,
        },
        bookedSeats: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // soft delete
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Event", eventSchema);
