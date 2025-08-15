const axios = require("axios");
require("dotenv").config();

const authHeader = `Basic ${Buffer.from(
  `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
).toString("base64")}`;

async function sendVendorPayout(vendor, amountInRupees) {
  try {
    // 1️⃣ Create Contact
    const contactPayload = {
      name: vendor.Vendorname,
      email: vendor.Email,
      contact: vendor.Number,
      type: "vendor",
      reference_id: `vendor_${vendor._id}`,
      notes: {
        company: vendor.CompanyId.CompanyName,
      },
    };

    const contactRes = await axios.post(
      "https://api.razorpay.com/v1/contacts",
      contactPayload,
      { headers: { Authorization: authHeader } }
    );

    const contactId = contactRes.data.id;

    // 2️⃣ Create Fund Account
    const fundAccountPayload = {
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: {
        name: vendor.CompanyId.Bankdetails.AccountHolderName,
        ifsc: vendor.CompanyId.Bankdetails.Ifsc,
        account_number: vendor.CompanyId.Bankdetails.Accountnumber,
      },
    };

    const fundAccountRes = await axios.post(
      "https://api.razorpay.com/v1/fund_accounts",
      fundAccountPayload,
      { headers: { Authorization: authHeader } }
    );

    const fundAccountId = fundAccountRes.data.id;

    // 3️⃣ Create Payout
    const payoutPayload = {
      account_number: process.env.RAZORPAYX_ACCOUNT_NO,
      fund_account_id: fundAccountId,
      amount: amountInRupees * 100,
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      narration: `Vendor payment - ${vendor.Vendorname}`,
    };

    const payoutRes = await axios.post(
      "https://api.razorpay.com/v1/payouts",
      payoutPayload,
      { headers: { Authorization: authHeader } }
    );

    console.log("✅ Payout Successful:", payoutRes.data);
    return payoutRes.data;
  } catch (err) {
    console.error(err.response?.data || err.message);
    throw err;
  }
}

module.exports = sendVendorPayout;
