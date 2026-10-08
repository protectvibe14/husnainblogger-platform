/**
 * validation/schema.ts
 *
 * Tiny declarative schema system for tool-page forms.
 *
 *   const schema = {
 *     price:    { type: 'number', label: 'Price', required: true, min: 0 },
 *     email:    { type: 'email',  label: 'Email', required: true },
 *     coupon:   { type: 'string', label: 'Coupon code',
 *                 requiredIf: (data) => data.hasCoupon === true,
 *                 maxLength: 20 },
 *   };
 *   const result = validateObject(formData, schema);
 *   // result = { ok, errors: { field: string[] }, values: {...} }
 *
 * - `errors` maps field paths ("address.zip", "tags[0]") to message arrays.
 * - `values` holds sanitized + coerced values (trimmed strings, numbers
 *   converted from numeric strings). Use `values` for calculations, and
 *   only when `ok` is true.
 * - String-family fields are sanitized (trim + normalize) by default
 *   before validation; set `sanitize: false` to opt out.
 * - `noScript` is applied by default to string/email/url fields as a
 *   defense-in-depth input guard; set `noScript: false` to opt out
 *   (e.g. a field that legitimately accepts the word "javascript:").
 * - Non-required validators skip empty values; `required`/`requiredIf`
 *   enforce presence.
 */

import {
  coerceNumber,
  isEmptyValue,
  noScript as noScriptValidator,
  runValidators,
} from './validators.ts';
import type { Validator } from './validators.ts';
import { sanitizeText } from './sanitize.ts';
import type { SanitizeTextOptions } from './sanitize.ts';

export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'email'
  | 'url'
  | 'enum'
  | 'object'
  | 'array';

/** Per-rule message overrides. Keys not set fall back to defaults. */
export interface FieldMessages {
  required?: string;
  type?: string;
  min?: string;
  max?: string;
  minLength?: string;
  maxLength?: string;
  precision?: string;
  pattern?: string;
  enum?: string;
  noScript?: string;
}

export interface FieldSchema {
  type: FieldType;
  /** Human-readable name used in error messages ("Price", "Email"). */
  label: string;
  required?: boolean;
  /**
   * Conditional requirement: evaluated against the ROOT data object.
   * Takes precedence over `required` when both are set.
   */
  requiredIf?: (rootData: Record<string, unknown>) => boolean;
  /** Allowed values for type 'enum'. */
  enumValues?: readonly unknown[];
  /** Nested schema for type 'object'. */
  schema?: Schema;
  /** Item schema for type 'array'. */
  items?: FieldSchema;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  /** Max decimal places for type 'number'. */
  precision?: number;
  pattern?: RegExp;
  /** Extra custom validators run after built-in checks. */
  validators?: Validator[];
  /** Per-rule message overrides. */
  messages?: FieldMessages;
  /** Sanitize string inputs before validation (default true). */
  sanitize?: boolean | SanitizeTextOptions;
  /** Apply the noScript input guard (default true for string/email/url). */
  noScript?: boolean;
}

export type Schema = Record<string, FieldSchema>;

export interface ObjectValidationResult {
  ok: boolean;
  /** Field path → messages. Nested paths use dots ("a.b") and array indices ("t[0]"). */
  errors: Record<string, string[]>;
  /** Sanitized/coerced values. Only trustworthy when ok === true. */
  values: Record<string, unknown>;
}

function addError(
  errors: Record<string, string[]>,
  path: string,
  message: string
): void {
  if (!errors[path]) errors[path] = [];
  errors[path].push(message);
}

function sanitizeStringField(
  raw: unknown,
  field: FieldSchema
): unknown {
  if (typeof raw !== 'string') return raw;
  if (field.sanitize === false) return raw;
  const options: SanitizeTextOptions =
    typeof field.sanitize === 'object' ? field.sanitize : {};
  return sanitizeText(raw, options);
}

function checkType(
  value: unknown,
  field: FieldSchema,
  path: string,
  errors: Record<string, string[]>
): { value: unknown; failed: boolean } {
  const typeMsg = field.messages?.type;
  switch (field.type) {
    case 'string': {
      if (typeof value !== 'string') {
        addError(errors, path, typeMsg ?? `${field.label} must be text.`);
        return { value, failed: true };
      }
      return { value, failed: false };
    }
    case 'number': {
      const n = coerceNumber(value);
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        addError(errors, path, typeMsg ?? `${field.label} must be a number.`);
        return { value, failed: true };
      }
      return { value: n, failed: false };
    }
    case 'integer': {
      const n = coerceNumber(value);
      if (Number.isNaN(n) || !Number.isFinite(n) || !Number.isInteger(n)) {
        addError(
          errors,
          path,
          typeMsg ?? `${field.label} must be a whole number.`
        );
        return { value, failed: true };
      }
      return { value: n, failed: false };
    }
    case 'boolean': {
      if (typeof value !== 'boolean') {
        addError(errors, path, typeMsg ?? `${field.label} is invalid.`);
        return { value, failed: true };
      }
      return { value, failed: false };
    }
    case 'email': {
      if (typeof value !== 'string') {
        addError(errors, path, typeMsg ?? `${field.label} must be text.`);
        return { value, failed: true };
      }
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
      if (!ok) {
        addError(
          errors,
          path,
          typeMsg ?? 'Enter a valid email address, like name@example.com.'
        );
        return { value, failed: true };
      }
      return { value, failed: false };
    }
    case 'url': {
      if (typeof value !== 'string') {
        addError(errors, path, typeMsg ?? `${field.label} must be text.`);
        return { value, failed: true };
      }
      let ok = false;
      try {
        const parsed = new URL(value.trim());
        ok =
          (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
          parsed.host.length > 0;
      } catch {
        ok = false;
      }
      if (!ok) {
        addError(
          errors,
          path,
          typeMsg ?? 'Enter a valid web address starting with http:// or https://.'
        );
        return { value, failed: true };
      }
      return { value, failed: false };
    }
    case 'enum': {
      const allowed = field.enumValues ?? [];
      if (!allowed.includes(value)) {
        addError(
          errors,
          path,
          field.messages?.enum ??
            `${field.label} must be one of: ${allowed.map(String).join(', ')}.`
        );
        return { value, failed: true };
      }
      return { value, failed: false };
    }
    case 'object':
    case 'array':
      // Handled by the caller (nested validation). Reaching here means
      // a programming error in validateField — fail closed.
      addError(errors, path, `${field.label} is invalid.`);
      return { value, failed: true };
  }
}

function validateField(
  rawValue: unknown,
  field: FieldSchema,
  path: string,
  rootData: Record<string, unknown>,
  errors: Record<string, string[]>
): unknown {
  const label = field.label;

  /* --- nested object --- */
  if (field.type === 'object') {
    const nested = field.schema ?? {};
    const value =
      rawValue !== null && typeof rawValue === 'object' && !Array.isArray(rawValue)
        ? (rawValue as Record<string, unknown>)
        : {};
    const result = validateObject(value, nested, rootData, path);
    for (const key of Object.keys(result.errors)) {
      errors[key] = result.errors[key];
    }
    return result.values;
  }

  /* --- array --- */
  if (field.type === 'array') {
    if (rawValue === undefined || rawValue === null) return rawValue;
    if (!Array.isArray(rawValue)) {
      addError(errors, path, field.messages?.type ?? `${label} must be a list.`);
      return rawValue;
    }
    const itemSchema = field.items;
    if (!itemSchema) return rawValue;
    return rawValue.map((item, index) =>
      validateField(item, itemSchema, `${path}[${index}]`, rootData, errors)
    );
  }

  /* --- presence --- */
  const isRequired = field.requiredIf
    ? field.requiredIf(rootData)
    : field.required === true;
  let value = rawValue;

  // Sanitize strings before any presence/type checks.
  if (
    field.type === 'string' ||
    field.type === 'email' ||
    field.type === 'url'
  ) {
    value = sanitizeStringField(value, field);
  }

  if (isEmptyValue(value)) {
    if (isRequired) {
      addError(
        errors,
        path,
        field.messages?.required ?? `${label} is required.`
      );
      return value;
    }
    // Optional + empty → normalize to undefined so downstream logic can
    // apply defaults via ?? (empty string would bypass ??).
    return undefined;
  }

  /* --- type check (also coerces numbers) --- */
  const typeResult = checkType(value, field, path, errors);
  if (typeResult.failed) return value;
  value = typeResult.value;

  /* --- built-in range/length checks --- */
  if (typeof value === 'number') {
    if (field.min !== undefined && value < field.min) {
      addError(
        errors,
        path,
        field.messages?.min ?? `${label} must be ${field.min} or more.`
      );
    }
    if (field.max !== undefined && value > field.max) {
      addError(
        errors,
        path,
        field.messages?.max ?? `${label} must be ${field.max} or less.`
      );
    }
    if (
      field.precision !== undefined &&
      field.type === 'number'
    ) {
      const factor = 10 ** field.precision;
      const scaled = value * factor;
      if (Math.abs(scaled - Math.round(scaled)) > 1e-8) {
        addError(
          errors,
          path,
          field.messages?.precision ??
            `${label} can have at most ${field.precision} decimal places.`
        );
      }
    }
  }

  if (typeof value === 'string') {
    const len = [...value].length;
    if (field.minLength !== undefined && len < field.minLength) {
      addError(
        errors,
        path,
        field.messages?.minLength ??
          `${label} must be at least ${field.minLength} characters.`
      );
    }
    if (field.maxLength !== undefined && len > field.maxLength) {
      addError(
        errors,
        path,
        field.messages?.maxLength ??
          `${label} must be no more than ${field.maxLength} characters.`
      );
    }
    if (field.pattern) {
      field.pattern.lastIndex = 0;
      if (!field.pattern.test(value)) {
        addError(
          errors,
          path,
          field.messages?.pattern ?? `${label} isn’t in the right format.`
        );
      }
    }
  }

  /* --- noScript input guard (default on for string-like fields) --- */
  const wantsNoScript =
    field.noScript !== false &&
    (field.type === 'string' ||
      field.type === 'email' ||
      field.type === 'url');
  if (wantsNoScript && typeof value === 'string') {
    const hit = noScriptValidator({
      message: field.messages?.noScript,
    })(value);
    if (hit) addError(errors, path, hit);
  }

  /* --- custom validators --- */
  if (field.validators) {
    for (const message of runValidators(value, field.validators)) {
      addError(errors, path, message);
    }
  }

  return value;
}

/**
 * Validate a data object against a schema.
 *
 * @param data   The raw form data (must be a plain object).
 * @param schema The field schema.
 * @param rootData Internal: the root data for requiredIf (defaults to data).
 * @param prefix Internal: path prefix for nested validation.
 */
export function validateObject(
  data: unknown,
  schema: Schema,
  rootData?: Record<string, unknown>,
  prefix = ''
): ObjectValidationResult {
  const errors: Record<string, string[]> = {};
  const values: Record<string, unknown> = {};

  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return {
      ok: false,
      errors: { _form: ['The submitted data is invalid. Please try again.'] },
      values: {},
    };
  }

  const record = data as Record<string, unknown>;
  const root = rootData ?? record;

  for (const key of Object.keys(schema)) {
    const field = schema[key];
    const path = prefix ? `${prefix}.${key}` : key;
    values[key] = validateField(record[key], field, path, root, errors);
  }

  return { ok: Object.keys(errors).length === 0, errors, values };
}
