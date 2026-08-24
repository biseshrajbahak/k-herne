const isValidTimeFormat = (value) => {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
};

const isValidDateFormat = (value) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
};

module.exports = {
  isValidTimeFormat,
  isValidDateFormat,
};
