import { z } from "zod";

export const bookingSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(8, "Số điện thoại chưa hợp lệ"),
  branchId: z.string().min(1, "Vui lòng chọn cơ sở"),
  guestCount: z.coerce.number().min(1).max(100),
  bookingDate: z.string().min(1),
  bookingTime: z.string().min(1),
  promotionId: z.string().optional(),
  note: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const franchiseLeadSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên").max(120),
  phone: z
    .string()
    .min(8, "Số điện thoại chưa hợp lệ")
    .max(20)
    .regex(/^[0-9+\-\s]+$/, "Số điện thoại chỉ gồm số"),
  area: z.string().max(120).optional().or(z.literal("")),
  capital: z.string().max(120).optional().or(z.literal("")),
  note: z.string().max(1000).optional().or(z.literal("")),
}).strip();

export const salesOrderSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ tên"),
  phone: z.string().min(8, "Số điện thoại chưa hợp lệ"),
  email: z.string().email("Email chưa hợp lệ").optional().or(z.literal("")),
  address: z.string().min(4, "Vui lòng nhập địa chỉ"),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  note: z.string().optional(),
  discountCode: z.string().optional(),
  paymentMethod: z.literal("cod").default("cod"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, "Giỏ hàng dang trong"),
});

export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
