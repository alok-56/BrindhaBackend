const nodemailer = require("nodemailer");
require("dotenv").config();

const SendEmail = async (email, type, userName, details) => {
  let subject = "";
  let htmlContent = "";

  const companyFooter = `
    <div style="background:#2c3e50;color:white;padding:30px;text-align:center;margin-top:30px;">
      <h3 style="margin:0 0 10px 0;font-size:24px;font-weight:300;">Brindah</h3>
      <p style="margin:0 0 10px 0;color:#bdc3c7;font-size:14px;">www.brindah.com</p>
      <p style="margin:0;color:#bdc3c7;font-size:14px;">Thank you for choosing us!</p>
    </div>
  `;

  switch (type) {
    case "OTP":
      subject = "Your One-Time Password (OTP)";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:30px;margin:0;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);overflow:hidden;">
            <div style="text-align:center;padding:40px 30px 30px;">
              <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;padding:20px;border-radius:50%;width:80px;height:80px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:36px;">🔐</div>
              <h2 style="color:#2c3e50;margin:0;font-size:28px;">Security Code</h2>
              <p style="color:#7f8c8d;margin:10px 0 0 0;">Enter this code to verify your identity</p>
            </div>
            
            <div style="background:#f8f9fa;padding:30px;text-align:center;margin:0 30px 30px;">
              <div style="font-size:48px;font-weight:bold;color:#667eea;letter-spacing:8px;margin-bottom:15px;">${details.otp}</div>
              <p style="color:#7f8c8d;margin:0;font-size:14px;">This code expires in 10 minutes</p>
            </div>
            
            <div style="background:#e8f4f8;padding:20px;margin:0 30px 30px;border-radius:8px;border-left:4px solid #17a2b8;">
              <p style="margin:0;color:#0c5460;font-size:14px;">
                <strong>Security Tips:</strong><br>
                • Never share this code with anyone<br>
                • We'll never ask for your OTP via phone or email
              </p>
            </div>
            
            ${companyFooter}
          </div>
        </div>`;
      break;

    case "OrderCreatedUser":
      subject = "🧾 Order Confirmation - Thank You!";
      

      const orderData = details.orderData || details;

      if (!Array.isArray(orderData.subOrders)) {
        htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Error</title>
      </head>
      <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#ffffff;padding:40px 30px;border-radius:12px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="font-size:48px;margin-bottom:20px;">❌</div>
            <h2 style="color:#e74c3c;margin:0 0 15px 0;font-size:24px;">Order Error</h2>
            <p style="color:#6c757d;margin:0;font-size:16px;">No items found in your order.</p>
          </div>
        </div>
      </body>
      </html>`;
        break;
      }

      htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .header { padding: 30px 20px !important; }
          .content { padding: 20px !important; }
          .product-card { padding: 15px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      
      <!-- Main Container -->
      <div class="container" style="max-width:600px;margin:0 auto;padding:20px;">
        
        <!-- Header -->
        <div class="header" style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);padding:40px 30px;text-align:center;color:white;border-radius:12px 12px 0 0;">
          <div style="font-size:48px;margin-bottom:15px;">🎉</div>
          <h1 style="margin:0;font-size:28px;font-weight:600;letter-spacing:-0.5px;">Order Confirmed!</h1>
          <p style="margin:15px 0 0 0;font-size:16px;opacity:0.9;">Thank you ${userName}! Your order is being processed.</p>
        </div>

        <!-- Order Details Card -->
        <div class="content" style="background:#ffffff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Order Info -->
          <div style="background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:25px;border-left:4px solid #28a745;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <h3 style="margin:0 0 5px 0;color:#2c3e50;font-size:16px;">Order Date</h3>
                <p style="margin:0;color:#6c757d;font-size:14px;">${new Date().toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</p>
              </div>
              <div style="text-align:right;">
                <div style="background:#28a745;color:white;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:600;">
                  CONFIRMED
                </div>
              </div>
            </div>
          </div>

          ${orderData.subOrders
            .map(
              (sub, idx) => `
            <!-- Store Section -->
            <div style="margin-bottom:25px;border:1px solid #e9ecef;border-radius:10px;overflow:hidden;">
              <div style="background:#495057;color:white;padding:15px;display:flex;align-items:center;justify-content:space-between;">
                <div style="display:flex;align-items:center;">
                  <span style="font-size:18px;margin-right:10px;">🏪</span>
                  <span style="font-weight:600;font-size:16px;">Store ${
                    idx + 1
                  }</span>
                </div>
                <div style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:12px;font-size:12px;">
                  ${sub.products.length} item${
                sub.products.length > 1 ? "s" : ""
              }
                </div>
              </div>
              
              <!-- Products -->
              <div style="padding:0;">
                ${sub.products
                  .map(
                    (prod, index) => `
                  <div class="product-card" style="padding:20px;border-bottom:1px solid #f1f3f4;${
                    index === sub.products.length - 1
                      ? "border-bottom:none;"
                      : ""
                  }">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px;">
                      <div>
                        <h4 style="margin:0 0 8px 0;color:#2c3e50;font-size:16px;font-weight:600;">Product ${
                          index + 1
                        }</h4>
                        <div style="display:flex;gap:15px;flex-wrap:wrap;">
                          <span style="background:#e9ecef;padding:4px 8px;border-radius:4px;font-size:12px;color:#495057;">
                            Qty: <strong>${prod.quantity}</strong>
                          </span>
                          ${
                            prod.color && prod.color !== "N/A"
                              ? `
                          <span style="background:#e9ecef;padding:4px 8px;border-radius:4px;font-size:12px;color:#495057;">
                            Color: <strong>${prod.color}</strong>
                          </span>
                          `
                              : ""
                          }
                          ${
                            prod.size && prod.size !== "N/A"
                              ? `
                          <span style="background:#e9ecef;padding:4px 8px;border-radius:4px;font-size:12px;color:#495057;">
                            Size: <strong>${prod.size}</strong>
                          </span>
                          `
                              : ""
                          }
                        </div>
                      </div>
                      <div style="text-align:right;">
                        <div style="color:#6c757d;font-size:12px;margin-bottom:4px;">Unit Price</div>
                        <div style="color:#495057;font-weight:600;font-size:14px;">₹${
                          prod.price
                        }</div>
                      </div>
                    </div>
                    
                    <div style="display:flex;justify-content:space-between;align-items:center;padding-top:15px;border-top:1px solid #f1f3f4;">
                      <span style="color:#6c757d;font-size:14px;">Item Total:</span>
                      <span style="color:#28a745;font-weight:700;font-size:16px;">₹${
                        prod.price * prod.quantity * prod.size
                      }</span>
                    </div>
                  </div>
                `
                  )
                  .join("")}
              </div>

              <!-- Store Summary -->
              <div style="background:#f8f9fa;padding:20px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="color:#6c757d;font-size:14px;">Subtotal:</span>
                  <span style="color:#2c3e50;font-weight:600;font-size:14px;">₹${
                    sub.subtotal
                  }</span>
                </div>
                
                <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
                  <span style="color:#6c757d;font-size:14px;">Delivery Charge:</span>
                  <span style="color:#2c3e50;font-weight:600;font-size:14px;">₹${
                    sub.deliveryCharge
                  }</span>
                </div>
                
                <div style="display:flex;justify-content:space-between;padding-top:15px;border-top:2px solid #dee2e6;">
                  <span style="color:#2c3e50;font-weight:700;font-size:16px;">Store Total:</span>
                  <span style="color:#28a745;font-weight:700;font-size:18px;">₹${
                    sub.total
                  }</span>
                </div>
              </div>
            </div>
          `
            )
            .join("")}

          <!-- Grand Total -->
          <div style="background:linear-gradient(135deg, #28a745 0%, #20c997 100%);color:white;padding:25px;border-radius:10px;margin-top:20px;">
            <div style="text-align:center;margin-bottom:15px;">
              <div style="font-size:16px;opacity:0.9;margin-bottom:5px;">Total Amount</div>
              <div style="font-size:32px;font-weight:700;letter-spacing:-1px;">₹${
                orderData.grandTotal
              }</div>
            </div>
            
            ${
              orderData.taxAmount && orderData.taxAmount > 0
                ? `
            <div style="display:flex;justify-content:space-between;padding-top:15px;border-top:1px solid rgba(255,255,255,0.3);font-size:14px;">
              <span style="opacity:0.9;">Tax Amount:</span>
              <span style="font-weight:600;">₹${orderData.taxAmount}</span>
            </div>
            `
                : ""
            }
          </div>

          <!-- What's Next -->
          <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;padding:20px;margin-top:25px;">
            <h3 style="margin:0 0 10px 0;color:#856404;font-size:16px;display:flex;align-items:center;">
              <span style="margin-right:8px;">📦</span>
              What's Next?
            </h3>
            <ul style="margin:0;padding-left:20px;color:#856404;font-size:14px;line-height:1.6;">
              <li>We'll send you tracking information once your order ships</li>
              <li>You'll receive updates via email and SMS</li>
              <li>Expected delivery: 3-5 business days</li>
            </ul>
          </div>

        </div>
        
        ${companyFooter}
      </div>
    </body>
    </html>
  `;
      break;

    case "OrderCreatedVendor":
      subject = "📦 New Order Alert - Action Required";

      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;margin:0;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);padding:40px 30px;text-align:center;color:white;">
              <div style="font-size:48px;margin-bottom:10px;">📦</div>
              <h1 style="margin:0;font-size:32px;font-weight:300;">New Order Received!</h1>
              <p style="margin:10px 0 0 0;font-size:16px;opacity:0.9;">You have a new order to process</p>
            </div>

            <!-- Content -->
            <div style="padding:40px 30px;">
              <div style="text-align:center;margin-bottom:30px;">
                <p style="color:#7f8c8d;font-size:16px;line-height:1.6;margin:0;">
                  You have received a new order. Please log in to your vendor dashboard to view the complete details and process the order.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin:30px 0;">
                <a href="#" style="background:linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);color:white;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">
                  View Order Details
                </a>
              </div>
            </div>
            
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "OrderStatusUpdated":
      subject = "Order Status Updated";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="padding:30px;">
              <h2 style="color:#2c3e50;margin:0 0 15px 0;">Order Status Updated</h2>
              <p style="color:#7f8c8d;font-size:16px;">Your order #${details.orderId} status is now: <strong>${details.status}</strong></p>
            </div>
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "OrderCancelled":
      subject = "Order Cancelled";

      htmlContent = `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8f9fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="padding:30px;">
          <h2 style="color:#e74c3c; margin:0 0 15px 0;">Order Cancelled</h2>
          <p style="color:#7f8c8d; font-size:16px;">The order <strong>#${
            details.orderId
          }</strong> has been cancelled.</p>

          <div style="margin-top:20px; padding:15px; background:#fef2f2; border:1px solid #e0b4b4; border-radius:8px;">
            <p style="margin:0; color:#c0392b; font-size:15px;"><strong>Refund Amount:</strong> ₹${
              details.RefundAmount || 0
            }</p>
            <p style="margin:5px 0 0 0; color:#c0392b; font-size:15px;"><strong>Refund ID:</strong> ${
              details.refundid
            }</p>
          </div>

          <p style="margin-top:25px; font-size:14px; color:#95a5a6;">If you have any questions or concerns, feel free to reach out to our support team.</p>
        </div>
        ${companyFooter}
      </div>
    </div>
  `;
      break;

    case "Welcomevendor":
      subject = "👋 Welcome to Our Vendor Platform!";
      htmlContent = `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8f9fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="padding:30px;">
          <h2 style="color:#2c3e50; margin:0 0 15px 0;">Welcome, ${userName}!</h2>
          <p style="color:#34495e; font-size:16px;">
            Thank you for registering as a vendor on our platform. We're thrilled to have you join our growing marketplace!
          </p>

          <p style="color:#7f8c8d; font-size:15px; margin-top:15px;">
            To move forward, please complete the vendor verification form and submit it for approval.
            This helps us ensure a secure and trusted experience for all users.
          </p>

          <div style="margin-top:25px;">
            <a href="https://yourdomain.com/vendor-verification" target="_blank" style="display:inline-block; padding:12px 24px; background:#2c3e50; color:#ffffff; text-decoration:none; border-radius:6px; font-size:15px;">
              Complete Verification Form
            </a>
          </div>

          <p style="margin-top:25px; font-size:14px; color:#95a5a6;">
            Once we receive and review your documents, we'll notify you about the next steps.
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
        ${companyFooter}
      </div>
    </div>
  `;
      break;

    case "VendorRegistered":
      subject = "Vendor Registration Submitted";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="padding:30px;">
              <h2 style="color:#2c3e50;margin:0 0 15px 0;">Vendor Registration Submitted</h2>
              <p style="color:#7f8c8d;font-size:16px;">${userName} has submitted a vendor registration request.</p>
            </div>
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "VendorRegisterednew":
      subject = "👋 Welcome! Your Vendor Application Has Been Submitted";
      htmlContent = `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8f9fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="padding:30px;">
          <h2 style="color:#2c3e50; margin:0 0 15px 0;">Welcome, ${userName}!</h2>
          <p style="color:#34495e; font-size:16px;">Thank you for applying to become a vendor on our platform.</p>

          <p style="color:#7f8c8d; font-size:15px; margin-top:15px;">
            We've successfully received your application. Our team is currently reviewing your information.
            You will receive an update via email once your account is approved.
          </p>

          <p style="color:#7f8c8d; font-size:15px; margin-top:15px;">
            In the meantime, feel free to reach out to us if you have any questions.
          </p>

          <p style="margin-top:25px; font-size:14px; color:#95a5a6;">
            Thank you for choosing to partner with us!
          </p>
        </div>
        ${companyFooter}
      </div>
    </div>
  `;
      break;

    case "VendorApproved":
      subject = "Your Vendor Account is Approved";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="padding:30px;">
              <h2 style="color:#28a745;margin:0 0 15px 0;">Congratulations!</h2>
              <p style="color:#7f8c8d;font-size:16px;">Your vendor account has been approved, ${userName}!</p>
            </div>
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "VendorRejected":
      subject = "Vendor Registration Rejected";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="padding:30px;">
              <h2 style="color:#e74c3c;margin:0 0 15px 0;">Registration Status</h2>
              <p style="color:#7f8c8d;font-size:16px;">Sorry ${userName}, your vendor request has been rejected.</p>
            </div>
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "ProductAdded":
      subject = "New Product Added";
      htmlContent = `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f8f9fa;padding:20px;">
          <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="padding:30px;">
              <h2 style="color:#2c3e50;margin:0 0 15px 0;">New Product Added</h2>
              <p style="color:#7f8c8d;font-size:16px;">Vendor added a new product! Please Review product</p>
            </div>
            ${companyFooter}
          </div>
        </div>
      `;
      break;

    case "ProductStatusUpdated":
      subject = `📦 Product Status: ${details.status}`;
      htmlContent = `
    <div style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f8f9fa; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="padding:30px;">
          <h2 style="color:${
            details.status === "Approved" ? "#28a745" : "#e74c3c"
          }; margin:0 0 15px 0;">
            Product ${details.status}
          </h2>

          <p style="color:#34495e; font-size:16px;">
            Your product has been <strong>${
              details.status
            }</strong> by our team.
          </p>

          ${
            details.status === "Approved"
              ? `
                <p style="color:#7f8c8d; font-size:15px;">
                  The product is now live on the platform. We recommend reviewing the listing to ensure everything is correct.
                </p>
                <div style="margin-top:20px;">
                  <a href="${
                    details.productLink || "#"
                  }" target="_blank" style="display:inline-block; padding:10px 20px; background:#28a745; color:#fff; text-decoration:none; border-radius:6px;">
                    View Product
                  </a>
                </div>
              `
              : `
                <p style="color:#7f8c8d; font-size:15px;">
                  Unfortunately, your product did not meet our publishing criteria and has been rejected.
                </p>
              `
          }

          <p style="margin-top:25px; font-size:14px; color:#95a5a6;">
            If you have questions, feel free to reach out to our support team.
          </p>
        </div>
        ${companyFooter}
      </div>
    </div>
  `;
      break;

    default:
      return;
  }

  const mailOptions = {
    from: process.env.Email,
    to: email,
    subject: subject + " " + new Date(),
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
