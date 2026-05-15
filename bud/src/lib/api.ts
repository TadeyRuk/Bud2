import { showErrorToast, showSuccessToast } from "./budToast";

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string };

const ERROR_MESSAGES: Record<string, string> = {
  "23505": "This record already exists.",
  "23503": "Referenced record not found.",
  "42501": "You don't have permission to do that.",
  PGRST301: "Session expired. Please sign in again.",
};

export function normalizeError(err: unknown): string {
  if (!err) return "Unknown error";

  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    const code = String(e.code ?? "");
    if (ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
    if (typeof e.message === "string") return e.message;
  }

  if (typeof err === "string") return err;
  return "Something went wrong. Please try again.";
}

export function showError(err: unknown) {
  showErrorToast(normalizeError(err));
}

export function showSuccess(msg: string) {
  showSuccessToast(msg);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 500
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const jitter = Math.random() * 200;
        const delay = baseDelay * Math.pow(2, attempt) + jitter;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}
