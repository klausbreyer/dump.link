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

export const dateToYYYYMMDD = (date: Date): string => {
  // do not convert to utc date, because the database is without timezone, just saved this date.
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const formattedDay = day < 10 ? `0${day}` : `${day}`;

  return `${year}-${formattedMonth}-${formattedDay}`;
};

export function calculateRemainingTime(
  startedAt: Date,
  endingAt: Date,
): string {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in a day

  // Function to determine singular or plural form and handle negative days
  const formatTime = (count: number, singular: string, plural: string) => {
    const absCount = Math.abs(count);
    const postfix = count < 0 ? "overdue" : "left";
    return `${absCount} ${absCount === 1 ? singular : plural} ${postfix}`;
  };

  // Normalize startedAt and endingAt to ignore time part
  startedAt.setHours(0, 0, 0, 0);
  endingAt.setHours(0, 0, 0, 0);

  // Ensure the current date is within the range
  if (today < startedAt) {
    return ""; // Return empty string if the date is before the start
  }

  if (today >= endingAt) {
    // Calculate the difference in days (negative value, use Math.ceil for overdue)
    const overdueDays = Math.ceil(
      (today.getTime() - endingAt.getTime()) / oneDay,
    );
    return formatTime(-overdueDays, "day", "days"); // Negative because it's overdue
  }

  // Calculate the difference in days (positive value for remaining time, use Math.floor)
  const remainingDays = Math.floor(
    (endingAt.getTime() - today.getTime()) / oneDay,
  );

  // Check if the time budget has ended
  if (remainingDays <= 0) {
    return "Time budget ended";
  }

  return formatTime(remainingDays, "day", "days");
}
