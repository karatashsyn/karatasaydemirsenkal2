export const parseUintArrayString = (str) => {
  if (!str) return [];
  return str.split(",").map((s) => ethers.toBigInt(s.trim()));
};
