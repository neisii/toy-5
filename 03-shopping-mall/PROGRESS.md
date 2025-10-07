# 프로젝트 3: 쇼핑몰 - 진행상황 문서

## 📅 개발 기간
- 2025-10-07

## 🎯 프로젝트 목표
Next.js 14 기반 쇼핑몰 애플리케이션 개발 및 Playwright E2E 테스트 완료

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

## 🚀 다음 단계
- 검색 기능 추가
- 페이지네이션 구현
- 상품 상세 페이지
- Toast 알림 컴포넌트

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
