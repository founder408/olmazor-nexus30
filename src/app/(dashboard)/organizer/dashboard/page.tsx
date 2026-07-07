import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress-ring";
import { EVENT_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

async function getEventStats() {
  const [ideationTotal, ideationShortlisted, ideationCheckedIn] = await Promise.all([
    prisma.ideationApplication.count(),
    prisma.ideationApplication.count({ where: { status: "shortlisted" } }),
    prisma.ideationApplication.count({ where: { checkedIn: true } }),
  ]);
  const [hakatonTotal, hakatonShortlisted, hakatonCheckedIn] = await Promise.all([
    prisma.team.count(),
    prisma.team.count({ where: { status: "shortlisted" } }),
    prisma.team.count({ where: { checkedIn: true } }),
  ]);
  const [startupTotal, startupShortlisted, startupCheckedIn] = await Promise.all([
    prisma.startupApplication.count(),
    prisma.startupApplication.count({ where: { status: "shortlisted" } }),
    prisma.startupApplication.count({ where: { checkedIn: true } }),
  ]);

  return {
    ideaton: { total: ideationTotal, shortlisted: ideationShortlisted, checkedIn: ideationCheckedIn },
    hakaton: { total: hakatonTotal, shortlisted: hakatonShortlisted, checkedIn: hakatonCheckedIn },
    startup: { total: startupTotal, shortlisted: startupShortlisted, checkedIn: startupCheckedIn },
  };
}

const COLORS: Record<string, string> = {
  ideaton: "#7C5CFF",
  hakaton: "#2DD4BF",
  startup: "#D4A94E",
};

export default async function OrganizerDashboardPage() {
  const stats = await getEventStats();
  const totalApplications = stats.ideaton.total + stats.hakaton.total + stats.startup.total;
  const totalShortlisted = stats.ideaton.shortlisted + stats.hakaton.shortlisted + stats.startup.shortlisted;
  const totalCheckedIn = stats.ideaton.checkedIn + stats.hakaton.checkedIn + stats.startup.checkedIn;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Tashkilotchi statistikasi
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Barcha 3 bosqich bo'yicha real vaqtdagi ko'rsatkichlar.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-text-muted">Jami arizalar</p>
          <p className="mt-2 font-mono text-4xl font-bold text-text-primary">
            {totalApplications}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-text-muted">Saralangan</p>
          <p className="mt-2 font-mono text-4xl font-bold text-accent-teal">
            {totalShortlisted}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-text-muted">Check-in qilingan</p>
          <p className="mt-2 font-mono text-4xl font-bold text-accent-violet">
            {totalCheckedIn}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.keys(stats) as (keyof typeof stats)[]).map((key) => {
          const s = stats[key];
          const percent = s.total ? (s.shortlisted / s.total) * 100 : 0;
          return (
            <Card key={key} className="flex items-center gap-5 p-6">
              <ProgressRing percent={percent} color={COLORS[key]} />
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">
                  {EVENT_LABELS[key]}
                </h3>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Jami</dt>
                    <dd className="font-mono text-text-primary">{s.total}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Saralangan</dt>
                    <dd className="font-mono text-accent-teal">{s.shortlisted}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-text-muted">Keldi</dt>
                    <dd className="font-mono text-accent-violet">{s.checkedIn}</dd>
                  </div>
                </dl>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
