const PLACEHOLDER_USERNAME = "test@testov";

/**
 * Derives a username from an email.
 * Returns a placeholder when the email is null, empty, or invalid.
 * Use this for CreatedFrom/ LastUpdatedFrom/ EditedFrom before insert/update.
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

/**
 * Helper function to format names
 * to remove system_name part "name(system_name)"
 */
export function formatName(dispName: string | null) {
  if (!dispName) return { fullName: "-", sysName: "" };
  const parts = dispName.split("(");
  const fullName = parts[0]?.trim() ?? "-";
  const sysName = parts[1] ? parts[1].replaceAll(")", "").trim() : "";
  return {
    fullName,
    sysName,
  };
}
