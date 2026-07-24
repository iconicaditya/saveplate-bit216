import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send an email verification OTP
 */
export async function sendVerificationEmail(to: string, otp: string) {
  const mailOptions = {
    from: `"SavePlate" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Verify your SavePlate email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #4CAF50; margin: 0;">SavePlate</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; padding: 32px;">
          <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Thanks for signing up! Use the verification code below to complete your registration.
          </p>
          <div style="text-align: center; padding: 20px 0;">
            <div style="display: inline-block; background: #f3f4f6; border-radius: 8px; padding: 16px 32px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937; font-family: monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
            This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
          <p>&copy; 2026 SavePlate. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}