# 쇼핑몰 프로젝트 - 학습 회고

> **목적**: AI-DLC 방법론과 Playwright E2E 테스트 학습을 위한 프로젝트

## 📅 개발 기간
- Phase 0: 2025-10-07 (초기 개발)
- Phase 1-4: 2025-10-14 ~ 2025-10-15 (반복 개선)

## 🎯 학습 목표
- Next.js 14 + TypeScript 기반 쇼핑몰 개발
- Playwright를 활용한 E2E 테스트 작성
- AI-DLC 방법론 적용 경험
- 점진적 기능 추가 및 리팩토링

## 🛠 기술 스택
- **Frontend**: Next.js 14 + TypeScript
- **스타일링**: Tailwind CSS 3.4.0
- **상태 관리**: Zustand
- **Mock API**: JSON Server (db.json)
- **테스트**: Playwright

## 📦 구현된 기능

### 1. 프로젝트 초기 설정
- Next.js 14 수동 설치 (create-next-app 이슈로 인해 npm init 후 수동 설치)
- Tailwind CSS 3.4.0 설정
- TypeScript 설정
- App Router 구조

### 2. 타입 정의 (`types/product.ts`)
```typescript
export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
```

### 3. Zustand 스토어 (`store/cartStore.ts`)
- **상태 관리**: 장바구니 아이템, 수량, 총 금액
- **LocalStorage 연동**: 페이지 새로고침 후에도 장바구니 유지
- **주요 액션**:
  - `addItem`: 상품 추가 (중복 시 수량 증가)
  - `removeItem`: 상품 삭제
  - `increaseQuantity`: 수량 증가
  - `decreaseQuantity`: 수량 감소 (최소 1개)
  - `getTotalPrice`: 총 금액 계산
  - `getTotalItems`: 총 아이템 개수 계산

### 4. 컴포넌트

#### ProductCard (`components/ProductCard.tsx`)
- 상품 이미지, 이름, 설명, 가격 표시
- "장바구니 담기" 버튼
- `data-id` 속성으로 Playwright 테스트 지원

#### ProductList (`components/ProductList.tsx`)
- 그리드 레이아웃 (반응형: 1~4 컬럼)
- 상품 없을 때 안내 메시지

#### CategoryFilter (`components/CategoryFilter.tsx`)
- 카테고리: 전체, 전자제품, 패션, 가구, 도서, 스포츠
- 선택된 카테고리 하이라이트

#### CartIcon (`components/CartIcon.tsx`)
- 장바구니 아이콘 + 상품 개수 배지
- `/cart` 페이지로 링크

### 5. 페이지

#### 홈 페이지 (`app/page.tsx`)
- JSON Server에서 상품 데이터 fetch (`http://localhost:3001/products`)
- 카테고리 필터링
- 총 상품 개수 표시
- 상품 목록 표시

#### 장바구니 페이지 (`app/cart/page.tsx`)
- 장바구니 아이템 목록
- 수량 증감 버튼 (+/-)
- 개별 상품 삭제
- 총 금액 실시간 계산
- 빈 장바구니 안내 메시지
- "쇼핑 계속하기" / "결제하기" 버튼

### 6. Mock API (JSON Server)
- `db.json`: 20개 상품 데이터
- 카테고리: electronics, fashion, furniture, books, sports
- 가격대: 19,000원 ~ 2,500,000원

### 7. Playwright 테스트 (`tests/shop.spec.ts`)

#### 테스트 1: 상품 목록 표시
- JSON Server API 모킹 (3개 상품)
- 상품 카드 개수 확인
- 상품명 표시 확인

#### 테스트 2: 카테고리 필터링
- 전체 → 전자제품 → 패션 → 전체 순서로 필터링
- 각 필터에 맞는 상품만 표시되는지 확인

#### 테스트 3: 장바구니 전체 시나리오 (E2E)
1. 홈 페이지에서 상품 2개 장바구니 담기
2. 장바구니 배지 개수 확인
3. 장바구니 페이지 이동
4. 장바구니 아이템 2개 확인
5. 수량 증가 → 총 금액 변경 확인
6. 수량 감소 → 총 금액 변경 확인
7. 아이템 삭제 (2개 → 1개)
8. 마지막 아이템 삭제 → 빈 장바구니 메시지 확인

## ✅ 테스트 결과
```
Running 3 tests using 3 workers
  3 passed (7.8s)
```
**모든 테스트 통과** ✅

## 🔧 기술적 결정사항

### 1. Next.js 수동 설치
- `create-next-app` 실행 시 interactive prompt 이슈 발생
- `npm init -y` 후 `next`, `react`, `react-dom` 개별 설치
- `tsconfig.json`, `next.config.js`, `tailwind.config.js` 수동 작성

### 2. Tailwind CSS v3.4.0
- 이전 프로젝트(Todo, Weather)와 동일한 이유로 v3 사용
- PostCSS 플러그인 호환성

### 3. Zustand 상태 관리
- Redux보다 간단한 API
- TypeScript 완벽 지원
- LocalStorage 연동 용이

### 4. API 모킹 전략
- Playwright 테스트에서 `page.route()` 사용
- JSON Server 의존성 제거로 안정적인 테스트
- 고정된 테스트 데이터로 일관성 보장

### 5. Client Component 사용
- Next.js App Router에서 상태 관리 필요 시 `'use client'` 지시어 사용
- Zustand hook은 클라이언트 컴포넌트에서만 동작

## 🐛 발생한 이슈 및 해결

### 이슈 1: create-next-app 설치 실패
**증상**: Interactive prompt에서 멈춤, 빈 디렉토리 생성
**원인**: CLI 도구의 stdin 처리 문제
**해결**: 수동 설치로 전환
```bash
npm init -y
npm install next@14 react react-dom
npm install -D typescript @types/react @types/node
```

### 이슈 2: Git에서 README.md 복원
**증상**: 프로젝트 디렉토리 재생성 시 README.md 손실
**해결**: Git history에서 복원
```bash
git show e9e8922:03-shopping-mall/README.md > 03-shopping-mall/README.md
```

## 📝 학습 포인트

### 1. E2E 테스트 시나리오
- 사용자 관점의 전체 플로우 테스트
- 상태 변화에 따른 UI 업데이트 확인
- 총 금액 계산 등 비즈니스 로직 검증

### 2. API 모킹
- `route.fulfill()`로 HTTP 응답 모킹
- 테스트 데이터 일관성 유지
- 외부 의존성 제거

### 3. LocalStorage 연동
- SSR 환경에서 `typeof window` 체크 필수
- 초기 렌더링 시 빈 배열 반환

### 4. Zustand 스토어 패턴
- `create()` 함수로 스토어 생성
- `get()`, `set()`으로 상태 읽기/쓰기
- selector 패턴으로 리렌더링 최적화

---

## Phase 1-4: 반복 개발 (2025-10-14 ~ 2025-10-15)

Phase 0 완료 후 4개의 추가 Phase를 통해 기능을 점진적으로 개선했습니다.

### Phase 1: 페이지네이션 (2025-10-14)
**학습 내용**:
- Next.js App Router의 `useSearchParams`, `useRouter`, `usePathname` 훅 활용
- URL과 UI 상태 동기화 패턴
- Playwright strict mode 대응 (`data-id` 속성 활용)

**구현 내용**:
- Pagination 컴포넌트 (이전/다음 버튼, 동적 페이지 번호)
- 페이지당 12개 상품 표시
- URL 파라미터로 페이지 상태 관리 (`?page=2`)
- 카테고리 변경 시 페이지 1로 자동 초기화

**테스트**: 3개 추가 (총 6개)

**트러블슈팅**:
- `text=상품 1` 선택자가 "상품 10", "상품 11"과 중복 매칭
- 해결: `[data-id="1"]` 속성 선택자 사용

---

### Phase 2: 검색 기능 (2025-10-15)
**학습 내용**:
- 실시간 필터링 구현 (debounce 없음)
- 다중 필터 조합 (카테고리 + 검색어 AND 조건)
- 빈 결과 상태 처리

**구현 내용**:
- 검색 입력창 (`placeholder: "상품명으로 검색..."`)
- 대소문자 구분 없는 필터링 (`.toLowerCase()`)
- 검색 결과 개수 표시
- 검색 시 페이지 1로 리셋

**테스트**: 4개 추가 (총 10개)
- 검색어 입력 시 필터링
- 카테고리 + 검색 조합
- 빈 검색 결과 메시지
- 검색 후 페이지네이션 동작

---

### Phase 3: Toast 알림 (2025-10-15)
**학습 내용**:
- React Context API를 활용한 전역 상태 관리
- Toast 큐 관리 (최대 3개 제한)
- 자동 제거 타이머 구현

**구현 내용**:
- ToastContext 및 ToastProvider
- Toast, ToastContainer 컴포넌트
- 장바구니 추가 시 Toast 표시
- 3초 후 자동 제거
- 타입별 색상 구분 (success/error/info)

**테스트**: 3개 추가 (총 13개)
- Toast 표시 확인
- 3초 후 자동 사라짐
- 최대 3개 제한

---

### Phase 4: URL 상태 관리 확장 (2025-10-15)
**학습 내용**:
- URL을 Single Source of Truth로 활용
- 브라우저 뒤로가기/앞으로가기 지원
- URL 파라미터 최적화 (기본값 제거)

**구현 내용**:
- URL에서 초기 상태 읽기 (`searchParams.get()`)
- 통합 `updateURL` 헬퍼 함수
- 모든 필터 상태를 URL에 반영 (search, category, page)
- 기본값 제거 로직 (간결한 URL)

**테스트**: 5개 추가 (총 18개)
- URL 파라미터로 초기 상태 로드
- 검색/카테고리 변경 시 URL 업데이트
- 복합 파라미터 유지
- 브라우저 뒤로가기 상태 복원

---

## 📊 프로젝트 통계

- **총 개발 기간**: 4일 (Phase 0: 1일, Phase 1-4: 2일)
- **Phase 수**: 5개 (Phase 0 ~ Phase 4)
- **테스트 수**: 18개 (모두 통과)
- **커밋 수**: 4개 (Phase 1-4 각 1개)
- **완성도**: 90% (상품 상세 페이지만 미구현)

---

## 🎓 핵심 학습 내용

### 1. Playwright E2E 테스트
- API 모킹 (`page.route()`, `route.fulfill()`)
- Strict mode 대응 (`data-id` 속성)
- 테스트 데이터 생성 헬퍼 함수
- E2E 시나리오 설계 (사용자 플로우)

### 2. Next.js App Router
- Client Component vs Server Component
- `useSearchParams`, `useRouter`, `usePathname` 훅
- URL 기반 상태 관리
- SSR 환경에서 `typeof window` 체크

### 3. 상태 관리 패턴
- Zustand: 간단한 전역 상태 관리
- Context API: Toast 시스템
- LocalStorage: 장바구니 영속성
- URL: 필터/페이지 상태

### 4. AI-DLC 방법론
- Phase별 점진적 개발
- 각 Phase마다 테스트 추가
- 트러블슈팅 기록
- 문서화 습관

---

## 💡 재사용 가능한 패턴

### 1. URL 상태 관리 헬퍼
```typescript
const updateURL = (updates: { search?: string; category?: string; page?: number }) => {
  const params = new URLSearchParams();
  
  // 기본값이 아닌 경우에만 파라미터 추가
  if (updates.search && updates.search.trim() !== "") {
    params.set("search", updates.search);
  }
  if (updates.category && updates.category !== "all") {
    params.set("category", updates.category);
  }
  if (updates.page && updates.page !== 1) {
    params.set("page", updates.page.toString());
  }
  
  router.push(params.toString() ? `${pathname}?${params}` : pathname);
};
```

### 2. Playwright API 모킹
```typescript
await page.route('**/localhost:3001/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData)
  });
});
```

### 3. SSR 안전 LocalStorage 접근
```typescript
const loadFromStorage = () => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('key');
  return saved ? JSON.parse(saved) : [];
};
```

---

## 🤔 개선 가능한 부분

1. **검색 Debounce**: 현재 실시간 필터링이라 타이핑할 때마다 재렌더링 발생
2. **성능 최적화**: `React.memo`, `useMemo` 미적용
3. **에러 처리**: API 실패 시 에러 UI 없음
4. **접근성**: ARIA 속성 일부만 적용
5. **상품 상세 페이지**: 미구현

---

## 📚 참고한 자료

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Playwright Testing Library](https://playwright.dev/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- AI-DLC 방법론 (프로젝트 내부 문서)

---

## 🏁 결론

이 프로젝트를 통해:
- Playwright E2E 테스트 작성 역량 향상
- Next.js App Router 이해도 증가
- Phase별 점진적 개발 경험
- 문서화 습관 형성

특히 **Phase 1-4를 2일 만에 완료하며 18개 테스트를 모두 통과**시킨 것이 가장 큰 성과입니다.

## 📂 프로젝트 구조
```
03-shopping-mall/
├── app/
│   ├── cart/
│   │   └── page.tsx          # 장바구니 페이지
│   ├── globals.css           # Tailwind CSS
│   ├── layout.tsx            # Root 레이아웃
│   └── page.tsx              # 홈 페이지
├── components/
│   ├── CartIcon.tsx          # 장바구니 아이콘
│   ├── CategoryFilter.tsx    # 카테고리 필터
│   ├── ProductCard.tsx       # 상품 카드
│   └── ProductList.tsx       # 상품 목록
├── store/
│   └── cartStore.ts          # Zustand 스토어
├── types/
│   └── product.ts            # 타입 정의
├── tests/
│   └── shop.spec.ts          # Playwright 테스트
├── db.json                   # JSON Server 데이터
├── playwright.config.ts      # Playwright 설정
├── next.config.js            # Next.js 설정
├── tailwind.config.js        # Tailwind 설정
├── tsconfig.json             # TypeScript 설정
└── package.json
```

## 💡 중요 코드 스니펫

### Zustand 스토어 초기화 (SSR 대응)
```typescript
const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};
```

### Playwright API 모킹
```typescript
await page.route('**/localhost:3001/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([...])
  });
});
```

### 카테고리 필터링 로직
```typescript
const filterProducts = () => {
  if (selectedCategory === 'all') {
    setFilteredProducts(products);
  } else {
    setFilteredProducts(products.filter(p => p.category === selectedCategory));
  }
};
```
