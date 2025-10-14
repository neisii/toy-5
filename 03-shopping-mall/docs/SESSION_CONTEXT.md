# Shopping Mall - Session Context

**Purpose**: Provide complete context for new Claude sessions to continue the Shopping Mall project.

**Last Updated**: 2025-10-14

---

## Project Overview

**Goal**: Build an e-commerce product listing page with cart functionality and Playwright E2E testing.

**Tech Stack**:
- Frontend: Next.js 14 + TypeScript
- Styling: Tailwind CSS
- State Management: Zustand
- Mock API: JSON Server
- Testing: Playwright

**Project Status**: Partially Complete (pagination and search not implemented)

**Methodology**: AI-DLC (see `../docs/ai-dlc.txt`)

---

## Communication Guidelines

1. **Tone**: Informal (반말) between user and Claude
2. **Documentation**: Fact-based (현상-원인-결과), avoid emojis, use numbering and bullets
3. **Progress Tracking**: Always update this file after completing tasks
4. **Approval**: Ask user approval when requirements are ambiguous
5. **Troubleshooting**: Record all problem-solving processes
6. **Phase Management**: Divide work into phases, document each phase
7. **Images**: Use https://picsum.photos/ for sample images
8. **Research**: Prioritize perplexity.ai, include reference URLs
9. **AI-DLC**: Follow AI-Driven Development Life Cycle methodology

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
9. **URL Parameters**: Page state reflected in URL (?page=2)

### Not Implemented
1. **Search**: Product name search with debounce
2. **Toast Notifications**: Alert on cart actions
3. **Product Detail Page**: Individual product view

---

## File Structure

```
03-shopping-mall/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home (product list)
│   │   ├── cart/
│   │   │   └── page.tsx          # Cart page
│   │   └── product/
│   │       └── [id]/
│   │           └── page.tsx      # Product detail (not implemented)
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── Pagination.tsx
│   │   ├── SearchBar.tsx         # Not implemented
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── store/
│   │   └── cartStore.ts          # Zustand store
│   ├── services/
│   │   └── productApi.ts
│   ├── types/
│   │   └── product.ts
│   └── utils/
│       └── format.ts
├── tests/
│   ├── shop.spec.ts
│   └── cart.spec.ts
├── db.json                        # JSON Server data
├── docs/
│   └── SESSION_CONTEXT.md
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

### Completed Tests
1. E2E cart scenario (add → view → update quantity → delete)
2. Category filtering
3. Quantity control in cart
4. **Pagination navigation** (Phase 1 - 2025-10-14): Page movement, previous/next buttons
5. **Category change resets to page 1** (Phase 1 - 2025-10-14)

### Missing Tests
1. Search functionality
2. Product detail page

**Test Files**: `tests/shop.spec.ts`

**Total Tests**: 6 (all passing)

---

## Completed Phases

### Phase 1: Setup
- Created Next.js 14 project with TypeScript
- Installed dependencies (Tailwind, Zustand, JSON Server, Playwright)
- Set up project structure

### Phase 2: Product List
- Implemented product grid layout
- Created ProductCard and ProductList components
- Set up JSON Server with mock data
- Connected to product API

### Phase 3: Category Filtering
- Added CategoryFilter component
- Implemented filter state management
- Connected filter to API query

### Phase 4: Shopping Cart
- Created Zustand cart store
- Implemented add/remove/update quantity
- Built cart page with CartItem and CartSummary
- Added LocalStorage persistence

### Phase 5: Testing
- Created E2E cart flow test
- Added category filtering test
- Verified quantity control

---

## Pending Work

### High Priority
1. **Pagination**: Implement page navigation with URL sync
2. **Search**: Add search bar with debounce and URL param
3. **Toast Notifications**: Alert user on cart actions

### Medium Priority
4. **Product Detail Page**: `/product/[id]` route
5. **URL State Management**: Reflect filters and pagination in URL
6. **Loading States**: Show spinner during API calls

### Low Priority
7. **Error Handling**: Display error messages
8. **Responsive Design**: Mobile optimization
9. **SEO**: Meta tags and Open Graph

---

## Troubleshooting History

No major issues recorded yet.

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

**Version**: 0.7.0 (70% complete)  
**Status**: In Development
