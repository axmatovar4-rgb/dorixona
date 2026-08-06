"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

type Lookup = { id: string; name: string };

type ProductRow = {
  id: string;
  name: string;
  barcode: string;
  unit: string;
  sellPrice: string;
  minStock: number;
  currentStock: number;
  prescriptionRequired: boolean;
  isActive: boolean;
  category: Lookup | null;
  brand: Lookup | null;
};

type ApiResponse = {
  data: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

const PAGE_SIZE = 10;

export function ProductsTable({
  categories,
  brands,
  canEdit,
}: {
  categories: Lookup[];
  brands: Lookup[];
  canEdit: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [brandId, setBrandId] = React.useState<string>("");
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, brandId]);

  const { data, isLoading, isFetching } = useQuery<ApiResponse>({
    queryKey: ["pharmacy-products", debouncedSearch, categoryId, brandId, page],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(brandId ? { brandId } : {}),
      });
      const res = await fetch(`/api/pharmacy/products?${qs.toString()}`);
      if (!res.ok) throw new Error("Ma'lumotlarni yuklab bo'lmadi");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        header: "Nomi",
        accessorKey: "name",
        cell: ({ row }) => (
          <Link
            href={`/pharmacy/products/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      },
      { header: "Barkod", accessorKey: "barcode" },
      {
        header: "Kategoriya",
        cell: ({ row }) => row.original.category?.name ?? "—",
      },
      {
        header: "Brend",
        cell: ({ row }) => row.original.brand?.name ?? "—",
      },
      { header: "Birlik", accessorKey: "unit" },
      {
        header: "Narx",
        cell: ({ row }) => `${Number(row.original.sellPrice).toLocaleString("uz-UZ")} so'm`,
      },
      {
        header: "Qoldiq",
        cell: ({ row }) => {
          const { currentStock, minStock } = row.original;
          const variant =
            currentStock === 0
              ? "destructive"
              : currentStock <= minStock
                ? "outline"
                : "secondary";
          return (
            <Badge variant={variant}>
              {currentStock} {row.original.unit}
            </Badge>
          );
        },
      },
      {
        header: "Retsept",
        cell: ({ row }) =>
          row.original.prescriptionRequired ? (
            <Badge variant="outline">Talab qilinadi</Badge>
          ) : (
            "—"
          ),
      },
      {
        header: "Holat",
        cell: ({ row }) =>
          row.original.isActive ? (
            <Badge variant="secondary">Faol</Badge>
          ) : (
            <Badge variant="outline">Nofaol</Badge>
          ),
      },
      ...(canEdit
        ? [
            {
              header: "",
              id: "actions",
              cell: ({ row }: { row: { original: ProductRow } }) => (
                <Link
                  href={`/pharmacy/products/${row.original.id}/edit`}
                  className="text-sm text-primary hover:underline"
                >
                  Tahrirlash
                </Link>
              ),
            } satisfies ColumnDef<ProductRow>,
          ]
        : []),
    ],
    [canEdit]
  );

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nomi yoki barkod bo'yicha qidirish..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          items={[
            { value: "all", label: "Barcha kategoriyalar" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
          value={categoryId || "all"}
          onValueChange={(v) => setCategoryId(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Kategoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha kategoriyalar</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={[
            { value: "all", label: "Barcha brendlar" },
            ...brands.map((b) => ({ value: b.id, label: b.name })),
          ]}
          value={brandId || "all"}
          onValueChange={(v) => setBrandId(!v || v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Brend" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Barcha brendlar</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
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
              Array.from({ length: 5 }).map((_, i) => (
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
                  Mahsulotlar topilmadi
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
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
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
