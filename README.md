# Playwright 학습 프로젝트 모음

> AI-DLC (AI-Driven Development Life Cycle) 방법론으로 개발한 Playwright E2E 테스트 학습 프로젝트

## 📋 프로젝트 소개

이 저장소는 Playwright를 활용한 E2E 테스트 작성 능력을 향상시키기 위해 만든 학습 프로젝트 모음입니다. 각 프로젝트는 난이도별로 구성되어 있으며, 실제 서비스와 유사한 기능을 구현하면서 테스트 작성 패턴을 학습할 수 있습니다.

## 🎯 학습 목표

- Playwright E2E 테스트 작성 및 실행
- 다양한 프레임워크(React, Vue, Svelte, Next.js)에서의 테스트 경험
- UI 상태 관리 및 사용자 인터랙션 테스트
- API 모킹 및 네트워크 요청 테스트
- 인증 플로우 및 쿠키 관리 테스트
- 반응형 디자인 및 모바일 뷰 테스트

## 📚 프로젝트 목록

### ✅ [01-todo-app](./01-todo-app/README.md)
**난이도**: ⭐ 입문  
**기술 스택**: React + Vite  
**개발 기간**: 1일  
**테스트**: 8개 통과  
**스크린샷**: 6개

투두 리스트 애플리케이션으로 기본적인 CRUD 작업과 필터링 기능을 학습합니다.

**주요 학습 내용**:
- 기본 폼 입력 및 제출 테스트
- 목록 아이템 추가/삭제/완료 처리
- 필터링 기능 (전체/진행중/완료)
- LocalStorage 상태 관리

---

### ✅ [02-weather-app](./02-weather-app/README.md)
**난이도**: ⭐⭐ 초급  
**기술 스택**: Vue 3 + Vite  
**개발 기간**: 7일  
**테스트**: 85개 통과  
**스크린샷**: 2개

날씨 정보 조회 애플리케이션으로 API 통합 및 비동기 처리를 학습합니다.

**주요 학습 내용**:
- 외부 API 호출 및 응답 처리
- 로딩 상태 및 에러 처리
- 검색 기능 구현
- Mock vs Real API 모드 전환

---

### ✅ [03-shopping-mall](./03-shopping-mall/README.md)
**난이도**: ⭐⭐⭐ 중급  
**기술 스택**: Next.js 14 + TypeScript  
**개발 기간**: 4일  
**테스트**: 18개 통과  
**스크린샷**: 11개

쇼핑몰 애플리케이션으로 복잡한 상태 관리와 URL 기반 필터링을 학습합니다.

**주요 학습 내용**:
- 상품 목록 및 페이지네이션
- 검색 및 카테고리 필터링
- 장바구니 기능 (Zustand)
- URL 상태 관리 (searchParams)
- Toast 알림 시스템
- JSON Server API 모킹

---

### ✅ [04-auth-form](./04-auth-form/README.md)
**난이도**: ⭐⭐ 초중급  
**기술 스택**: Svelte + SvelteKit + Express  
**개발 기간**: 2-3일  
**테스트**: 6개 통과  
**스크린샷**: 9개

인증 시스템으로 로그인/회원가입 플로우와 JWT 인증을 학습합니다.

**주요 학습 내용**:
- 회원가입 폼 검증 (Zod)
- 로그인/로그아웃 플로우
- JWT 토큰 및 쿠키 관리
- 비밀번호 해싱 (bcrypt)
- 인증 필요 페이지 접근 제어
- 프로필 페이지 구현

---

### 🚧 [05-chat-app](./05-chat-app/README.md)
**난이도**: ⭐⭐⭐⭐ 고급  
**상태**: 미완성  
**기술 스택**: 미정

실시간 채팅 애플리케이션 (개발 예정)

---

## 📊 프로젝트 통계

| 프로젝트 | 난이도 | 프레임워크 | 개발기간 | 테스트 | 스크린샷 | 완성도 |
|---------|--------|-----------|---------|--------|---------|--------|
| 01-todo-app | ⭐ | React | 1일 | 8개 | 6개 | 100% |
| 02-weather-app | ⭐⭐ | Vue 3 | 7일 | 85개 | 2개 | 100% |
| 03-shopping-mall | ⭐⭐⭐ | Next.js 14 | 4일 | 18개 | 11개 | 90% |
| 04-auth-form | ⭐⭐ | SvelteKit | 2-3일 | 6개 | 9개 | 100% |
| 05-chat-app | ⭐⭐⭐⭐ | 미정 | - | - | - | 0% |

**총 테스트**: 117개  
**총 스크린샷**: 28개  
**총 개발 기간**: 14-15일

---

## 🛠 기술 스택

### Frontend
- **React** + Vite (01-todo-app)
- **Vue 3** + Vite (02-weather-app)
- **Next.js 14** + App Router (03-shopping-mall)
- **Svelte** + SvelteKit (04-auth-form)

### 상태 관리
- Zustand (03-shopping-mall)
- LocalStorage (01-todo-app)

### 스타일링
- Tailwind CSS (03-shopping-mall)
- CSS Modules (01-todo-app, 02-weather-app)
- Scoped CSS (04-auth-form)

### 테스트
- **Playwright** - E2E 테스트
- **Vitest** - 단위 테스트 (일부 프로젝트)

### Backend
- JSON Server (03-shopping-mall)
- Express + JWT (04-auth-form)
- SQLite (04-auth-form)

---

## 🚀 빠른 시작

각 프로젝트는 독립적으로 실행 가능합니다.

```bash
# 프로젝트 클론
git clone https://github.com/neisii/toy-5.git
cd toy-5

# 원하는 프로젝트로 이동
cd 01-todo-app

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# Playwright 테스트 실행
npx playwright test

# Playwright UI 모드
npx playwright test --ui
```

---

## 📖 학습 문서

각 프로젝트에는 다음과 같은 문서가 포함되어 있습니다:

- **README.md**: 프로젝트 개요 및 실행 방법
- **docs/PROGRESS.md**: Phase별 개발 진행 상황
- **docs/RETROSPECTIVE.md**: 학습 회고 및 재사용 패턴
- **docs/SESSION_CONTEXT.md**: Claude AI 세션용 컨텍스트

---

## 🎓 학습 방법 추천

1. **01-todo-app**부터 시작 (입문자용)
2. 각 프로젝트의 테스트 코드 읽기
3. 테스트를 실행하며 동작 확인
4. 기능 추가 및 테스트 작성 연습
5. 다음 난이도 프로젝트로 진행

---

## 🤝 기여 가이드

이 프로젝트는 개인 학습용이지만, 피드백이나 개선 제안은 환영합니다!

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📝 라이선스

MIT License

---

## 👤 작성자

**neisii**

이 프로젝트는 AI-DLC 방법론을 활용하여 Claude Code와 함께 개발되었습니다.

---

## 🔗 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [React 공식 문서](https://react.dev/)
- [Vue 3 공식 문서](https://vuejs.org/)
- [Next.js 공식 문서](https://nextjs.org/)
- [SvelteKit 공식 문서](https://kit.svelte.dev/)
