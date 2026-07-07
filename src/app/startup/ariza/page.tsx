import { SiteHeader } from "@/components/site-header";
import { StartupForm } from "@/components/forms/startup-form";
import { RegistrationClosedCard } from "@/components/registration-closed-card";
import { isRegistrationOpen, getRegistrationStatus } from "@/lib/registration-deadlines";

export const dynamic = "force-dynamic";

export default function StartupArizaPage() {
  const open = isRegistrationOpen("startup");
  const status = getRegistrationStatus("startup");

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        {open ? (
          <StartupForm deadlineLabel={status.closesAtLabel} />
        ) : (
          <RegistrationClosedCard event="startup" />
        )}
      </main>
    </div>
  );
}
