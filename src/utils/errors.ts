export class IOError extends Error {
  readonly type = "io-error";
}

export class ParseError extends Error {
  readonly type = "parse-error";
}

export class ValidationError extends Error {
  readonly type = "validation-error";
}

export class NotFoundError extends Error {
  readonly type = "not-found-error";
}
