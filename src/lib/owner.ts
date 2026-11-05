const DEFAULT_OWNER_EMAIL = "darradam1975@gmail.com";

export function isSiteOwner(email: string): boolean {
  const owner = (process.env.OWNER_EMAIL ?? DEFAULT_OWNER_EMAIL).trim().toLowerCase();
  return email.trim().toLowerCase() === owner;
}
