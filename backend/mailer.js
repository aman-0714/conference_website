// ============================================================
//  mailer.js  –  Email utility for I-PESs 2027
// ============================================================

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Send paper submission confirmation ───────────────────
async function sendSubmissionConfirmation(authorEmail, authorName, paperTitle, track) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: authorEmail,
    subject: `[I-PESs 2027] Paper Submission Received – ${paperTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a237e; color: white; padding: 24px; text-align: center;">
          <h2 style="margin:0;">I-PESs 2027</h2>
          <p style="margin:4px 0 0; font-size:13px;">International Conference on Intelligent Power, Energy and Sustainable Systems</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>${authorName}</strong>,</p>
          <p>Thank you for submitting your paper to <strong>I-PESs 2027</strong>. We have successfully received your submission.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background:#f5f5f5;">
              <td style="padding:8px 12px; font-weight:bold; width:40%;">Paper Title</td>
              <td style="padding:8px 12px;">${paperTitle}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px; font-weight:bold;">Track</td>
              <td style="padding:8px 12px;">${track}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:8px 12px; font-weight:bold;">Status</td>
              <td style="padding:8px 12px; color:#1565c0;">Under Review</td>
            </tr>
          </table>
          <p>You will be notified via email once the review process is complete. For queries, reply to this email or contact the secretariat.</p>
          <p style="margin-top: 32px; color: #777; font-size: 12px;">
            © 2027 I-PESs Conference | NIT Jalandhar, Punjab, India
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn("Email sending failed (non-critical):", err.message);
  }
}

// ─── Send registration confirmation ───────────────────────
async function sendRegistrationConfirmation(email, name, category, amount, mode) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `[I-PESs 2027] Registration Received – ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: #1a237e; color: white; padding: 24px; text-align: center;">
          <h2 style="margin:0;">I-PESs 2027</h2>
          <p style="margin:4px 0 0; font-size:13px;">Registration Acknowledgement</p>
        </div>
        <div style="padding: 24px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>We have received your registration for <strong>I-PESs 2027</strong>. Your registration is currently <strong>pending payment verification</strong>.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="background:#f5f5f5;">
              <td style="padding:8px 12px; font-weight:bold; width:40%;">Category</td>
              <td style="padding:8px 12px;">${category}</td>
            </tr>
            <tr>
              <td style="padding:8px 12px; font-weight:bold;">Amount</td>
              <td style="padding:8px 12px;">₹${amount}</td>
            </tr>
            <tr style="background:#f5f5f5;">
              <td style="padding:8px 12px; font-weight:bold;">Mode</td>
              <td style="padding:8px 12px;">${mode}</td>
            </tr>
          </table>
          <p>Once your payment is verified by the organizing team, you will receive your final confirmation letter. For any queries, contact the secretariat.</p>
          <p style="margin-top: 32px; color: #777; font-size: 12px;">
            © 2027 I-PESs Conference | NIT Jalandhar, Punjab, India
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn("Email sending failed (non-critical):", err.message);
  }
}

module.exports = { sendSubmissionConfirmation, sendRegistrationConfirmation };
