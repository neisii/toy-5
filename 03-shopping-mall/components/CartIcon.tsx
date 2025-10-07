'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function CartIcon() {
  const totalItems = useCartStore(state => state.getTotalItems());

  return (
    <Link href="/cart" aria-label="장바구니" className="relative">
      <div className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        <span>🛒</span>
        <span>장바구니</span>
        {totalItems > 0 && (
          <span className="cart-badge absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {totalItems}
          </span>
        )}
      </div>
    </Link>
  );
}
