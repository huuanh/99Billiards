"use client";

export interface CartItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export const cartStorageKey = "99billiards_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(cartStorageKey);
    if (!value) return [];
    const parsed = JSON.parse(value) as CartItem[];
    return Array.isArray(parsed)
      ? parsed
          .filter((item) => item.productId && item.name && Number(item.quantity) > 0)
          .map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image || "",
            price: Number(item.price || 0),
            quantity: Math.min(99, Math.max(1, Number(item.quantity || 1))),
          }))
      : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function addCartItem(item: CartItem) {
  const current = readCart();
  const existing = current.find((cartItem) => cartItem.productId === item.productId);
  const next = existing
    ? current.map((cartItem) =>
        cartItem.productId === item.productId
          ? { ...cartItem, quantity: Math.min(99, cartItem.quantity + item.quantity) }
          : cartItem,
      )
    : [...current, { ...item, quantity: Math.max(1, item.quantity) }];
  writeCart(next);
  return next;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}
