"use client";

import { useCallback, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Copy, Download, Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";
import { STATUS_LABELS, EVENT_LABELS, type EventKey } from "@/lib/constants";
import { CreateApplicationDialog } from "@/components/tables/create-application-dialog";
import { ApplicationDetailDialog } from "@/components/tables/application-detail-dialog";
import { ClientDate } from "@/components/client-date";

const STATUSES = ["pending", "shortlisted", "rejected"] as const;

export function ApplicationsTable({
  event,
  initialRows,
  tracks,
}: {
  event: EventKey;
  initialRows: OrganizerRow[];
  tracks: { id: string; name: string }[];
}) {
  const [rows, setRows] = useState(initialRows);
  const [globalFilter, setGlobalFilter] = useState("");
  const [trackFilter, setTrackFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (id: string, status: (typeof STATUSES)[number]) => {
      setUpdatingId(id);
      try {
        const res = await fetch(`/api/organizer/${event}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) {
          toast.error("O'zgarishlarni saqlashda xatolik yuz berdi");
          return;
        }
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        toast.success("Status yangilandi");
      } finally {
        setUpdatingId(null);
      }
    },
    [event]
  );

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (trackFilter !== "all" && r.trackName !== trackFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (globalFilter) {
        const q = globalFilter.toLowerCase();
        const hay = `${r.displayName} ${r.phone} ${r.telegramUsername}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, trackFilter, statusFilter, globalFilter]);

  const columns = useMemo<ColumnDef<OrganizerRow>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {event === "hakaton" ? "Jamoa nomi" : "Ism-familya"}
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-text-primary">{row.original.displayName}</p>
            {row.original.memberCount ? (
              <p className="font-mono text-xs text-text-muted">
                {row.original.memberCount} a'zo
              </p>
            ) : null}
            {row.original.ageValid === false && (
              <span className="mt-0.5 inline-block rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-medium text-danger">
                Yosh mos emas
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Telefon",
        cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span>,
      },
      {
        accessorKey: "telegramUsername",
        header: "Telegram",
        cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span>,
      },
      {
        accessorKey: "trackName",
        header: "Trek",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button disabled={updatingId === row.original.id}>
                <Badge
                  variant={row.original.status}
                  className="cursor-pointer hover:opacity-80"
                >
                  {STATUS_LABELS[row.original.status]}
                </Badge>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {STATUSES.map((s) => (
                <DropdownMenuItem key={s} onClick={() => updateStatus(row.original.id, s)}>
                  {STATUS_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        accessorKey: "checkedIn",
        header: "Keldi/Ketdi",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.checkedIn ? (
              <Badge variant="checkedIn">Keldi</Badge>
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
            {row.original.checkedOutAt && <Badge variant="outline">Ketdi</Badge>}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            className="flex items-center gap-1"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sana
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-mono text-xs text-text-muted">
            <ClientDate iso={getValue<string>()} />
          </span>
        ),
      },
      ...(event === "hakaton"
        ? [
            {
              id: "invite",
              header: "Taklif linki",
              cell: ({ row }: { row: { original: OrganizerRow } }) =>
                row.original.inviteLink ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}${row.original.inviteLink}`
                      );
                      toast.success("Link nusxalandi");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Nusxalash
                  </Button>
                ) : (
                  <span className="text-xs text-text-muted">Yuborilgan</span>
                ),
            } satisfies ColumnDef<OrganizerRow>,
          ]
        : []),
      {
        id: "detail",
        header: "",
        cell: ({ row }) => (
          <ApplicationDetailDialog
            event={event}
            id={row.original.id}
            tracks={tracks}
            onUpdated={(updated) =>
              setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
            }
            onDeleted={(deletedId) =>
              setRows((prev) => prev.filter((r) => r.id !== deletedId))
            }
          />
        ),
      },
    ],
    [event, updatingId, updateStatus, tracks]
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const trackOptions = useMemo(() => {
    const names = new Set(tracks.map((t) => t.name));
    rows.forEach((r) => names.add(r.trackName));
    return Array.from(names);
  }, [tracks, rows]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {EVENT_LABELS[event]} arizalari
          </h1>
          <p className="text-sm text-text-muted">{filteredRows.length} ta ariza</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <CreateApplicationDialog
            event={event}
            tracks={tracks}
            onCreated={(row) => setRows((prev) => [row, ...prev])}
          />
          <Button asChild variant="secondary" className="gap-1.5">
            <a href={`/api/export/${event}`} download>
              <Download className="h-4 w-4" />
              Excel yuklab olish
            </a>
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Qidirish..."
            className="pl-10"
          />
        </div>
        <Select value={trackFilter} onValueChange={setTrackFilter}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Trek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha treklar</SelectItem>
            {trackOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha statuslar</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-text-muted">
                Hali arizalar yo'q. Birinchi ariza kelganda shu yerda ko'rinadi.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
