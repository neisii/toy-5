'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const { items, increaseQuantity, decreaseQuantity, removeItem, getTotalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">장바구니</h1>
          <div className="cart-empty text-center py-16">
            <p className="text-gray-500 mb-4">장바구니가 비어있습니다</p>
            <Link href="/" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">장바구니</h1>

        <div className="space-y-4">
          {items.map(item => (
            <div key={item.product.id} className="cart-item border rounded-lg p-4 flex items-center gap-4">
              <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded" />

              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="item-price text-gray-600">{item.product.price.toLocaleString()}원</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decreaseQuantity(item.product.id)}
                  aria-label="수량 감소"
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="quantity w-12 text-center">{item.quantity}</span>
                <button
                  onClick={() => increaseQuantity(item.product.id)}
                  aria-label="수량 증가"
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <p className="font-bold">{(item.product.price * item.quantity).toLocaleString()}원</p>
                <button
                  onClick={() => removeItem(item.product.id)}
                  aria-label="삭제"
                  className="mt-2 text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">총 금액</span>
            <span className="total-price text-2xl font-bold text-blue-500">
              {getTotalPrice().toLocaleString()}원
            </span>
          </div>

          <div className="flex gap-4">
            <Link href="/" className="flex-1 bg-gray-200 text-center py-3 rounded hover:bg-gray-300">
              쇼핑 계속하기
            </Link>
            <button className="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600">
              결제하기
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
