# Phase 1: 페이지네이션 구현 완료 보고

## 개요
- **완료일**: 2025-10-14
- **소요 시간**: 약 90분 (예상대로)
- **테스트 결과**: 6/6 통과 (100%)

---

## 구현 상세

### 1. Pagination 컴포넌트 (`components/Pagination.tsx`)

새로 생성된 재사용 가능한 페이지네이션 컴포넌트.

#### Props
```typescript
interface PaginationProps {
  currentPage: number;      // 현재 페이지 번호
  totalItems: number;        // 전체 아이템 수
  itemsPerPage: number;      // 페이지당 아이템 수
  onPageChange: (page: number) => void; // 페이지 변경 핸들러
}
```

#### 주요 기능
- **동적 페이지 번호 표시**: 최대 5개 버튼, 현재 페이지를 중심으로 표시
- **이전/다음 버튼**: 첫 페이지/마지막 페이지에서 자동 비활성화
- **Tailwind CSS 스타일링**: 현재 페이지 강조, hover 효과, 비활성화 상태

#### 코드 예시
```tsx
const getPageNumbers = () => {
  const pageNumbers = [];
  const maxButtons = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  return pageNumbers;
};
```

---

### 2. 메인 페이지 통합 (`app/page.tsx`)

#### 추가된 Import
```typescript
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Pagination from "@/components/Pagination";
```

#### 페이지네이션 로직
```typescript
const ITEMS_PER_PAGE = 12;

// URL에서 페이지 번호 읽기
const currentPage = parseInt(searchParams.get("page") || "1", 10);
const validPage = Math.max(1, isNaN(currentPage) ? 1 : currentPage);

// 상품 슬라이싱
const startIndex = (validPage - 1) * ITEMS_PER_PAGE;
const endIndex = startIndex + ITEMS_PER_PAGE;
const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
```

#### URL 동기화
```typescript
const handlePageChange = (page: number) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set("page", page.toString());
  if (selectedCategory !== "all") {
    params.set("category", selectedCategory);
  }
  router.push(`${pathname}?${params.toString()}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

#### 카테고리 변경 시 페이지 초기화
```typescript
const handleCategoryChange = (category: string) => {
  setSelectedCategory(category);
  handlePageChange(1); // 카테고리 변경 시 항상 1페이지로
};
```

---

### 3. E2E 테스트 추가 (`tests/shop.spec.ts`)

#### 헬퍼 함수
```typescript
function generateMockProducts(count: number) {
  const products = [];
  const categories = ["electronics", "clothing", "food"];
  
  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `상품 ${i}`,
      price: 10000 + i * 1000,
      category: categories[i % 3],
      image: `https://via.placeholder.com/300?text=Product+${i}`,
    });
  }
  
  return products;
}
```

#### 테스트 케이스

**1) 페이지 이동 테스트**
```typescript
test("페이지 이동", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({ json: generateMockProducts(25) });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // 1페이지: 상품 1 표시
  await expect(page.locator('[data-id="1"]')).toBeVisible();

  // 2페이지로 이동: 상품 13 표시
  await page.click('button:has-text("2")');
  await page.waitForURL("**/1?page=2");
  await expect(page.locator('[data-id="13"]')).toBeVisible();

  // 3페이지로 이동: 상품 25 표시
  await page.click('button:has-text("3")');
  await page.waitForURL("**/1?page=3");
  await expect(page.locator('[data-id="25"]')).toBeVisible();
});
```

**2) 이전/다음 버튼 테스트**
```typescript
test("이전/다음 버튼", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({ json: generateMockProducts(25) });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // 1페이지: 이전 버튼 비활성화
  const prevButton = page.locator('button:has-text("이전")');
  await expect(prevButton).toBeDisabled();

  // 다음 버튼으로 2페이지 이동
  await page.click('button:has-text("다음")');
  await page.waitForURL("**/1?page=2");
  await expect(page.locator('[data-id="13"]')).toBeVisible();

  // 이전 버튼으로 1페이지 복귀
  await page.click('button:has-text("이전")');
  await page.waitForURL("**/1?page=1");
  await expect(page.locator('[data-id="1"]')).toBeVisible();
});
```

**3) 카테고리 변경 시 페이지 초기화 테스트**
```typescript
test("카테고리 변경 시 1페이지로 초기화", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({ json: generateMockProducts(25) });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // 2페이지로 이동
  await page.click('button:has-text("2")');
  await page.waitForURL("**/1?page=2");

  // 카테고리 변경
  await page.click('button:has-text("전자제품")');
  await page.waitForLoadState("networkidle");

  // URL이 page=1로 초기화되었는지 확인
  const url = page.url();
  const urlParams = new URLSearchParams(url.split("?")[1]);
  const pageParam = urlParams.get("page");
  expect(pageParam).toBe("1");

  // 상품이 표시되는지 확인
  const productCount = await page.locator(".product-card").count();
  expect(productCount).toBeGreaterThan(0);
});
```

---

## 트러블슈팅

### 이슈 1: Playwright Strict Mode Violation

#### 문제
```
Error: strict mode violation: locator('text=상품 1') resolved to 8 elements
```
- `text=상품 1` 선택자가 "상품 1", "상품 10", "상품 11", "상품 12" 등 여러 요소와 매칭됨
- 부분 텍스트 매칭으로 인한 문제

#### 해결
```typescript
// 변경 전 (오류 발생)
await expect(page.locator('text=상품 1')).toBeVisible();

// 변경 후 (정상 동작)
await expect(page.locator('[data-id="1"]')).toBeVisible();
```
- 기존 `data-id` 속성 활용
- 정확한 요소 타겟팅 가능

---

### 이슈 2: toHaveCount.greaterThan() 메서드 없음

#### 문제
```
TypeError: expect(...).toHaveCount.greaterThan is not a function
at shop.spec.ts:250:61
```
- Playwright API에 `toHaveCount.greaterThan()` 메서드 존재하지 않음
- 잘못된 API 사용

#### 해결
```typescript
// 변경 전 (오류 발생)
await expect(page.locator(".product-card")).toHaveCount.greaterThan(0);

// 변경 후 (정상 동작)
const productCount = await page.locator(".product-card").count();
expect(productCount).toBeGreaterThan(0);
```
- `.count()` 메서드로 개수 조회
- 일반 `expect().toBeGreaterThan()` 사용

---

## 테스트 결과

### 전체 테스트 현황
```
Running 6 tests using 1 worker

✓ 상품 목록 조회 및 표시
✓ 카테고리 필터링
✓ 장바구니 추가 및 수량 조절
✓ 페이지 이동 (Phase 1)
✓ 이전/다음 버튼 (Phase 1)
✓ 카테고리 변경 시 1페이지로 초기화 (Phase 1)

6 passed (6s)
```

### Phase 1 추가 테스트
- **페이지 이동**: 25개 상품, 3페이지 네비게이션 검증
- **이전/다음 버튼**: 버튼 활성화/비활성화 상태 검증
- **카테고리 변경 시 페이지 초기화**: URL 파라미터 `page=1` 검증

---

## 커밋 정보

### 커밋 메시지 (Conventional Commits with Scope)
```
feat(shopping-mall): implement Phase 1 pagination with URL sync

- Add Pagination component with dynamic page numbers
- Integrate URL state management with useSearchParams
- Reset to page 1 on category change
- Add 3 E2E tests for pagination navigation
- Fix strict mode violation with data-id selectors
- Fix toHaveCount.greaterThan() to use .count() method

Tests: 6/6 passing
```

### 변경된 파일
```
03-shopping-mall/
├── components/Pagination.tsx (신규)
├── app/page.tsx (수정)
├── tests/shop.spec.ts (수정)
└── docs/
    ├── SESSION_CONTEXT.md (수정)
    ├── PROGRESS.md (신규)
    ├── PHASE_1_PLAN.md (기존)
    └── PHASE_1_SUMMARY.md (신규)
```

---

## 다음 단계

### Phase 2: 검색 기능 (예정)
- 상품명 검색 입력창 추가
- 실시간 필터링 구현
- 검색어 강조 표시
- E2E 테스트 추가

### Phase 3: Toast 알림 (예정)
- 장바구니 추가 시 알림 표시
- 3초 후 자동 사라짐
- 우측 상단 배치

### Phase 4: URL 상태 관리 확장 (예정)
- 카테고리 필터 URL 반영 (`?category=electronics`)
- 검색어 URL 반영 (`?search=키워드`)
- 새로고침 시 상태 유지

---

## 결론

Phase 1 페이지네이션 구현이 성공적으로 완료됨. 모든 테스트가 통과했으며, URL 동기화, 카테고리 필터 통합, 사용자 경험 개선(스크롤 최상단 이동)이 구현됨. 트러블슈팅 과정에서 Playwright 선택자 정확성과 API 사용법에 대한 학습이 이루어짐.
