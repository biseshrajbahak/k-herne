const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Register new user
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("Email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// Login User
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error("Account has been deactivated, Contact Admin");
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});

// Get logged in user's own profile
const getMe = asyncHandler(async (req, res, next) => {
  res.json({
    success: true,
    data: req.user,
  });
});

// Update logged in user's own profile
const updateMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If the user provided a value, use it. Otherwise, keep the old value.
  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;

  // Only update the password when the user wants to change it.
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updated = await user.save();

  res.json({
    success: true,
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
    },
  });
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateMe,
};
