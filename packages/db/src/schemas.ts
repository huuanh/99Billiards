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
