export const dateToISO = (date: Date) =>
  date instanceof Date ? date.toISOString().split("T")[0] : date;

export const ISOToDate = (isoDate: string) => new Date(isoDate);

export function formatDate(date: Date): string {
  const day = date.getDate();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];

  let daySuffix: string;

  if ([11, 12, 13].includes(day)) {
    daySuffix = "th";
  } else if (day % 10 === 1) {
    daySuffix = "st";
  } else if (day % 10 === 2) {
    daySuffix = "nd";
  } else if (day % 10 === 3) {
    daySuffix = "rd";
  } else {
    daySuffix = "th";
  }

  return `${month} ${day}${daySuffix}`;
}
export const dateToHumanReadable = (date: Date | string): string => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} sec ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  return date.toLocaleString("en-US");
};
export function calculateRemainingTime(
  startedAt: Date,
  endingAt: Date,
): string {
  const today = new Date();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day

  // Function to determine singular or plural form
  const formatTime = (count: number, singular: string, plural: string) =>
    `${count} ${count === 1 ? singular : plural} left`;

  // Ensure the current date is within the range
  if (today < startedAt) {
    return ""; // Return empty string if the date is before the start
  }

  if (today > endingAt) {
    // Handling the case where today's date is past the ending date
    return "Time budget ended";
  }

  // Calculate the difference in days
  const diffDays = Math.round(
    Math.abs((endingAt.getTime() - today.getTime()) / oneDay),
  );

  // Check if the time budget has ended
  if (diffDays === 0) {
    return "Time budget ended";
  }

  return formatTime(diffDays, "day", "days");
}
