# Password Reset Feature - Setup Guide

A complete, secure password reset flow has been implemented for your Next.js application.

## 🚀 Features

- ✅ Secure password reset with time-limited tokens (1 hour expiration)
- ✅ Professional email templates with HTML and plain text
- ✅ Strong password validation (same as signup)
- ✅ Password strength indicator with real-time feedback
- ✅ Password visibility toggle
- ✅ Confirmation passwords with matching validation
- ✅ Success/error notifications
- ✅ Security: tokens are single-use and automatically expire
- ✅ Modern, responsive UI matching your existing design

## 📋 Setup Instructions

### 1. Email Configuration

Add these environment variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-specific-password"
EMAIL_FROM="your-email@gmail.com"
EMAIL_FROM_NAME="Priveras"

# App URL (for reset links)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Gmail Setup (Recommended for Development)

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **Security > 2-Step Verification > App passwords**
5. Generate an app password for "Mail"
6. Copy the 16-character password
7. Use it as `EMAIL_PASSWORD` in your `.env` file

### 3. Alternative Email Providers

**Outlook/Hotmail:**

```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
```

**Yahoo:**

```env
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT="587"
```

**SendGrid (Production Recommended):**

```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

**Mailgun:**

```env
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT="587"
EMAIL_USER="your-mailgun-smtp-username"
EMAIL_PASSWORD="your-mailgun-smtp-password"
```

### 4. Database Migration

The database has already been migrated with the `password_reset_tokens` table.

If you need to run it again:

```bash
npx prisma migrate dev
```

## 🔐 User Flow

### Requesting Password Reset

1. User clicks "Forgot password?" on the login page
2. User enters their email address
3. System generates a secure token and sends email
4. User receives email with reset link
5. Success message shown (even if email doesn't exist - security best practice)

### Resetting Password

1. User clicks the link in the email
2. System validates the token (not expired, not used)
3. User enters new password with strength validation
4. User confirms the new password
5. System updates password and marks token as used
6. Confirmation email sent
7. User redirected to login

## 🛡️ Security Features

- **Token Expiration**: Reset links expire after 1 hour
- **Single Use**: Tokens can only be used once
- **Secure Hashing**: Passwords hashed with bcrypt
- **Email Enumeration Protection**: Same response whether email exists or not
- **Strong Password Requirements**: Enforced on both frontend and backend
- **HTTPS Ready**: Works with secure email transmission

## 📁 Files Created/Modified

### New Files:

- `lib/email.ts` - Email service with nodemailer
- `app/(public)/forgot-password/page.tsx` - Request reset page
- `app/(public)/forgot-password/forgot-password-form.tsx` - Request form
- `app/(public)/reset-password/page.tsx` - Reset password page
- `app/(public)/reset-password/reset-password-form.tsx` - Reset form
- `.env.example` - Environment variables template
- `PASSWORD_RESET_SETUP.md` - This file

### Modified Files:

- `prisma/schema.prisma` - Added PasswordResetToken model
- `lib/auth.ts` - Added password reset functions
- `app/(public)/login/login-form.tsx` - Added "Forgot password?" link
- `app/(public)/signup/signup-form.tsx` - Enhanced password validation

### Database:

- New table: `password_reset_tokens`

## 🎨 UI Features

- Beautiful gradient backgrounds matching your brand
- Responsive design (mobile-friendly)
- Real-time password strength indicator
- Visual checkmarks for password requirements
- Loading states with animations
- Toast notifications for feedback
- Professional email templates

## 🧪 Testing

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Test the flow:
   - Go to http://localhost:3000/login
   - Click "Forgot password?"
   - Enter your email
   - Check your email inbox
   - Click the reset link
   - Enter a new strong password
   - Verify you can login with new password

## 🐛 Troubleshooting

**Emails not sending:**

- Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check spam/junk folder
- Look at terminal logs for error messages

**Token expired/invalid:**

- Tokens expire after 1 hour
- Request a new reset link
- Ensure system time is correct

**Can't receive emails:**

- Verify email service credentials
- Check email service quota/limits
- Try with a different email provider
- Check application logs

## 📧 Email Templates

The system includes two beautifully designed emails:

1. **Password Reset Request Email**

   - Clean, modern design
   - Clear call-to-action button
   - Link expiration notice
   - Security information

2. **Password Reset Confirmation Email**
   - Success notification
   - Security alert if user didn't make the change
   - Professional branding

## 🚀 Production Deployment

Before deploying to production:

1. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
2. **Update NEXT_PUBLIC_APP_URL** to your production domain
3. **Enable HTTPS** (required for secure password transmission)
4. **Set EMAIL_SECURE="true"** if using port 465
5. **Add email service to environment variables** in your hosting platform
6. **Test thoroughly** in staging environment

## 📝 Notes

- Password requirements: 8+ characters, uppercase, lowercase, number, special char
- Minimum 4 out of 5 requirements must be met
- Tokens are stored in the database, not in memory
- Old/unused tokens are automatically deleted when new ones are created
- All password handling uses bcrypt for security

## 🤝 Support

If you encounter any issues:

1. Check the terminal logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your email provider allows SMTP access
4. Check that ports 587 or 465 are not blocked by your firewall
