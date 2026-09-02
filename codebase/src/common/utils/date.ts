export function handleDateAddition(date: Date, days: number) {
  date.setDate(date.getDate() + days);
  return date;
}
