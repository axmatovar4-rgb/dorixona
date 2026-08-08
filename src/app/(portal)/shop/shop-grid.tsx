"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, PackageSearch, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MedicineCard, type MedicineCardData } from "@/modules/customer/components/medicine-card";

type Category = { id: string; name: string };

type ApiResponse = {
  data: MedicineCardData[];
  total: number;
  page: number;
  pageCount: number;
};

const PAGE_SIZE = 12;

export function ShopGrid({
  categories,
  countries = [],
  initialSearch = "",
  initialCategoryId = "",
}: {
  categories: Category[];
  countries?: string[];
  initialSearch?: string;
  initialCategoryId?: string;
}) {
  const [search, setSearch] = React.useState(initialSearch);
  const [categoryId, setCategoryId] = React.useState(initialCategoryId);
  const [country, setCountry] = React.useState("");
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryId, country]);

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ["shop-products", debouncedSearch, categoryId, country, page],
    queryFn: async () => {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(country ? { country } : {}),
      });
      const res = await fetch(`/api/shop/products?${qs.toString()}`);
      if (!res.ok) throw new Error("Yuklab bo'lmadi");
      return res.json();
    },
    placeholderData: (prev) => prev,
  });

  const categoryName = categories.find((c) => c.id === categoryId)?.name;
  const hasActiveFilters = !!search || !!categoryId || !!country;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Dori nomini qidiring..."
            className="h-10 rounded-full pl-9"
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
          <SelectTrigger className="h-10 w-52 rounded-full">
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
        {countries.length > 0 && (
          <Select
            items={[{ value: "all", label: "Barcha davlatlar" }, ...countries.map((c) => ({ value: c, label: c }))]}
            value={country || "all"}
            onValueChange={(v) => setCountry(!v || v === "all" ? "" : (v as string))}
          >
            <SelectTrigger className="h-10 w-52 rounded-full">
              <SelectValue placeholder="Ishlab chiqarilgan joyi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha davlatlar</SelectItem>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Tanlangan filtrlar:</span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium hover:bg-muted/70"
            >
              &quot;{search}&quot; <X className="h-3 w-3" />
            </button>
          )}
          {categoryId && categoryName && (
            <button
              type="button"
              onClick={() => setCategoryId("")}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium hover:bg-muted/70"
            >
              {categoryName} <X className="h-3 w-3" />
            </button>
          )}
          {country && (
            <button
              type="button"
              onClick={() => setCountry("")}
              className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium hover:bg-muted/70"
            >
              {country} <X className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategoryId("");
              setCountry("");
            }}
            className="text-primary hover:underline"
          >
            Filtrlarni tozalash
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4.2] w-full rounded-2xl" />
            ))
          : data?.data.map((p) => <MedicineCard key={p.id} product={p} />)}
      </div>

      {!isLoading && data?.data.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <PackageSearch className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Dorilar topilmadi</p>
        </div>
      )}

      {data && data.pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {data.page}/{data.pageCount} sahifa
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full"
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
