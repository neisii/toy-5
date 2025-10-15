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

  // URL에서 초기 상태 읽기
  const searchFromURL = searchParams.get("search") || "";
  const categoryFromURL = searchParams.get("category") || "all";
  const pageFromURL = parseInt(searchParams.get("page") || "1", 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);
  const [searchQuery, setSearchQuery] = useState(searchFromURL);
  const [loading, setLoading] = useState(true);

  // URL에서 현재 페이지 읽기
  const currentPage = pageFromURL;

  // 페이지 번호 유효성 검사
  const validPage = Math.max(1, isNaN(currentPage) ? 1 : currentPage);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

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
    let filtered = products;

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // 검색어 필터링
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredProducts(filtered);
  };

  // URL 업데이트 헬퍼 함수
  const updateURL = (updates: {
    search?: string;
    category?: string;
    page?: number;
  }) => {
    const params = new URLSearchParams();

    // 검색어 업데이트
    const newSearch =
      updates.search !== undefined ? updates.search : searchQuery;
    if (newSearch.trim() !== "") {
      params.set("search", newSearch);
    }

    // 카테고리 업데이트
    const newCategory =
      updates.category !== undefined ? updates.category : selectedCategory;
    if (newCategory !== "all") {
      params.set("category", newCategory);
    }

    // 페이지 업데이트
    const newPage = updates.page !== undefined ? updates.page : validPage;
    if (newPage !== 1) {
      params.set("page", newPage.toString());
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // 카테고리 변경 시 1페이지로 초기화
    updateURL({ category, page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // 검색어 변경 시 1페이지로 초기화
    updateURL({ search: query, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });

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

        {/* 검색 입력창 */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="상품명으로 검색..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4 text-gray-600">
          검색 결과: {filteredProducts.length}개
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            검색 결과가 없습니다
          </div>
        ) : (
          <ProductList products={paginatedProducts} />
        )}

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
