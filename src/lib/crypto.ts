/**
 * Password utilities - stores passwords as plain text
 */

export async function hashPassword(password: string): Promise<string> {
  // Store password as plain text
  return password;
}

export async function verifyPassword(password: string, storedPassword: string): Promise<boolean> {
  // Direct string comparison
  return password === storedPassword;
}
