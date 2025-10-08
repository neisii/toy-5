# Shopping Mall 트러블슈팅 가이드

## 📋 개요

이 문서는 Shopping Mall App (Next.js 14 + Zustand) 개발 과정에서 마주한 모든 기술적 이슈와 해결 과정을 상세히 기록합니다.

**프로젝트**: 03-shopping-mall  
**프레임워크**: Next.js 14 (App Router) + Zustand + TypeScript  
**개발 기간**: 2025-10-07  
**마주친 이슈 수**: 5개 (Critical: 2, Medium: 2, Minor: 1)

---

## 🔴 Critical Issues

### Issue #1: create-next-app Interactive Prompt 문제

**심각도**: Critical  
**발생 시각**: 2025-10-07  
**소요 시간**: ~30분  
**영향 범위**: 프로젝트 초기 설정

#### 증상

`create-next-app` 실행 시 interactive prompt에서 멈춤:

```bash
$ npx create-next-app@14 03-shopping-mall

✔ Would you like to use TypeScript? … No / Yes
# 여기서 멈춤, 입력 불가
```

추가 시도:
```bash
$ npm create next-app@14 03-shopping-mall -- --typescript --tailwind --app --no-src-dir

# 빈 디렉토리만 생성되고 아무 파일도 생성 안 됨
```

#### 원인 분석

1. **CLI stdin 처리 이슈**
   - 자동화된 환경에서 interactive prompt 처리 불가
   - `--yes` 플래그로도 해결 안 됨

2. **환경 변수 전달 실패**
   - CLI 인자가 제대로 전달되지 않음
   - 디렉토리만 생성되고 템플릿 복사 안 됨

3. **npx vs npm create 차이**
   - 둘 다 동일한 문제 발생
   - 패키지 실행 방식의 근본적인 문제

#### 해결 방법

**완전 수동 설정으로 전환:**

**Step 1**: 빈 npm 프로젝트 생성
```bash
cd 03-shopping-mall
npm init -y
```

**Step 2**: Next.js 핵심 패키지 설치
```bash
npm install next@14 react react-dom
npm install -D typescript @types/react @types/node @types/react-dom
```

**Step 3**: `package.json` 스크립트 추가
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

**Step 4**: TypeScript 설정 (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 5**: Next.js 설정 (`next.config.js`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
```

**Step 6**: Tailwind CSS 설치 및 설정
```bash
npm install -D tailwindcss@3.4.0 postcss autoprefixer
npx tailwindcss init -p
```

`tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
```

**Step 7**: App Router 구조 생성
```bash
mkdir -p app
touch app/layout.tsx app/page.tsx app/globals.css
```

`app/layout.tsx`:
```typescript
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '쇼핑몰',
  description: 'Next.js 14 쇼핑몰',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`app/page.tsx`:
```typescript
export default function Home() {
  return <main className="p-8"><h1>쇼핑몰</h1></main>;
}
```

**Step 8**: 개발 서버 실행 확인
```bash
npm run dev
# ✅ http://localhost:3000 접속 성공
```

#### 학습 포인트

1. **Next.js 핵심 구성 이해**
   - `next`, `react`, `react-dom` 3개 패키지만으로 기본 구성 가능
   - TypeScript 설정의 `plugins: [{ "name": "next" }]` 필수
   - App Router는 `app/` 디렉토리만 있으면 동작

2. **Tailwind v3.4.0 선택**
   - 이전 프로젝트(todo-app, weather-app)와 동일한 버전
   - PostCSS 플러그인 호환성 보장

3. **수동 설정의 장점**
   - 정확히 필요한 패키지만 설치
   - 각 설정 파일의 역할 명확히 이해
   - 디버깅 시 구조 파악 용이

#### 대안 방법 (향후)

1. **Vite + React로 전환**
   ```bash
   npm create vite@latest my-app -- --template react-ts
   ```

2. **비대화형 플래그 사용 (Next.js 15+)**
   ```bash
   npx create-next-app@latest --defaults
   ```

3. **Docker 환경에서 실행**
   - stdin 처리 문제 우회 가능

#### 참고 자료

- [Next.js Manual Setup](https://nextjs.org/docs/getting-started/installation#manual-installation)
- [Next.js App Router](https://nextjs.org/docs/app)
- [create-next-app GitHub Issues](https://github.com/vercel/next.js/issues)

---

### Issue #2: README.md 파일 손실 및 복원

**심각도**: Critical  
**발생 시각**: 2025-10-07  
**소요 시간**: ~15분  
**영향 범위**: 프로젝트 문서

#### 증상

프로젝트 디렉토리 재생성 후 README.md 파일 손실:

```bash
$ ls 03-shopping-mall/
app/  components/  store/  package.json  # README.md 없음
```

이전 세션에서 작성한 README.md 내용:
- 프로젝트 설명
- 기능 명세
- 개발 가이드
- 체크리스트

#### 원인 분석

1. **디렉토리 재생성 과정**
   - `create-next-app` 실패 후 디렉토리 삭제 및 재생성
   - 수동 설정 중 README.md 복사 누락

2. **Git 커밋 이력 존재**
   - 이전 세션에서 README.md가 커밋됨
   - Git history에 파일 내용 보존됨

#### 해결 방법

**Git history에서 파일 복원:**

**Step 1**: 커밋 히스토리에서 README.md 확인
```bash
git log --all --full-history -- "03-shopping-mall/README.md"

# 결과:
commit e9e89223... (이전 세션)
Author: ...
Date: ...
    Add shopping mall project
```

**Step 2**: 특정 커밋에서 파일 내용 추출
```bash
git show e9e8922:03-shopping-mall/README.md
```

**Step 3**: 파일로 복원
```bash
git show e9e8922:03-shopping-mall/README.md > 03-shopping-mall/README.md
```

**Step 4**: 복원 확인
```bash
cat 03-shopping-mall/README.md
# ✅ 이전 내용 완전 복원
```

#### 추가 해결 방법

**방법 1**: Git checkout (파일만)
```bash
git checkout e9e8922 -- 03-shopping-mall/README.md
```

**방법 2**: Git restore (Git 2.23+)
```bash
git restore --source=e9e8922 03-shopping-mall/README.md
```

**방법 3**: 전체 디렉토리 복원
```bash
git checkout e9e8922 -- 03-shopping-mall/
# 주의: 모든 파일이 해당 커밋 상태로 복원됨
```

#### 학습 포인트

1. **Git은 영구 저장소**
   - 커밋된 파일은 삭제해도 Git history에 남음
   - `git show <commit>:<path>` 패턴으로 언제든 접근 가능

2. **파일 복원 커맨드 비교**
   ```bash
   # 내용만 보기
   git show <commit>:<path>
   
   # 파일로 복원 (수동)
   git show <commit>:<path> > <path>
   
   # 파일로 복원 (자동)
   git checkout <commit> -- <path>
   
   # 최신 Git (restore)
   git restore --source=<commit> <path>
   ```

3. **프로젝트 재생성 체크리스트**
   - [ ] 기존 파일 백업 확인
   - [ ] README.md, PROGRESS.md 등 문서 파일 별도 복사
   - [ ] Git 커밋 후 재생성 시작
   - [ ] 복원 필요 시 `git show` 활용

#### 예방 전략

1. **중요 파일 백업**
   ```bash
   # 재생성 전
   cp -r 03-shopping-mall 03-shopping-mall.backup
   
   # 또는 Git stash
   git stash push -m "backup before recreation"
   ```

2. **Git 커밋 습관화**
   - 디렉토리 재생성 전 반드시 커밋
   - 문서 파일 변경 즉시 커밋

3. **템플릿 파일 관리**
   - `.template/` 디렉토리에 기본 README.md 보관
   - 새 프로젝트 생성 시 복사

#### 참고 자료

- [Git show documentation](https://git-scm.com/docs/git-show)
- [Git restore documentation](https://git-scm.com/docs/git-restore)
- [Recovering Lost Files in Git](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)

---

## 🟡 Medium Issues

### Issue #3: LocalStorage SSR 호환성

**심각도**: Medium  
**발생 시각**: 2025-10-07  
**소요 시간**: ~15분  
**영향 범위**: Zustand 스토어 초기화

#### 증상

Zustand 스토어에서 LocalStorage 접근 시 서버 에러:

```bash
Error: localStorage is not defined
ReferenceError: localStorage is not defined
    at loadCart (cartStore.ts:3:22)
```

브라우저 콘솔:
```
Hydration failed because the initial UI does not match what was rendered on the server.
```

#### 원인 분석

1. **Next.js SSR/SSG 환경**
   - Next.js는 기본적으로 서버에서 먼저 렌더링 (SSR)
   - Node.js 환경에는 `window`, `localStorage` 객체 없음

2. **Zustand 스토어 초기화 타이밍**
   ```typescript
   // ❌ 서버에서도 실행됨
   const loadCart = (): CartItem[] => {
     const saved = localStorage.getItem('cart');
     return saved ? JSON.parse(saved) : [];
   };
   
   export const useCartStore = create<CartStore>((set, get) => ({
     items: loadCart(), // SSR 시 에러!
   }));
   ```

3. **Hydration 불일치**
   - 서버: `items: []` (에러로 인해 빈 배열)
   - 클라이언트: `items: [...]` (LocalStorage에서 로드)
   - React Hydration 에러 발생

#### 해결 방법

**환경 체크로 SSR 안전하게 처리:**

```typescript
const loadCart = (): CartItem[] => {
  // ✅ 서버 환경 체크
  if (typeof window === 'undefined') {
    return []; // 서버에서는 빈 배열 반환
  }
  
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};

const saveCart = (items: CartItem[]) => {
  // ✅ 서버 환경 체크
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem('cart', JSON.stringify(items));
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: loadCart(),
  
  addItem: (product: Product) => {
    const items = get().items;
    const existingItem = items.find(item => item.product.id === product.id);
    
    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newItems = [...items, { product, quantity: 1 }];
    }
    
    saveCart(newItems); // ✅ 클라이언트에서만 저장
    set({ items: newItems });
  },
  
  // ... 다른 액션들도 동일하게 saveCart 사용
}));
```

#### 추가 패턴: useEffect 사용

```typescript
'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

export default function CartInitializer() {
  useEffect(() => {
    // ✅ useEffect는 클라이언트에서만 실행
    const saved = localStorage.getItem('cart');
    if (saved) {
      const items = JSON.parse(saved);
      useCartStore.setState({ items });
    }
  }, []);
  
  return null;
}

// layout.tsx에서 사용
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartInitializer />
        {children}
      </body>
    </html>
  );
}
```

#### 학습 포인트

1. **Next.js 렌더링 환경**
   - 서버: Node.js (no window, no document, no localStorage)
   - 클라이언트: Browser (전체 Web API 사용 가능)
   - `typeof window === 'undefined'`로 환경 구분

2. **Hydration 일관성**
   - 서버와 클라이언트의 초기 상태가 동일해야 함
   - LocalStorage는 클라이언트에서만 접근
   - `useEffect`는 클라이언트 전용

3. **'use client' 지시어**
   - 클라이언트 컴포넌트로 명시
   - Zustand hook 사용 시 필수
   - 해당 컴포넌트는 SSR 건너뜀

#### 대안: Zustand Persist Middleware

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => { /* ... */ },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // SSR 안전: 서버에서는 자동으로 스킵
    }
  )
);
```

#### 참고 자료

- [Next.js Rendering](https://nextjs.org/docs/app/building-your-application/rendering)
- [Zustand SSR Guide](https://github.com/pmndrs/zustand#server-side-rendering)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)

---

### Issue #4: Playwright 테스트에서 장바구니 초기화

**심각도**: Medium  
**발생 시각**: 2025-10-07  
**소요 시간**: ~10분  
**영향 범위**: E2E 테스트

#### 증상

Playwright 테스트 실행 시 이전 테스트의 장바구니 데이터가 남아있음:

```typescript
test('should add product to cart', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-id="1"] button'); // 장바구니 담기
  
  const badge = page.locator('[data-testid="cart-badge"]');
  await expect(badge).toHaveText('1'); // ❌ 실패: '3' (이전 테스트 잔여)
});
```

#### 원인 분석

1. **LocalStorage 영속성**
   - Playwright는 기본적으로 브라우저 상태 유지
   - 테스트 간 LocalStorage 공유

2. **Context 재사용**
   - `{ page }` fixture는 같은 브라우저 컨텍스트 사용
   - 테스트 격리 부족

#### 해결 방법

**방법 1**: 각 테스트 전 LocalStorage 초기화

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // ✅ 모든 테스트 전에 LocalStorage 클리어
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('should add product to cart', async ({ page }) => {
  await page.goto('/');
  // ... 테스트 코드
});
```

**방법 2**: 테스트 컨텍스트 격리 (playwright.config.ts)

```typescript
export default defineConfig({
  use: {
    // ✅ 각 테스트마다 새로운 컨텍스트
    storageState: undefined,
  },
  testOptions: {
    // ✅ 테스트 간 상태 공유 안 함
    trace: 'on-first-retry',
  },
});
```

**방법 3**: API 모킹과 함께 초기화

```typescript
test('cart e2e flow', async ({ page }) => {
  // API 모킹
  await page.route('**/localhost:3001/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: '노트북', price: 1200000, category: 'electronics', ... },
        { id: 2, name: '마우스', price: 50000, category: 'electronics', ... }
      ])
    });
  });

  // LocalStorage 초기화
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload(); // 스토어 재초기화
  
  // 테스트 시작
  await page.click('[data-id="1"] button');
  await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
});
```

**최종 테스트 패턴:**

```typescript
test('complete cart flow', async ({ page }) => {
  // 1. API 모킹
  await page.route('**/localhost:3001/products', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockProducts)
    });
  });

  // 2. 페이지 이동 및 초기화
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // 3. 상품 추가
  await page.click('[data-id="1"] button');
  await page.click('[data-id="2"] button');
  
  // 4. 장바구니 확인
  await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('2');
  
  // 5. 장바구니 페이지 이동
  await page.click('[data-testid="cart-icon"]');
  await expect(page).toHaveURL('/cart');
  
  // 6. 수량 조절
  const firstItem = page.locator('[data-id="1"]');
  await firstItem.locator('[data-action="increase"]').click();
  
  // 7. 총 금액 확인
  const totalPrice = 1200000 * 2 + 50000; // 노트북 2개 + 마우스 1개
  await expect(page.locator('[data-testid="total-price"]'))
    .toHaveText(`${totalPrice.toLocaleString()}원`);
});
```

#### 학습 포인트

1. **테스트 격리 중요성**
   - 각 테스트는 독립적이어야 함
   - `beforeEach`로 초기 상태 보장

2. **Playwright Context 관리**
   - `{ page }` fixture는 컨텍스트 공유
   - `context.clearCookies()`, `localStorage.clear()` 활용

3. **E2E 테스트 패턴**
   - Setup (모킹, 초기화)
   - Action (사용자 동작)
   - Assertion (결과 확인)

#### 참고 자료

- [Playwright Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright Storage State](https://playwright.dev/docs/auth#reuse-authentication-state)
- [Test Isolation Best Practices](https://playwright.dev/docs/best-practices#test-isolation)

---

## 🟢 Minor Issues

### Issue #5: JSON Server 포트 충돌

**심각도**: Minor  
**발생 시각**: 2025-10-07  
**소요 시간**: ~5분  
**영향 범위**: Mock API 서버

#### 증상

JSON Server 실행 시 포트 3001 이미 사용 중:

```bash
$ npx json-server db.json --port 3001

Error: listen EADDRINUSE: address already in use :::3001
```

#### 원인 분석

1. **이전 JSON Server 프로세스 잔존**
   - 터미널 종료 후에도 백그라운드 실행
   - 다른 프로젝트에서 실행 중

#### 해결 방법

**방법 1**: 포트 사용 프로세스 종료
```bash
# 3001 포트 사용 프로세스 찾기
lsof -ti:3001

# 종료
lsof -ti:3001 | xargs kill -9
```

**방법 2**: 다른 포트 사용
```bash
npx json-server db.json --port 3002
```

**방법 3**: package.json 스크립트 설정
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "mock": "json-server db.json --port 3001",
    "test": "playwright test"
  }
}
```

#### 학습 포인트

1. **포트 관리**
   - 각 서비스별 고정 포트 할당
   - Next.js: 3000, JSON Server: 3001, etc.

2. **프로세스 정리**
   - 개발 서버 종료 시 `lsof` 확인 습관화

#### 참고 자료

- [JSON Server Documentation](https://github.com/typicode/json-server)

---

## 📊 이슈 통계

| 심각도 | 개수 | 평균 해결 시간 | 총 소요 시간 |
|--------|------|----------------|--------------|
| Critical | 2 | 22.5분 | 45분 |
| Medium | 2 | 12.5분 | 25분 |
| Minor | 1 | 5분 | 5분 |
| **합계** | **5** | **15분** | **75분** |

---

## 🎯 핵심 학습 내용

### 1. Next.js App Router + Zustand 패턴

**Client Component with Zustand:**
```typescript
'use client'; // ✅ 필수!

import { useCartStore } from '@/store/cartStore';

export default function CartIcon() {
  const totalItems = useCartStore(state => 
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  
  return (
    <div>
      장바구니 ({totalItems})
    </div>
  );
}
```

**SSR-Safe LocalStorage:**
```typescript
const loadCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};
```

### 2. Playwright E2E 테스트 완전 격리

```typescript
test.beforeEach(async ({ page }) => {
  // API 모킹
  await page.route('**/localhost:3001/products', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(mockProducts)
    });
  });
  
  // 초기화
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('cart operations', async ({ page }) => {
  // 완전히 격리된 환경에서 테스트
});
```

### 3. Next.js 수동 설정 체크리스트

```bash
# 1. 패키지 설치
npm install next@14 react react-dom
npm install -D typescript @types/react @types/node

# 2. 설정 파일
- tsconfig.json (plugins: [{ "name": "next" }])
- next.config.js (reactStrictMode: true)
- package.json (scripts: dev, build, start)

# 3. App Router 구조
mkdir app
touch app/layout.tsx app/page.tsx app/globals.css

# 4. Tailwind CSS
npm install -D tailwindcss@3.4.0 postcss autoprefixer
npx tailwindcss init -p
```

---

## 🛡️ 예방 전략

### 개발 시작 전 체크리스트

- [ ] Git 커밋 완료 (재생성 전)
- [ ] 중요 파일 백업 (`README.md`, `PROGRESS.md`)
- [ ] 포트 충돌 확인 (`lsof -ti:3000,3001`)
- [ ] TypeScript `tsconfig.json` 검증
- [ ] `'use client'` 지시어 위치 확인

### Next.js + Zustand 베스트 프랙티스

1. **SSR 안전 코드**
   ```typescript
   // ✅ 항상 window 체크
   if (typeof window !== 'undefined') {
     localStorage.setItem(...);
   }
   ```

2. **Client Component 명시**
   ```typescript
   'use client'; // 파일 최상단
   
   import { useStore } from '@/store';
   ```

3. **Selector 최적화**
   ```typescript
   // ❌ 전체 상태 구독 (불필요한 리렌더)
   const store = useCartStore();
   
   // ✅ 필요한 값만 구독
   const totalItems = useCartStore(state => state.getTotalItems());
   ```

### Playwright 테스트 전략

1. **테스트 격리**
   - `beforeEach`로 초기화
   - `localStorage.clear()` + `reload()`

2. **API 모킹 일관성**
   - 고정된 테스트 데이터
   - `route.fulfill()` 사용

3. **E2E 시나리오 설계**
   - 사용자 플로우 기반
   - 단위 테스트와 통합 테스트 분리

---

## 📚 참고 자료

### 공식 문서
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Playwright Documentation](https://playwright.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Next.js 특화
- [Next.js Manual Installation](https://nextjs.org/docs/getting-started/installation#manual-installation)
- [Next.js SSR vs CSR](https://nextjs.org/docs/app/building-your-application/rendering)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### 상태 관리
- [Zustand with Next.js](https://github.com/pmndrs/zustand#server-side-rendering)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand#persist-middleware)

### Git
- [Git Show Command](https://git-scm.com/docs/git-show)
- [Git File Recovery](https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery)

---

## 🔄 회고

### 잘한 점

1. **수동 설정 완벽 이해**
   - create-next-app 실패를 기회로 전환
   - Next.js 핵심 구조 깊이 이해
   - 각 설정 파일의 역할 명확히 파악

2. **Git 활용 능력**
   - 손실된 파일 복원 성공
   - `git show` 커맨드 활용
   - 버전 관리의 중요성 재인식

3. **SSR 안전 코드**
   - `typeof window` 체크 패턴 확립
   - LocalStorage 사용 시 환경 구분
   - Hydration 에러 사전 방지

4. **완전한 테스트 격리**
   - `beforeEach` + `localStorage.clear()` 패턴
   - API 모킹으로 외부 의존성 제거
   - E2E 시나리오 완전 격리

### 개선할 점

1. **초기 설정 자동화**
   - Next.js 수동 설정 스크립트 작성
   - 템플릿 프로젝트 구성

2. **문서 백업 전략**
   - 프로젝트 재생성 전 자동 백업
   - 중요 파일 별도 디렉토리 관리

3. **포트 관리 시스템**
   - 프로젝트별 포트 문서화
   - 개발 서버 시작 전 포트 체크 스크립트

### 다음 프로젝트 적용 사항

1. **Svelte/SvelteKit 환경**
   - SSR 안전 코드 패턴 유지
   - `$:` reactive 문법에서 window 체크

2. **백엔드 통합 (Express)**
   - API 서버와 프론트엔드 동시 관리
   - 포트 할당 전략 수립

3. **환경별 설정 분리**
   - 개발/테스트/프로덕션 환경 구분
   - 환경 변수 체계적 관리

---

**문서 작성일**: 2025-10-07  
**작성자**: Claude Code Assistant  
**프로젝트 버전**: 1.0.0
