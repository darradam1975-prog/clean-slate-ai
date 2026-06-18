const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Email is required.";
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateTitle(title: string): string | null {
  const trimmed = title.trim();
  if (!trimmed) return "A title is required for every upload.";
  if (trimmed.length < 3) return "Title must be at least 3 characters.";
  if (trimmed.length > 120) return "Title must be 120 characters or fewer.";
  return null;
}