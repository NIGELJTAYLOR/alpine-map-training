/**
 * SM-2 spaced-repetition algorithm.
 *
 * Reference: SuperMemo SM-2 (Wozniak), with the standard Anki-style 4-button
 * mapping:
 *   - "Again" → quality 1 (got it wrong; reset interval)
 *   - "Hard"  → quality 3 (correct but difficult; small ease drop)
 *   - "Good"  → quality 4 (correct with normal effort)
 *   - "Easy"  → quality 5 (correct, easy; ease bump)
 */

export type Rating = "again" | "hard" | "good" | "easy";

export interface CardSchedule {
  /** Easiness factor (≥1.3, defaults to 2.5). */
  easiness: number;
  /** Number of consecutive successful repetitions. */
  repetitions: number;
  /** Days until next review when last scheduled. */
  intervalDays: number;
  /** ISO date this card is next due. */
  dueDate: string;
  /** ISO timestamp of last review. */
  lastReviewed?: string;
  /** Last quality rating, 0-5. */
  lastQuality?: number;
}

export const DEFAULT_EASINESS = 2.5;

const RATING_TO_QUALITY: Record<Rating, number> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export function emptySchedule(): CardSchedule {
  return {
    easiness: DEFAULT_EASINESS,
    repetitions: 0,
    intervalDays: 0,
    dueDate: todayIso(),
  };
}

/**
 * Apply a rating to a card's schedule. Returns the new schedule.
 */
export function applyRating(
  prior: CardSchedule | undefined,
  rating: Rating,
  now: Date = new Date(),
): CardSchedule {
  const sched = prior ?? emptySchedule();
  const quality = RATING_TO_QUALITY[rating];

  let { easiness, repetitions, intervalDays } = sched;

  if (quality < 3) {
    // Wrong / Again: reset repetitions, schedule for tomorrow.
    repetitions = 0;
    intervalDays = 1;
  } else {
    // Correct: increase repetitions and grow the interval.
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easiness);
    }
    repetitions += 1;
  }

  // Standard SM-2 easiness update. Floor at 1.3.
  easiness = Math.max(
    1.3,
    easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  );

  const due = new Date(now);
  due.setUTCHours(0, 0, 0, 0);
  due.setUTCDate(due.getUTCDate() + intervalDays);

  return {
    easiness,
    repetitions,
    intervalDays,
    dueDate: due.toISOString().slice(0, 10),
    lastReviewed: now.toISOString(),
    lastQuality: quality,
  };
}

/**
 * Is this card due for review on the given date (default: today)?
 * A card with no schedule yet is considered due (it has never been studied).
 */
export function isDue(sched: CardSchedule | undefined, date: Date = new Date()): boolean {
  if (!sched) return true;
  const today = isoDate(date);
  return sched.dueDate <= today;
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Format a "due in X" hint for the deck card UI.
 */
export function dueHint(sched: CardSchedule | undefined, date: Date = new Date()): string {
  if (!sched) return "new";
  const today = isoDate(date);
  if (sched.dueDate <= today) return "due";
  // Days from today to due date
  const a = Date.parse(today);
  const b = Date.parse(sched.dueDate);
  const days = Math.round((b - a) / 86400000);
  if (days === 1) return "tomorrow";
  if (days < 7) return `in ${days}d`;
  if (days < 30) return `in ${Math.round(days / 7)}w`;
  return `in ${Math.round(days / 30)}mo`;
}
