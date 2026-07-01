import type { NextResponse } from "next/server";
import type { OrganizationContext, OrganizationMemberRecord, OrganizationRecord } from "@/lib/v2/organization-types";

export const currentOrganizationCookieName = "chaintrace_v2_current_org";

type CookieReader = {
  get(name: string): { value?: string } | undefined;
};

type CookiePayload = {
  organization: OrganizationRecord;
  membership: OrganizationMemberRecord;
};

export function setCurrentOrganizationCookie(response: NextResponse, organization: OrganizationRecord, membership: OrganizationMemberRecord) {
  const value = encodeURIComponent(JSON.stringify({ organization, membership } satisfies CookiePayload));
  response.cookies.set(currentOrganizationCookieName, value, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function readCurrentOrganizationCookie(cookieStore: CookieReader): CookiePayload | null {
  const raw = cookieStore.get(currentOrganizationCookieName)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as CookiePayload;
    if (!parsed.organization?.id || !parsed.membership?.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function applyCurrentOrganizationCookie(context: OrganizationContext, cookieStore: CookieReader): OrganizationContext {
  if (context.organization && context.membership) return context;
  const payload = readCurrentOrganizationCookie(cookieStore);
  if (!payload) return context;

  const membership: OrganizationMemberRecord = {
    ...payload.membership,
    userId: context.user.id,
    user: context.user,
  };

  return {
    ...context,
    organization: payload.organization,
    membership,
    organizations: [
      { organization: payload.organization, membership },
      ...context.organizations.filter((item) => item.organization.id !== payload.organization.id),
    ],
  };
}
