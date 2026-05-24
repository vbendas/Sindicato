const PII_FIELDS = [
  "email",
  "password",
  "token",
  "secret",
  "key",
  "authorization",
  "cookie",
  "phone",
  "displayName",
  "ip",
  "ipAddress",
  "x-forwarded-for",
  "cf-connecting-ip",
];

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length > 8) {
      return value.slice(0, 2) + "..." + value.slice(-2);
    }
    return "***";
  }
  return value;
}

function redactPii(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (PII_FIELDS.some((field) => lowerKey.includes(field))) {
      result[key] = redactValue(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = redactPii(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    const redacted = data ? redactPii(data) : undefined;
    console.log(JSON.stringify({ level: "info", message, ...redacted, timestamp: new Date().toISOString() }));
  },

  warn(message: string, data?: Record<string, unknown>) {
    const redacted = data ? redactPii(data) : undefined;
    console.warn(JSON.stringify({ level: "warn", message, ...redacted, timestamp: new Date().toISOString() }));
  },

  error(message: string, data?: Record<string, unknown>) {
    const redacted = data ? redactPii(data) : undefined;
    console.error(JSON.stringify({ level: "error", message, ...redacted, timestamp: new Date().toISOString() }));
  },
};
