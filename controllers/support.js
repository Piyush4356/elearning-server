import { createTransport } from "nodemailer";
import TryCatch from "../middleware/TryCatch.js";

// Reusable transporter
const makeTransport = () => {
  console.log("📧 [Support] Creating transport with Gmail:", process.env.Gmail);
  console.log("📧 [Support] Password configured:", process.env.Password ? `YES (${process.env.Password.length} chars)` : "❌ MISSING");
  return createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.Gmail,
      pass: process.env.Password,
    },
  });
};

// ── GET /api/support/test ─────────────────────────────────────────────────────
// Hit this in browser to verify email works: http://localhost:5000/api/support/test
export const testSupportEmail = TryCatch(async (req, res) => {
  console.log("🧪 [Support Test] Starting email test...");
  console.log("🧪 Gmail env:", process.env.Gmail);
  console.log("🧪 Password env:", process.env.Password ? `SET (${process.env.Password.length} chars)` : "NOT SET");

  const transport = makeTransport();

  console.log("🧪 Verifying transporter connection...");
  await transport.verify();
  console.log("✅ Transporter verified OK");

  await transport.sendMail({
    from: `"E-Learning Test" <${process.env.Gmail}>`,
    to: process.env.Gmail,
    subject: "✅ Test Email — Lexi Support",
    html: "<h2>Test email from Lexi chatbot support system. If you see this, email is working! 🎉</h2>",
  });

  console.log("✅ Test email sent to", process.env.Gmail);
  res.json({ success: true, message: `Test email sent to ${process.env.Gmail}` });
});

// ── POST /api/support ─────────────────────────────────────────────────────────
export const submitSupportRequest = TryCatch(async (req, res) => {
  const { email, message } = req.body;
  console.log("📩 [Support] New request — email:", email, "| message:", message?.slice(0, 60));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn("⚠️  [Support] Invalid email rejected:", email);
    return res.status(400).json({ message: "A valid email address is required." });
  }

  const transport = makeTransport();
  const adminEmail = process.env.Gmail; // your Gmail — acts as super admin until you set a dedicated one
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // ── 1. Notify admin ─────────────────────────────────────────────────────────
  const adminHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
    .card { background: #fff; max-width: 560px; margin: auto; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 24px 28px; color: #fff; }
    .header h2 { margin: 0; font-size: 20px; }
    .header p { margin: 4px 0 0; opacity: 0.8; font-size: 13px; }
    .body { padding: 24px 28px; }
    .field { margin-bottom: 16px; }
    .label { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase;
             letter-spacing: 0.05em; margin-bottom: 4px; }
    .value { font-size: 15px; color: #111827; }
    .badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 10px;
             border-radius: 999px; font-size: 12px; font-weight: 600; }
    .footer { padding: 14px 28px; background: #f9fafb; font-size: 12px; color: #9ca3af;
              border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>🆘 New Support Request — Lexi Chatbot</h2>
      <p>E-Learning Platform · Customer Assistance Required</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Customer Email</div>
        <div class="value">${email}</div>
      </div>
      <div class="field">
        <div class="label">Message / Issue</div>
        <div class="value">${message || "No additional message provided — customer requested a callback."}</div>
      </div>
      <div class="field">
        <div class="label">Received At</div>
        <div class="value">${timestamp} IST</div>
      </div>
      <div class="field">
        <div class="label">Source</div>
        <div class="value"><span class="badge">Lexi Chatbot</span></div>
      </div>
    </div>
    <div class="footer">Please respond to the customer within 24 hours. Reply directly to: ${email}</div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: `"E-Learning Support Bot" <${adminEmail}>`,
    to: adminEmail,
    replyTo: email,
    subject: `🆘 Support Request from ${email}`,
    html: adminHtml,
  });

  // ── 2. Confirm to customer ───────────────────────────────────────────────────
  const customerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px; }
    .card { background: #fff; max-width: 560px; margin: auto; border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e40af, #7c3aed); padding: 28px;
              color: #fff; text-align: center; }
    .header h1 { margin: 0 0 6px; font-size: 22px; }
    .header p { margin: 0; opacity: 0.85; font-size: 14px; }
    .body { padding: 28px; text-align: center; }
    .emoji { font-size: 48px; margin-bottom: 12px; }
    .body h2 { color: #111827; margin: 0 0 12px; font-size: 20px; }
    .body p { color: #4b5563; line-height: 1.7; margin: 0 0 16px; }
    .highlight { background: #dbeafe; color: #1e40af; border-radius: 8px;
                 padding: 12px 20px; font-size: 14px; font-weight: 600; margin: 16px 0; }
    .footer { padding: 16px 28px; background: #f9fafb; text-align: center;
              font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>E-Learning Platform</h1>
      <p>India's Premier Learning Destination</p>
    </div>
    <div class="body">
      <div class="emoji">🎓</div>
      <h2>We've received your request!</h2>
      <p>Hi there! Thank you for reaching out to us. Our support team has been notified and will get back to you <strong>within 24 hours</strong>.</p>
      <div class="highlight">📧 We'll reply to: ${email}</div>
      <p>In the meantime, feel free to keep exploring our <strong>500+ courses</strong> or check your <strong>Account</strong> page for any active subscriptions.</p>
      <p style="font-size:13px; color:#6b7280;">If your issue is urgent, please log in and visit the Account page for immediate assistance.</p>
    </div>
    <div class="footer">
      You're receiving this because you submitted a support request via Lexi on the E-Learning platform.<br>
      Please do not reply to this email — our team will contact you shortly.
    </div>
  </div>
</body>
</html>`;

  await transport.sendMail({
    from: `"E-Learning Support" <${adminEmail}>`,
    to: email,
    subject: "✅ We've received your support request — E-Learning",
    html: customerHtml,
  });

  res.json({
    message: "Support request received. Confirmation email sent.",
  });
});
