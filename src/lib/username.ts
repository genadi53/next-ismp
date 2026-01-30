const PLACEHOLDER_USERNAME = "test@testov";

/**
 * Derives a username from an email by taking the local part (before @).
 * Returns a placeholder when the email is null, empty, or invalid (no @).
 * Use this for CreatedFrom / LastUpdatedFrom / EditedFrom before insert/update.
 */
export function usernameFromEmail(email: string | null): string {
  if (email == null || email.trim() === "") {
    return PLACEHOLDER_USERNAME;
  }
  const at = email.indexOf("@");
  if (at < 0) {
    return PLACEHOLDER_USERNAME;
  }
  const local = email.slice(0, at).trim();
  return local || PLACEHOLDER_USERNAME;
}

export function emailFromUsername(username: string | null): string {
  return username?.concat("@ellatzite-med.com") ?? "";
}

export function nameInput(username: string, nameBg: string): string {
  return nameBg + " (" + username + ")";
}

export function initialsFromName(name: string | null | undefined): string {
  if (!name || name.trim() === "") {
    return "";
  }

  const parts = name.split(" ");
  if (parts.length === 0) {
    return "";
  }

  return (
    parts[0]?.charAt(0) + (parts[parts.length - 1]?.charAt(0) ?? "")
  ).toUpperCase();
}
