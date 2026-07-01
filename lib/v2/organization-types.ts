export const organizationTypes = [
  "EXPORTER",
  "BUYER",
  "LOGISTICS",
  "WAREHOUSE",
  "QC",
  "FUNDER",
  "LEGAL",
  "CUSTOMS",
  "PLATFORM",
] as const;

export type OrganizationType = typeof organizationTypes[number];

export const memberRoles = [
  "ADMIN",
  "OPERATOR",
  "FINANCE",
  "SIGNER",
  "REVIEWER",
  "VIEWER",
] as const;

export type MemberRole = typeof memberRoles[number];

export type MemberStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REMOVED";

export type ChainTraceUser = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationRecord = {
  id: string;
  name: string;
  orgType: OrganizationType;
  country?: string | null;
  website?: string | null;
  verificationLevel: string;
  status: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  orgRegistryHash?: string | null;
  orgDid?: string | null;
};

export type OrganizationMemberRecord = {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy?: string | null;
  joinedAt: string;
  user?: ChainTraceUser;
};

export type OrganizationContext = {
  user: ChainTraceUser;
  organization: OrganizationRecord | null;
  membership: OrganizationMemberRecord | null;
  organizations: Array<{
    organization: OrganizationRecord;
    membership: OrganizationMemberRecord;
  }>;
  mode: "neon_v2_organization_store" | "runtime_v2_organization_store";
};

export function isOrganizationType(value: unknown): value is OrganizationType {
  return typeof value === "string" && (organizationTypes as readonly string[]).includes(value);
}

export function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && (memberRoles as readonly string[]).includes(value);
}
