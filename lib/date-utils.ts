/**
 * Centralized helpers for converting between:
 *  - the browser's local wall-clock time (used by <input type="datetime-local">)
 *  - UTC instants (how we store and transmit all session times)
 *
 * Rule: scheduled_at is ALWAYS stored/transmitted as a UTC ISO string
 * (e.g. "2025-06-15T11:30:00.000Z"). Every display point converts that
 * UTC instant into the viewer's own local time using the browser's
 * built-in timezone conversion (toLocaleDateString/toLocaleTimeString),
 * so instructors and students each see the correct time in their own
 * timezone automatically — no manual offset math anywhere.
 */

/**
 * Converts a value from an <input type="datetime-local"> (e.g. "2025-06-15T14:30"),
 * which represents the user's LOCAL wall-clock time, into a UTC ISO string
 * suitable for sending to the API / storing in the database.
 */
export function localInputToUTCISOString(localDateTimeValue: string): string {
  // `new Date("2025-06-15T14:30")` is parsed by the JS spec as LOCAL time
  // (no timezone designator present), so .toISOString() correctly gives
  // us the equivalent UTC instant.
  return new Date(localDateTimeValue).toISOString()
}

/**
 * Safely parses a timestamp coming back from the database/API into a JS Date,
 * always treating it as a UTC instant — even if the driver returned it
 * without a trailing "Z" (which "timestamp without time zone" columns often do).
 */
export function parseUTCTimestamp(value: string | Date): Date {
  if (value instanceof Date) return value
  const hasTimezoneDesignator = /Z$|[+-]\d{2}:?\d{2}$/.test(value)
  return new Date(hasTimezoneDesignator ? value : `${value}Z`)
}

/**
 * Converts a UTC database timestamp into the correct value for an
 * <input type="datetime-local"> field, expressed in the VIEWER's local time.
 */
export function utcTimestampToLocalInputValue(value: string | Date): string {
  const date = parseUTCTimestamp(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}