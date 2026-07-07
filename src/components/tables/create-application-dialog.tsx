"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IdeationAdminForm } from "@/components/tables/ideation-admin-form";
import { HakatonAdminForm } from "@/components/tables/hakaton-admin-form";
import { StartupAdminForm } from "@/components/tables/startup-admin-form";
import { EVENT_LABELS, type EventKey } from "@/lib/constants";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";

/** Lets an organizer/admin add a walk-in / paper sign-up directly, without the public form flow. */
export function CreateApplicationDialog({
  event,
  tracks,
  onCreated,
}: {
  event: EventKey;
  tracks: { id: string; name: string }[];
  onCreated: (row: OrganizerRow) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          {event === "hakaton" ? "Yangi jamoa qo'shish" : "Yangi ariza qo'shish"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{EVENT_LABELS[event]} — qo'lda ariza qo'shish</DialogTitle>
        </DialogHeader>
        {open && event === "ideaton" && (
          <IdeationAdminForm
            mode="create"
            tracks={tracks}
            onSaved={(row) => {
              onCreated(row);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
        {open && event === "hakaton" && (
          <HakatonAdminForm
            mode="create"
            tracks={tracks}
            onSaved={(row) => {
              onCreated(row);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
        {open && event === "startup" && (
          <StartupAdminForm
            mode="create"
            tracks={tracks}
            onSaved={(row) => {
              onCreated(row);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
