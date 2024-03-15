import { UserID, UserName as UserId } from "../Project/types";
import { isOrgLink } from "../Routing";

export function getUsername(): UserId {
  return localStorage.getItem("username") || "";
}

export function isAnonymous(userID: UserId): boolean {
  if (isOrgLink()) return false;
  const username = extractUsername(userID);
  return username.length === 0;
}

export function isSelf(userID: UserId, sub: UserID | null): boolean {
  if (sub !== null && isOrgLink()) {
    return userID === sub;
  }

  const username = extractUsername(userID);
  console.log("isSelf", userID, username, getUsername());
  return username === getUsername();
}

export function extractInitials(userId: UserId): string {
  const username = extractUsername(userId);
  return extractInitialsFromUsername(username);
}

export function extractInitialsFromUsername(username: string): string {
  if (username.length === 0) return "";
  if (username.length < 3) return username;

  const parts = username.split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0) + parts[0].charAt(1);
  } else {
    return parts[0].charAt(0) + parts[1].charAt(0);
  }
}

export const getUsernameFromPrompt = (defaultUsername: string = ""): string => {
  const promptMessage =
    "Please enter your name as you would like your team to see it";
  let username = prompt(promptMessage, defaultUsername || getUsername());
  if (!username && getUsername()) {
    return getUsername();
  }
  if (!username) {
    username = defaultUsername;
  }
  localStorage.setItem("username", username);
  return username;
};

export function extractUsername(userId: string): string {
  const underscoreIndex = userId.indexOf("_");
  if (underscoreIndex === -1) {
    console.log(userId);

    throw new Error("No underscore (_) found in the string." + userId);
  }
  // Extract everything after the first underscore
  const encodedPart = userId.substring(underscoreIndex + 1);
  // Decode the extracted part using JavaScript's native decodeURIComponent function
  return decodeURIComponent(encodedPart);
}

export function isPublicUser(input: string): boolean {
  const pattern = /^dumplink\|.*_/;
  return pattern.test(input);
}
