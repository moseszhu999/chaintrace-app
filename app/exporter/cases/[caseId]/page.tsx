import { AdapterExporterCaseDetailPage } from "@/components/p1-adapter-pages";
import { P1Shell } from "@/components/p1-shell";

export default async function Page({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <P1Shell requiredRole="EXPORTER">
      <AdapterExporterCaseDetailPage caseId={caseId} />
    </P1Shell>
  );
}
