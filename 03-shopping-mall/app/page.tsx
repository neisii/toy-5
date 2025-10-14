"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Product } from "@/types/product";
import ProductList from "@/components/ProductList";
import CategoryFilter from "@/components/CategoryFilter";
import CartIcon from "@/components/CartIcon";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // URL에서 현재 페이지 읽기
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // 페이지 번호 유효성 검사
  const validPage = Math.max(1, isNaN(currentPage) ? 1 : currentPage);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/products");
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory),
      );
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 카테고리 변경 시 1페이지로 초기화
    handlePageChange(1);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    // 카테고리가 all이 아니면 URL에 포함
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    router.push(`${pathname}?${params.toString()}`);

    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 페이지네이션 적용된 상품 계산
  const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <p className="text-center">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🛒 쇼핑몰</h1>
          <CartIcon />
        </div>

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="mb-4 text-gray-600">
          총 {filteredProducts.length}개 상품
        </div>

        <ProductList products={paginatedProducts} />

        <Pagination
          currentPage={validPage}
          totalItems={filteredProducts.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>
    </main>
  );
}
