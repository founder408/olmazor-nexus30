import { SiteHeader } from "@/components/site-header";
import { StartupForm } from "@/components/forms/startup-form";

export default function StartupArizaPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        <StartupForm />
      </main>
    </div>
  );
}
