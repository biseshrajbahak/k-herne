const cron = require("node-cron");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

const startExpiryJob = () => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const expiredBookings = await Booking.find({
        status: "pending",
        paymentStatus: "pending",
        expiresAt: { $lt: new Date() }, // lt means less than, finds booking crossing expiry
      });

      for (const booking of expiredBookings) {
        const event = await Event.findById(booking.event);

        if (event) {
          const section = event.sections.find(
            (s) => s.name === booking.sectionName,
          );

          if (section) {
            section.bookedSeats = Math.max(
              0,
              section.bookedSeats - booking.quantity,
            );

            await event.save();
          }
        }

        booking.status = "cancelled";
        booking.paymentStatus = "failed";
        await booking.save();
      }

      if (expiredBookings.length > 0) {
        console.log(
          `Expired and released ${expiredBookings.length} pending booking(s)`,
        );
      }
    } catch (error) {
      console.error("Booking expiry job error:", error.message);
    }
  });
};

module.exports = startExpiryJob;
