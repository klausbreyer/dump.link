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
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedMonth = month < 10 ? `0${month}` : `${month}`;
  const formattedDay = day < 10 ? `0${day}` : `${day}`;

  return `${year}-${formattedMonth}-${formattedDay}`;
};
export function calculateTimeDifference(
  startedAt: Date,
  endingAt: Date,
): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startedAt.setHours(0, 0, 0, 0);
  endingAt.setHours(0, 0, 0, 0);

  const oneDay = 24 * 60 * 60 * 1000;

  if (today < startedAt) {
    return Infinity; // Indicates the start date is not reached yet
  }

  if (today >= endingAt) {
    return Math.ceil((today.getTime() - endingAt.getTime()) / oneDay) * -1;
  }

  return Math.floor((endingAt.getTime() - today.getTime()) / oneDay);
}

export function formatTimeDifference(timeDifference: number): string {
  if (timeDifference === Infinity) {
    return "";
  }

  const absTimeDifference = Math.abs(timeDifference);
  const postfix = timeDifference < 0 ? "over" : "left";
  const timeUnit = absTimeDifference === 1 ? "day" : "days";

  return `${absTimeDifference} ${timeUnit} ${postfix}`;
}
