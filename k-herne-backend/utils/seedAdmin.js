// Run with: npm run seed:admin
require("dotenv").config();

const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  let user = await User.findOne({ email });

  if (user) {
    user.role = "admin";
    await user.save();

    console.log(`Existing user ${email} promoted to admin.`);
  } else {
    user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log(`Admin user created: ${email}`);
  }

  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
