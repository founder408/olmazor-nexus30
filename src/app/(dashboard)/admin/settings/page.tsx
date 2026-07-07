"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/field-shell";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE } from "@/lib/constants";
import { ChangePasswordCard } from "@/components/admin/change-password-card";

type Track = { id: string; name: string };
type Settings = { minAge: number; maxAge: number; eventName: string };

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    minAge: DEFAULT_MIN_AGE,
    maxAge: DEFAULT_MAX_AGE,
    eventName: "NEXUS30",
  });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTrack, setNewTrack] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.settings) {
        setSettings({
          minAge: json.settings.minAge,
          maxAge: json.settings.maxAge,
          eventName: json.settings.eventName,
        });
      }
      setTracks(json.tracks ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveSettings() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Saqlashda xatolik yuz berdi");
        return;
      }
      toast.success("O'zgarishlar saqlandi");
    } finally {
      setSaving(false);
    }
  }

  async function addTrack() {
    if (!newTrack.trim()) return;
    try {
      const res = await fetch("/api/admin/tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTrack.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      setTracks((prev) => [...prev, json.track]);
      setNewTrack("");
      toast.success("Yo'nalish qo'shildi");
    } catch {
      toast.error("Xatolik yuz berdi");
    }
  }

  async function removeTrack(id: string) {
    if (!confirm("Yo'nalishni o'chirishni tasdiqlaysizmi?")) return;
    const res = await fetch(`/api/admin/tracks/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "O'chirishda xatolik");
      return;
    }
    setTracks((prev) => prev.filter((t) => t.id !== id));
    toast.success("Yo'nalish o'chirildi");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Sozlamalar</h1>
        <p className="text-sm text-text-muted">
          Yosh chegarasi, tadbir nomi va yo'nalishlar ro'yxatini boshqaring.
        </p>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold text-text-primary">Yosh chegarasi</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FieldShell label="Minimal yosh">
            <Input
              type="number"
              value={settings.minAge}
              onChange={(e) => setSettings((s) => ({ ...s, minAge: Number(e.target.value) }))}
            />
          </FieldShell>
          <FieldShell label="Maksimal yosh">
            <Input
              type="number"
              value={settings.maxAge}
              onChange={(e) => setSettings((s) => ({ ...s, maxAge: Number(e.target.value) }))}
            />
          </FieldShell>
        </div>
        <FieldShell label="Tadbir nomi" className="mt-4">
          <Input
            value={settings.eventName}
            onChange={(e) => setSettings((s) => ({ ...s, eventName: e.target.value }))}
          />
        </FieldShell>
        <Button onClick={saveSettings} disabled={saving} className="mt-5 gap-1.5">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          O'zgarishlarni saqlash
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-lg font-bold text-text-primary">Yo'nalishlar (treklar)</h2>
        <div className="mt-4 space-y-2">
          {tracks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5"
            >
              <span className="text-sm text-text-primary">{t.name}</span>
              <Button variant="ghost" size="icon" onClick={() => removeTrack(t.id)}>
                <Trash2 className="h-4 w-4 text-danger" />
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={newTrack}
            onChange={(e) => setNewTrack(e.target.value)}
            placeholder="Yangi yo'nalish nomi"
            onKeyDown={(e) => e.key === "Enter" && addTrack()}
          />
          <Button onClick={addTrack} className="gap-1.5 flex-shrink-0">
            <Plus className="h-4 w-4" />
            Qo'shish
          </Button>
        </div>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
