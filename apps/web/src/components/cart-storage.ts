"use client";

export interface CartItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
}

export const cartStorageKey = "99billiards_cart";
let cachedCartValue: string | null = null;
let cachedCartItems: CartItem[] = [];

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(cartStorageKey);
    if (value === cachedCartValue) return cachedCartItems;
    if (!value) {
      cachedCartValue = value;
      cachedCartItems = [];
      return cachedCartItems;
    }
    const parsed = JSON.parse(value) as CartItem[];
    cachedCartValue = value;
    cachedCartItems = Array.isArray(parsed)
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
    return cachedCartItems;
  } catch {
    cachedCartValue = null;
    cachedCartItems = [];
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  cachedCartItems = items;
  cachedCartValue = JSON.stringify(items);
  window.localStorage.setItem(cartStorageKey, cachedCartValue);
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function subscribeCart(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("cart-updated", callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("cart-updated", callback);
    window.removeEventListener("storage", callback);
  };
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
