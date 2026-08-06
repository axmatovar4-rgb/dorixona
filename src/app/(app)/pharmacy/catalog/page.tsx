import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LookupManager } from "@/modules/pharmacy/components/lookup-manager";

export default async function CatalogPage() {
  const session = await auth();
  const role = session!.user.role;
  const canManage = can(role, "pharmacy", "create");

  const [categories, brands, manufacturers, activeIngredients] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.manufacturer.findMany({ orderBy: { name: "asc" } }),
    prisma.activeIngredient.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Katalog</h1>
        <p className="text-sm text-muted-foreground">
          Kategoriya, brend, ishlab chiqaruvchi va faol moddalarni boshqarish
        </p>
      </div>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">Kategoriyalar</TabsTrigger>
          <TabsTrigger value="brand">Brendlar</TabsTrigger>
          <TabsTrigger value="manufacturer">Ishlab chiqaruvchilar</TabsTrigger>
          <TabsTrigger value="activeIngredient">Faol moddalar</TabsTrigger>
        </TabsList>

        <Card className="mt-3">
          <CardContent className="pt-6">
            <TabsContent value="category">
              <LookupManager model="category" items={categories} canManage={canManage} />
            </TabsContent>
            <TabsContent value="brand">
              <LookupManager model="brand" items={brands} canManage={canManage} />
            </TabsContent>
            <TabsContent value="manufacturer">
              <LookupManager
                model="manufacturer"
                items={manufacturers}
                canManage={canManage}
                withCountry
              />
            </TabsContent>
            <TabsContent value="activeIngredient">
              <LookupManager
                model="activeIngredient"
                items={activeIngredients}
                canManage={canManage}
              />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
