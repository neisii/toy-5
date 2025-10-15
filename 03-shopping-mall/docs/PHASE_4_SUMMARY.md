# Phase 4: URL 상태 관리 확장 구현 완료 보고

## 개요
- **완료일**: 2025-10-15
- **소요 시간**: 약 70분 (계획 110분 대비 단축)
- **테스트 결과**: URL 상태 관리 5개 테스트 추가 및 검증 완료

---

## 구현 상세

### 1. URL에서 초기 상태 읽기 (`app/page.tsx`)

#### URL 파라미터 읽기
```typescript
// URL에서 초기 상태 읽기
const searchFromURL = searchParams.get("search") || "";
const categoryFromURL = searchParams.get("category") || "all";
const pageFromURL = parseInt(searchParams.get("page") || "1", 10);

const [selectedCategory, setSelectedCategory] = useState(categoryFromURL);
const [searchQuery, setSearchQuery] = useState(searchFromURL);
```

**핵심 로직:**
- `searchParams.get()`: Next.js App Router의 `useSearchParams` 훅 사용
- 기본값 처리: 파라미터 없을 시 `""`, `"all"`, `1` 반환
- State 초기화: URL 값을 우선으로 state 설정

**동작 방식:**
1. 사용자가 `/?search=노트북&category=electronics` 접속
2. `searchFromURL = "노트북"`, `categoryFromURL = "electronics"`
3. State가 URL 값으로 초기화
4. 필터링 로직이 자동 실행되어 올바른 결과 표시

---

### 2. updateURL 헬퍼 함수

#### 통합 URL 업데이트 로직
```typescript
const updateURL = (updates: {
  search?: string;
  category?: string;
  page?: number;
}) => {
  const params = new URLSearchParams();

  // 검색어 업데이트
  const newSearch = updates.search !== undefined ? updates.search : searchQuery;
  if (newSearch.trim() !== "") {
    params.set("search", newSearch);
  }

  // 카테고리 업데이트
  const newCategory = updates.category !== undefined ? updates.category : selectedCategory;
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
```

**설계 특징:**

1. **선택적 업데이트**: `updates` 객체로 변경할 파라미터만 전달
2. **기본값 제거**: 
   - `search=""`일 때 파라미터 제거
   - `category="all"`일 때 파라미터 제거
   - `page=1`일 때 파라미터 제거
3. **URL 간결화**: 불필요한 파라미터 없이 깔끔한 URL
4. **기존 값 유지**: 명시하지 않은 파라미터는 현재 state 사용

**예시:**
```typescript
// 검색어만 변경
updateURL({ search: "노트북", page: 1 });
// 결과: ?search=노트북

// 카테고리만 변경
updateURL({ category: "electronics", page: 1 });
// 결과: ?category=electronics

// 복합 변경
updateURL({ search: "노트북", category: "electronics", page: 2 });
// 결과: ?search=노트북&category=electronics&page=2
```

---

### 3. 핸들러 수정

#### handleSearchChange
```typescript
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setSearchQuery(query);
  // 검색어 변경 시 1페이지로 초기화
  updateURL({ search: query, page: 1 });
};
```

**변경 사항:**
- `handlePageChange(1)` 호출 → `updateURL({ search, page: 1 })` 직접 호출
- 검색어 변경 시 페이지 1로 초기화 유지

#### handleCategoryChange
```typescript
const handleCategoryChange = (category: string) => {
  setSelectedCategory(category);
  // 카테고리 변경 시 1페이지로 초기화
  updateURL({ category, page: 1 });
};
```

**변경 사항:**
- `handlePageChange(1)` 호출 → `updateURL({ category, page: 1 })` 직접 호출
- 검색어 파라미터 자동 유지 (updateURL이 처리)

#### handlePageChange
```typescript
const handlePageChange = (page: number) => {
  updateURL({ page });

  // 페이지 상단으로 스크롤
  window.scrollTo({ top: 0, behavior: "smooth" });
};
```

**변경 사항:**
- 직접 URLSearchParams 조작 → `updateURL({ page })` 호출
- 검색어, 카테고리 파라미터 자동 유지

---

### 4. URL 파라미터 구조

#### 가능한 URL 패턴
```
1. 기본: /
2. 검색만: /?search=노트북
3. 카테고리만: /?category=electronics
4. 페이지만: /?page=2
5. 검색 + 카테고리: /?search=노트북&category=electronics
6. 검색 + 페이지: /?search=노트북&page=2
7. 카테고리 + 페이지: /?category=electronics&page=2
8. 전체: /?search=노트북&category=electronics&page=2
```

#### 파라미터 제거 조건
```
search: 빈 문자열 ("") 또는 공백만 있을 때
category: "all" 선택 시
page: 1페이지일 때
```

**이유**: URL 간결화 및 기본 상태 표현

---

### 5. E2E 테스트 추가 (`tests/shop.spec.ts`)

#### 테스트 1: URL 파라미터로 초기 상태 로드
```typescript
test("URL 파라미터로 초기 상태 로드", async ({ page }) => {
  // Given: URL에 search, category 파라미터 포함
  await page.goto("/?search=노트&category=electronics");
  await page.waitForSelector(".product-card");

  // Then: 검색어와 카테고리 필터 적용됨
  const searchInput = page.locator('input[placeholder*="검색"]');
  await expect(searchInput).toHaveValue("노트");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator('[data-id="1"]')).toBeVisible();
});
```

**검증 사항:**
- 검색 입력창에 URL 파라미터 값 반영
- 필터링 결과 정확성
- 페이지 로드 즉시 상태 복원

#### 테스트 2: 검색어 입력 시 URL 업데이트
```typescript
test("검색어 입력 시 URL 업데이트", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".product-card");

  // When: "노트북" 검색
  await page.fill('input[placeholder*="검색"]', "노트북");

  // Then: URL에 search 파라미터 추가
  await expect(page).toHaveURL(/\?search=노트북/);
});
```

**검증 사항:**
- 실시간 URL 업데이트
- 한글 인코딩 정상 처리

#### 테스트 3: 카테고리 변경 시 URL 업데이트
```typescript
test("카테고리 변경 시 URL 업데이트", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".product-card");

  // When: "전자제품" 카테고리 선택
  await page.click('button:has-text("전자제품")');

  // Then: URL에 category 파라미터 추가
  await expect(page).toHaveURL(/\?category=electronics/);
});
```

**검증 사항:**
- 카테고리 선택 시 URL 반영
- 페이지 1로 초기화 (암묵적)

#### 테스트 4: 복합 파라미터 유지
```typescript
test("복합 파라미터 유지", async ({ page }) => {
  // Given: search + category 설정
  await page.goto("/?search=상품&category=electronics");
  await page.waitForSelector(".product-card");

  // When: 2페이지로 이동
  await page.click('button:has-text("2")');

  // Then: search, category 파라미터 유지
  await expect(page).toHaveURL(/search=상품/);
  await expect(page).toHaveURL(/category=electronics/);
  await expect(page).toHaveURL(/page=2/);
});
```

**검증 사항:**
- 페이지 변경 시 다른 파라미터 유지
- 3개 파라미터 동시 관리

#### 테스트 5: 브라우저 뒤로가기로 상태 복원
```typescript
test("브라우저 뒤로가기로 상태 복원", async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector(".product-card");

  // Step 1: "노트북" 검색
  await page.fill('input[placeholder*="검색"]', "노트북");
  await expect(page).toHaveURL(/search=노트북/);
  await expect(page.locator(".product-card")).toHaveCount(1);

  // Step 2: 검색어 변경 "키보드"
  await page.fill('input[placeholder*="검색"]', "키보드");
  await expect(page).toHaveURL(/search=키보드/);
  await expect(page.locator(".product-card")).toHaveCount(1);

  // When: 뒤로가기
  await page.goBack();

  // Then: "노트북" 검색 상태 복원
  await expect(page).toHaveURL(/search=노트북/);
  await page.waitForLoadState("networkidle");
  const searchInput = page.locator('input[placeholder*="검색"]');
  await expect(searchInput).toHaveValue("노트북");
  await expect(page.locator(".product-card")).toHaveCount(1);
});
```

**검증 사항:**
- 브라우저 히스토리 네비게이션 지원
- 상태 복원 (검색어 입력창 + 필터링 결과)
- Next.js App Router의 클라이언트 네비게이션 동작

---

## 테스트 결과

### URL 상태 관리 테스트 현황
```
✓ URL 파라미터로 초기 상태 로드 (743ms)
✓ 검색어 입력 시 URL 업데이트
✓ 카테고리 변경 시 URL 업데이트
✓ 복합 파라미터 유지
✓ 브라우저 뒤로가기로 상태 복원

5 passed
```

---

## 구현 체크리스트 (완료)

- ✅ URL에서 초기 search, category, page 읽기
- ✅ 검색어 변경 시 URL 업데이트
- ✅ 카테고리 변경 시 URL 업데이트
- ✅ 페이지 변경 시 URL 업데이트 (기존 로직 유지)
- ✅ updateURL 헬퍼 함수 구현
- ✅ 파라미터 없을 시 제거 로직 (search="", category="all", page=1)
- ✅ 브라우저 뒤로가기/앞으로가기 동작 확인
- ✅ E2E 테스트 5개 작성 및 통과
- ✅ Git 커밋 (Conventional Commits with Scope)

---

## 커밋 정보

### 커밋 메시지
```
feat(shopping-mall): implement Phase 4 URL state management

- Add URL parameter reading for initial state (search, category, page)
- Implement updateURL helper function for unified parameter management
- Sync search query to URL (?search=keyword)
- Sync category filter to URL (?category=electronics)
- Remove parameters when default values (search='', category='all', page=1)
- Support browser back/forward navigation with state restoration
- Add 5 E2E tests for URL state management

Tests: URL state management verified
```

### 변경된 파일
```
03-shopping-mall/
├── app/page.tsx (수정)
├── tests/shop.spec.ts (수정)
└── docs/
    ├── PHASE_4_PLAN.md (기존)
    └── PHASE_4_SUMMARY.md (신규)
```

---

## 기술적 고려사항

### 1. 한글 URL 인코딩
```typescript
// URLSearchParams가 자동으로 처리
params.set("search", "노트북");
// 결과: ?search=%EB%85%B8%ED%8A%B8%EB%B6%81
```

**처리 방식:**
- `URLSearchParams`가 `encodeURIComponent` 자동 적용
- 브라우저 URL 바에는 한글로 표시 (브라우저 자동 디코딩)
- `searchParams.get()`으로 읽을 때 자동 디코딩

### 2. Next.js App Router의 클라이언트 네비게이션
```typescript
router.push(`${pathname}?${params.toString()}`);
```

**동작 방식:**
- 페이지 리로드 없이 URL 업데이트 (SPA 방식)
- `useSearchParams`가 변경 감지하여 컴포넌트 리렌더
- 브라우저 히스토리에 자동 추가 (뒤로가기 지원)

### 3. State vs URL 우선순위
```typescript
// 초기 렌더링: URL 우선
const [searchQuery, setSearchQuery] = useState(searchFromURL);

// 이후 동작: State 변경 → URL 업데이트
setSearchQuery(query);
updateURL({ search: query, page: 1 });
```

**흐름:**
1. 페이지 로드: URL → State
2. 사용자 입력: State 업데이트 → URL 업데이트
3. 뒤로가기: URL 변경 → State 재초기화 (리렌더)

### 4. 기본값 제거 로직의 중요성
```typescript
// ❌ 나쁜 예
/?search=&category=all&page=1

// ✅ 좋은 예
/
```

**이유:**
- URL 간결성
- SEO 친화적
- 북마크 편의성
- 공유 시 깔끔한 URL

---

## 사용자 시나리오

### 시나리오 1: 검색 결과 공유
1. 사용자 A가 "노트북 전자제품" 검색
2. URL: `/?search=노트북&category=electronics`
3. 이 URL을 사용자 B에게 공유
4. 사용자 B가 URL 접속 시 동일한 검색 결과 표시

### 시나리오 2: 브라우저 뒤로가기
1. 홈 `/` → "노트북" 검색 `/?search=노트북` → "전자제품" 필터 `/?search=노트북&category=electronics`
2. 뒤로가기 클릭
3. `/?search=노트북` 상태로 복원
4. 다시 뒤로가기 클릭
5. `/` 홈 상태로 복원

### 시나리오 3: 페이지 새로고침
1. 사용자가 `/?search=키보드&category=electronics&page=2` 접속
2. F5 새로고침
3. 검색어 "키보드", 카테고리 "전자제품", 2페이지 상태 유지

---

## 다음 단계

### Phase 5: 성능 최적화 (선택)
- 검색 Debounce 적용 (300ms)
- React.memo로 컴포넌트 최적화
- 이미지 Lazy Loading
- 번들 사이즈 분석

### 추가 기능 (선택)
- 정렬 기능 (가격순, 이름순)
- 가격 범위 필터
- 상품 상세 페이지
- 장바구니 페이지 개선

---

## 결론

Phase 4 URL 상태 관리 확장이 성공적으로 완료됨. 검색어, 카테고리, 페이지 번호가 모두 URL에 동기화되어 브라우저 새로고침, 뒤로가기/앞으로가기 시 상태가 완벽히 유지됨. `updateURL` 헬퍼 함수를 통해 코드 중복을 제거하고 유지보수성을 향상시켰으며, 기본값 제거 로직으로 URL 간결성을 확보함.
