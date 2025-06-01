import { ethers } from "ethers";

export const parseUintArrayString = (str) => {
  if (!str) return [];
  return str.split(",").map((s) => ethers.toBigInt(s.trim()));
};

export function unixToDatetimeLocal(unixTime) {
  if (!unixTime) return "";
  const date = new Date(
    typeof unixTime === "bigint" ? Number(unixTime) * 1000 : unixTime * 1000
  );
  const pad = (n) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function datetimeLocalToUnix(datetimeStr) {
  const date = new Date(datetimeStr);
  return Math.floor(date.getTime() / 1000);
}

export function getReadableDate(unixTime) {
  const dateString = unixToDatetimeLocal(unixTime);
  const [date, time] = dateString.split("T");
  return `${date}, Time: ${time}`;
}
