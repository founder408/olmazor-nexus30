import { Download, FileSpreadsheet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminExportAllPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-2xl font-bold text-text-primary">To'liq Excel eksport</h1>
      <p className="mt-1 text-sm text-text-muted">
        Barcha 3 ta forma ma'lumotlarini bitta faylda, alohida varaqlarda yuklab oling.
      </p>

      <Card className="mt-6 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gold/15 text-accent-gold">
          <FileSpreadsheet className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-lg font-bold text-text-primary">
          nexus30-full-export.xlsx
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          "Ideaton", "Hakaton" va "Startup" varaqlari — status ranglari bilan formatlangan.
        </p>
        <Button asChild size="lg" className="mt-6 gap-1.5">
          <a href="/api/export/all" download>
            <Download className="h-4 w-4" />
            Barchasini yuklab olish
          </a>
        </Button>
      </Card>
    </div>
  );
}
