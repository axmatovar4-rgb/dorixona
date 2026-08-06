import Link from "next/link";
import { getCategoryIcon } from "@/modules/customer/category-icons";
import { SectionHeader } from "@/modules/customer/components/section";

type Category = { id: string; name: string; count: number };

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div>
      <SectionHeader title="Mashhur kategoriyalar" subtitle="Kerakli bo'limni tanlang" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}#catalog`}
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center portal-shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:portal-shadow"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.count} ta mahsulot</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
