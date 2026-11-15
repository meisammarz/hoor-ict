const digits = "۰۱۲۳۴۵۶۷۸۹";

export function faNum(value: number | string) {
  return String(value).replace(/\d/g, (digit) => digits[Number(digit)] ?? digit);
}
