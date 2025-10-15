# Phase 3: Toast 알림 구현 계획

## 목표
장바구니 추가 시 사용자에게 시각적 피드백을 제공하는 Toast 알림 시스템 구현.

---

## 요구사항

### 기능 요구사항
1. **Toast 알림 표시**
   - 장바구니 "담기" 버튼 클릭 시 Toast 표시
   - 메시지: "장바구니에 추가되었습니다"
   - 위치: 화면 우측 상단 (fixed position)
   - 자동 사라짐: 3초 후

2. **Toast 스타일**
   - 배경색: 초록색 (성공 표시)
   - 텍스트: 흰색
   - 그림자: 적절한 drop-shadow
   - 애니메이션: fade-in/fade-out

3. **Toast 중복 처리**
   - 여러 상품 연속 추가 시 Toast 큐 관리
   - 동시에 최대 3개까지 표시 (위에서 아래로 쌓임)
   - 오래된 Toast부터 사라짐

### 비기능 요구사항
- React Context API로 전역 Toast 관리
- 재사용 가능한 Toast 컴포넌트
- TypeScript 타입 안정성
- Tailwind CSS 애니메이션

---

## 구현 단계

### 1단계: Toast 타입 및 Context 설정 (15분)
- Toast 타입 정의 (`id`, `message`, `type`)
- ToastContext 생성
- ToastProvider 구현 (상태 관리, 자동 제거 로직)

### 2단계: Toast 컴포넌트 작성 (20분)
- `components/Toast.tsx` 생성
- 개별 Toast 아이템 렌더링
- fade-in/fade-out 애니메이션
- Tailwind CSS 스타일링

### 3단계: ToastContainer 구성 (15분)
- `components/ToastContainer.tsx` 생성
- Toast 목록 렌더링 (우측 상단 fixed)
- 최대 3개 제한 처리

### 4단계: 애플리케이션 통합 (10분)
- `app/layout.tsx`에 ToastProvider 추가
- `app/page.tsx`에서 useToast 훅 사용
- "담기" 버튼 클릭 시 Toast 호출

### 5단계: E2E 테스트 작성 (25분)
- 장바구니 추가 시 Toast 표시 테스트
- Toast 3초 후 사라짐 테스트
- 여러 Toast 동시 표시 테스트

### 6단계: 문서화 및 커밋 (10분)
- SESSION_CONTEXT.md 업데이트
- PROGRESS.md 업데이트
- PHASE_3_SUMMARY.md 작성
- Git 커밋

**예상 소요 시간**: 95분

---

## 아키텍처 설계

### Toast 타입 정의
```typescript
// types/toast.ts
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
```

### ToastContext 구조
```typescript
// context/ToastContext.tsx
interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    
    setToasts((prev) => {
      const updated = [...prev, newToast];
      // 최대 3개 제한
      return updated.slice(-3);
    });

    // 3초 후 자동 제거
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
```

### Toast 컴포넌트
```typescript
// components/Toast.tsx
interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }[toast.type];

  return (
    <div
      className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg 
                  animate-fade-in flex items-center gap-3`}
    >
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="text-white hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}
```

### ToastContainer 컴포넌트
```typescript
// components/ToastContainer.tsx
export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
}
```

---

## 테스트 전략

### E2E 테스트 시나리오

#### 1) 장바구니 추가 시 Toast 표시
```typescript
test("장바구니 추가 시 Toast 표시", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
      ],
    });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: "담기" 버튼 클릭
  await page.click('[data-id="1"] button:has-text("담기")');

  // Then: Toast 표시
  await expect(page.locator('text=장바구니에 추가되었습니다')).toBeVisible();
});
```

#### 2) Toast 3초 후 자동 사라짐
```typescript
test("Toast 3초 후 자동 사라짐", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
      ],
    });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: "담기" 버튼 클릭
  await page.click('[data-id="1"] button:has-text("담기")');

  // Then: Toast 표시
  await expect(page.locator('text=장바구니에 추가되었습니다')).toBeVisible();

  // Wait: 3초 대기
  await page.waitForTimeout(3000);

  // Then: Toast 사라짐
  await expect(page.locator('text=장바구니에 추가되었습니다')).not.toBeVisible();
});
```

#### 3) 여러 Toast 동시 표시 (최대 3개)
```typescript
test("여러 Toast 동시 표시", async ({ page }) => {
  await page.route("http://localhost:3001/products", async (route) => {
    await route.fulfill({
      json: [
        { id: 1, name: "노트북", price: 1000000, category: "electronics", image: "..." },
        { id: 2, name: "키보드", price: 50000, category: "electronics", image: "..." },
        { id: 3, name: "마우스", price: 30000, category: "electronics", image: "..." },
        { id: 4, name: "모니터", price: 500000, category: "electronics", image: "..." },
      ],
    });
  });

  await page.goto("http://localhost:3000");
  await page.waitForSelector(".product-card");

  // When: 4개 상품 연속 추가
  await page.click('[data-id="1"] button:has-text("담기")');
  await page.click('[data-id="2"] button:has-text("담기")');
  await page.click('[data-id="3"] button:has-text("담기")');
  await page.click('[data-id="4"] button:has-text("담기")');

  // Then: 최대 3개만 표시 (마지막 3개: 키보드, 마우스, 모니터)
  const toasts = page.locator('.fixed.top-4.right-4 > div');
  await expect(toasts).toHaveCount(3);
});
```

---

## Tailwind 애니메이션 설정

### `tailwind.config.ts` 확장
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "fade-out": "fadeOut 0.3s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-10px)" },
        },
      },
    },
  },
};
```

---

## 예상 파일 변경

### 신규 파일
- `types/toast.ts`: Toast 타입 정의
- `context/ToastContext.tsx`: Toast 전역 상태 관리
- `components/Toast.tsx`: 개별 Toast 컴포넌트
- `components/ToastContainer.tsx`: Toast 컨테이너

### 수정 파일
- `app/layout.tsx`: ToastProvider 래핑
- `app/page.tsx`: useToast 훅 사용, "담기" 버튼에 Toast 호출
- `tailwind.config.ts`: 애니메이션 추가 (필요 시)

### 문서 파일
- `docs/SESSION_CONTEXT.md`: Phase 3 완료 반영
- `docs/PROGRESS.md`: Phase 3 상세 내용 추가
- `docs/PHASE_3_SUMMARY.md`: 구현 완료 보고서

---

## 구현 후 체크리스트

- [ ] Toast 타입 정의
- [ ] ToastContext 및 Provider 구현
- [ ] Toast 컴포넌트 작성
- [ ] ToastContainer 작성
- [ ] layout.tsx에 ToastProvider 추가
- [ ] page.tsx에서 useToast 사용
- [ ] Tailwind 애니메이션 설정 (필요 시)
- [ ] E2E 테스트 3개 작성 및 통과
- [ ] 문서 업데이트 (SESSION_CONTEXT, PROGRESS, PHASE_3_SUMMARY)
- [ ] Git 커밋 (Conventional Commits with Scope)

---

## 참고 사항

- **Context API 사용 이유**: 전역 상태 관리가 필요하고, 학습 목적으로 외부 라이브러리(react-toastify) 사용 안 함
- **자동 제거 로직**: `setTimeout`으로 3초 후 제거, 메모리 누수 방지 위해 cleanup 필요 없음 (컴포넌트 언마운트 시 자동 정리)
- **최대 3개 제한**: UX 고려, 너무 많은 Toast는 사용자 혼란 야기
