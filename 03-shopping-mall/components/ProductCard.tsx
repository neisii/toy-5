'use client';

import type { Product } from '@/types/product';
import { useCartStore } from '@/store/cartStore';

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    addItem(product);
  };

  return (
    <div className="product-card border rounded-lg p-4 hover:shadow-lg transition-shadow" data-id={product.id}>
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded" />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.description}</p>
      <p className="mt-2 text-lg font-bold">{product.price.toLocaleString()}원</p>
      <button
        onClick={handleAddToCart}
        className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        장바구니 담기
      </button>
    </div>
  );
}
