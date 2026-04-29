const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getVerificationEmailTemplate = (otp) => `
 EMAIL VERIFICATION - TRUEFACE

Your verification code: ${otp}

Valid for 5 minutes.

Enter this code to verify your email address.

Trueface Beauty Contest
`;

const getPasswordResetTemplate = (otp) => `
 PASSWORD RESET - TRUEFACE

Your password reset code: ${otp}

Valid for 5 minutes.

Enter this code to reset your password.

Trueface Beauty Contest
`;

exports.sendOTPEmail = async (to, otp, purpose = 'password_reset') => {
  try {
    const subject = purpose === 'email_verification' 
      ? `Verify Your Email - Trueface` 
      : `Password Reset - Trueface`;
    
    const text = purpose === 'email_verification'
      ? getVerificationEmailTemplate(otp)
      : getPasswordResetTemplate(otp);

    const mailOptions = {
      from: `Trueface <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log(` ${purpose} email sent to ${to}`);
    return { success: true };
    
  } catch (error) {
    console.error('Email error:', error.message);
    return { error: 'Failed to send email' };
  }
};