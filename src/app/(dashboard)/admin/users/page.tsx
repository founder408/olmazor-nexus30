"use client";

import { useEffect, useState, useCallback } from "react";
import { Trash2, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog";
import { ROLE_LABELS } from "@/lib/constants";

type UserRow = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "volunteer" | "organizer" | "admin";
  createdAt: string;
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<UserRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      setUsers(json.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(id: string, role: UserRow["role"]) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        toast.error("O'zgarishlarni saqlashda xatolik yuz berdi");
        return;
      }
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      toast.success("Rol yangilandi");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(id: string) {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "O'chirishda xatolik");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("Foydalanuvchi o'chirildi");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Foydalanuvchilar
          </h1>
          <p className="text-sm text-text-muted">Volontyor, tashkilotchi va admin hisoblari</p>
        </div>
        <CreateUserDialog onCreated={load} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ism</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-text-muted">
                  Hali foydalanuvchilar yo'q. Birinchi foydalanuvchini qo'shing.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-text-primary">{u.fullName}</TableCell>
                  <TableCell className="font-mono text-sm">{u.email}</TableCell>
                  <TableCell className="font-mono text-sm">{u.phone}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => changeRole(u.id, v as UserRow["role"])}
                      disabled={busyId === u.id || u.id === session?.user?.id}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["volunteer", "organizer", "admin"] as const).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busyId === u.id}
                        onClick={() => setResetUser(u)}
                        aria-label="Parolni o'zgartirish"
                      >
                        <KeyRound className="h-4 w-4 text-accent-violet" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busyId === u.id || u.id === session?.user?.id}
                        onClick={() => deleteUser(u.id)}
                        aria-label="O'chirish"
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {resetUser && (
        <ResetPasswordDialog
          user={resetUser}
          open={!!resetUser}
          onOpenChange={(open) => !open && setResetUser(null)}
        />
      )}
    </div>
  );
}
