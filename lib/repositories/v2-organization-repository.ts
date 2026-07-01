import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import type {
  ChainTraceUser,
  MemberRole,
  OrganizationContext,
  OrganizationMemberRecord,
  OrganizationRecord,
  OrganizationType,
} from "@/lib/v2/organization-types";

export type CreateOrganizationInput = {
  userEmail: string;
  userName?: string;
  name: string;
  orgType: OrganizationType;
  country?: string;
  website?: string;
};

export type InviteOrganizationMemberInput = {
  organizationId: string;
  email: string;
  role: MemberRole;
  invitedByEmail: string;
  name?: string;
};

export type UpdateOrganizationMemberRoleInput = {
  membershipId: string;
  role: MemberRole;
};

type OrganizationPersistenceMode = "neon_v2_organization_store" | "runtime_v2_organization_store";

type OrganizationRepository = {
  getOrCreateUser(email: string, name?: string): Promise<ChainTraceUser>;
  createOrganization(input: CreateOrganizationInput): Promise<{ organization: OrganizationRecord; membership: OrganizationMemberRecord; user: ChainTraceUser }>;
  listOrganizationsForUser(email: string): Promise<OrganizationContext["organizations"]>;
  getCurrentOrganizationContext(email: string, name?: string): Promise<OrganizationContext>;
  listOrganizationMembers(organizationId: string): Promise<OrganizationMemberRecord[]>;
  inviteOrganizationMember(input: InviteOrganizationMemberInput): Promise<OrganizationMemberRecord>;
  updateOrganizationMemberRole(input: UpdateOrganizationMemberRoleInput): Promise<OrganizationMemberRecord>;
};

function nowIso() {
  return new Date().toISOString();
}

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured for the v2 organization store.");
  return url;
}

export function getOrganizationPersistenceMode(): OrganizationPersistenceMode {
  return process.env.DATABASE_URL ? "neon_v2_organization_store" : "runtime_v2_organization_store";
}

const runtimeUsers = new Map<string, ChainTraceUser>();
const runtimeOrganizations = new Map<string, OrganizationRecord>();
const runtimeMemberships = new Map<string, OrganizationMemberRecord>();

function cloneUser(user: ChainTraceUser): ChainTraceUser {
  return { ...user };
}

function cloneOrganization(org: OrganizationRecord): OrganizationRecord {
  return { ...org };
}

function cloneMembership(member: OrganizationMemberRecord): OrganizationMemberRecord {
  return {
    ...member,
    user: member.user ? cloneUser(member.user) : undefined,
  };
}

function createRuntimeOrganizationRepository(): OrganizationRepository {
  async function getOrCreateUser(email: string, name?: string) {
    const normalizedEmail = cleanEmail(email);
    const existing = runtimeUsers.get(normalizedEmail);
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
    runtimeUsers.set(normalizedEmail, user);
    return cloneUser(user);
  }

  return {
    getOrCreateUser,
    async createOrganization(input) {
      const user = await getOrCreateUser(input.userEmail, input.userName);
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
      runtimeOrganizations.set(organization.id, organization);
      runtimeMemberships.set(membership.id, membership);
      return { organization: cloneOrganization(organization), membership: cloneMembership(membership), user };
    },
    async listOrganizationsForUser(email) {
      const user = await getOrCreateUser(email);
      return Array.from(runtimeMemberships.values())
        .filter((member) => member.userId === user.id && member.status === "ACTIVE")
        .map((membership) => {
          const organization = runtimeOrganizations.get(membership.organizationId);
          if (!organization) return null;
          return { organization: cloneOrganization(organization), membership: cloneMembership({ ...membership, user }) };
        })
        .filter((item): item is OrganizationContext["organizations"][number] => Boolean(item));
    },
    async getCurrentOrganizationContext(email, name) {
      const user = await getOrCreateUser(email, name);
      const organizations = await this.listOrganizationsForUser(user.email);
      const first = organizations[0];
      return {
        user,
        organization: first?.organization ?? null,
        membership: first?.membership ?? null,
        organizations,
        mode: getOrganizationPersistenceMode(),
      };
    },
    async listOrganizationMembers(organizationId) {
      return Array.from(runtimeMemberships.values())
        .filter((member) => member.organizationId === organizationId && member.status !== "REMOVED")
        .map((member) => {
          const user = Array.from(runtimeUsers.values()).find((item) => item.id === member.userId);
          return cloneMembership({ ...member, user });
        });
    },
    async inviteOrganizationMember(input) {
      const invitedBy = await getOrCreateUser(input.invitedByEmail);
      const user = await getOrCreateUser(input.email, input.name);
      const existing = Array.from(runtimeMemberships.values()).find((member) => member.organizationId === input.organizationId && member.userId === user.id);
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
      runtimeMemberships.set(member.id, member);
      return cloneMembership(member);
    },
    async updateOrganizationMemberRole(input) {
      const existing = runtimeMemberships.get(input.membershipId);
      if (!existing) throw new Error("ORGANIZATION_MEMBER_NOT_FOUND");
      const next = { ...existing, role: input.role };
      runtimeMemberships.set(next.id, next);
      const user = Array.from(runtimeUsers.values()).find((item) => item.id === next.userId);
      return cloneMembership({ ...next, user });
    },
  };
}

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

type OrganizationRow = {
  id: string;
  name: string;
  org_type: OrganizationType;
  country: string | null;
  website: string | null;
  verification_level: string;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  org_registry_hash: string | null;
  org_did: string | null;
};

type MemberRow = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  status: OrganizationMemberRecord["status"];
  invited_by: string | null;
  joined_at: string;
  user_email?: string;
  user_name?: string | null;
  user_avatar_url?: string | null;
  user_created_at?: string;
  user_updated_at?: string;
};

function mapUser(row: UserRow): ChainTraceUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapOrganization(row: OrganizationRow): OrganizationRecord {
  return {
    id: row.id,
    name: row.name,
    orgType: row.org_type,
    country: row.country,
    website: row.website,
    verificationLevel: row.verification_level,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    orgRegistryHash: row.org_registry_hash,
    orgDid: row.org_did,
  };
}

function mapMember(row: MemberRow): OrganizationMemberRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    invitedBy: row.invited_by,
    joinedAt: row.joined_at,
    user: row.user_email ? {
      id: row.user_id,
      email: row.user_email,
      name: row.user_name ?? null,
      avatarUrl: row.user_avatar_url ?? null,
      createdAt: row.user_created_at ?? row.joined_at,
      updatedAt: row.user_updated_at ?? row.joined_at,
    } : undefined,
  };
}

function createNeonOrganizationRepository(): OrganizationRepository {
  const sql = neon(getDatabaseUrl());

  async function getOrCreateUser(email: string, name?: string): Promise<ChainTraceUser> {
    const normalizedEmail = cleanEmail(email);
    const rows = await sql`
      insert into users (email, name)
      values (${normalizedEmail}, ${name ?? null})
      on conflict (email) do update set
        name = coalesce(users.name, excluded.name),
        updated_at = now()
      returning id, email, name, avatar_url, created_at, updated_at;
    ` as UserRow[];
    return mapUser(rows[0]);
  }

  return {
    getOrCreateUser,
    async createOrganization(input) {
      const user = await getOrCreateUser(input.userEmail, input.userName);
      const orgRows = await sql`
        insert into organizations (name, org_type, country, website, created_by)
        values (${input.name.trim()}, ${input.orgType}::org_type, ${input.country?.trim() || null}, ${input.website?.trim() || null}, ${user.id})
        returning id, name, org_type, country, website, verification_level, status, created_by, created_at, updated_at, org_registry_hash, org_did;
      ` as OrganizationRow[];
      const organization = mapOrganization(orgRows[0]);
      const memberRows = await sql`
        insert into organization_members (organization_id, user_id, role, status, invited_by)
        values (${organization.id}, ${user.id}, ${"ADMIN"}::member_role, ${"ACTIVE"}::member_status, ${user.id})
        on conflict (organization_id, user_id) do update set role = ${"ADMIN"}::member_role, status = ${"ACTIVE"}::member_status
        returning id, organization_id, user_id, role, status, invited_by, joined_at;
      ` as MemberRow[];
      const membership = mapMember({ ...memberRows[0], user_email: user.email, user_name: user.name, user_avatar_url: user.avatarUrl, user_created_at: user.createdAt, user_updated_at: user.updatedAt });
      return { organization, membership, user };
    },
    async listOrganizationsForUser(email) {
      const user = await getOrCreateUser(email);
      const rows = await sql`
        select
          o.id, o.name, o.org_type, o.country, o.website, o.verification_level, o.status, o.created_by, o.created_at, o.updated_at, o.org_registry_hash, o.org_did,
          m.id as member_id, m.role, m.status as member_status, m.invited_by, m.joined_at
        from organization_members m
        join organizations o on o.id = m.organization_id
        where m.user_id = ${user.id} and m.status = ${"ACTIVE"}::member_status
        order by m.joined_at asc;
      ` as Array<OrganizationRow & { member_id: string; role: MemberRole; member_status: OrganizationMemberRecord["status"]; invited_by: string | null; joined_at: string }>;
      return rows.map((row) => ({
        organization: mapOrganization(row),
        membership: {
          id: row.member_id,
          organizationId: row.id,
          userId: user.id,
          role: row.role,
          status: row.member_status,
          invitedBy: row.invited_by,
          joinedAt: row.joined_at,
          user,
        },
      }));
    },
    async getCurrentOrganizationContext(email, name) {
      const user = await getOrCreateUser(email, name);
      const organizations = await this.listOrganizationsForUser(user.email);
      const first = organizations[0];
      return {
        user,
        organization: first?.organization ?? null,
        membership: first?.membership ?? null,
        organizations,
        mode: getOrganizationPersistenceMode(),
      };
    },
    async listOrganizationMembers(organizationId) {
      const rows = await sql`
        select
          m.id, m.organization_id, m.user_id, m.role, m.status, m.invited_by, m.joined_at,
          u.email as user_email, u.name as user_name, u.avatar_url as user_avatar_url, u.created_at as user_created_at, u.updated_at as user_updated_at
        from organization_members m
        join users u on u.id = m.user_id
        where m.organization_id = ${organizationId} and m.status <> ${"REMOVED"}::member_status
        order by m.joined_at asc;
      ` as MemberRow[];
      return rows.map(mapMember);
    },
    async inviteOrganizationMember(input) {
      const invitedBy = await getOrCreateUser(input.invitedByEmail);
      const user = await getOrCreateUser(input.email, input.name);
      const rows = await sql`
        insert into organization_members (organization_id, user_id, role, status, invited_by)
        values (${input.organizationId}, ${user.id}, ${input.role}::member_role, ${"PENDING"}::member_status, ${invitedBy.id})
        on conflict (organization_id, user_id) do update set role = excluded.role
        returning id, organization_id, user_id, role, status, invited_by, joined_at;
      ` as MemberRow[];
      return mapMember({ ...rows[0], user_email: user.email, user_name: user.name, user_avatar_url: user.avatarUrl, user_created_at: user.createdAt, user_updated_at: user.updatedAt });
    },
    async updateOrganizationMemberRole(input) {
      const rows = await sql`
        update organization_members
        set role = ${input.role}::member_role
        where id = ${input.membershipId}
        returning id, organization_id, user_id, role, status, invited_by, joined_at;
      ` as MemberRow[];
      if (!rows[0]) throw new Error("ORGANIZATION_MEMBER_NOT_FOUND");
      return mapMember(rows[0]);
    },
  };
}

function createOrganizationRepository(): OrganizationRepository {
  return getOrganizationPersistenceMode() === "neon_v2_organization_store"
    ? createNeonOrganizationRepository()
    : createRuntimeOrganizationRepository();
}

export async function getOrCreateV2User(email: string, name?: string) {
  return createOrganizationRepository().getOrCreateUser(email, name);
}

export async function createV2Organization(input: CreateOrganizationInput) {
  return createOrganizationRepository().createOrganization(input);
}

export async function listV2OrganizationsForUser(email: string) {
  return createOrganizationRepository().listOrganizationsForUser(email);
}

export async function getCurrentV2OrganizationContext(email: string, name?: string) {
  return createOrganizationRepository().getCurrentOrganizationContext(email, name);
}

export async function listV2OrganizationMembers(organizationId: string) {
  return createOrganizationRepository().listOrganizationMembers(organizationId);
}

export async function inviteV2OrganizationMember(input: InviteOrganizationMemberInput) {
  return createOrganizationRepository().inviteOrganizationMember(input);
}

export async function updateV2OrganizationMemberRole(input: UpdateOrganizationMemberRoleInput) {
  return createOrganizationRepository().updateOrganizationMemberRole(input);
}
