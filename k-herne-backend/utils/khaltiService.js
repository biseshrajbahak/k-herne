require("dotenv").config();

const axios = require("axios");

const KHALTI_API_URL =
  process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

if (!KHALTI_SECRET_KEY) {
  throw new Error("KHALTI_SECRET_KEY is missing from .env");
}

const initiateKhaltiPayment = async ({
  amount,
  purchaseOrderId,
  purchaseOrderName,
  customerInfo,
}) => {
  const payload = {
    return_url: `${process.env.BASE_URL}/api/bookings/khalti/callback`,
    website_url: process.env.BASE_URL,
    amount: Math.round(amount * 100),
    purchase_order_id: purchaseOrderId,
    purchase_order_name: purchaseOrderName,
    customer_info: customerInfo,
  };

  const response = await axios.post(
    `${KHALTI_API_URL}/epayment/initiate/`,
    payload,
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

const verifyKhaltiPayment = async (pidx) => {
  const response = await axios.post(
    `${KHALTI_API_URL}/epayment/lookup/`,
    { pidx },
    {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
};
