export type RequestIdentity = {
  email: string;
  name?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmailLike(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function resolveRequestIdentity(request: Request, payload?: Record<string, unknown>): RequestIdentity {
  const headerEmail = clean(request.headers.get("x-chaintrace-user-email"));
  const payloadEmail = clean(payload?.userEmail);
  const envEmail = clean(process.env.CHAINTRACE_DEV_USER_EMAIL);
  const email = headerEmail || payloadEmail || envEmail || "founder@chaintrace.local";

  if (!isEmailLike(email)) {
    throw new Error("INVALID_USER_EMAIL");
  }

  const headerName = clean(request.headers.get("x-chaintrace-user-name"));
  const payloadName = clean(payload?.userName);
  const envName = clean(process.env.CHAINTRACE_DEV_USER_NAME);

  return {
    email: email.toLowerCase(),
    name: headerName || payloadName || envName || undefined,
  };
}
