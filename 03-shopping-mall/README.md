# 쇼핑몰 프로젝트

> Next.js 14 + Playwright E2E 테스트 학습 프로젝트

## 📋 프로젝트 개요

**난이도**: ⭐⭐⭐ 중급  
**실제 개발 기간**: 4일 (2025-10-07 ~ 2025-10-15)  
**완성도**: 90% (18개 E2E 테스트 통과)  
**학습 효과**: ⭐⭐⭐⭐

## 🎯 학습 목표

- Playwright E2E 테스트 작성 및 API 모킹
- Next.js 14 App Router 활용
- URL 기반 상태 관리 패턴
- AI-DLC 방법론 적용
- Phase별 점진적 개발 경험

## 📚 문서 구조

이 프로젝트는 학습 목적으로 여러 문서를 관리합니다:

### 1. **README.md** (이 파일)
**목적**: 프로젝트 개요 및 실행 방법  
**대상**: 외부인, 포트폴리오 리뷰어  
**내용**: 
- 프로젝트가 무엇인지
- 어떻게 실행하는지
- 주요 기능과 기술 스택

### 2. **docs/SESSION_CONTEXT.md**
**목적**: Claude AI 세션 컨텍스트 제공  
**대상**: Claude Code (AI 개발 도구)  
**내용**:
- 프로젝트 현재 상태 스냅샷
- 구현된 기능 목록
- 파일 구조 및 데이터 모델
- 다음 작업 리스트

### 3. **docs/PROGRESS.md**
**목적**: Phase별 개발 로그  
**대상**: 개발자 (나 자신)  
**내용**:
- Phase 1-4 작업 내역
- 각 Phase의 커밋 해시
- 구현 내용 및 테스트 결과
- 트러블슈팅 기록

### 4. **docs/RETROSPECTIVE.md**
**목적**: 학습 회고 및 재사용 패턴 정리  
**대상**: 미래의 나, 학습 복습용  
**내용**:
- Phase 0 초기 개발 상세 내역
- Phase 1-4 학습 포인트
- 재사용 가능한 코드 패턴
- 핵심 학습 내용 정리
- 개선 가능한 부분

### 문서 읽는 순서
1. **처음 보는 사람**: README.md → docs/RETROSPECTIVE.md
2. **작업 이어받기**: docs/SESSION_CONTEXT.md → docs/PROGRESS.md
3. **학습 복습**: docs/RETROSPECTIVE.md

## 🛠 기술 스택

- **Frontend**: Next.js 14 + TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **Mock API**: JSON Server

## ✨ 주요 기능 요구사항

### 1. 상품 목록 표시 (페이지네이션)
- 한 페이지당 12개 상품 표시
- 페이지 번호 버튼 (1, 2, 3, ... 또는 이전/다음)
- 현재 페이지 하이라이트
- URL에 페이지 정보 반영 (`?page=2`)
- 총 상품 수 표시

### 2. 카테고리별 필터링
- **카테고리**: 전자제품, 패션, 가구, 도서, 스포츠 등
- 카테고리 선택 시 해당 카테고리 상품만 표시
- URL 파라미터로 필터 상태 관리 (`?category=electronics`)
- 필터 적용 시 페이지 1로 리셋

### 3. 검색 기능
- 상품명 기반 검색
- 실시간 검색 (디바운스 적용)
- 검색어 하이라이트 표시
- URL에 검색어 반영 (`?search=맥북`)
- 검색 결과 개수 표시

### 4. 장바구니 추가/삭제
- 상품 카드에 "장바구니 담기" 버튼
- 장바구니 추가 시 Toast 알림
- 장바구니 아이콘에 배지 (상품 개수)
- 중복 상품 추가 시 수량 증가
- LocalStorage에 장바구니 저장

### 5. 장바구니 페이지
- 장바구니 항목 목록
- 수량 증가/감소 버튼
- 개별 항목 삭제
- 총 금액 계산 (실시간 업데이트)
- 빈 장바구니 안내 메시지

### 6. 상품 상세 페이지
- 상품 이미지
- 상품명, 가격, 설명
- 카테고리 표시
- 장바구니 담기 버튼
- 이전/다음 상품 네비게이션

## 🎨 UI/UX 요구사항

### 홈 페이지 레이아웃
```
┌─────────────────────────────────────────────────┐
│  🛒 쇼핑몰     [검색...........]  🛒 장바구니(2)  │
├─────────────────────────────────────────────────┤
│  [전체] [전자제품] [패션] [가구] [도서]           │
├─────────────────────────────────────────────────┤
│  ┌────┬────┬────┬────┐                         │
│  │상품1│상품2│상품3│상품4│                         │
│  │$100│$200│$150│$300│                         │
│  │[담기]│[담기]│[담기]│[담기]│                         │
│  └────┴────┴────┴────┘                         │
│  ┌────┬────┬────┬────┐                         │
│  │상품5│상품6│상품7│상품8│                         │
│  └────┴────┴────┴────┘                         │
├─────────────────────────────────────────────────┤
│  총 48개 상품                                    │
│  [◀] [1] [2] [3] [4] [▶]                        │
└─────────────────────────────────────────────────┘
```

### 장바구니 페이지 레이아웃
```
┌─────────────────────────────────────────────────┐
│  장바구니                                        │
├─────────────────────────────────────────────────┤
│  상품 1                                          │
│  [$100] [- 2 +] [삭제]                          │
│  소계: $200                                      │
├─────────────────────────────────────────────────┤
│  상품 2                                          │
│  [$50] [- 1 +] [삭제]                           │
│  소계: $50                                       │
├─────────────────────────────────────────────────┤
│  총 금액: $250                                   │
│  [쇼핑 계속하기] [결제하기]                      │
└─────────────────────────────────────────────────┘
```

## 🗄️ Mock API (JSON Server)

### 설치
```bash
npm install -D json-server
```

### db.json 구조
```json
{
  "products": [
    {
      "id": 1,
      "name": "맥북 프로 M3",
      "price": 2500000,
      "category": "electronics",
      "description": "최신 M3 칩 탑재",
      "image": "https://via.placeholder.com/300",
      "stock": 10
    },
    {
      "id": 2,
      "name": "나이키 에어맥스",
      "price": 150000,
      "category": "fashion",
      "description": "편안한 운동화",
      "image": "https://via.placeholder.com/300",
      "stock": 25
    }
  ]
}
```

### 실행
```bash
npx json-server --watch db.json --port 3001
```

### API 엔드포인트
- `GET /products` - 모든 상품
- `GET /products?category=electronics` - 카테고리 필터
- `GET /products?q=맥북` - 검색
- `GET /products?_page=1&_limit=12` - 페이지네이션
- `GET /products/:id` - 상품 상세

## 🧪 Playwright 테스트 시나리오

### 1. 장바구니 전체 시나리오
```typescript
test('장바구니 전체 시나리오', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 상품 목록 로딩 확인
  await expect(page.locator('.product-card')).toHaveCount(12);
  
  // 첫 번째 상품 클릭
  await page.click('.product-card:first-child');
  
  // 상품 상세 페이지 확인
  await expect(page).toHaveURL(/.*\/product\/\d+/);
  await expect(page.locator('h1')).toBeVisible();
  
  // 장바구니 추가
  await page.click('button:has-text("장바구니 담기")');
  
  // Toast 알림 확인
  await expect(page.locator('.toast')).toHaveText('장바구니에 추가되었습니다');
  
  // 장바구니 아이콘 배지 확인
  await expect(page.locator('.cart-badge')).toHaveText('1');
  
  // 장바구니 페이지로 이동
  await page.click('[aria-label="장바구니"]');
  await expect(page).toHaveURL(/.*\/cart/);
  
  // 장바구니 항목 확인
  await expect(page.locator('.cart-item')).toHaveCount(1);
  
  // 수량 증가
  await page.click('button[aria-label="수량 증가"]');
  await expect(page.locator('.quantity')).toHaveText('2');
  
  // 총 금액 확인
  const price = await page.locator('.item-price').textContent();
  const total = await page.locator('.total-price').textContent();
  expect(parseInt(total!)).toBe(parseInt(price!) * 2);
  
  // 항목 삭제
  await page.click('button[aria-label="삭제"]');
  await expect(page.locator('.cart-empty')).toBeVisible();
});
```

### 2. 검색 기능 테스트
```typescript
test('검색 기능', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 검색어 입력
  await page.fill('input[placeholder="상품 검색"]', '맥북');
  await page.press('input[placeholder="상품 검색"]', 'Enter');
  
  // URL 파라미터 확인
  await expect(page).toHaveURL(/.*\?search=맥북/);
  
  // 검색 결과 확인
  const products = page.locator('.product-card');
  await expect(products).toHaveCount.greaterThan(0);
  
  // 모든 상품 제목에 "맥북" 포함 확인
  const titles = await products.locator('h3').allTextContents();
  titles.forEach(title => {
    expect(title.toLowerCase()).toContain('맥북');
  });
});
```

### 3. 카테고리 필터링 테스트
```typescript
test('카테고리 필터링', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // "전자제품" 카테고리 클릭
  await page.click('button:has-text("전자제품")');
  
  // URL 확인
  await expect(page).toHaveURL(/.*\?category=electronics/);
  
  // 필터링된 상품만 표시
  const productCount = await page.locator('.product-card').count();
  expect(productCount).toBeGreaterThan(0);
  expect(productCount).toBeLessThanOrEqual(12); // 페이지당 최대 12개
});
```

### 4. 페이지네이션 테스트
```typescript
test('페이지네이션', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 첫 페이지 상품 ID 저장
  const firstProductId = await page.locator('.product-card:first-child').getAttribute('data-id');
  
  // 2페이지로 이동
  await page.click('button:has-text("2")');
  await expect(page).toHaveURL(/.*\?page=2/);
  
  // 다른 상품 표시 확인
  const secondPageProductId = await page.locator('.product-card:first-child').getAttribute('data-id');
  expect(firstProductId).not.toBe(secondPageProductId);
  
  // 이전 버튼으로 1페이지 복귀
  await page.click('button[aria-label="이전 페이지"]');
  await expect(page).toHaveURL(/.*\?page=1/);
});
```

### 5. 수량 조절 테스트
```typescript
test('장바구니 수량 조절', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // 상품 추가
  await page.click('.product-card:first-child button:has-text("담기")');
  await page.click('[aria-label="장바구니"]');
  
  // 초기 수량 확인
  await expect(page.locator('.quantity')).toHaveText('1');
  
  // 수량 증가
  await page.click('button[aria-label="수량 증가"]');
  await expect(page.locator('.quantity')).toHaveText('2');
  
  // 수량 증가 (3개)
  await page.click('button[aria-label="수량 증가"]');
  await expect(page.locator('.quantity')).toHaveText('3');
  
  // 수량 감소
  await page.click('button[aria-label="수량 감소"]');
  await expect(page.locator('.quantity')).toHaveText('2');
});
```

## 📁 프로젝트 구조

```
03-shopping-mall/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # 홈 (상품 목록)
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # 상품 상세
│   │   └── cart/
│   │       └── page.tsx             # 장바구니
│   ├── components/
│   │   ├── ProductCard.tsx          # 상품 카드
│   │   ├── ProductList.tsx          # 상품 목록
│   │   ├── CategoryFilter.tsx       # 카테고리 필터
│   │   ├── SearchBar.tsx            # 검색 바
│   │   ├── Pagination.tsx           # 페이지네이션
│   │   ├── CartItem.tsx             # 장바구니 항목
│   │   ├── CartSummary.tsx          # 장바구니 요약
│   │   └── Toast.tsx                # 알림 토스트
│   ├── store/
│   │   └── cartStore.ts             # Zustand 스토어
│   ├── services/
│   │   └── productApi.ts            # API 호출
│   ├── types/
│   │   └── product.ts               # 타입 정의
│   └── utils/
│       ├── format.ts                # 포맷 유틸
│       └── debounce.ts              # 디바운스
├── tests/
│   ├── shop.spec.ts
│   ├── cart.spec.ts
│   ├── search.spec.ts
│   └── fixtures/
│       └── products.json
├── db.json                          # JSON Server 데이터
├── playwright.config.ts
├── package.json
└── README.md
```

## 📊 데이터 모델

### Product 타입
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  stock: number;
}
```

### CartItem 타입
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### Cart 타입
```typescript
interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}
```

## 🚀 시작하기

### 1. 프로젝트 생성
```bash
npx create-next-app@latest 03-shopping-mall --typescript --tailwind --app
cd 03-shopping-mall
```

### 2. 의존성 설치
```bash
# Zustand
npm install zustand

# JSON Server
npm install -D json-server

# Playwright
npm install -D @playwright/test
npx playwright install
```

### 3. Mock 데이터 생성
`db.json` 파일을 생성하고 상품 데이터 추가

### 4. 개발 서버 실행
```bash
# 터미널 1: Next.js
npm run dev

# 터미널 2: JSON Server
npx json-server --watch db.json --port 3001
```

### 5. 테스트 실행
```bash
npx playwright test
```

## ✅ 완료 체크리스트

### 기능 구현 (90% 완료)
- [x] 상품 목록 표시
- [x] 페이지네이션 (Phase 1)
- [x] 카테고리 필터링
- [x] 검색 기능 (Phase 2)
- [x] 장바구니 추가/삭제
- [x] 수량 조절
- [x] 총 금액 계산
- [x] Toast 알림 (Phase 3)
- [x] URL 상태 관리 (Phase 4)
- [x] LocalStorage 저장
- [ ] 상품 상세 페이지 (미구현)

### 테스트 작성 (18개 통과)
- [x] 상품 목록 표시
- [x] 카테고리 필터링
- [x] E2E 장바구니 시나리오
- [x] 검색 기능 (4개)
- [x] Toast 알림 (3개)
- [x] URL 상태 관리 (5개)
- [x] 페이지네이션 (3개)

### UI/UX
- [x] 반응형 디자인
- [x] 로딩 상태 표시
- [x] 빈 상태 처리
- [x] 접근성 (ARIA)

## 💡 추가 개선 아이디어

### 기본
- [ ] 가격 범위 필터
- [ ] 정렬 기능 (가격순, 인기순)
- [ ] 위시리스트

### 중급
- [ ] 상품 리뷰/평점
- [ ] 재고 부족 표시
- [ ] 쿠폰/할인 적용
- [ ] 최근 본 상품

### 고급
- [ ] 결제 플로우 (Stripe 연동)
- [ ] 주문 내역
- [ ] 실시간 재고 업데이트 (WebSocket)
- [ ] 추천 알고리즘

## 📚 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [Zustand 문서](https://github.com/pmndrs/zustand)
- [JSON Server 문서](https://github.com/typicode/json-server)
- [Playwright 공식 문서](https://playwright.dev/)
