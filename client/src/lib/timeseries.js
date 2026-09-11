function startOfWeek(d) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Monday = 0
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

const WEEKDAY_MONTH = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });

// Buckets `dates` (array of Date) into `weeks` consecutive weekly counts ending this week.
export function weeklyCounts(dates, weeks = 6) {
  const start = startOfWeek(new Date());
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() - 7 * i);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + 7);
    const count = dates.filter((d) => d >= bucketStart && d < bucketEnd).length;
    buckets.push({ label: WEEKDAY_MONTH.format(bucketStart), start: bucketStart, count });
  }
  return buckets;
}

// Buckets `entries` ({date, value}) into weekly averages; null where no data that week.
export function weeklyAverages(entries, weeks = 6) {
  const start = startOfWeek(new Date());
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const bucketStart = new Date(start);
    bucketStart.setDate(start.getDate() - 7 * i);
    const bucketEnd = new Date(bucketStart);
    bucketEnd.setDate(bucketStart.getDate() + 7);
    const inBucket = entries.filter((e) => e.date >= bucketStart && e.date < bucketEnd);
    const avg = inBucket.length
      ? inBucket.reduce((sum, e) => sum + e.value, 0) / inBucket.length
      : null;
    buckets.push({ label: WEEKDAY_MONTH.format(bucketStart), start: bucketStart, value: avg });
  }
  return buckets;
}

// % change of the last bucket vs the one before it. Returns null when not computable.
export function lastChangePct(buckets, key = 'count') {
  if (buckets.length < 2) return null;
  const prev = buckets[buckets.length - 2][key];
  const curr = buckets[buckets.length - 1][key];
  if (prev === null || curr === null) return null;
  if (prev === 0) return curr === 0 ? 0 : null;
  return ((curr - prev) / prev) * 100;
}
