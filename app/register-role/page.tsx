import { RegisterRolePage } from "@/components/p1-pages";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ wallet?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <RegisterRolePage initialWallet={resolvedSearchParams.wallet} />;
}
