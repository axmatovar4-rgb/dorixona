"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { updateOrderStatus } from "@/modules/orders/actions";
import { ORDER_STATUS_LABELS, ORDER_STATUS_VARIANT, PAYMENT_METHOD_LABELS } from "@/lib/order-labels";

type OrderRow = {
  id: string;
  status: keyof typeof ORDER_STATUS_LABELS;
  paymentMethod: keyof typeof PAYMENT_METHOD_LABELS;
  paymentStatus: string;
  total: string;
  itemCount: number;
  requiresPrescription: boolean;
  createdAt: string;
  customerName: string;
  customerPhone: string;
};

type ApiResponse = {
  data: OrderRow[];
  total: number;
  page: number;
  pageCount: number;
};

const PAGE_SIZE = 15;

export function OrdersTable({ canEdit }: { canEdit: boolean }) {
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const queryClient = useQueryClient();

  const debouncedSearch = useDebouncedValue(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const { data, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey: ["sales-orders", status, debouncedSearch, page],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(status ? { status } : {}),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/sales/orders?${qs.toString()}`);
      if (!res.ok) throw new Error("Yuklab bo'lmadi");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const handleStatusChange = React.useCallback(async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus as OrderRow["status"]);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Holat yangilandi");
    queryClient.invalidateQueries({ queryKey: ["sales-orders"] });
  }, [queryClient]);

  const columns = React.useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        header: "Buyurtma",
        cell: ({ row }) => (
          <Link href={`/sales/orders/${row.original.id}`} className="font-medium hover:underline">
            #{row.original.id.slice(-8).toUpperCase()}
          </Link>
        ),
      },
      { header: "Sana", cell: ({ row }) => format(new Date(row.original.createdAt), "dd.MM.yyyy HH:mm") },
      {
        header: "Mijoz",
        cell: ({ row }) => (
          <div>
            <p>{row.original.customerName}</p>
            <p className="text-xs text-muted-foreground">{row.original.customerPhone}</p>
          </div>
        ),
      },
      { header: "Mahsulotlar", cell: ({ row }) => `${row.original.itemCount} ta` },
      {
        header: "Summa",
        cell: ({ row }) => `${Number(row.original.total).toLocaleString("uz-UZ")} so'm`,
      },
      {
        header: "To'lov",
        cell: ({ row }) => PAYMENT_METHOD_LABELS[row.original.paymentMethod],
      },
      {
        header: "Retsept",
        cell: ({ row }) =>
          row.original.requiresPrescription ? <Badge variant="outline">Kerak</Badge> : "—",
      },
      {
        header: "Holat",
        cell: ({ row }) =>
          canEdit ? (
            <Select
              items={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              value={row.original.status}
              onValueChange={(v) => v && handleStatusChange(row.original.id, v)}
            >
              <SelectTrigger className="w-40" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge variant={ORDER_STATUS_VARIANT[row.original.status]}>
              {ORDER_STATUS_LABELS[row.original.status]}
            </Badge>
          ),
      },
    ],
    [canEdit, handleStatusChange]
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Mijoz ismi yoki telefon..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          items={[
            { value: "all", label: "Barcha holatlar" },
            ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
          ]}
          value={status || "all"}
          onValueChange={(v) => setStatus(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Holat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha holatlar</SelectItem>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
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
                  Buyurtmalar topilmadi
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

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
