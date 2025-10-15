# Shopping Mall - Session Context

**Purpose**: Provide complete context for new Claude sessions to continue the Shopping Mall project.

**Last Updated**: 2025-10-15

---

## Project Overview

**Goal**: Build an e-commerce product listing page with cart functionality and Playwright E2E testing.

**Tech Stack**:
- Frontend: Next.js 14 + TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Mock API: JSON Server
- Testing: Playwright

**Project Status**: 90% Complete (only product detail page remaining)

**Methodology**: AI-DLC (see `../docs/ai-dlc.txt`)

---

## Communication Guidelines

1. **Tone**: Informal (반말) between user and Claude
2. **Documentation**: Fact-based (현상-원인-결과), avoid emojis, use numbering and bullets
3. **Documentation Structure**:
   - **PROGRESS.md**: 전체 Phase 간결한 요약 (Phase별 5-10줄, 커밋 해시)
   - **PHASE_N_PLAN.md**: Phase 시작 전 상세 계획 (요구사항, 기술적 접근, 예상 이슈)
   - **PHASE_N_SUMMARY.md**: Phase 완료 후 상세 회고 (구현 내용, 트러블슈팅, 코드 예시)
   - **RETROSPECTIVE.md**: 전체 프로젝트 학습 회고 (학습 포인트, 재사용 패턴, 통계)
   - **SESSION_CONTEXT.md**: Claude 세션용 스냅샷 (현재 상태, 다음 작업)
4. **Progress Tracking**: Always update this file after completing tasks
5. **Approval**: Ask user approval when requirements are ambiguous
6. **Troubleshooting**: Record all problem-solving processes
7. **Phase Management**: Divide work into phases, document each phase
8. **Images**: Use https://picsum.photos/ for sample images
9. **Research**: Prioritize perplexity.ai, include reference URLs
10. **AI-DLC**: Follow AI-Driven Development Life Cycle methodology

---

## Implemented Features

### Completed
1. **Product List Display**: Grid layout with 12 products per page
2. **Category Filtering**: Filter products by category (electronics, fashion, furniture, books, sports)
3. **Cart Add/Remove**: Add products to cart, manage cart items
4. **Quantity Control**: Increment/decrement quantity in cart
5. **Total Price Calculation**: Real-time cart total update
6. **LocalStorage Persistence**: Cart data saved to localStorage
7. **Empty State**: Display message when cart is empty
8. **Pagination** (Phase 1 - 2025-10-14): Page navigation with URL sync, previous/next buttons
9. **Search** (Phase 2 - 2025-10-15): Real-time product name search with category combination
10. **Toast Notifications** (Phase 3 - 2025-10-15): Success alerts on cart actions (auto-dismiss in 3s, max 3 toasts)
11. **URL State Management** (Phase 4 - 2025-10-15): All filters persist in URL, browser back/forward support

### Not Implemented
1. **Product Detail Page**: Individual product view with `/product/[id]` route

---

## File Structure

```
03-shopping-mall/
├── app/
│   ├── page.tsx              # Home (product list + search)
│   ├── layout.tsx            # Root layout with ToastProvider
│   ├── cart/
│   │   └── page.tsx          # Cart page
│   └── product/
│       └── [id]/
│           └── page.tsx      # Product detail (not implemented)
├── components/
│   ├── ProductCard.tsx       # Product card with toast on add
│   ├── ProductList.tsx
│   ├── CategoryFilter.tsx
│   ├── Pagination.tsx        # Page navigation
│   ├── CartIcon.tsx          # Cart icon with badge
│   ├── Toast.tsx             # Individual toast component
│   └── ToastContainer.tsx    # Toast manager
├── context/
│   └── ToastContext.tsx      # Toast state management
├── store/
│   └── cartStore.ts          # Zustand store
├── types/
│   └── product.ts
├── tests/
│   └── shop.spec.ts          # 18 E2E tests (all passing)
├── db.json                   # JSON Server data (20 products)
├── docs/
│   ├── SESSION_CONTEXT.md
│   └── PROGRESS.md           # Phase 1-4 detailed documentation
└── README.md
```

---

## Data Models

### Product
```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;          // https://picsum.photos/300
  stock: number;
}
```

### CartItem
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}
```

### Cart (Zustand Store)
```typescript
interface Cart {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}
```

---

## Mock API (JSON Server)

**Port**: 3001  
**Data File**: `db.json`

### Endpoints
- `GET /products` - All products
- `GET /products?category=electronics` - Filter by category
- `GET /products?q=맥북` - Search by name
- `GET /products?_page=1&_limit=12` - Pagination
- `GET /products/:id` - Product detail

### Sample Data Structure
```json
{
  "products": [
    {
      "id": 1,
      "name": "맥북 프로 M3",
      "price": 2500000,
      "category": "electronics",
      "description": "최신 M3 칩 탑재",
      "image": "https://picsum.photos/300?random=1",
      "stock": 10
    }
  ]
}
```

---

## Test Coverage

### Completed Tests (18 total, all passing)

**Basic Features** (3 tests)
1. Product list display
2. Category filtering
3. E2E cart scenario (add → view → update quantity → delete)

**Search** (4 tests - Phase 2)
4. Search input with filtering
5. Category + search combination
6. Empty search results message
7. Search with pagination

**Toast Notifications** (3 tests - Phase 3)
8. Toast display on cart add
9. Toast auto-dismiss after 3 seconds
10. Multiple toasts (max 3)

**URL State Management** (5 tests - Phase 4)
11. Load initial state from URL parameters
12. Update URL on search input
13. Update URL on category change
14. Maintain multiple parameters (search + category + page)
15. Browser back/forward state restoration

**Pagination** (3 tests - Phase 1)
16. Page navigation (1 → 2 → 3)
17. Previous/Next buttons
18. Category change resets to page 1

**Test Files**: `tests/shop.spec.ts`

---

## Completed Phases

### Phase 0: Initial Setup (2025-10-07)
- Created Next.js 14 project with TypeScript
- Installed dependencies (Tailwind, Zustand, JSON Server, Playwright)
- Set up project structure
- Implemented product list, category filtering, and cart functionality
- Created basic E2E tests

### Phase 1: Pagination (2025-10-14)
**Commit**: `b06ab02`
- Created Pagination component with previous/next buttons
- Implemented URL sync for page parameter (?page=2)
- Added page reset on category change
- Added 3 E2E tests for pagination

### Phase 2: Search (2025-10-15)
**Commit**: `05446f1`
- Added search input field in home page
- Implemented real-time filtering (no debounce)
- Combined search + category filtering (AND condition)
- Search resets to page 1
- Display search result count and empty state
- Added 4 E2E tests for search

### Phase 3: Toast Notifications (2025-10-15)
**Commit**: `7ce3227`
- Created Toast context and provider
- Built Toast and ToastContainer components
- Integrated toast on cart add action
- Auto-dismiss after 3 seconds
- Max 3 toasts displayed simultaneously
- Added 3 E2E tests for toast

### Phase 4: URL State Management (2025-10-15)
**Commit**: `64844a0`
- Load initial state from URL parameters
- Created unified updateURL helper function
- All filters persist in URL (search, category, page)
- Browser back/forward support
- URL cleanup (remove default values)
- Added 5 E2E tests for URL state

---

## Pending Work

### High Priority
1. **Product Detail Page**: `/product/[id]` route with product info and back navigation

### Medium Priority (Optional Enhancements)
2. **Search Debounce**: Add 300ms debounce to reduce filter operations
3. **Loading States**: Show spinner during API calls
4. **Error Handling**: Display error messages for API failures

### Low Priority (Optional Enhancements)
5. **Sorting**: Sort by price (ascending/descending) and name
6. **Price Range Filter**: Min/max price slider
7. **Responsive Design**: Mobile optimization improvements
8. **SEO**: Meta tags and Open Graph
9. **Image Lazy Loading**: Optimize image loading performance

---

## Troubleshooting History

### Phase 1: Pagination (2025-10-14)
1. **Playwright strict mode violation**
   - 현상: `text=상품 1` 선택자가 "상품 10", "상품 11" 등과 중복 매칭
   - 원인: 부분 문자열 매칭으로 인한 다중 요소 선택
   - 해결: `[data-id="1"]` 속성 선택자로 변경

2. **toHaveCount.greaterThan() 메서드 오류**
   - 현상: Playwright에 `toHaveCount.greaterThan()` 메서드 없음
   - 원인: Playwright API 오해
   - 해결: `.count()` 후 `expect().toBeGreaterThan()` 사용

---

## User Decisions

None recorded yet. Future decisions should be documented here.

---

## Running the Project

### Development
```bash
# Terminal 1: Next.js
cd 03-shopping-mall
npm install
npm run dev

# Terminal 2: JSON Server
npx json-server --watch db.json --port 3001
```

### Testing
```bash
npx playwright test
npx playwright show-report
```

---

## References

- Next.js 14 Docs: https://nextjs.org/docs
- Zustand: https://github.com/pmndrs/zustand
- JSON Server: https://github.com/typicode/json-server
- Tailwind CSS: https://tailwindcss.com/
- Playwright: https://playwright.dev/

---

**Version**: 0.9.0 (90% complete)  
**Status**: In Development

---

## Summary of Phase 1-4 Implementation

All core features have been implemented and tested:
- **18 E2E tests** passing (shop.spec.ts)
- **4 major phases** completed in 2 days (2025-10-14 to 2025-10-15)
- **Pagination + Search + Toast + URL State** fully functional
- Only **product detail page** remains for full completion

See `docs/PROGRESS.md` for detailed phase documentation.
