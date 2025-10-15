# Phase 4: URL 상태 관리 확장 구현 계획

## 목표
검색어, 카테고리, 페이지 번호를 URL에 동기화하여 브라우저 새로고침, 뒤로가기/앞으로가기 시 상태 유지.

---

## 요구사항

### 기능 요구사항
1. **검색어 URL 동기화**
   - 검색어 입력 시 URL 파라미터 업데이트 (`?search=노트북`)
   - URL에서 검색어 읽어서 초기 state 설정
   - 검색어 없을 시 파라미터 제거

2. **카테고리 URL 동기화**
   - 카테고리 선택 시 URL 파라미터 업데이트 (`?category=electronics`)
   - URL에서 카테고리 읽어서 초기 state 설정
   - "전체" 선택 시 파라미터 제거

3. **복합 URL 파라미터 관리**
   - 검색어 + 카테고리 + 페이지 조합 (`?search=노트북&category=electronics&page=2`)
   - 파라미터 변경 시 다른 파라미터 유지
   - 검색어/카테고리 변경 시 페이지는 1로 초기화

4. **브라우저 네비게이션 지원**
   - 뒤로가기: 이전 검색/필터 상태 복원
   - 앞으로가기: 다음 검색/필터 상태 복원
   - 새로고침: 현재 URL 기반 상태 복원

### 비기능 요구사항
- URL 파라미터 인코딩 (한글 안전 처리)
- 유효하지 않은 카테고리 처리 ("all"로 폴백)
- 페이지 번호 유효성 검증 (음수/0 처리)

---

## 구현 단계

### 1단계: URL에서 초기 상태 읽기 (20분)
- `useSearchParams`로 search, category, page 파라미터 읽기
- 초기 state 설정 시 URL 우선 적용
- 유효성 검증 (category 존재 여부, page 숫자 범위)

### 2단계: 검색어 URL 동기화 (15분)
- `handleSearchChange`에서 URL 업데이트 로직 추가
- 검색어 없을 시 `search` 파라미터 제거
- 기존 category, page 파라미터 유지

### 3단계: 카테고리 URL 동기화 (15분)
- `handleCategoryChange`에서 URL 업데이트 로직 수정
- "all" 선택 시 `category` 파라미터 제거
- 기존 search 파라미터 유지, page는 1로 초기화

### 4단계: 통합 URL 업데이트 함수 리팩토링 (20분)
- `updateURL` 헬퍼 함수 생성
- 모든 핸들러에서 공통 로직 재사용
- 파라미터 추가/제거 로직 일원화

### 5단계: E2E 테스트 작성 (30분)
- URL 파라미터 초기 로드 테스트
- 검색어 입력 시 URL 업데이트 테스트
- 카테고리 변경 시 URL 업데이트 테스트
- 브라우저 뒤로가기/앞으로가기 테스트

### 6단계: 문서화 및 커밋 (10분)
- SESSION_CONTEXT.md 업데이트
- PROGRESS.md 업데이트
- PHASE_4_SUMMARY.md 작성
- Git 커밋

**예상 소요 시간**: 110분

---

## 아키텍처 설계

### URL 파라미터 구조
```
기본: /
검색: /?search=노트북
카테고리: /?category=electronics
페이지: /?page=2
복합: /?search=노트북&category=electronics&page=2
```

### 초기 상태 로딩 로직
```typescript
// URL에서 파라미터 읽기
const searchParams = useSearchParams();
const searchFromURL = searchParams.get("search") || "";
const categoryFromURL = searchParams.get("category") || "all";
const pageFromURL = parseInt(searchParams.get("page") || "1", 10);

// State 초기화 (URL 우선)
const [searchQuery, setSearchQuery] = useState(searchFromURL);
const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);
```

### URL 업데이트 헬퍼 함수
```typescript
const updateURL = (updates: {
  search?: string;
  category?: string;
  page?: number;
}) => {
  const params = new URLSearchParams(searchParams.toString());

  // 검색어 업데이트
  if (updates.search !== undefined) {
    if (updates.search.trim() === "") {
      params.delete("search");
    } else {
      params.set("search", updates.search);
    }
  }

  // 카테고리 업데이트
  if (updates.category !== undefined) {
    if (updates.category === "all") {
      params.delete("category");
    } else {
      params.set("category", updates.category);
    }
  }

  // 페이지 업데이트
  if (updates.page !== undefined) {
    if (updates.page === 1) {
      params.delete("page");
    } else {
      params.set("page", updates.page.toString());
    }
  }

  router.push(`${pathname}?${params.toString()}`);
};
```

### 핸들러 수정
```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setSearchQuery(query);
  updateURL({ search: query, page: 1 });
};

const handleCategoryChange = (category: string) => {
  setSelectedCategory(category);
  updateURL({ category, page: 1 });
};

const handlePageChange = (page: number) => {
  updateURL({ page });
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

---

## 테스트 전략

### E2E 테스트 시나리오

#### 1) URL 파라미터로 초기 상태 로드
```typescript
test("URL 파라미터로 초기 상태 로드", async ({ page }) => {
  await page.route("**/localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", ... },
        { id: 2, name: "키보드", price: 50000, category: "electronics", ... },
        { id: 3, name: "티셔츠", price: 20000, category: "fashion", ... },
      ],
    });
  });

  // Given: URL에 search, category 파라미터 포함
  await page.goto("/?search=노트&category=electronics");

  // Then: 검색어와 카테고리 필터 적용됨
  const searchInput = page.locator('input[placeholder*="검색"]');
  await expect(searchInput).toHaveValue("노트");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator('[data-id="1"]')).toBeVisible();
});
```

#### 2) 검색어 입력 시 URL 업데이트
```typescript
test("검색어 입력 시 URL 업데이트", async ({ page }) => {
  await page.route("**/localhost:3001/products", async (route) => {
    await route.fulfill({ json: [/* ... */] });
  });

  await page.goto("/");

  // When: "노트북" 검색
  await page.fill('input[placeholder*="검색"]', "노트북");

  // Then: URL에 search 파라미터 추가
  await expect(page).toHaveURL(/\?.*search=노트북/);
});
```

#### 3) 카테고리 변경 시 URL 업데이트
```typescript
test("카테고리 변경 시 URL 업데이트", async ({ page }) => {
  await page.route("**/localhost:3001/products", async (route) => {
    await route.fulfill({ json: [/* ... */] });
  });

  await page.goto("/");

  // When: "전자제품" 카테고리 선택
  await page.click('button:has-text("전자제품")');

  // Then: URL에 category 파라미터 추가, page=1
  await expect(page).toHaveURL(/\?.*category=electronics/);
  await expect(page).toHaveURL(/\?.*page=1/);
});
```

#### 4) 복합 파라미터 유지
```typescript
test("복합 파라미터 유지", async ({ page }) => {
  await page.route("**/localhost:3001/products", async (route) => {
    await route.fulfill({ json: generateMockProducts(25) });
  });

  // Given: search + category 설정
  await page.goto("/?search=전자&category=electronics");

  // When: 2페이지로 이동
  await page.click('button:has-text("2")');

  // Then: search, category 파라미터 유지
  await expect(page).toHaveURL(/\?.*search=전자/);
  await expect(page).toHaveURL(/\?.*category=electronics/);
  await expect(page).toHaveURL(/\?.*page=2/);
});
```

#### 5) 브라우저 뒤로가기
```typescript
test("브라우저 뒤로가기로 상태 복원", async ({ page }) => {
  await page.route("**/localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", ... },
        { id: 2, name: "키보드", price: 50000, category: "electronics", ... },
      ],
    });
  });

  await page.goto("/");

  // Step 1: "노트북" 검색
  await page.fill('input[placeholder*="검색"]', "노트북");
  await expect(page).toHaveURL(/\?.*search=노트북/);
  await expect(page.locator(".product-card")).toHaveCount(1);

  // Step 2: 검색어 변경 "키보드"
  await page.fill('input[placeholder*="검색"]', "키보드");
  await expect(page).toHaveURL(/\?.*search=키보드/);
  await expect(page.locator(".product-card")).toHaveCount(1);

  // When: 뒤로가기
  await page.goBack();

  // Then: "노트북" 검색 상태 복원
  await expect(page).toHaveURL(/\?.*search=노트북/);
  const searchInput = page.locator('input[placeholder*="검색"]');
  await expect(searchInput).toHaveValue("노트북");
  await expect(page.locator(".product-card")).toHaveCount(1);
});
```

---

## 예상 파일 변경

### 수정 파일
- `app/page.tsx`: URL 동기화 로직 추가, 초기 state URL 기반 설정

### 신규 파일
- (없음)

### 문서 파일
- `docs/SESSION_CONTEXT.md`: Phase 4 완료 반영
- `docs/PROGRESS.md`: Phase 4 상세 내용 추가
- `docs/PHASE_4_SUMMARY.md`: 구현 완료 보고서

---

## 구현 후 체크리스트

- [ ] URL에서 초기 search, category, page 읽기
- [ ] 검색어 변경 시 URL 업데이트
- [ ] 카테고리 변경 시 URL 업데이트
- [ ] 페이지 변경 시 URL 업데이트 (기존 로직 유지)
- [ ] updateURL 헬퍼 함수 구현
- [ ] 파라미터 없을 시 제거 로직 (search="", category="all", page=1)
- [ ] 브라우저 뒤로가기/앞으로가기 동작 확인
- [ ] E2E 테스트 5개 작성 및 통과
- [ ] 문서 업데이트 (SESSION_CONTEXT, PROGRESS, PHASE_4_SUMMARY)
- [ ] Git 커밋 (Conventional Commits with Scope)

---

## 참고 사항

- **한글 인코딩**: `URLSearchParams`가 자동 처리 (encodeURIComponent)
- **페이지 1 처리**: `page=1`일 때 파라미터 제거로 URL 간결화
- **기본값 제거**: `category=all`, `search=""` 시 파라미터 제거
- **Next.js App Router**: `router.push`로 클라이언트 네비게이션, 페이지 리로드 없음
