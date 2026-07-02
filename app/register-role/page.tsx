import { AdapterRegisterRolePage } from "@/components/p1-adapter-pages";

export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ wallet?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <AdapterRegisterRolePage initialWallet={resolvedSearchParams.wallet} />;
}
