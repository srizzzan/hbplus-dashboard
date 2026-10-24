import { DOMAIN_REJECTION_MESSAGE } from "@/utils/domain";

const GENERIC_ERROR = "Something went wrong. Please try again.";

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : undefined;
  }

  return undefined;
}

export function mapAuthError(error: unknown): string {
  switch (getErrorCode(error)) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/cancelled":
    case "auth/cancelled-native":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "The sign-in popup was blocked. Allow popups and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/wrong-domain":
      return DOMAIN_REJECTION_MESSAGE;
    case "auth/unverified-email":
      return "Verify your email address before signing in.";
    case "permission-denied":
    case "firestore/permission-denied":
      return "You do not have permission to access this data.";
    case "unavailable":
    case "firestore/unavailable":
      return "The service is temporarily unavailable. Please try again.";
    default:
      return GENERIC_ERROR;
  }
}
