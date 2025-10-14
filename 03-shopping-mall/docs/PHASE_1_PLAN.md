# Phase 1: 페이지네이션 구현 계획

**작성일**: 2025-10-14  
**상태**: 계획  
**우선순위**: 높음

---

## 목표

상품 목록에 페이지네이션을 구현하고 URL과 동기화하여 적절한 네비게이션 컨트롤을 제공한다.

---

## 요구사항

1. 페이지당 12개 상품 표시
2. 페이지 번호 버튼 표시
3. 현재 페이지 강조 표시
4. URL과 페이지 상태 동기화 (`?page=2`)
5. 이전/다음 버튼 추가
6. 카테고리 필터 변경 시 1페이지로 초기화
7. 총 상품 개수 표시

---

## 기술적 접근

### 1. Pagination 컴포넌트컴포넌트

**파일파일**: `components/Pagination.tsx`

Props:
```typescript
interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
```

기능:
- 총 페이지 계산: `Math.ceil(totalItems / itemsPerPage)`
- 페이지 버튼 표시 (최대 5개 표시)
- 이전 버튼 (1페이지에서 비활성화)
- 다음 버튼 (마지막 페이지에서 비활성화)
- 현재 페이지 다른 색상으로 강조

로직:
```
1페이지: [이전] [1] 2 3 4 5 [다음]
3페이지: [이전] 1 2 [3] 4 5 [다음]
10페이지: [이전] 8 9 [10] 11 12 [다음]
```

### 2. Homepage 수정

**파일**: `app/page.tsx`

변경사항:
1. `useSearchParams`를 `next/navigation`에서 import
2. URL에서 현재 페이지 읽기: `searchParams.get('page') || '1'`
3. 페이지네이션 계산:
   - `startIndex = (currentPage - 1) * itemsPerPage`
   - `endIndex = startIndex + itemsPerPage`
   - `paginatedProducts = filteredProducts.slice(startIndex, endIndex)`
4. 페이지 변경 처리:
   - `router.push()`로 URL 업데이트
   - 맨 위로 스크롤
5. 카테고리 변경 시 1페이지로 초기화

### 3. URL 상태 관리

Next.js App Router 패턴 사용:
```typescript
const searchParams = useSearchParams();
const router = useRouter();
const pathname = usePathname();

const handlePageChange = (page: number) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', page.toString());
  router.push(`${pathname}?${params.toString()}`);
};
```

### 4. 카테고리 필터 연동

카테고리 변경 시:
- 1페이지로 초기화
- URL을 category와 page=1로 업데이트
- 필터링된 상품 기준으로 총 페이지 재계산

---

## 구현 단계

### 단계 1: Pagination 컴포넌트 생성
- `components/Pagination.tsx` 생성
- 페이지 계산 로직 구현
- 이전/다음 버튼 추가
- 페이지 번호 버튼 (많은 페이지는 생략 기호 사용)
- Tailwind CSS 스타일링

### 단계 2: Homepage 업데이트
- `useSearchParams`, `useRouter`, `usePathname` hook 추가
- URL 파라미터에서 page 읽기
- 페이지네이션된 상품 계산
- Pagination 컴포넌트에 props 전달
- 페이지 변경 콜백 처리

### 단계 3: 카테고리 필터 연동
- `CategoryFilter` 수정하여 변경 시 페이지 초기화
- URL에 category와 page 파라미터 함께 업데이트

### 단계 4: 테스트
- 페이지 이동 테스트 (1 → 2 → 3)
- 이전/다음 버튼 테스트
- URL 동기화 테스트
- 브라우저 뒤로가기/앞으로가기 테스트
- 카테고리 필터가 1페이지로 초기화되는지 테스트

### 단계 5: 문서화
- PROGRESS.md 업데이트
- SESSION_CONTEXT.md 업데이트
- 트러블슈팅 섹션에 이슈 기록

---

## 데이터 흐름

```
사용자가 페이지 버튼 클릭
  ↓
handlePageChange(2)
  ↓
URL 업데이트: ?page=2
  ↓
새로운 searchParams로 컴포넌트 재렌더링
  ↓
계산: products.slice(12, 24)
  ↓
2페이지 상품 표시
```

---

## 예외 상황 처리

1. **잘못된 페이지 번호**: 
   - URL에 `?page=999`인데 5페이지만 존재
   - 해결: 유효 범위로 제한하거나 1페이지로 리다이렉트

2. **숫자가 아닌 페이지**:
   - URL에 `?page=abc`
   - 해결: 1페이지로 기본값 설정

3. **0 또는 음수 페이지**:
   - URL에 `?page=0` 또는 `?page=-1`
   - 해결: 1페이지로 기본값 설정

4. **카테고리 변경**:
   - "전자제품" 3페이지에서 "패션"으로 전환
   - 해결: 1페이지로 초기화

5. **상품 없음**:
   - 검색 결과 없음
   - 해결: "상품 없음" 메시지 표시, 페이지네이션 숨김

---

## 테스트 전략

### E2E 테스트 (Playwright)

테스트 1: 기본 페이지네이션
```typescript
test('페이지 이동', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 기본 1페이지
  expect(page.locator('.product-card')).toHaveCount(12);
  
  // 2페이지 클릭
  await page.click('button:has-text("2")');
  await expect(page).toHaveURL(/\?page=2/);
  expect(page.locator('.product-card')).toHaveCount(12);
  
  // 다른 상품
  const firstProductPage2 = await page.locator('.product-card').first().textContent();
  expect(firstProductPage2).not.toBe(firstProductPage1);
});
```

테스트 2: 이전/다음 버튼
```typescript
test('이전/다음 버튼', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 1페이지에서 이전 버튼 비활성화
  await expect(page.locator('button:has-text("이전")')).toBeDisabled();
  
  // 다음 버튼 활성화
  await page.click('button:has-text("다음")');
  await expect(page).toHaveURL(/\?page=2/);
  
  // 이제 이전 버튼 활성화
  await expect(page.locator('button:has-text("이전")')).toBeEnabled();
  await page.click('button:has-text("이전")');
  await expect(page).toHaveURL(/\?page=1/);
});
```

테스트 3: 카테고리 필터가 페이지 초기화
```typescript
test('카테고리 변경 시 1페이지로 초기화', async ({ page }) => {
  await page.goto('http://localhost:3000?page=3');
  
  // 3페이지에 있음
  await expect(page).toHaveURL(/\?page=3/);
  
  // 카테고리 변경
  await page.click('button:has-text("전자제품")');
  
  // 1페이지로 돌아감
  await expect(page).toHaveURL(/category=electronics/);
  await expect(page).not.toHaveURL(/page=3/);
});
```

---

## 스타일링

Tailwind 클래스 사용:
- 현재 페이지: `bg-blue-600 text-white`
- 비활성 페이지: `bg-white text-gray-700 hover:bg-gray-100`
- 비활성화 버튼: `opacity-50 cursor-not-allowed`
- 페이지 버튼: `px-3 py-2 rounded border`

---

## 예상 결과

구현 후:
1. 상품이 페이지당 12개씩 표시됨
2. 페이지 번호가 보이고 클릭 가능
3. URL에 현재 페이지 반영됨
4. 브라우저 뒤로가기/앞으로가기 정상 작동
5. 카테고리 변경 시 1페이지로 초기화
6. 모든 E2E 테스트 통과

---

## 예상 소요 시간

- 컴포넌트 생성: 30분
- 통합: 30분
- 테스트: 20분
- 문서화: 10분

**총**: 약 90분

---

## 의존성

- Next.js App Router (`useSearchParams`, `useRouter`, `usePathname`)
- Tailwind CSS (스타일링)
- 기존 상품 데이터 및 필터링 로직

---

## 해결할 질문

없음. 계획이 명확하고 구현 준비 완료.
