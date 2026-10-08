/**
 * validation/index.ts — public entry point for the validation library.
 *
 * Import from here in tool templates:
 *   import { validateObject, guardCalculation, sanitizeText } from
 *     '../lib/validation/index.ts';
 * (The exact relative path depends on the framework choice; keep imports
 * framework-free — this module has zero dependencies.)
 */

export {
  // types
  // (Validator, ValidatorOptions exported below as types)
  isEmptyValue,
  coerceNumber,
  required,
  isNumber,
  integer,
  finiteNumber,
  min,
  max,
  decimalPrecision,
  minLength,
  maxLength,
  pattern,
  email,
  url,
  oneOf,
  enumOf,
  noScript,
  runValidators,
  combine,
} from './validators.ts';
export type { Validator, ValidatorOptions } from './validators.ts';

export { validateObject } from './schema.ts';
export type {
  FieldType,
  FieldMessages,
  FieldSchema,
  Schema,
  ObjectValidationResult,
} from './schema.ts';

export {
  trim,
  normalizeUnicode,
  normalizeWhitespace,
  escapeHtml,
  stripHtml,
  sanitizeText,
  sanitizeUrl,
} from './sanitize.ts';
export type { SanitizeTextOptions } from './sanitize.ts';

export {
  ERROR_MESSAGES,
  makeError,
  isUsableNumber,
  guardCalculation,
  guardDivide,
} from './errors.ts';
export type {
  ErrorSeverity,
  ErrorCode,
  ToolError,
  MessageParams,
  ErrorMessageFn,
  MakeErrorOptions,
  GuardedResult,
  GuardOptions,
} from './errors.ts';
