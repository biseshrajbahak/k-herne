const asyncHandler = require("express-async-handler");
const Event = require("../models/Event");

// Get the events based on the filter
const getAllEvents = asyncHandler(async (req, res, next) => {
  const {
    title,
    venue,
    location,
    category,
    date,
    startDate,
    endDate,
    maxPrice,
    minPrice,
  } = req.query;

  const filter = {
    isActive: true,
  };

  // "i" means case-insensitive search
  if (title) {
    filter.title = {
      $regex: title,
      $options: "i",
    };
  }

  if (venue) {
    filter.venue = {
      $regex: venue,
      $options: "i",
    };
  }

  if (location) {
    filter.location = {
      $regex: location,
      $options: "i",
    };
  }

  if (category) {
    filter.category = category;
  }

  if (minPrice || maxPrice) {
    filter["sections.price"] = {};
    if (minPrice) {
      filter["sections.price"].$gte = Number(minPrice);
    }
    if (maxPrice) {
      filter["sections.price"].$lte = Number(maxPrice);
    }
  }
  // If exact date is provided
  if (date) {
    filter.date = date;
  }

  // If exact date is not provided, filter by date range
  else if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = startDate;
    }
    if (endDate) {
      filter.date.$lte = endDate;
    }
  }

  // Find matching events and (-1) means show newly created events first
  const events = await Event.find(filter).sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    count: events.length,
    data: events,
  });
});

// Get event by id
const getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  res.json({
    success: true,
    data: event,
  });
});

// Used by admin routes:

// Create a event
const createEvent = asyncHandler(async (req, res, next) => {
  const {
    title,
    category,
    performers,
    venue,
    location,
    date,
    time,
    description,
    posterImage,
    sections,
  } = req.body;

  const event = await Event.create({
    title,
    category,
    performers,
    venue,
    location,
    date,
    time,
    description,
    posterImage,
    sections,
  });

  res.status(201).json({
    success: true,
    data: event,
  });
});

// Update the event
const updateEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  event.title = req.body.title ?? event.title;
  event.category = req.body.category ?? event.category;
  event.performers = req.body.performers ?? event.performers;
  event.venue = req.body.venue ?? event.venue;
  event.location = req.body.location ?? event.location;
  event.date = req.body.date ?? event.date;
  event.time = req.body.time ?? event.time;
  event.description = req.body.description ?? event.description;
  event.posterImage = req.body.posterImage ?? event.posterImage;
  event.sections = req.body.sections ?? event.sections;
  event.isActive = req.body.isActive ?? event.isActive;

  const updated = await event.save();

  res.json({
    success: true,
    data: updated,
  });
});

// Delete a event (soft delete)
const deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error("Event not Found");
  }

  event.isActive = false;
  await event.save();

  res.json({
    success: true,
    message: "Event is deleted",
  });
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
