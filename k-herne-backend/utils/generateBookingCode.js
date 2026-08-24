// returns KHERNE- + 4 timestamp characters + 5 random characters
// Eg: KHRN-X2P9Q8K2M
// toString(36) converts to base 36 ie.(0-9 a-z)  eg. 0.q8k2m...
// substring(2,7) gives characters from position 2 upto position 6 eg. q8k2m
// slice(-4) gives last 4 characters

const generateBookingCode = () => {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `KHERNE-${random + timestamp}`;
};

module.exports = generateBookingCode;
