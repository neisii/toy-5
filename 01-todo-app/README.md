# 프로젝트 1: 할 일 관리 앱 (Todo List)

## 📋 프로젝트 개요

**난이도**: ⭐ 초급  
**개발 시간**: 1-2일  
**Playwright 학습 효과**: ⭐⭐  
**실무 유사도**: ⭐⭐

## 🎯 학습 목표

이 프로젝트를 통해 다음을 학습합니다:
- 기본 DOM 조작 테스트
- LocalStorage 상태 확인
- CSS 클래스 검증
- 리스트 필터링 테스트

## 🛠 기술 스택

- **Frontend**: React + TypeScript + Vite
- **상태 관리**: Context API 또는 Zustand
- **스타일링**: Tailwind CSS
- **저장소**: LocalStorage

## ✨ 주요 기능 요구사항

### 1. 할 일 추가
- 입력 필드에 텍스트 입력
- Enter 키 또는 추가 버튼으로 할 일 추가
- 빈 문자열은 추가 불가
- 추가 후 입력 필드 자동 초기화

### 2. 할 일 삭제
- 각 할 일 항목에 삭제 버튼 제공
- 삭제 시 확인 없이 즉시 삭제
- 삭제된 항목은 목록에서 제거

### 3. 완료 상태 토글
- 체크박스를 통한 완료/미완료 상태 변경
- 완료된 항목은 시각적으로 구분 (예: 취소선, 투명도 조정)
- 완료 상태는 LocalStorage에 저장

### 4. 필터링 기능
- **전체**: 모든 할 일 표시
- **진행중**: 미완료 항목만 표시
- **완료**: 완료된 항목만 표시
- 필터 상태는 URL 또는 로컬 상태로 관리

### 5. LocalStorage 자동 저장
- 모든 할 일 데이터는 LocalStorage에 저장
- 페이지 새로고침 시에도 데이터 유지
- 데이터 구조: `{ id, text, completed, createdAt }`

## 🎨 UI/UX 요구사항

### 레이아웃
```
┌──────────────────────────────────┐
│  할 일 관리 앱                    │
├──────────────────────────────────┤
│  [입력 필드................] [+]  │
├──────────────────────────────────┤
│  [전체] [진행중] [완료]           │
├──────────────────────────────────┤
│  ☐ 할 일 1            [삭제]      │
│  ☑ 할 일 2 (완료)     [삭제]      │
│  ☐ 할 일 3            [삭제]      │
└──────────────────────────────────┘
│  총 3개 / 완료 1개                │
└──────────────────────────────────┘
```

### 상태별 스타일
- **미완료**: 일반 텍스트
- **완료**: 취소선 + 50% 투명도
- **호버**: 배경색 변경
- **포커스**: 파란색 테두리

## 🧪 Playwright 테스트 시나리오

### 1. 할 일 추가 테스트
```typescript
test('할 일 추가', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 입력 필드에 텍스트 입력
  await page.fill('input[name="todo"]', '우유 사기');
  
  // Enter 키로 추가
  await page.press('input[name="todo"]', 'Enter');
  
  // 추가된 항목 확인
  await expect(page.locator('text=우유 사기')).toBeVisible();
  
  // 입력 필드 초기화 확인
  await expect(page.locator('input[name="todo"]')).toHaveValue('');
});
```

### 2. 할 일 완료 처리 테스트
```typescript
test('할 일 완료 처리', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 할 일 추가
  await page.fill('input[name="todo"]', '청소하기');
  await page.press('input[name="todo"]', 'Enter');
  
  // 체크박스 클릭
  await page.click('input[type="checkbox"]');
  
  // 완료 스타일 확인
  const todoItem = page.locator('text=청소하기');
  await expect(todoItem).toHaveClass(/completed/);
});
```

### 3. 할 일 삭제 테스트
```typescript
test('할 일 삭제', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 할 일 추가
  await page.fill('input[name="todo"]', '운동하기');
  await page.press('input[name="todo"]', 'Enter');
  
  // 삭제 버튼 클릭
  await page.click('button[aria-label="삭제"]');
  
  // 항목이 사라졌는지 확인
  await expect(page.locator('text=운동하기')).not.toBeVisible();
});
```

### 4. 필터링 테스트
```typescript
test('필터링 - 완료된 항목만 보기', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 여러 할 일 추가
  await page.fill('input[name="todo"]', '할 일 1');
  await page.press('input[name="todo"]', 'Enter');
  await page.fill('input[name="todo"]', '할 일 2');
  await page.press('input[name="todo"]', 'Enter');
  
  // 첫 번째 완료
  await page.click('input[type="checkbox"]:first-child');
  
  // "완료됨" 필터 클릭
  await page.click('button:has-text("완료됨")');
  
  // 완료된 항목만 표시
  await expect(page.locator('text=할 일 1')).toBeVisible();
  await expect(page.locator('text=할 일 2')).not.toBeVisible();
});
```

### 5. LocalStorage 지속성 테스트
```typescript
test('LocalStorage 데이터 유지', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 할 일 추가
  await page.fill('input[name="todo"]', '장보기');
  await page.press('input[name="todo"]', 'Enter');
  
  // 페이지 새로고침
  await page.reload();
  
  // 데이터 유지 확인
  await expect(page.locator('text=장보기')).toBeVisible();
});
```

## 📁 프로젝트 구조

```
01-todo-app/
├── src/
│   ├── components/
│   │   ├── TodoInput.tsx      # 할 일 입력 컴포넌트
│   │   ├── TodoList.tsx       # 할 일 목록 컴포넌트
│   │   ├── TodoItem.tsx       # 개별 할 일 항목
│   │   └── TodoFilter.tsx     # 필터 버튼 그룹
│   ├── hooks/
│   │   └── useTodos.ts        # 할 일 관리 커스텀 훅
│   ├── types/
│   │   └── todo.ts            # Todo 타입 정의
│   ├── utils/
│   │   └── storage.ts         # LocalStorage 유틸
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── todo.spec.ts           # Playwright 테스트
│   └── fixtures/
│       └── todos.ts           # 테스트 데이터
├── playwright.config.ts
├── package.json
└── README.md
```

## 📊 데이터 모델

### Todo 타입
```typescript
interface Todo {
  id: string;           // UUID
  text: string;         // 할 일 내용
  completed: boolean;   // 완료 상태
  createdAt: number;    // 생성 시간 (timestamp)
}
```

### LocalStorage 키
- `todos`: Todo 배열 저장

## 🚀 시작하기

### 1. 프로젝트 생성
```bash
npm create vite@latest 01-todo-app -- --template react-ts
cd 01-todo-app
npm install
```

### 2. 의존성 설치
```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 상태 관리 (선택사항)
npm install zustand

# Playwright
npm install -D @playwright/test
npx playwright install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 테스트 실행
```bash
npx playwright test
npx playwright show-report
```

## ✅ 완료 체크리스트

### 기능 구현
- [x] 할 일 추가 기능
- [x] 할 일 삭제 기능
- [x] 완료 상태 토글
- [x] 필터링 (전체/진행중/완료)
- [x] LocalStorage 저장/로드
- [x] 빈 문자열 입력 방지
- [x] 총 개수/완료 개수 표시

### 테스트 작성
- [x] 할 일 추가 테스트
- [x] 할 일 삭제 테스트
- [x] 완료 처리 테스트
- [x] 필터링 테스트
- [x] LocalStorage 지속성 테스트
- [x] 빈 문자열 추가 방지 테스트
- [x] 통계 정보 표시 테스트

### UI/UX
- [x] 반응형 디자인
- [x] 접근성 (ARIA 레이블)
- [x] 키보드 네비게이션 (Enter로 추가)
- [x] 완료 항목 시각적 구분

## 💡 추가 개선 아이디어

### 기본
- [ ] 할 일 수정 기능
- [ ] 전체 삭제 버튼
- [ ] 완료된 항목 일괄 삭제

### 중급
- [ ] 드래그 앤 드롭으로 순서 변경
- [ ] 우선순위 설정
- [ ] 카테고리/태그 기능
- [ ] 마감일 설정

### 고급
- [ ] 다크 모드
- [ ] 서버 동기화 (Firebase, Supabase)
- [ ] 검색 기능
- [ ] 통계 대시보드
- [ ] PWA (오프라인 지원)

## 📚 참고 자료

- [React 공식 문서](https://react.dev/)
- [Playwright 공식 문서](https://playwright.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [LocalStorage API](https://developer.mozilla.org/ko/docs/Web/API/Window/localStorage)
