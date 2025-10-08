# Todo App 트러블슈팅 회고록

## 📋 개요
이 문서는 Todo App 개발 중 마주친 문제들과 해결 과정을 기록합니다.

---

## 🔥 주요 이슈

### 1. Tailwind CSS v4 PostCSS 플러그인 오류

**발생 일시**: 2025-10-07  
**심각도**: 🔴 Critical (프로젝트 빌드 불가)

#### 증상
```bash
[postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin. 
Official PostCSS plugin has been moved to a separate package.
```

#### 원인 분석
- Tailwind CSS v4에서 PostCSS 플러그인 아키텍처가 변경됨
- 기존: `tailwindcss` 패키지에 PostCSS 플러그인 포함
- v4: PostCSS 플러그인이 `@tailwindcss/postcss` 별도 패키지로 분리

#### 시도한 해결 방법들

**시도 1**: `@tailwindcss/postcss` 설치
```bash
npm install -D @tailwindcss/postcss
```
- 결과: 실패 (추가 설정 복잡도 증가)

**시도 2**: PostCSS 설정 수정
```javascript
// postcss.config.js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```
- 결과: 실패 (다른 의존성 충돌)

**최종 해결**: Tailwind CSS v3.4.0으로 다운그레이드
```bash
npm install -D tailwindcss@3.4.0
```
- 결과: ✅ 성공
- 이유: v3는 안정적이고 검증된 버전, 프로젝트 규모에 충분

#### 학습 포인트
- 🎯 **새 버전의 Breaking Change 주의**: 메이저 버전 업그레이드 시 문서 확인 필수
- 🎯 **프로젝트 규모 고려**: 작은 프로젝트에서는 안정 버전 사용이 유리
- 🎯 **의존성 버전 고정**: `package.json`에 정확한 버전 명시

#### 참고 자료
- [Tailwind CSS v4 Alpha 문서](https://tailwindcss.com/docs/upgrade-guide)
- [PostCSS Plugin 마이그레이션 가이드](https://tailwindcss.com/blog/tailwindcss-v4-alpha)

---

### 2. React 앱 렌더링 실패 - Type Import 이슈

**발생 일시**: 2025-10-07  
**심각도**: 🔴 Critical (앱 동작 불가)

#### 증상
1. 브라우저에서 `#root` div가 비어있음
2. Playwright 테스트 실패:
   ```
   Error: locator.fill: Timeout 30000ms exceeded.
   waiting for locator('input[name="todo"]')
   ```
3. 브라우저 콘솔 에러:
   ```javascript
   Uncaught SyntaxError: The requested module '/src/types/todo.ts' 
   does not provide an export named 'Todo'
   ```

#### 디버깅 과정

**1단계: 문제 확인**
- `simple.spec.ts` 생성하여 기본 페이지 로드 테스트
```typescript
test('페이지 로드 확인', async ({ page }) => {
  await page.goto('http://localhost:5173');
  const content = await page.content();
  console.log('Page HTML:', content);
});
```
- 결과: `#root`가 비어있음 확인

**2단계: 브라우저 콘솔 에러 캡처**
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', error => console.log('ERROR:', error));
```
- 결과: Type export 관련 모듈 에러 발견

**3단계: 원인 파악**
- `types/todo.ts` 파일의 export 구조는 정상:
  ```typescript
  export type Todo = { ... }
  export type FilterType = 'all' | 'active' | 'completed';
  ```
- 하지만 다른 파일들에서 일반 import 사용:
  ```typescript
  import { Todo } from '../types/todo';  // ❌ 문제
  ```

#### 원인 분석
- **Vite의 모듈 해석 방식**과 **TypeScript type-only exports** 충돌
- TypeScript는 type과 value를 구분하지만, Vite의 ESM 변환 과정에서 혼동 발생
- `export type`으로 선언된 것을 일반 import로 가져올 때 런타임 에러 발생

#### 해결 방법
모든 type import를 **type-only import**로 변경:

```typescript
// ❌ Before
import { Todo, FilterType } from '../types/todo';

// ✅ After
import type { Todo, FilterType } from '../types/todo';
```

**수정한 파일들:**
1. `src/utils/storage.ts`
2. `src/components/TodoItem.tsx`
3. `src/components/TodoList.tsx`
4. `src/store/useTodoStore.ts`

**추가 조치:**
```bash
# Vite 캐시 삭제 (혹시 모를 캐싱 이슈 해결)
rm -rf node_modules/.vite
npm run dev
```

#### 테스트 결과
- ✅ React 앱 정상 렌더링
- ✅ Playwright 테스트 8개 모두 통과 (2.9초)
- ✅ LocalStorage 연동 정상 동작

#### 학습 포인트
- 🎯 **Type-only imports의 중요성**: TypeScript와 번들러 간 명확한 구분 필요
- 🎯 **디버깅 도구 활용**: 
  - Playwright의 `page.on('console')` 이벤트
  - `page.on('pageerror')` 이벤트
  - 브라우저 개발자 도구
- 🎯 **캐시 문제 의심**: 모듈 관련 이슈는 빌드 캐시 삭제 시도
- 🎯 **단계적 디버깅**: 
  1. 최소 재현 코드 작성 (simple.spec.ts)
  2. 에러 메시지 수집
  3. 원인 가설 수립
  4. 해결책 적용
  5. 검증

#### 참고 자료
- [TypeScript: Type-Only Imports and Export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export)
- [Vite: TypeScript Configuration](https://vitejs.dev/guide/features.html#typescript)
- [Stack Overflow: Module does not provide an export](https://stackoverflow.com/questions/tagged/vite+typescript)

---

### 3. Playwright 테스트 타임아웃

**발생 일시**: 2025-10-07  
**심각도**: 🟡 Medium (이슈 2의 부수적 증상)

#### 증상
```
Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for locator('input[name="todo"]')
```

#### 원인
- 근본 원인: 이슈 2 (React 앱 렌더링 실패)
- DOM이 렌더링되지 않아 요소를 찾을 수 없음

#### 해결
- 이슈 2 해결 후 자동으로 해결됨
- 추가 설정 불필요

#### 학습 포인트
- 🎯 **근본 원인 파악**: 테스트 실패는 증상일 뿐, 앱 동작 확인이 우선
- 🎯 **의존성 이해**: 테스트 실패 → 앱 렌더링 확인 → 콘솔 에러 확인

---

## 🛠 기타 마이너 이슈

### 4. Vite 프로젝트 생성 시 디렉토리 충돌

**증상**: 
```bash
Error: Target directory is not empty
```

**원인**: 
- `01-todo-app/` 디렉토리에 `README.md` 파일이 이미 존재

**해결**:
1. 임시 디렉토리에 프로젝트 생성
2. 파일 이동
3. 기존 README.md와 병합

**학습 포인트**:
- 🎯 **디렉토리 정리**: 프로젝트 생성 전 대상 디렉토리 비우기
- 🎯 **대안 방법**: `--force` 옵션 사용 가능하나 기존 파일 손실 위험

---

### 5. npm exec 권한 문제

**증상**:
```bash
npm error could not determine executable to run
```

**원인**:
- `npx tailwindcss init` 실행 시 권한 문제

**해결**:
- 설정 파일을 직접 생성
- `tailwind.config.js`, `postcss.config.js` 수동 작성

**학습 포인트**:
- 🎯 **Manual Fallback**: CLI 도구 실패 시 수동 설정도 고려
- 🎯 **권한 이해**: npm/npx 실행 권한 확인

---

## 📊 통계

### 이슈 요약
- 총 이슈: 5개
- Critical: 2개 (Tailwind v4, Type Import)
- Medium: 1개 (테스트 타임아웃)
- Minor: 2개 (디렉토리 충돌, 권한)

### 해결 시간
- Tailwind v4 이슈: ~10분
- Type Import 이슈: ~30분 (디버깅 포함)
- 기타: ~5분

### 학습된 패턴
1. 버전 관리 신중히
2. Type import 명시적으로
3. 단계적 디버깅 프로세스
4. 캐시 문제 항상 고려

---

## 🎯 베스트 프랙티스

### 1. 의존성 관리
```json
{
  "devDependencies": {
    "tailwindcss": "3.4.0",  // 정확한 버전 명시
    "@playwright/test": "^1.49.1"
  }
}
```

### 2. Type Import
```typescript
// ✅ Good: 명시적 type import
import type { Todo } from './types';

// ❌ Bad: 암묵적 import (런타임 에러 가능)
import { Todo } from './types';
```

### 3. 디버깅 설정
```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry',  // 실패 시 trace 저장
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}
```

### 4. 에러 캡처
```typescript
page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', error => console.log('PAGE ERROR:', error));
```

---

## 🔮 향후 예방책

1. **새 프로젝트 시작 시 체크리스트**
   - [ ] 의존성 버전 문서 확인
   - [ ] Breaking changes 검토
   - [ ] Type import 패턴 통일
   - [ ] 에러 모니터링 설정

2. **코드 리뷰 포인트**
   - [ ] Type import 사용 확인
   - [ ] 의존성 버전 정확성
   - [ ] 에러 핸들링 존재 여부

3. **테스트 전략**
   - [ ] 기본 렌더링 테스트 먼저
   - [ ] 콘솔 에러 모니터링
   - [ ] 단계적 기능 추가

---

## 📚 참고 자료

### 공식 문서
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Playwright](https://playwright.dev/)

### 유용한 링크
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

---

## 💭 회고

이 프로젝트를 통해 배운 가장 중요한 교훈:

1. **문제의 근본 원인을 파악하라**
   - 테스트 실패 → 앱 렌더링 확인 → 콘솔 에러 → Type Import 이슈

2. **도구를 신뢰하되 검증하라**
   - Tailwind v4의 새 기능보다 v3의 안정성 선택

3. **명시적 코드가 암묵적 코드보다 낫다**
   - `import type`의 명시성이 런타임 에러 예방

4. **디버깅 도구에 투자하라**
   - Playwright의 `page.on` 이벤트가 핵심 단서 제공

---

**작성자**: Claude  
**최종 수정**: 2025-10-07
