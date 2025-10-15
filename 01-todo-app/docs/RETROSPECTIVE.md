# Todo App - 학습 회고

> **목적**: Playwright E2E 테스트 학습을 위한 첫 프로젝트

## 📅 개발 기간
- 개발 완료: 2025-10-07 (1일)

---

## ✅ 완료된 작업

### 1. 프로젝트 초기 설정 ✓

**완료 날짜**: 2025-10-07

#### 구현 내용
- **Vite + React + TypeScript 프로젝트 생성**
  - `npm create vite@latest` 사용
  - React 18 + TypeScript 템플릿
  - 디렉토리: `01-todo-app/`

- **Tailwind CSS 설치 및 설정**
  - 패키지: `tailwindcss`, `postcss`, `autoprefixer`
  - `tailwind.config.js` 생성 (content path 설정)
  - `postcss.config.js` 생성
  - `src/index.css` - Tailwind directives 추가

- **Zustand 상태 관리 라이브러리 설치**
  - 패키지: `zustand`
  - Todo 상태 관리용으로 선택
  - Context API보다 간단하고 보일러플레이트 적음

- **Playwright 설치 및 설정**
  - 패키지: `@playwright/test`
  - `playwright.config.ts` 생성
  - 테스트 디렉토리: `tests/`
  - baseURL: `http://localhost:5173`
  - webServer 자동 실행 설정

#### 기술적 결정 사항

1. **상태 관리: Zustand 선택**
   - 이유: Context API보다 간단하고 성능이 좋음
   - LocalStorage 연동이 쉬움
   - 작은 프로젝트에 적합

2. **Tailwind CSS 사용**
   - 이유: 빠른 프로토타이핑
   - 유틸리티 클래스로 일관된 디자인
   - 반응형 디자인 쉬움

3. **Playwright 설정**
   - chromium만 사용 (개발 속도 향상)
   - webServer 자동 실행으로 편의성 증대

#### 파일 구조
```
01-todo-app/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css (Tailwind)
├── tests/
├── playwright.config.ts
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

#### 발생한 이슈 및 해결

**이슈 1**: Vite 프로젝트 생성 시 디렉토리가 비어있지 않음
- 원인: README.md 파일이 이미 존재
- 해결: temp-project 폴더에 생성 후 파일 이동

**이슈 2**: `npx tailwindcss init` 실행 오류
- 원인: npm exec 권한 문제
- 해결: 설정 파일 직접 생성

**이슈 3**: Playwright 브라우저 설치 타임아웃
- 원인: 브라우저 다운로드 시간 초과
- 해결: 설정 파일만 생성, 브라우저는 나중에 수동 설치 예정

---

## ✅ 완료된 작업 (계속)

### 2. Todo 앱 기능 구현 및 테스트 ✓

**완료 날짜**: 2025-10-07

#### 구현 내용

**기능 구현:**
- ✅ Todo 타입 정의 (`src/types/todo.ts`)
- ✅ LocalStorage 유틸리티 (`src/utils/storage.ts`)
- ✅ Zustand 스토어 (`src/store/useTodoStore.ts`)
- ✅ TodoInput 컴포넌트 - 할 일 추가
- ✅ TodoItem 컴포넌트 - 개별 항목 표시/완료/삭제
- ✅ TodoList 컴포넌트 - 목록 표시 및 필터링
- ✅ App.tsx 통합
- ✅ Tailwind CSS 스타일링

**Playwright 테스트 (8개 모두 통과):**
- ✅ 할 일 추가 테스트
- ✅ 빈 문자열 추가 방지 테스트
- ✅ 할 일 완료 처리 테스트
- ✅ 할 일 삭제 테스트
- ✅ 필터링 - 완료된 항목만 보기
- ✅ 필터링 - 진행중 항목만 보기
- ✅ LocalStorage 데이터 유지 테스트
- ✅ 통계 정보 표시 테스트

#### 기술적 결정 사항

1. **Type-only imports 사용**
   - 이유: Vite의 모듈 해석 문제 해결
   - `import { Todo }` → `import type { Todo }`
   - TypeScript type만 import할 때 명시적으로 표시

2. **Tailwind CSS v3 사용**
   - 이유: Tailwind v4의 PostCSS 플러그인 변경사항 때문
   - v4는 `@tailwindcss/postcss` 별도 패키지 필요
   - v3로 다운그레이드하여 안정성 확보

3. **Playwright webServer 설정**
   - `reuseExistingServer: true` - 기존 서버 재사용
   - `timeout: 120000` - 충분한 대기 시간
   - 개발 서버가 이미 실행 중일 때 활용

#### 발생한 이슈 및 해결

**이슈 1**: Tailwind CSS v4 PostCSS 오류
- 증상: `[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin`
- 원인: Tailwind v4에서 PostCSS 플러그인이 별도 패키지로 분리됨
- 해결: Tailwind CSS를 v3.4.0으로 다운그레이드

**이슈 2**: React 앱이 렌더링되지 않음 (#root가 비어있음)
- 증상: Playwright 테스트에서 `input[name="todo"]`를 찾을 수 없음
- 원인: TypeScript type export 관련 Vite 모듈 해석 오류
- 에러: `The requested module '/src/types/todo.ts' does not provide an export named 'Todo'`
- 해결: 모든 type import를 `import type { ... }`로 변경

**이슈 3**: Playwright 테스트 타임아웃
- 증상: 페이지 로드 후 요소를 찾지 못함
- 원인: React 앱 렌더링 실패로 DOM이 비어있음
- 해결: 근본 원인(이슈 2)을 해결하여 자동으로 해결됨

#### 파일 구조 (최종)
```
01-todo-app/
├── src/
│   ├── components/
│   │   ├── TodoInput.tsx       ✓
│   │   ├── TodoList.tsx        ✓
│   │   └── TodoItem.tsx        ✓
│   ├── store/
│   │   └── useTodoStore.ts     ✓
│   ├── types/
│   │   └── todo.ts             ✓
│   ├── utils/
│   │   └── storage.ts          ✓
│   ├── App.tsx                 ✓
│   ├── main.tsx
│   └── index.css               ✓
├── tests/
│   ├── todo.spec.ts            ✓ (8/8 통과)
│   └── simple.spec.ts          (진단용)
├── playwright.config.ts        ✓
├── tailwind.config.js          ✓
├── package.json
└── PROGRESS.md
```

---

## 🚧 현재 진행 중

**없음** - Todo 앱 기본 기능 완료

---

## 📍 다음 단계

### 1. README.md 체크리스트 업데이트
- [ ] 기능 구현 체크리스트 업데이트
- [ ] 테스트 작성 체크리스트 업데이트

### 2. 추가 기능 구현 (선택사항)
- [ ] 할 일 수정 기능
- [ ] 드래그 앤 드롭
- [ ] 다크 모드

---

## 💡 메모

- Playwright 브라우저 설치: `cd 01-todo-app && npx playwright install chromium`
- 개발 서버 실행: `npm run dev`
- 테스트 실행: `npx playwright test`

---

## 📦 설치된 패키지

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.15",
    "typescript": "~5.6.2",
    "vite": "^6.0.1"
  }
}
```
