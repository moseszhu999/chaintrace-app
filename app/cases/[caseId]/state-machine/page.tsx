import { AdapterStateMachinePage } from "@/components/p1-adapter-pages";
import { P1Shell } from "@/components/p1-shell";

export default async function Page({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <P1Shell>
      <AdapterStateMachinePage caseId={caseId} />
    </P1Shell>
  );
}
