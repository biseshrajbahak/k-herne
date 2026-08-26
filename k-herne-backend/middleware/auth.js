const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// To verify user is authorized or not
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Authorization denied, no valid token");
  }

  // split(" ") => splits the string apart wherever there's a space and forms a array
  // [1] gives second item from the array
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // select("-password") gives everything about the user EXCEPT the password field
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new Error("Authorization denied, user not found");
    }

    if (!user.isActive) {
      throw new Error(
        "Authorization denied, user's account has been deactivated",
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.message === "Authorization denied, user not found" ||
      error.message ===
        "Authorization denied, user's account has been deactivated"
    ) {
      res.status(401);
      throw error;
    }

    res.status(401);
    throw new Error("Authorization denied, token failed or expired");
  }
});

// To verify admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  res.status(403);
  throw new Error("Authorization denied, you don't have admin roles");
};

module.exports = {
  protect,
  adminOnly,
};
