/**
 * validation/validators.ts
 *
 * Framework-agnostic, dependency-free composable validators for the
 * HusnainBlogger.com 500 Mini Tools platform.
 *
 * Design notes:
 * - A Validator is a pure function: (value: unknown) => string | null.
 *   It returns an error message when invalid, null when valid.
 * - Convention: every validator EXCEPT `required` treats an empty value
 *   (null, undefined, "", whitespace-only) as VALID. Use `required` to
 *   enforce presence. This keeps optional fields simple.
 * - Validators never throw, never log, never execute user input.
 * - Only erasable TypeScript syntax is used (no enums, no namespaces),
 *   so these files run directly under Node type-stripping and any bundler.
 */

export type Validator = (value: unknown) => string | null;

export interface ValidatorOptions {
  /** Override the default error message for this validator. */
  message?: string;
}

/** True for null, undefined, "", whitespace-only strings, and empty arrays. */
export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Coerce a number or numeric string to a number.
 * Returns NaN for anything non-numeric (including "" and booleans).
 */
export function coerceNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return NaN;
    const n = Number(trimmed);
    return n;
  }
  return NaN;
}

function messageOr(override: string | undefined, fallback: string): string {
  return override ?? fallback;
}

/* ------------------------------------------------------------------ */
/* Presence                                                            */
/* ------------------------------------------------------------------ */

/** Value must be present (not null/undefined/empty/whitespace-only). */
export function required(options: ValidatorOptions = {}): Validator {
  return (value) =>
    isEmptyValue(value)
      ? messageOr(options.message, 'This field is required.')
      : null;
}

/* ------------------------------------------------------------------ */
/* Numbers                                                             */
/* ------------------------------------------------------------------ */

/** Value must be numeric (number or numeric string). */
export function isNumber(options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    return Number.isNaN(coerceNumber(value))
      ? messageOr(options.message, 'Enter a valid number.')
      : null;
  };
}

/** Value must be a whole number (no decimals). Accepts numeric strings. */
export function integer(options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const n = coerceNumber(value);
    if (Number.isNaN(n)) {
      return messageOr(options.message, 'Enter a valid number.');
    }
    return Number.isInteger(n)
      ? null
      : messageOr(options.message, 'Enter a whole number (no decimals).');
  };
}

/**
 * Value must be a finite number (rejects NaN, Infinity, -Infinity).
 * Use this as a calculation/input guard wherever math happens.
 */
export function finiteNumber(options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const n = coerceNumber(value);
    return typeof n === 'number' && Number.isFinite(n)
      ? null
      : messageOr(
          options.message,
          'Enter a valid number (not too large to calculate).'
        );
  };
}

/** Numeric value must be >= min. */
export function min(minValue: number, options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const n = coerceNumber(value);
    if (Number.isNaN(n)) {
      return messageOr(options.message, 'Enter a valid number.');
    }
    return n >= minValue
      ? null
      : messageOr(options.message, `Enter ${minValue} or more.`);
  };
}

/** Numeric value must be <= max. */
export function max(maxValue: number, options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const n = coerceNumber(value);
    if (Number.isNaN(n)) {
      return messageOr(options.message, 'Enter a valid number.');
    }
    return n <= maxValue
      ? null
      : messageOr(options.message, `Enter ${maxValue} or less.`);
  };
}

/**
 * Numeric value must have at most `maxPlaces` decimal places.
 * Float-safe: compares with a small tolerance instead of exact equality.
 */
export function decimalPrecision(
  maxPlaces: number,
  options: ValidatorOptions = {}
): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const n = coerceNumber(value);
    if (Number.isNaN(n) || !Number.isFinite(n)) {
      return messageOr(options.message, 'Enter a valid number.');
    }
    const factor = 10 ** maxPlaces;
    const scaled = n * factor;
    const isWithinPrecision =
      Math.abs(scaled - Math.round(scaled)) < 1e-8;
    return isWithinPrecision
      ? null
      : messageOr(
          options.message,
          `Use at most ${maxPlaces} decimal place${maxPlaces === 1 ? '' : 's'}.`
        );
  };
}

/* ------------------------------------------------------------------ */
/* Strings                                                             */
/* ------------------------------------------------------------------ */

/** String length must be >= n (counts user-perceived characters). */
export function minLength(n: number, options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const s = String(value);
    return [...s].length >= n
      ? null
      : messageOr(options.message, `Enter at least ${n} characters.`);
  };
}

/** String length must be <= n. */
export function maxLength(n: number, options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const s = String(value);
    return [...s].length <= n
      ? null
      : messageOr(options.message, `Keep it to ${n} characters or fewer.`);
  };
}

/** Value must match the given regular expression. */
export function pattern(
  regex: RegExp,
  options: ValidatorOptions = {}
): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const s = String(value);
    // Reset lastIndex so global regexes behave deterministically.
    regex.lastIndex = 0;
    return regex.test(s)
      ? null
      : messageOr(options.message, 'This value is not in the right format.');
  };
}

/**
 * Practical email check (not full RFC 5322 — intentionally strict enough
 * to catch typos, loose enough to accept real addresses).
 */
export function email(options: ValidatorOptions = {}): Validator {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return (value) => {
    if (isEmptyValue(value)) return null;
    const s = String(value).trim();
    return emailRegex.test(s)
      ? null
      : messageOr(
          options.message,
          'Enter a valid email address, like name@example.com.'
        );
  };
}

/** Must be an http(s) URL with a host. Rejects javascript:, data:, etc. */
export function url(options: ValidatorOptions = {}): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    const s = String(value).trim();
    try {
      const parsed = new URL(s);
      const okProtocol =
        parsed.protocol === 'http:' || parsed.protocol === 'https:';
      if (okProtocol && parsed.host) return null;
    } catch {
      // fall through to error
    }
    return messageOr(
      options.message,
      'Enter a valid web address starting with http:// or https://.'
    );
  };
}

/** Value must be one of the allowed values (strict equality). */
export function oneOf(
  allowed: readonly unknown[],
  options: ValidatorOptions = {}
): Validator {
  return (value) => {
    if (isEmptyValue(value)) return null;
    return allowed.includes(value)
      ? null
      : messageOr(
          options.message,
          `Choose one of: ${allowed.map(String).join(', ')}.`
        );
  };
}

/** Alias for oneOf, for enum-style fields. */
export const enumOf = oneOf;

/* ------------------------------------------------------------------ */
/* Safety                                                              */
/* ------------------------------------------------------------------ */

/**
 * Rejects strings that look like executable markup/script.
 * This is a first-line input guard only — it is NOT a sanitizer and NOT
 * a security boundary. Always also escape output (see sanitize.ts).
 *
 * Rejected: <script> tags, javascript:/vbscript:/data:text/html URIs,
 * <iframe>/<object>/<embed> tags, and inline event handlers (onerror= etc).
 */
export function noScript(options: ValidatorOptions = {}): Validator {
  const dangerous: RegExp[] = [
    /<\s*script/i,
    /<\/\s*script/i,
    /javascript\s*:/i,
    /vbscript\s*:/i,
    /data\s*:\s*text\/html/i,
    /<\s*iframe/i,
    /<\s*object/i,
    /<\s*embed/i,
    /\son\w+\s*=/i, // inline event handler, e.g. onerror=
  ];
  return (value) => {
    if (isEmptyValue(value)) return null;
    if (typeof value !== 'string') return null;
    const hit = dangerous.some((re) => {
      re.lastIndex = 0;
      return re.test(value);
    });
    return hit
      ? messageOr(
          options.message,
          'That input looks like code and can’t be used here.'
        )
      : null;
  };
}

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

/**
 * Run every validator against the value; collect ALL error messages.
 * Use for rendering a full list of problems under one field.
 */
export function runValidators(value: unknown, validators: Validator[]): string[] {
  const messages: string[] = [];
  for (const validate of validators) {
    const result = validate(value);
    if (result !== null) messages.push(result);
  }
  return messages;
}

/**
 * Combine validators into one that returns the FIRST error only.
 * Use when a field should show a single message at a time.
 */
export function combine(...validators: Validator[]): Validator {
  return (value) => {
    for (const validate of validators) {
      const result = validate(value);
      if (result !== null) return result;
    }
    return null;
  };
}
