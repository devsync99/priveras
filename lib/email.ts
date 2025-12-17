import nodemailer from "nodemailer";

// Create transporter with email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Priveras"}" <${
        process.env.EMAIL_FROM || process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text: text || "",
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string
) {
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Reset Your Password</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                ${userName ? `Hi ${userName},` : "Hi,"}
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                We received a request to reset your password for your Priveras account. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                Or copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all;">
                <a href="${resetUrl}" style="color: #6366f1; text-decoration: none; font-size: 14px;">
                  ${resetUrl}
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px;">
                  <strong>Important:</strong> This link will expire in 1 hour for security reasons.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                  If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Priveras. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

${userName ? `Hi ${userName},` : "Hi,"}

We received a request to reset your password for your Priveras account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} Priveras. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - Priveras",
    html,
    text,
  });
}

export async function sendPasswordResetConfirmationEmail(
  email: string,
  userName?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed Successfully</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Changed Successfully</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                ${userName ? `Hi ${userName},` : "Hi,"}
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your password has been successfully changed. You can now sign in with your new password.
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>Security Tip:</strong> If you didn't make this change, please contact our support team immediately.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Priveras. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Password Changed Successfully

${userName ? `Hi ${userName},` : "Hi,"}

Your password has been successfully changed. You can now sign in with your new password.

Security Tip: If you didn't make this change, please contact our support team immediately.

© ${new Date().getFullYear()} Priveras. All rights reserved.
  `;

  return sendEmail({
    to: email,
    subject: "Password Changed Successfully - Priveras",
    html,
    text,
  });
}
