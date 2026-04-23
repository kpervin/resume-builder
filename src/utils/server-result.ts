import { Result } from "typescript-result";

export type Ok<T> = { ok: true; value: T };
export type SerializableError = { type: string; message: string };
export type ServerResult<T> = { ok: true; value: T } | { ok: false; error: SerializableError };

export function withServerResult<T, E extends SerializableError>(
  result: Result<T, E>,
): ServerResult<T>;

export function withServerResult<T, E extends SerializableError>(
  promise: Promise<Result<T, E>>,
): Promise<ServerResult<T>>;

// oxlint-disable-next-line typescript/no-explicit-any
export function withServerResult(resultOrPromise: any): any {
  if (resultOrPromise instanceof Promise) {
    return resultOrPromise.then((resolved) => withServerResult(resolved));
  }
  if (resultOrPromise.ok) {
    return { ok: true, value: resultOrPromise.value };
  } else {
    return {
      ok: false,
      error: {
        type: resultOrPromise.error.name,
        message: resultOrPromise.error.message,
      },
    };
  }
}
