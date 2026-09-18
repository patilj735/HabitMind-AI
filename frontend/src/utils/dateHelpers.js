import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

export const toKey = (d) => format(d, "yyyy-MM-dd");
export const todayKey = () => toKey(new Date());

export const last7Days = () => {
  const end = new Date();
  const start = subDays(end, 6);
  return eachDayOfInterval({ start, end }).map((d) => ({
    key: toKey(d),
    label: format(d, "EEE"),
    short: format(d, "d"),
    date: d,
  }));
};

export const last90Days = () => {
  const end = new Date();
  const start = subDays(end, 89);
  return eachDayOfInterval({ start, end }).map((d) => toKey(d));
};

export const weekKeys = () => weekKeysFor(new Date());

export const weekKeysFor = (date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map((d) => ({
    key: toKey(d),
    label: format(d, "EEE"),
    short: format(d, "d"),
    date: d,
  }));
};

export const prettyDate = (d) => format(d instanceof Date ? d : new Date(d), "MMM d, yyyy");

export const streakFromKeys = (keys) => {
  if (!keys?.length) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...new Set(keys)].sort();

  const parseKey = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const today = todayKey();
  const yesterday = toKey(subDays(new Date(), 1));

  const set = new Set(sorted);

  let current = 0;

  // A streak is active if today OR yesterday is completed.
  if (set.has(today) || set.has(yesterday)) {
    let cursor = set.has(today)
      ? parseKey(today)
      : parseKey(yesterday);

    while (set.has(toKey(cursor))) {
      current++;
      cursor = subDays(cursor, 1);
    }
  }

  let longest = 0;
  let run = 0;
  let previousDate = null;

  for (const key of sorted) {
    const currentDate = parseKey(key);

    if (previousDate === null) {
      run = 1;
    } else {
      const diff =
        Math.round(
          (currentDate.getTime() - previousDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

      if (diff === 1) {
        run++;
      } else {
        run = 1;
      }
    }

    longest = Math.max(longest, run);
    previousDate = currentDate;
  }

  return {
    current,
    longest,
  };
};