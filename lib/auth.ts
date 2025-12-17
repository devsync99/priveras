// lib/auth.ts
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "No account found with this email address" };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { error: "Invalid password. Please try again" };
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  // Validate password strength
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword };
}

export async function createPasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { error: "No account found with this email address" };
  }

  // Generate secure random token
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  // Delete any existing unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      used: false,
    },
  });

  // Create new token
  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  return { token, user };
}

export async function verifyPasswordResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return { error: "Invalid or expired reset link" };
  }

  if (resetToken.used) {
    return { error: "This reset link has already been used" };
  }

  if (new Date() > resetToken.expiresAt) {
    return { error: "This reset link has expired" };
  }

  return { resetToken };
}

export async function resetPassword(token: string, newPassword: string) {
  const verification = await verifyPasswordResetToken(token);

  if (verification.error) {
    return { error: verification.error };
  }

  const { resetToken } = verification;

  if (!resetToken) {
    return { error: "Invalid reset token" };
  }

  // Validate password strength
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long" };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return { success: true, user: resetToken.user };
}
