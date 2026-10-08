/**
 * validation/errors.ts
 *
 * Typed error model for tool pages:
 *   { code, field?, message, severity }
 *
 * - ERROR_MESSAGES is the single user-facing message catalog (English,
 *   written for a US/UK/CA/AU audience, plain language, no jargon).
 * - makeError() builds a ToolError from a code + parameters.
 * - guardCalculation() wraps any calculation so division-by-zero, NaN,
 *   Infinity and overflows become friendly messages — never raw "NaN".
 */

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ErrorCode =
  | 'REQUIRED'
  | 'NOT_A_NUMBER'
  | 'NOT_AN_INTEGER'
  | 'TOO_SMALL'
  | 'TOO_LARGE'
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'PRECISION_EXCEEDED'
  | 'BAD_FORMAT'
  | 'INVALID_EMAIL'
  | 'INVALID_URL'
  | 'NOT_ALLOWED_VALUE'
  | 'SCRIPT_REJECTED'
  | 'DIVIDE_BY_ZERO'
  | 'NOT_FINITE'
  | 'CALC_FAILED'
  | 'INVALID_SHARED_STATE';

export interface ToolError {
  code: ErrorCode;
  /** Field name/path the error belongs to, if any. */
  field?: string;
  /** User-facing message (from the catalog, never a stack trace). */
  message: string;
  severity: ErrorSeverity;
}

export type MessageParams = Record<string, string | number>;
export type ErrorMessageFn = (params?: MessageParams) => string;

function labelOf(params?: MessageParams): string {
  const label = params?.label;
  return typeof label === 'string' && label.length > 0 ? label : 'This field';
}

/**
 * The single catalog of user-facing messages. All messages:
 * - are plain English (US/UK/CA/AU audience),
 * - name the problem and hint at the fix,
 * - never expose internals ("NaN", "undefined", stack traces).
 */
export const ERROR_MESSAGES: Record<ErrorCode, ErrorMessageFn> = {
  REQUIRED: (p) => `${labelOf(p)} is required.`,
  NOT_A_NUMBER: (p) => `${labelOf(p)} must be a number.`,
  NOT_AN_INTEGER: (p) => `${labelOf(p)} must be a whole number (no decimals).`,
  TOO_SMALL: (p) => `${labelOf(p)} must be ${p?.min ?? 'a larger value'} or more.`,
  TOO_LARGE: (p) => `${labelOf(p)} must be ${p?.max ?? 'a smaller value'} or less.`,
  TOO_SHORT: (p) =>
    `${labelOf(p)} must be at least ${p?.count ?? 'a few'} characters.`,
  TOO_LONG: (p) =>
    `${labelOf(p)} must be no more than ${p?.count ?? 'fewer'} characters.`,
  PRECISION_EXCEEDED: (p) =>
    `${labelOf(p)} can have at most ${p?.places ?? 'a few'} decimal places.`,
  BAD_FORMAT: (p) => `${labelOf(p)} isn’t in the right format.`,
  INVALID_EMAIL: () =>
    'Enter a valid email address, like name@example.com.',
  INVALID_URL: () =>
    'Enter a valid web address starting with http:// or https://.',
  NOT_ALLOWED_VALUE: (p) =>
    `${labelOf(p)} must be one of: ${p?.allowed ?? 'the listed options'}.`,
  SCRIPT_REJECTED: () =>
    'That input looks like code and can’t be used here.',
  DIVIDE_BY_ZERO: () =>
    'Can’t divide by zero — check the numbers you entered.',
  NOT_FINITE: () =>
    'That calculation didn’t produce a valid result. Check for a zero divisor or extremely large numbers.',
  CALC_FAILED: () =>
    'Something went wrong with this calculation. Check your inputs and try again.',
  INVALID_SHARED_STATE: () =>
    'This shared link looks broken or outdated. Please re-enter your values.',
};

export interface MakeErrorOptions {
  field?: string;
  params?: MessageParams;
  severity?: ErrorSeverity;
}

/** Build a ToolError from a catalog code. Never throws. */
export function makeError(
  code: ErrorCode,
  options: MakeErrorOptions = {}
): ToolError {
  const messageFn = ERROR_MESSAGES[code];
  return {
    code,
    field: options.field,
    message: messageFn(options.params),
    severity: options.severity ?? 'error',
  };
}

/**
 * True only for real, finite numbers. Use on any computed value before
 * rendering it, so the UI can never show "NaN" or "Infinity".
 */
export function isUsableNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export type GuardedResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ToolError };

export interface GuardOptions {
  field?: string;
}

/**
 * Run a calculation and convert every numeric failure mode into a
 * friendly ToolError:
 *  - NaN result            → NOT_FINITE
 *  - ±Infinity result      → NOT_FINITE (covers division by zero and overflow)
 *  - thrown exception      → CALC_FAILED
 *
 * Never returns raw "NaN"/"Infinity" to the caller. The caller renders
 * `error.message` as-is.
 *
 * NOTE: this guards the FINAL result. If a tool divides mid-formula and
 * the intermediate division matters to the user (e.g. "per-unit cost"),
 * guard that intermediate step with its own guardCalculation call.
 */
export function guardCalculation<T>(
  fn: () => T,
  options: GuardOptions = {}
): GuardedResult<T> {
  try {
    const value = fn();
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return {
        ok: false,
        error: makeError('NOT_FINITE', { field: options.field }),
      };
    }
    return { ok: true, value };
  } catch {
    return {
      ok: false,
      error: makeError('CALC_FAILED', { field: options.field }),
    };
  }
}

/**
 * Guard a division explicitly, so "x ÷ 0" gets the specific
 * DIVIDE_BY_ZERO message instead of the generic NOT_FINITE one.
 */
export function guardDivide(
  numerator: number,
  denominator: number,
  options: GuardOptions = {}
): GuardedResult<number> {
  if (!isUsableNumber(numerator) || !isUsableNumber(denominator)) {
    return {
      ok: false,
      error: makeError('NOT_FINITE', { field: options.field }),
    };
  }
  if (denominator === 0) {
    return {
      ok: false,
      error: makeError('DIVIDE_BY_ZERO', { field: options.field }),
    };
  }
  return guardCalculation(() => numerator / denominator, options);
}
