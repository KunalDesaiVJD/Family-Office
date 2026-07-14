// Typed application errors. The error handler maps these to JSON responses.

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super("BAD_REQUEST", message, 400, details);
    this.name = "BadRequestError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
    this.name = "ForbiddenError";
  }
}

/** No active broker session for the tenant — authenticate server-side first. */
export class SessionRequiredError extends AppError {
  constructor(message = "No active broker session for this tenant") {
    super("SESSION_REQUIRED", message, 401);
    this.name = "SessionRequiredError";
  }
}

/** The connector is missing required configuration (e.g. Angel credentials). */
export class NotConfiguredError extends AppError {
  constructor(message = "Connector is not configured") {
    super("NOT_CONFIGURED", message, 503);
    this.name = "NotConfiguredError";
  }
}

/** An upstream broker/API call failed. */
export class ConnectorError extends AppError {
  constructor(message: string, details?: unknown) {
    super("CONNECTOR_ERROR", message, 502, details);
    this.name = "ConnectorError";
  }
}

/** Trading is intentionally disabled in this version. */
export class TradingDisabledError extends AppError {
  constructor() {
    super("TRADING_DISABLED", "Trading is disabled in this version.", 403);
    this.name = "TradingDisabledError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super("RATE_LIMITED", message, 429);
    this.name = "RateLimitError";
  }
}
