# Phase 2: 검색 기능 구현 계획

## 목표
상품명 검색 기능을 구현하여 사용자가 원하는 상품을 빠르게 찾을 수 있도록 함.

---

## 요구사항

### 기능 요구사항
1. **검색 입력창**
   - 상단 카테고리 필터 아래에 배치
   - placeholder: "상품명으로 검색..."
   - 실시간 입력 반영 (debounce 없이 즉시 필터링)

2. **검색 필터링**
   - 상품명에 검색어 포함 여부로 필터링
   - 대소문자 구분 없음 (한글은 자모 분리 없이 완성형만)
   - 카테고리 필터와 AND 조건으로 동작
   - 검색어 없을 시 전체 상품 표시

3. **검색 결과 표시**
   - 검색된 상품 개수 표시 ("검색 결과: N개")
   - 결과 없을 시: "검색 결과가 없습니다" 메시지 표시
   - 페이지네이션과 연동 (검색 결과도 12개씩 페이지 분할)

4. **URL 동기화** (선택 - Phase 4와 통합 가능)
   - 검색어 URL 파라미터 반영 (`?search=키워드`)
   - 페이지 새로고침 시 검색 상태 유지
   - **이번 Phase에서는 제외하고 Phase 4에서 일괄 처리**

### 비기능 요구사항
- 검색어 변경 시 페이지 1로 초기화
- 카테고리 변경 시 검색어 유지
- 검색 입력창 포커스 시 외곽선 강조

---

## 구현 단계

### 1단계: 검색 상태 관리 (15분)
- `app/page.tsx`에 `searchQuery` state 추가
- `handleSearchChange` 핸들러 구현
- 검색어 변경 시 페이지 1로 초기화

### 2단계: 검색 필터링 로직 (10분)
- `filteredProducts` 로직 수정
- 카테고리 + 검색어 AND 조건 적용
- 대소문자 구분 없이 `.toLowerCase()` 사용

### 3단계: UI 구성 (20분)
- 검색 입력창 컴포넌트 작성 (또는 인라인)
- 검색 결과 개수 표시
- 결과 없을 시 메시지 표시
- Tailwind CSS 스타일링

### 4단계: E2E 테스트 작성 (25분)
- 검색어 입력 시 필터링 테스트
- 카테고리 + 검색 조합 테스트
- 검색 결과 없을 시 메시지 표시 테스트
- 검색 후 페이지네이션 동작 테스트

### 5단계: 문서화 및 커밋 (10분)
- SESSION_CONTEXT.md 업데이트
- PROGRESS.md 업데이트
- PHASE_2_SUMMARY.md 작성
- Git 커밋

**예상 소요 시간**: 80분

---

## 테스트 전략

### E2E 테스트 시나리오

#### 1) 검색어 입력 시 필터링
```typescript
test("검색어 입력 시 필터링", async ({ page }) => {
  // Given: 상품 목록 로드
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
        { id: 2, name: "키보드", price: 50000, category: "electronics", image: "..." },
        { id: 3, name: "티셔츠", price: 20000, category: "clothing", image: "..." },
      ],
    });
  });
  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: "노트" 검색
  await page.fill('input[placeholder*="검색"]', "노트");

  // Then: "노트북"만 표시
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator('[data-id="1"]')).toBeVisible();
  await expect(page.locator('[data-id="2"]')).not.toBeVisible();
});
```

#### 2) 카테고리 + 검색 조합
```typescript
test("카테고리와 검색 조합", async ({ page }) => {
  // Given: 상품 목록 로드
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
        { id: 2, name: "키보드", price: 50000, category: "electronics", image: "..." },
        { id: 3, name: "노트", price: 2000, category: "food", image: "..." },
      ],
    });
  });
  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: "전자제품" 카테고리 + "노트" 검색
  await page.click('button:has-text("전자제품")');
  await page.fill('input[placeholder*="검색"]', "노트");

  // Then: "노트북"만 표시 (전자제품 카테고리의 "노트" 포함 상품)
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator('[data-id="1"]')).toBeVisible();
});
```

#### 3) 검색 결과 없을 시 메시지 표시
```typescript
test("검색 결과 없을 시 메시지 표시", async ({ page }) => {
  // Given: 상품 목록 로드
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
        { id: 2, name: "키보드", price: 50000, category: "electronics", image: "..." },
      ],
    });
  });
  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: 존재하지 않는 상품 검색
  await page.fill('input[placeholder*="검색"]', "존재하지않는상품");

  // Then: 결과 없음 메시지 표시
  await expect(page.locator(".product-card")).toHaveCount(0);
  await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible();
});
```

#### 4) 검색 후 페이지네이션 동작
```typescript
test("검색 후 페이지네이션 동작", async ({ page }) => {
  // Given: 25개 상품 중 "전자" 포함 상품 15개
  const products = generateMockProducts(25);
  products.forEach((product, index) => {
    if (index % 2 === 0) {
      product.name = `전자제품 ${index + 1}`;
    }
  });

  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({ json: products });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: "전자" 검색
  await page.fill('input[placeholder*="검색"]', "전자");

  // Then: 1페이지에 12개, 2페이지에 3개 표시
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.click('button:has-text("2")');
  await expect(page.locator(".product-card")).toHaveCount(3);
});
```

---

## 예상 파일 변경

### 수정 파일
- `app/page.tsx`: 검색 상태 관리, 필터링 로직, UI 추가

### 신규 파일
- (없음 - 검색 입력창은 인라인으로 구현)

### 문서 파일
- `docs/SESSION_CONTEXT.md`: Phase 2 완료 반영
- `docs/PROGRESS.md`: Phase 2 상세 내용 추가
- `docs/PHASE_2_SUMMARY.md`: 구현 완료 보고서

---

## 구현 후 체크리스트

- [ ] 검색 입력창 UI 구현
- [ ] 검색 필터링 로직 구현 (카테고리 + 검색 AND 조건)
- [ ] 검색 결과 개수 표시
- [ ] 검색 결과 없을 시 메시지 표시
- [ ] 검색어 변경 시 페이지 1로 초기화
- [ ] E2E 테스트 4개 작성 및 통과
- [ ] 문서 업데이트 (SESSION_CONTEXT, PROGRESS, PHASE_2_SUMMARY)
- [ ] Git 커밋 (Conventional Commits with Scope)

---

## 참고 사항

- **URL 동기화는 Phase 4에서 처리**: 검색어, 카테고리, 페이지 모두 한번에 URL 반영
- **Debounce 미적용**: 학습 목적으로 단순하게 구현, 필요 시 Phase 5에서 추가
- **검색어 강조 표시 미구현**: 복잡도 고려하여 생략 (요청 시 추가 가능)
