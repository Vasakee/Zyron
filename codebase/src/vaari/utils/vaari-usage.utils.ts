import { Granularity } from '../dto/analytics.dto';

export function weekWindow(now = new Date()) {
  const n = new Date(now);
  const dow = (n.getUTCDay() + 6) % 7;
  const start = new Date(
    Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() - dow),
  );
  const end = new Date(
    Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + 6,
      23,
      59,
      59,
      999,
    ),
  );
  return { start, end };
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

export function defaultRange(granularity: Granularity): {
  from: Date;
  to: Date;
} {
  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);
  if (granularity === 'daily') from.setUTCDate(from.getUTCDate() - 6);
  else if (granularity === 'weekly')
    from.setUTCDate(from.getUTCDate() - 7 * 11);
  else if (granularity === 'monthly') from.setUTCMonth(from.getUTCMonth() - 11);
  else from.setUTCFullYear(from.getUTCFullYear() - 6);
  return { from, to };
}

export function generateBuckets(
  granularity: Granularity,
  fromIso?: string,
  toIso?: string,
) {
  const rangeFrom = fromIso ? new Date(fromIso) : undefined;
  const rangeTo = toIso ? new Date(toIso) : undefined;
  const { from, to } =
    rangeFrom && rangeTo
      ? { from: rangeFrom, to: rangeTo }
      : defaultRange(granularity);
  const start = startOfUtcDay(from);
  const end = startOfUtcDay(to);
  const buckets: { start: Date; end: Date; label: string }[] = [];
  const cur = new Date(start);

  if (granularity === 'daily') {
    while (cur <= end) {
      const s = startOfUtcDay(cur);
      const e = new Date(s);
      e.setUTCDate(e.getUTCDate() + 1);
      const label = s.toLocaleDateString('en-US', { weekday: 'short' });
      buckets.push({ start: s, end: e, label });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
  } else if (granularity === 'weekly') {
    while (cur <= end) {
      const s = startOfUtcDay(cur);
      const day = s.getUTCDay() || 7;
      s.setUTCDate(s.getUTCDate() - day + 1);
      const e = new Date(s);
      e.setUTCDate(e.getUTCDate() + 7);
      const weekNum = Math.ceil(
        (s.getUTCDate() -
          1 +
          (new Date(
            Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1),
          ).getUTCDay() || 7)) /
          7,
      );
      buckets.push({ start: new Date(s), end: e, label: `Wk ${weekNum}` });
      cur.setUTCDate(cur.getUTCDate() + 7);
    }
  } else if (granularity === 'monthly') {
    while (cur <= end) {
      const s = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1));
      const e = new Date(
        Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1),
      );
      buckets.push({
        start: s,
        end: e,
        label: s.toLocaleString('en-US', { month: 'short' }),
      });
      cur.setUTCMonth(cur.getUTCMonth() + 1);
    }
  } else {
    while (cur <= end) {
      const s = new Date(Date.UTC(cur.getUTCFullYear(), 0, 1));
      const e = new Date(Date.UTC(cur.getUTCFullYear() + 1, 0, 1));
      buckets.push({ start: s, end: e, label: String(s.getUTCFullYear()) });
      cur.setUTCFullYear(cur.getUTCFullYear() + 1);
    }
  }

  return buckets.filter((b) => b.start <= end && b.end >= start);
}
