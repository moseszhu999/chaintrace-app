import { NewExporterCasePage } from "@/components/p1-pages";
import { P1Shell } from "@/components/p1-shell";

export default function Page() {
  return (
    <P1Shell requiredRole="EXPORTER">
      <NewExporterCasePage />
    </P1Shell>
  );
}
