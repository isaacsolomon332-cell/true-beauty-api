const nodemailer = require("nodemailer");
require("dotenv").config(); // <--- ADD THIS LINE FIRST

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});



const getPasswordResetEmailTemplate = (resetLink) => `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9fafb; }
    .button {
      display: inline-block;
      background: #4f46e5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer { font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Trueface Beauty Contest</h2>
    </div>
    <div class="content">
      <p>We received a request to reset your password.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetLink}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link will expire in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Trueface Beauty Contest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getVerificationEmailTemplate = (verificationLink) => `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9fafb; }
    .button {
      display: inline-block;
      background: #4f46e5;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer { font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Trueface Beauty Contest</h2>
    </div>
    <div class="content">
      <p>Welcome to Trueface!</p>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${verificationLink}" class="button">Verify Email Address</a>
      <p>Or copy and paste this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in <strong>5 minutes</strong>.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 Trueface Beauty Contest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

exports.sendPasswordResetEmail = async (to, resetLink) => {
  try {
    const mailOptions = {
      from: `Trueface <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Reset Your Password - Trueface",
      html: getPasswordResetEmailTemplate(resetLink)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${to}`);
    return { success: true };
    
  } catch (error) {
    console.error(" Email error:", error.message);
    return { error: "Failed to send reset email" };
  }
};

exports.sendVerificationEmail = async (to, verificationLink) => {
  try {
    const mailOptions = {
      from: `Trueface <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Verify Your Email - Trueface",
      html: getVerificationEmailTemplate(verificationLink)
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to}`);
    return { success: true };
    
  } catch (error) {
    console.error(" Email error:", error.message);
    return { error: "Failed to send verification email" };
  }
};

exports.sendOTPEmail = async (to, otp, purpose) => {
  try {
    const subject = purpose === 'email_verification' 
      ? "Verify Your Email - Trueface" 
      : "Password Reset - Trueface";
    
    const text = `Your OTP code is: ${otp}\nValid for 5 minutes.\nIf you didn't request this, please ignore this email.`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${to}`);
    return { success: true };
    
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return { success: false, error: error.message };
  }
};