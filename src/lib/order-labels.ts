import { OrderStatus, PaymentMethod } from "@prisma/client";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Kutilmoqda",
  PREPARING: "Tayyorlanmoqda",
  DELIVERING: "Yetkazilmoqda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
};

export const ORDER_STATUS_VARIANT: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "outline",
  PREPARING: "secondary",
  DELIVERING: "secondary",
  DELIVERED: "secondary",
  CANCELLED: "destructive",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Naqd (yetkazishda)",
  CLICK: "Click",
  PAYME: "Payme",
  UZCARD: "Uzcard",
  HUMO: "Humo",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "DELIVERING",
  "DELIVERED",
];
