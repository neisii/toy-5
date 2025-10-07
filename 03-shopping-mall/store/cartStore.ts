import { create } from 'zustand';
import type { Product, CartItem } from '@/types/product';

type CartStore = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  clearCart: () => void;
};

const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadCart(),

  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.id === product.id);

    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newItems = [...items, { product, quantity: 1 }];
    }

    saveCart(newItems);
    set({ items: newItems });
  },

  removeItem: (productId: number) => {
    const newItems = get().items.filter(item => item.product.id !== productId);
    saveCart(newItems);
    set({ items: newItems });
  },

  increaseQuantity: (productId: number) => {
    const newItems = get().items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
    saveCart(newItems);
    set({ items: newItems });
  },

  decreaseQuantity: (productId: number) => {
    const newItems = get().items.map(item =>
      item.product.id === productId && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );
    saveCart(newItems);
    set({ items: newItems });
  },

  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },
}));
