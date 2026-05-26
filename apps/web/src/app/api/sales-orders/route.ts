import { NextResponse } from "next/server";
import { ProductModel, SalesOrderModel, connectDb } from "@99billiards/db";
import { salesOrderSchema } from "@99billiards/db/schemas";

function makeOrderCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `DH${stamp}${suffix}`;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = salesOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Thông tin đơn hàng chưa hợp lệ" }, { status: 400 });
  }

  const connection = await connectDb().catch((error) => {
    console.error("Sales order DB connection failed", error);
    return null;
  });

  if (!connection) {
    return NextResponse.json({ error: "Order service is temporarily unavailable" }, { status: 503 });
  }

  const requestedItems = parsed.data.items;
  const productIds = requestedItems.map((item) => item.productId);
  const products = await ProductModel.find({
    status: "published",
    $or: [{ id: { $in: productIds } }, { _id: { $in: productIds.filter((id) => /^[a-f\d]{24}$/i.test(id)) } }],
  }).lean();
  const productById = new Map(products.flatMap((product) => [[String(product.id || ""), product], [String(product._id), product]]));

  const items = requestedItems.map((item) => {
    const product = productById.get(item.productId);
    if (!product) return null;
    const price = Number(product.price || 0);
    const quantity = Number(item.quantity || 1);
    return {
      productId: String(product.id || product._id),
      name: String(product.name || ""),
      image: String(product.image || ""),
      price,
      quantity,
      total: price * quantity,
    };
  });

  if (items.some((item) => !item)) {
    return NextResponse.json({ error: "Một số sản phẩm không còn tồn tại hoặc chưa publish" }, { status: 400 });
  }

  const resolvedItems = items.filter((item): item is NonNullable<typeof item> => Boolean(item));
  const subtotal = resolvedItems.reduce((total, item) => total + item.total, 0);
  const discountTotal = 0;
  const total = Math.max(0, subtotal - discountTotal);

  const order = await SalesOrderModel.create({
    orderCode: makeOrderCode(),
    customerName: parsed.data.customerName,
    phone: parsed.data.phone,
    email: parsed.data.email || "",
    address: parsed.data.address,
    province: parsed.data.province || "",
    district: parsed.data.district || "",
    ward: parsed.data.ward || "",
    note: parsed.data.note || "",
    paymentMethod: "cod",
    items: resolvedItems,
    subtotal,
    discountCode: parsed.data.discountCode || "",
    discountTotal,
    total,
    status: "new",
  });

  return NextResponse.json({ ok: true, id: order._id.toString(), orderCode: order.orderCode });
}
