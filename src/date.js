// This module exists mainly to be mocked, but it also centralizes some logic
// to make the code leaner.

export function now() {
  return new Date(Date.now());
}

export function day(date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function today() {
  return this.day(this.now());
}

export function addDays(date, days) {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days,
    ),
  );
}

export function getWeek(date) {
  date = this.day(date);
  const sow = this.addDays(date, -date.getUTCDay());
  const dates = [sow];
  for (var dow = 1; dow < 7; dow++) {
    dates.push(this.addDays(sow, dow));
  }
  return dates;
}
