// Check if it is a valid time format
const isValidTimeFormat = (value) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
};

// Check if it is a valid date format and the date exists
// In JavaScript's Date, month start from 0 upto 11 ...so ( month-1 )
const isValidDateFormat = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

module.exports = {
  isValidTimeFormat,
  isValidDateFormat,
};
