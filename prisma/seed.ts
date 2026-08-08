import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("Seeding...");

  const passwordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
    10
  );

  const [superAdmin, pharmacist, cashier, warehouseManager] = await Promise.all([
    prisma.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL ?? "admin@pharmcare.uz" },
      update: {},
      create: {
        name: "Super Admin",
        email: process.env.SEED_ADMIN_EMAIL ?? "admin@pharmcare.uz",
        passwordHash,
        role: "SUPER_ADMIN",
      },
    }),
    prisma.user.upsert({
      where: { email: "farmatsevt@pharmcare.uz" },
      update: {},
      create: {
        name: "Nodira Yusupova",
        email: "farmatsevt@pharmcare.uz",
        passwordHash,
        role: "PHARMACIST",
      },
    }),
    prisma.user.upsert({
      where: { email: "kassir@pharmcare.uz" },
      update: {},
      create: {
        name: "Diyor Karimov",
        email: "kassir@pharmcare.uz",
        passwordHash,
        role: "CASHIER",
      },
    }),
    prisma.user.upsert({
      where: { email: "ombor@pharmcare.uz" },
      update: {},
      create: {
        name: "Sherzod Aliyev",
        email: "ombor@pharmcare.uz",
        passwordHash,
        role: "WAREHOUSE_MANAGER",
      },
    }),
  ]);

  const branch1 = await prisma.branch.upsert({
    where: { id: "seed-branch-1" },
    update: {},
    create: { id: "seed-branch-1", name: "Bosh filial (Chilonzor)", address: "Toshkent, Chilonzor" },
  });
  const branch2 = await prisma.branch.upsert({
    where: { id: "seed-branch-2" },
    update: {},
    create: { id: "seed-branch-2", name: "Yunusobod filiali", address: "Toshkent, Yunusobod" },
  });

  const warehouse1 = await prisma.warehouse.upsert({
    where: { id: "seed-wh-1" },
    update: {},
    create: { id: "seed-wh-1", name: "Bosh ombor", branchId: branch1.id },
  });
  const warehouse2 = await prisma.warehouse.upsert({
    where: { id: "seed-wh-2" },
    update: {},
    create: { id: "seed-wh-2", name: "Yunusobod ombori", branchId: branch2.id },
  });

  const categoryNames = ["Og'riq qoldiruvchi", "Antibiotik", "Vitamin", "Sovuqotish", "Yurak-qon tomir"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const brandNames = ["Nobel", "Jurabek Laboratories", "Remedy", "Sanofi", "Pharmson"];
  const brands = await Promise.all(
    brandNames.map((name) => prisma.brand.upsert({ where: { name }, update: {}, create: { name } }))
  );

  const manufacturerData = [
    { name: "Nobel Ilac", country: "Turkiya" },
    { name: "Jurabek Laboratories", country: "O'zbekiston" },
    { name: "Sanofi", country: "Fransiya" },
    { name: "Pharmson", country: "O'zbekiston" },
  ];
  const manufacturers = await Promise.all(
    manufacturerData.map((m) =>
      prisma.manufacturer.upsert({ where: { name: m.name }, update: {}, create: m })
    )
  );

  const ingredientNames = ["Paratsetamol", "Ibuprofen", "Amoksitsillin", "Askorbin kislota", "Amlodipin"];
  const ingredients = await Promise.all(
    ingredientNames.map((name) =>
      prisma.activeIngredient.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const productDefs = [
    { name: "Parasetamol 500mg", barcode: "4780000000001", unit: "tabletka", dosage: "500mg", price: [800, 1500], min: 50, max: 500 },
    { name: "Ibuprofen 400mg", barcode: "4780000000002", unit: "tabletka", dosage: "400mg", price: [1000, 1800], min: 40, max: 400 },
    { name: "Amoksitsillin 500mg", barcode: "4780000000003", unit: "kapsula", dosage: "500mg", price: [2000, 3500], min: 30, max: 300, rx: true },
    { name: "Askorbin kislota 100mg", barcode: "4780000000004", unit: "tabletka", dosage: "100mg", price: [500, 900], min: 60, max: 600 },
    { name: "Amlodipin 5mg", barcode: "4780000000005", unit: "tabletka", dosage: "5mg", price: [1500, 2800], min: 20, max: 200, rx: true },
    { name: "No-shpa 40mg", barcode: "4780000000006", unit: "tabletka", dosage: "40mg", price: [1800, 3200], min: 25, max: 250 },
    { name: "Sumamed 500mg", barcode: "4780000000007", unit: "tabletka", dosage: "500mg", price: [4500, 7000], min: 15, max: 150, rx: true },
    { name: "Nurofen sirop", barcode: "4780000000008", unit: "flakon", dosage: "100ml", price: [3000, 5500], min: 10, max: 100 },
    { name: "Aktivirlangan ko'mir", barcode: "4780000000009", unit: "tabletka", dosage: "250mg", price: [300, 600], min: 100, max: 800 },
    { name: "Loratadin 10mg", barcode: "4780000000010", unit: "tabletka", dosage: "10mg", price: [1200, 2200], min: 30, max: 300 },
    { name: "Vitamin D3 2000IU", barcode: "4780000000011", unit: "kapsula", dosage: "2000IU", price: [2500, 4200], min: 20, max: 200 },
    { name: "Omeprazol 20mg", barcode: "4780000000012", unit: "kapsula", dosage: "20mg", price: [1600, 2900], min: 25, max: 250 },
    { name: "Metformin 500mg", barcode: "4780000000013", unit: "tabletka", dosage: "500mg", price: [1300, 2400], min: 20, max: 200, rx: true },
    { name: "Bint (marla)", barcode: "4780000000014", unit: "dona", dosage: "", price: [700, 1300], min: 40, max: 400 },
    { name: "Analgin 500mg", barcode: "4780000000015", unit: "tabletka", dosage: "500mg", price: [400, 800], min: 50, max: 500 },
    { name: "Insulin Actrapid", barcode: "4780000000016", unit: "flakon", dosage: "100IU/ml", price: [25000, 38000], min: 5, max: 50, rx: true },
    { name: "Aspirin Cardio 100mg", barcode: "4780000000017", unit: "tabletka", dosage: "100mg", price: [900, 1700], min: 30, max: 300 },
  ];

  const products = [];
  for (let i = 0; i < productDefs.length; i++) {
    const def = productDefs[i];
    const product = await prisma.product.upsert({
      where: { barcode: def.barcode },
      update: {},
      create: {
        name: def.name,
        barcode: def.barcode,
        unit: def.unit,
        dosage: def.dosage || null,
        categoryId: categories[i % categories.length].id,
        brandId: brands[i % brands.length].id,
        manufacturerId: manufacturers[i % manufacturers.length].id,
        activeIngredientId: ingredients[i % ingredients.length].id,
        prescriptionRequired: !!def.rx,
        purchasePrice: def.price[0],
        sellPrice: def.price[1],
        minStock: def.min,
        maxStock: def.max,
        stockMethod: "FEFO",
      },
    });
    products.push(product);
  }

  // Batches: cycle through scenarios — normal, low-stock, near-expiry, expired
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const warehouse = i % 2 === 0 ? warehouse1 : warehouse2;
    const scenario = i % 4;

    let quantity: number;
    let expiryDate: Date;

    switch (scenario) {
      case 0: // normal healthy stock
        quantity = product.minStock * 4;
        expiryDate = daysFromNow(365);
        break;
      case 1: // low stock (below minStock)
        quantity = Math.max(1, Math.floor(product.minStock * 0.4));
        expiryDate = daysFromNow(200);
        break;
      case 2: // near expiry (within 30 days)
        quantity = product.minStock * 2;
        expiryDate = daysFromNow(15);
        break;
      default: // expired
        quantity = product.minStock;
        expiryDate = daysFromNow(-10);
    }

    const batch = await prisma.batch.create({
      data: {
        productId: product.id,
        warehouseId: warehouse.id,
        batchNumber: `LOT-${2026}-${String(i + 1).padStart(3, "0")}`,
        expiryDate,
        quantity,
        purchasePrice: product.purchasePrice,
        supplierName: "Demo Supplier LLC",
      },
    });

    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        batchId: batch.id,
        warehouseId: warehouse.id,
        type: "IN",
        quantity,
        performedById: warehouseManager.id,
      },
    });
  }

  // ---------- RolePermission defaults (new modules) ----------
  const ALL_ACTIONS = ["view", "create", "edit", "delete"];
  const WRITE_ACTIONS = ["view", "create", "edit"];
  const READ_ACTIONS = ["view"];

  const NEW_MODULES = [
    "crm",
    "procurement",
    "finance",
    "hr",
    "payroll",
    "accounting",
    "supplierManagement",
    "branchManagement",
    "reports",
    "notifications",
    "settings",
    "audit",
    "promoCodes",
    "doctors",
  ] as const;

  const ROLE_MODULE_ACTIONS: Record<string, Record<string, string[]>> = {
    SUPER_ADMIN: Object.fromEntries(NEW_MODULES.map((m) => [m, ALL_ACTIONS])),
    ADMIN: Object.fromEntries(NEW_MODULES.map((m) => [m, ALL_ACTIONS])),
    PHARMACIST: {
      crm: READ_ACTIONS,
      procurement: READ_ACTIONS,
      supplierManagement: READ_ACTIONS,
      reports: READ_ACTIONS,
      notifications: READ_ACTIONS,
    },
    WAREHOUSE_MANAGER: {
      procurement: WRITE_ACTIONS,
      supplierManagement: WRITE_ACTIONS,
      branchManagement: READ_ACTIONS,
      reports: READ_ACTIONS,
      notifications: READ_ACTIONS,
    },
    CASHIER: {
      crm: READ_ACTIONS,
      reports: READ_ACTIONS,
      notifications: READ_ACTIONS,
    },
    MANAGER: {
      crm: WRITE_ACTIONS,
      procurement: WRITE_ACTIONS,
      supplierManagement: WRITE_ACTIONS,
      branchManagement: WRITE_ACTIONS,
      reports: READ_ACTIONS,
      notifications: READ_ACTIONS,
      finance: READ_ACTIONS,
      accounting: READ_ACTIONS,
      hr: READ_ACTIONS,
      payroll: READ_ACTIONS,
      promoCodes: WRITE_ACTIONS,
      doctors: WRITE_ACTIONS,
    },
    ACCOUNTANT: {
      finance: ALL_ACTIONS,
      accounting: ALL_ACTIONS,
      reports: READ_ACTIONS,
      notifications: READ_ACTIONS,
    },
    HR: {
      hr: ALL_ACTIONS,
      payroll: ALL_ACTIONS,
      crm: READ_ACTIONS,
      notifications: READ_ACTIONS,
    },
  };

  const permissionRows: { role: string; module: string; action: string; allowed: boolean }[] = [];
  for (const role of Object.keys(ROLE_MODULE_ACTIONS)) {
    for (const moduleName of NEW_MODULES) {
      const allowedActions = ROLE_MODULE_ACTIONS[role][moduleName] ?? [];
      for (const action of ALL_ACTIONS) {
        permissionRows.push({
          role,
          module: moduleName,
          action,
          allowed: allowedActions.includes(action),
        });
      }
    }
  }

  await prisma.rolePermission.createMany({
    data: permissionRows as never,
    skipDuplicates: true,
  });
  console.log(`RolePermission rows seeded: ${permissionRows.length}`);

  console.log("Seed complete.");
  console.log(`Super Admin: ${superAdmin.email}`);
  console.log(`Pharmacist: ${pharmacist.email}`);
  console.log(`Cashier: ${cashier.email}`);
  console.log(`Warehouse manager: ${warehouseManager.email}`);
  console.log(`Password for all seeded users: ${process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
