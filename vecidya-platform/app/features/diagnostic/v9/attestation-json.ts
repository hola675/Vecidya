export function canonicalizeDiagnosticJson(value: unknown): string {
  const visit = (input: unknown): string => {
    if (input === null || typeof input === "boolean" || typeof input === "string") {
      if (typeof input === "string" && !isWellFormedUnicode(input)) throw new TypeError("invalid_unicode");
      return JSON.stringify(input);
    }
    if (typeof input === "number") {
      if (!Number.isFinite(input)) throw new TypeError("invalid_number");
      return JSON.stringify(input);
    }
    if (Array.isArray(input)) return `[${input.map((item) => visit(item)).join(",")}]`;
    if (!input || typeof input !== "object" || (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null)) {
      throw new TypeError("invalid_json_value");
    }
    const record = input as Record<string, unknown>;
    const keys = Object.keys(record).sort();
    return `{${keys.map((key) => {
      if (!isWellFormedUnicode(key) || record[key] === undefined) throw new TypeError("invalid_json_value");
      return `${JSON.stringify(key)}:${visit(record[key])}`;
    }).join(",")}}`;
  };
  return visit(value);
}

function isWellFormedUnicode(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}
