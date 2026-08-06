import Link from "next/link";
import { Pill, Phone, MessageCircle, Send } from "lucide-react";

const COLUMNS = [
  {
    title: "Do'kon",
    links: [
      { label: "Barcha dorilar", href: "/shop" },
      { label: "Savat", href: "/cart" },
      { label: "Buyurtmalarim", href: "/orders" },
    ],
  },
  {
    title: "Yordam",
    links: [
      { label: "Ko'p so'raladigan savollar", href: "#" },
      { label: "Yetkazib berish", href: "#" },
      { label: "Qaytarish siyosati", href: "#" },
    ],
  },
  {
    title: "Kompaniya",
    links: [
      { label: "Biz haqimizda", href: "#" },
      { label: "Filiallar", href: "#" },
      { label: "Hamkorlik", href: "#" },
    ],
  },
];

export function PortalFooter() {
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <Link href="/shop" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Pill className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold">PharmCare</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Ishonchli onlayn dorixona — sog&apos;ligingiz biz uchun ustuvor.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground portal-shadow-sm">
                <Phone className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground portal-shadow-sm">
                <Send className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground portal-shadow-sm">
                <MessageCircle className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-sm font-semibold">{col.title}</p>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} PharmCare. Barcha huquqlar himoyalangan.</p>
          <p>Faqat retsept asosida sotiladigan dorilar shifokor nazorati ostida qo&apos;llanilishi kerak.</p>
        </div>
      </div>
    </footer>
  );
}
