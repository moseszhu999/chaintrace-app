import { randomUUID } from "node:crypto";
import type {
  ChainTraceUser,
  MemberRole,
  OrganizationContext,
  OrganizationMemberRecord,
  OrganizationRecord,
  OrganizationType,
} from "@/lib/v2/organization-types";
import {
  createV2Organization as createNeonOrRuntimeV2Organization,
  getCurrentV2OrganizationContext as getNeonOrRuntimeCurrentContext,
  getOrCreateV2User as getNeonOrRuntimeUser,
  inviteV2OrganizationMember as inviteNeonOrRuntimeMember,
  listV2OrganizationMembers as listNeonOrRuntimeMembers,
  listV2OrganizationsForUser as listNeonOrRuntimeOrganizations,
  updateV2OrganizationMemberRole as updateNeonOrRuntimeRole,
} from "@/lib/repositories/v2-organization-repository";

type CreateOrganizationInput = {
  userEmail: string;
  userName?: string;
  name: string;
  orgType: OrganizationType;
  country?: string;
  website?: string;
};

type InviteMemberInput = {
  organizationId: string;
  email: string;
  role: MemberRole;
  invitedByEmail: string;
  name?: string;
};

const safeUsers = new Map<string, ChainTraceUser>();
const safeOrganizations = new Map<string, OrganizationRecord>();
const safeMemberships = new Map<string, OrganizationMemberRecord>();

function nowIso() {
  return new Date().toISOString();
}

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function cloneUser(user: ChainTraceUser): ChainTraceUser {
  return { ...user };
}

function cloneOrganization(org: OrganizationRecord): OrganizationRecord {
  return { ...org };
}

function cloneMembership(member: OrganizationMemberRecord): OrganizationMemberRecord {
  return { ...member, user: member.user ? cloneUser(member.user) : undefined };
}

async function safeRuntimeGetOrCreateUser(email: string, name?: string): Promise<ChainTraceUser> {
  const normalizedEmail = cleanEmail(email);
  const existing = safeUsers.get(normalizedEmail);
  if (existing) return cloneUser(existing);
  const createdAt = nowIso();
  const user: ChainTraceUser = {
    id: randomUUID(),
    email: normalizedEmail,
    name: name || normalizedEmail.split("@")[0],
    avatarUrl: null,
    createdAt,
    updatedAt: createdAt,
  };
  safeUsers.set(normalizedEmail, user);
  return cloneUser(user);
}

async function safeRuntimeCreateOrganization(input: CreateOrganizationInput) {
  const user = await safeRuntimeGetOrCreateUser(input.userEmail, input.userName);
  const createdAt = nowIso();
  const organization: OrganizationRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    orgType: input.orgType,
    country: input.country?.trim() || null,
    website: input.website?.trim() || null,
    verificationLevel: "UNVERIFIED",
    status: "ACTIVE",
    createdBy: user.id,
    createdAt,
    updatedAt: createdAt,
    orgRegistryHash: null,
    orgDid: null,
  };
  const membership: OrganizationMemberRecord = {
    id: randomUUID(),
    organizationId: organization.id,
    userId: user.id,
    role: "ADMIN",
    status: "ACTIVE",
    invitedBy: user.id,
    joinedAt: createdAt,
    user,
  };
  safeOrganizations.set(organization.id, organization);
  safeMemberships.set(membership.id, membership);
  return { organization: cloneOrganization(organization), membership: cloneMembership(membership), user };
}

async function safeRuntimeListOrganizationsForUser(email: string): Promise<OrganizationContext["organizations"]> {
  const user = await safeRuntimeGetOrCreateUser(email);
  return Array.from(safeMemberships.values())
    .filter((member) => member.userId === user.id && member.status === "ACTIVE")
    .map((membership) => {
      const organization = safeOrganizations.get(membership.organizationId);
      if (!organization) return null;
      return { organization: cloneOrganization(organization), membership: cloneMembership({ ...membership, user }) };
    })
    .filter((item): item is OrganizationContext["organizations"][number] => Boolean(item));
}

async function safeRuntimeCurrentContext(email: string, name?: string): Promise<OrganizationContext> {
  const user = await safeRuntimeGetOrCreateUser(email, name);
  const organizations = await safeRuntimeListOrganizationsForUser(user.email);
  const first = organizations[0];
  return {
    user,
    organization: first?.organization ?? null,
    membership: first?.membership ?? null,
    organizations,
    mode: "runtime_v2_organization_store",
  };
}

async function safeRuntimeMembers(organizationId: string) {
  return Array.from(safeMemberships.values())
    .filter((member) => member.organizationId === organizationId && member.status !== "REMOVED")
    .map((member) => cloneMembership({ ...member, user: Array.from(safeUsers.values()).find((user) => user.id === member.userId) }));
}

async function safeRuntimeInviteMember(input: InviteMemberInput) {
  const invitedBy = await safeRuntimeGetOrCreateUser(input.invitedByEmail);
  const user = await safeRuntimeGetOrCreateUser(input.email, input.name);
  const existing = Array.from(safeMemberships.values()).find((member) => member.organizationId === input.organizationId && member.userId === user.id);
  if (existing) return cloneMembership({ ...existing, user });
  const member: OrganizationMemberRecord = {
    id: randomUUID(),
    organizationId: input.organizationId,
    userId: user.id,
    role: input.role,
    status: "PENDING",
    invitedBy: invitedBy.id,
    joinedAt: nowIso(),
    user,
  };
  safeMemberships.set(member.id, member);
  return cloneMembership(member);
}

async function safeRuntimeUpdateRole(membershipId: string, role: MemberRole) {
  const existing = safeMemberships.get(membershipId);
  if (!existing) throw new Error("ORGANIZATION_MEMBER_NOT_FOUND");
  const next = { ...existing, role };
  safeMemberships.set(next.id, next);
  return cloneMembership(next);
}

async function fallback<T>(label: string, primary: () => Promise<T>, runtime: () => Promise<T>): Promise<T> {
  try {
    return await primary();
  } catch (error) {
    console.error(`${label} failed; using safe runtime organization fallback.`, error);
    return runtime();
  }
}

export async function safeGetOrCreateV2User(email: string, name?: string) {
  return fallback("getOrCreateV2User", () => getNeonOrRuntimeUser(email, name), () => safeRuntimeGetOrCreateUser(email, name));
}

export async function safeCreateV2Organization(input: CreateOrganizationInput) {
  return fallback("createV2Organization", () => createNeonOrRuntimeV2Organization(input), () => safeRuntimeCreateOrganization(input));
}

export async function safeListV2OrganizationsForUser(email: string) {
  return fallback("listV2OrganizationsForUser", () => listNeonOrRuntimeOrganizations(email), () => safeRuntimeListOrganizationsForUser(email));
}

export async function safeGetCurrentV2OrganizationContext(email: string, name?: string) {
  return fallback("getCurrentV2OrganizationContext", () => getNeonOrRuntimeCurrentContext(email, name), () => safeRuntimeCurrentContext(email, name));
}

export async function safeListV2OrganizationMembers(organizationId: string) {
  return fallback("listV2OrganizationMembers", () => listNeonOrRuntimeMembers(organizationId), () => safeRuntimeMembers(organizationId));
}

export async function safeInviteV2OrganizationMember(input: InviteMemberInput) {
  return fallback("inviteV2OrganizationMember", () => inviteNeonOrRuntimeMember(input), () => safeRuntimeInviteMember(input));
}

export async function safeUpdateV2OrganizationMemberRole(input: { membershipId: string; role: MemberRole }) {
  return fallback("updateV2OrganizationMemberRole", () => updateNeonOrRuntimeRole(input), () => safeRuntimeUpdateRole(input.membershipId, input.role));
}
