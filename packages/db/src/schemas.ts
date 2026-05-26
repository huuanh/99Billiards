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

export const salesOrderSchema = z.object({
  customerName: z.string().min(2, "Vui long nhap ho ten"),
  phone: z.string().min(8, "So dien thoai chua hop le"),
  email: z.string().email("Email chua hop le").optional().or(z.literal("")),
  address: z.string().min(4, "Vui long nhap dia chi"),
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
    .min(1, "Gio hang dang trong"),
});

export type SalesOrderInput = z.infer<typeof salesOrderSchema>;
