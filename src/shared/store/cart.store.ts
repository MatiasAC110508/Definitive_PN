"use client";

import { create } from "zustand";
import type { Product } from "@/domain/entities/product.entity";

export type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem(product: Product): void;
  removeItem(productId: string): void;
  updateQuantity(productId: string, quantity: number): void;
  clear(): void;
  setIsOpen(open: boolean): void;
  totalItems(): number;
  subtotal(): number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
  addItem(product) {
    if (product.stock <= 0) return;

    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        const newQuantity = Math.min(existing.quantity + 1, product.stock);
        return {
          items: state.items.map((item) =>
            item.id === product.id ? { ...item, quantity: newQuantity } : item,
          ),
        };
      }

      return { items: [...state.items, { ...product, quantity: 1 }] };
    });
  },
  removeItem(productId) {
    set((state) => ({ items: state.items.filter((item) => item.id !== productId) }));
  },
  updateQuantity(productId, quantity) {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, Math.min(quantity, item.stock));
          return { ...item, quantity: newQuantity };
        }
        return item;
      }),
    }));
  },
  clear() {
    set({ items: [] });
  },
  totalItems() {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  subtotal() {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },
}));
