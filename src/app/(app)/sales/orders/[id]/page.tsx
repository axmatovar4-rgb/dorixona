import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAYMENT_METHOD_LABELS } from "@/lib/order-labels";
import { StatusControl } from "./status-control";

export default async function StaffOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !can(session.user.role, "sales", "view")) {
    redirect("/dashboard");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, address: true, customer: true },
  });
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Buyurtma #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(order.createdAt, "dd.MM.yyyy HH:mm")}
          </p>
        </div>
        <StatusControl
          orderId={order.id}
          status={order.status}
          canEdit={can(session.user.role, "sales", "edit")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mijoz</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground">F.I.Sh.</span>
            <p className="font-medium">
              {order.customer.firstName} {order.customer.lastName}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Telefon</span>
            <p className="font-medium">{order.customer.phone}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Manzil</span>
            <p className="font-medium">{order.address.fullAddress}</p>
          </div>
          <div>
            <span className="text-muted-foreground">To&apos;lov usuli</span>
            <p className="font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mahsulotlar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahsulot</TableHead>
                <TableHead>Miqdor</TableHead>
                <TableHead>Narx</TableHead>
                <TableHead>Jami</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{Number(item.unitPrice).toLocaleString("uz-UZ")}</TableCell>
                  <TableCell>{Number(item.lineTotal).toLocaleString("uz-UZ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-3" />
          <div className="ml-auto flex w-56 flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mahsulotlar</span>
              <span>{Number(order.subtotal).toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yetkazib berish</span>
              <span>{Number(order.deliveryFee).toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Jami</span>
              <span>{Number(order.total).toLocaleString("uz-UZ")} so&apos;m</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.requiresPrescription && (
        <Card>
          <CardHeader>
            <CardTitle>Retsept</CardTitle>
          </CardHeader>
          <CardContent>
            {order.prescriptionImageUrl ? (
              <a href={order.prescriptionImageUrl} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- base64 data URI, next/image can't optimize it */}
                <img
                  src={order.prescriptionImageUrl}
                  alt="Retsept"
                  className="max-h-96 rounded-lg border"
                />
              </a>
            ) : (
              <Badge variant="destructive">Yuklanmagan</Badge>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
