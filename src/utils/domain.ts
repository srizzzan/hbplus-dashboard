import { ALLOWED_DOMAIN } from "@/config";

export const DOMAIN_REJECTION_MESSAGE =
  "Access restricted. Please login using your official domain email.";

export function isAllowedEmail(
  email: string | null | undefined,
  emailVerified: boolean | null | undefined
): boolean {
  if (!emailVerified || !email) {
    return false;
  }

  return email.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}
