"use client";

import * as React from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Option = { id: string; name: string };

type MovementRow = {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: string;
  product: { name: string };
  warehouse: { name: string };
  performedBy: { name: string } | null;
};

type ApiResponse = {
  data: MovementRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const MOVEMENT_LABELS: Record<string, string> = {
  IN: "Kirim",
  OUT: "Chiqim",
  TRANSFER_IN: "Transfer (kirim)",
  TRANSFER_OUT: "Transfer (chiqim)",
  ADJUSTMENT: "Tuzatish",
  RETURN: "Qaytarish",
};

const PAGE_SIZE = 15;

export function MovementsTable({ warehouses }: { warehouses: Option[] }) {
  const [warehouseId, setWarehouseId] = React.useState("");
  const [type, setType] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [warehouseId, type]);

  const { data, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey: ["inventory-movements", warehouseId, type, page],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(warehouseId ? { warehouseId } : {}),
        ...(type ? { type } : {}),
      });
      const res = await fetch(`/api/inventory/movements?${qs.toString()}`);
      if (!res.ok) throw new Error("Ma'lumotlarni yuklab bo'lmadi");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const columns = React.useMemo<ColumnDef<MovementRow>[]>(
    () => [
      {
        header: "Sana",
        cell: ({ row }) => format(new Date(row.original.createdAt), "dd.MM.yyyy HH:mm"),
      },
      {
        header: "Turi",
        cell: ({ row }) => (
          <Badge variant={row.original.type === "OUT" ? "outline" : "secondary"}>
            {MOVEMENT_LABELS[row.original.type] ?? row.original.type}
          </Badge>
        ),
      },
      { header: "Mahsulot", cell: ({ row }) => row.original.product.name },
      { header: "Ombor", cell: ({ row }) => row.original.warehouse.name },
      { header: "Miqdor", accessorKey: "quantity" },
      { header: "Kim", cell: ({ row }) => row.original.performedBy?.name ?? "Onlayn buyurtma" },
      { header: "Izoh", cell: ({ row }) => row.original.reason || "—" },
    ],
    []
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={[
            { value: "all", label: "Barcha omborlar" },
            ...warehouses.map((w) => ({ value: w.id, label: w.name })),
          ]}
          value={warehouseId || "all"}
          onValueChange={(v) => setWarehouseId(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ombor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha omborlar</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={[
            { value: "all", label: "Barcha turlar" },
            ...Object.entries(MOVEMENT_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          value={type || "all"}
          onValueChange={(v) => setType(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Turi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha turlar</SelectItem>
            {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
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
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Harakatlar topilmadi
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Jami {data.total} ta, {data.page}/{data.pageCount} sahifa
            {isFetching && " · yuklanmoqda..."}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= data.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
