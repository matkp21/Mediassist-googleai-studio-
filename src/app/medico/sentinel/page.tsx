import { ErrorBrainDashboard } from "@/components/medico/error-brain-dashboard";

export const metadata = {
  title: "Sentinel Dashboard | MediAssistant",
  description: "Meta-logic guard monitoring application health and stability.",
};

export default function SentinelPage() {
  return (
    <main className="bg-background min-h-screen">
      <ErrorBrainDashboard />
    </main>
  );
}
