const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const count = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});
const month = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
});

export const formatMoney = (value: number) => currency.format(value);
export const formatCount = (value: number) => count.format(value);
export const formatDate = (value: string) => date.format(new Date(value));
export const formatMonth = (value: string) => month.format(new Date(value));
export const formatMonthShort = (value: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(
    new Date(value),
  );
