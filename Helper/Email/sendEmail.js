const nodemailer = require("nodemailer");
require("dotenv").config();

const SendEmail = async (email, type, userName, details) => {
  let subject = "";
  let htmlContent = "";

  switch (type) {
    case "OTP":
      subject = "Your One-Time Password (OTP)";
      htmlContent = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f5f5f5;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
            <h2 style="text-align:center;">Your OTP</h2>
            <p style="text-align:center;">Use this code to proceed:</p>
            <div style="font-size:32px;text-align:center;font-weight:bold;color:#0077B6;">${details.otp}</div>
            <p style="text-align:center;">This OTP is valid for a short time only.</p>
          </div>
        </div>`;
      break;

    case "WelcomeUser":
      subject = "Welcome to Our Platform";
      htmlContent = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f2f2f2;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
            <h2>Welcome, ${userName}!</h2>
            <p>We're thrilled to have you on board. Explore our platform and enjoy the experience.</p>
            <p>If you need help, just <a href="mailto:support@yourcompany.com">contact support</a>.</p>
          </div>
        </div>`;
      break;

    case "OrderCreated":
      subject = "Order Confirmation";
      htmlContent = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f2f2f2;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
            <h2>Hello ${userName},</h2>
            <p>Your order <strong>#${details.orderId}</strong> has been successfully placed.</p>
            <p>Order Total: <strong>$${details.amount}</strong></p>
            <p>We'll notify you once it's shipped.</p>
            <a href="${details.orderLink}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#28a745;color:white;text-decoration:none;border-radius:5px;">View Order</a>
          </div>
        </div>`;
      break;

    case "OrderUpdated":
      subject = "Order Update";
      htmlContent = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f2f2f2;">
          <div style="max-width:600px;margin:auto;background:#fff;padding:20px;border-radius:8px;">
            <h2>Order Update for #${details.orderId}</h2>
            <p>Dear ${userName},</p>
            <p>Your order status has been updated to: <strong>${details.status}</strong>.</p>
            <a href="${details.orderLink}" style="display:inline-block;margin-top:20px;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">Track Order</a>
          </div>
        </div>`;
      break;

    default:
      return;
  }

  const mailOptions = {
    from: process.env.Email,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.Email,
      pass: process.env.PASSWORD,
    },
  });

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email Error:", error);
        reject(error);
      } else {
        console.log("Email sent:", info.response);
        resolve(info);
      }
    });
  });
};

module.exports = SendEmail;
