/** Adds working days, skipping Sundays. */
export function addWorkingDays(start: Date, days: number) {
  const date = new Date(start);
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0) left -= 1;
  }
  return date;
}

export function deliveryEstimate(now: Date, dispatchDays: number, transitDays: number) {
  const dispatch = addWorkingDays(now, Math.max(0, dispatchDays));
  const delivery = addWorkingDays(dispatch, Math.max(0, transitDays));
  return { dispatch, delivery };
}
