import { AdapterExporterDashboardPage } from "@/components/p1-adapter-pages";
import { P1Shell } from "@/components/p1-shell";

export default function Page() {
  return (
    <P1Shell requiredRole="EXPORTER">
      <AdapterExporterDashboardPage />
    </P1Shell>
  );
}
