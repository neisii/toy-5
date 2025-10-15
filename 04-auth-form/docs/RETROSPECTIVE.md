# Auth Form - 학습 회고

> **목적**: SvelteKit + Express 풀스택 인증 시스템 학습

## 📅 개발 기간
- 개발 완료: 2025-10-07 (1일)

## 🎯 학습 목표
- SvelteKit + Express 풀스택 구조 이해
- JWT 기반 인증 구현
- Zod를 활용한 폼 검증
- Playwright E2E 테스트 (인증 플로우)

## 🛠 기술 스택
- **Frontend**: Svelte 5 + SvelteKit 2
- **Backend**: Express + JWT + bcrypt
- **Database**: better-sqlite3
- **검증**: Zod
- **테스트**: Playwright

## 📦 구현된 기능

### 1. 프로젝트 초기 설정
- Svelte 5 + SvelteKit 2 수동 설치 (Svelte 4와 호환성 문제로 Svelte 5 사용)
- Express 백엔드 서버 별도 구성
- Better-sqlite3로 SQLite 데이터베이스 설정
- 프로젝트 구조: Frontend(5173) + Backend(3002)

### 2. 타입 정의 및 검증 스키마

#### 타입 정의 (`src/lib/types/auth.ts`)
```typescript
export type User = {
  id: number;
  email: string;
  createdAt: string;
};

export type SignupData = {
  email: string;
  password: string;
  confirmPassword: string;
};
```

#### Zod 검증 스키마 (`src/lib/utils/validation.ts`)
```typescript
export const signupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
});
```

### 3. Express 백엔드 서버

#### 사용자 모델 (`server/models/User.js`)
- **데이터베이스**: SQLite (better-sqlite3)
- **비밀번호 해싱**: bcrypt (salt rounds: 10)
- **테이블 구조**: id, email, password_hash, created_at, updated_at

#### 인증 라우트 (`server/routes/auth.js`)
1. **POST /api/auth/signup**: 회원가입
   - 이메일 중복 확인
   - 비밀번호 bcrypt 해싱
   - 사용자 생성

2. **POST /api/auth/login**: 로그인
   - 이메일/비밀번호 검증
   - JWT 토큰 발급 (1시간 유효)
   - httpOnly 쿠키로 토큰 저장

3. **GET /api/auth/profile**: 프로필 조회
   - JWT 토큰 검증 미들웨어
   - 사용자 정보 반환

4. **POST /api/auth/logout**: 로그아웃
   - 쿠키 삭제

#### 보안 설정
- **JWT Secret**: 환경 변수로 관리 (기본값: 'your-secret-key-change-in-production')
- **쿠키 옵션**: httpOnly, secure (production), sameSite: strict
- **CORS**: origin: 'http://localhost:5173', credentials: true

### 4. SvelteKit 프론트엔드

#### 회원가입 페이지 (`src/routes/signup/+page.svelte`)
- 이메일, 비밀번호, 비밀번호 확인 입력
- 클라이언트 검증 (Zod)
- 서버 요청 후 성공 시 로그인 페이지로 리다이렉트
- 에러 메시지 표시

#### 로그인 페이지 (`src/routes/login/+page.svelte`)
- 이메일, 비밀번호 입력
- credentials: 'include'로 쿠키 전송
- 성공 시 프로필 페이지로 리다이렉트

#### 프로필 페이지 (`src/routes/profile/+page.svelte`)
- onMount로 프로필 API 호출
- 인증 실패 시 로그인 페이지로 리다이렉트
- 사용자 이메일 및 가입일 표시
- 로그아웃 버튼

### 5. 스타일링 (`src/app.css`)
- 클린한 폼 디자인
- 에러/성공 메시지 스타일
- 반응형 컨테이너 (max-width: 400px)
- 포커스 상태 하이라이트

### 6. Playwright 테스트 (`tests/auth.spec.ts`)

#### 테스트 1: 회원가입 → 로그인 → 프로필 전체 플로우
- 타임스탬프로 고유 이메일 생성
- 회원가입 → 성공 메시지 → 로그인 페이지 리다이렉트
- 로그인 → 프로필 페이지 리다이렉트
- 이메일 표시 확인
- 로그아웃 → 로그인 페이지 리다이렉트

#### 테스트 2: 비밀번호 검증 - 짧은 비밀번호
- 3자 비밀번호 입력
- "비밀번호는 최소 8자 이상이어야 합니다" 에러 확인

#### 테스트 3: 비밀번호 검증 - 특수문자 없음
- "Password123" 입력 (특수문자 없음)
- "특수문자를 포함해야 합니다" 에러 확인

#### 테스트 4: 비밀번호 불일치
- password와 confirmPassword 다르게 입력
- "비밀번호가 일치하지 않습니다" 에러 확인

#### 테스트 5: 로그인 실패 - 잘못된 비밀번호
- 회원가입 후 잘못된 비밀번호로 로그인 시도
- "이메일 또는 비밀번호가 올바르지 않습니다" 에러 확인

#### 테스트 6: 중복 이메일 가입 방지
- 같은 이메일로 두 번 가입 시도
- "이미 등록된 이메일입니다" 에러 확인

## 🔧 기술적 결정사항

### 1. Svelte 5 사용
- SvelteKit 2가 Svelte 5를 요구
- Svelte 4 설치 시 peer dependency 충돌
- Svelte 5의 새로운 runes API 사용 가능

### 2. 백엔드 별도 서버
- SvelteKit의 서버 라우트 대신 Express 사용
- JWT 쿠키 관리의 명확한 분리
- 실무와 유사한 구조 (Frontend/Backend 분리)

### 3. Better-sqlite3 선택
- 동기식 API로 간단한 사용
- 외부 의존성 없음 (서버리스 배포 가능)
- 개발 환경에 적합

### 4. JWT httpOnly 쿠키
- XSS 공격 방지 (JavaScript 접근 불가)
- CSRF 방지를 위한 sameSite: strict
- 1시간 만료 시간

## 🐛 발생한 이슈 및 해결

### 이슈 1: Svelte 버전 충돌
**증상**: `npm install svelte@4 @sveltejs/kit@2` 실행 시 peer dependency 에러
```
Could not resolve dependency:
peer svelte@"^5.0.0" from @sveltejs/vite-plugin-svelte@6.2.1
```
**원인**: SvelteKit 2가 Svelte 5를 요구하는데 Svelte 4 설치 시도
**해결**: Svelte 5 설치
```bash
npm install svelte@5 @sveltejs/kit@2
```

### 이슈 2: 쿠키 파싱
**증상**: Express에서 req.cookies가 undefined
**원인**: cookie-parser 미들웨어 누락
**해결**: 수동 쿠키 파싱 미들웨어 작성
```javascript
app.use((req, res, next) => {
  const cookies = req.headers.cookie;
  req.cookies = {};
  if (cookies) {
    cookies.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      req.cookies[name] = value;
    });
  }
  next();
});
```

### 이슈 3: Playwright 테스트 타임아웃
**증상**: 테스트 실행 시 무한 대기
**원인**: 서버 2개(Express, SvelteKit)를 동시에 관리해야 함
**해결**: 
- start-servers.sh 스크립트 작성
- 수동으로 서버 시작 후 테스트 실행
- 테스트는 작성 완료되었으나 실행은 수동으로 진행

## 📝 학습 포인트

### 1. 폼 검증 테스트
- Zod 스키마로 클라이언트 검증
- 에러 메시지 UI 확인
- 다양한 검증 케이스 테스트

### 2. 인증 플로우
- JWT 토큰 발급 및 검증
- httpOnly 쿠키로 보안 강화
- 미들웨어 패턴

### 3. 쿠키 관리
- credentials: 'include'로 쿠키 전송
- CORS 설정 (origin, credentials)
- 쿠키 삭제 (로그아웃)

### 4. 페이지 리다이렉트
- SvelteKit의 goto() 함수
- onMount 훅에서 인증 확인
- 조건부 리다이렉트

## 🚀 다음 단계
- Playwright webServer 설정으로 자동 서버 관리
- 비밀번호 찾기 기능
- 이메일 인증
- 소셜 로그인 (OAuth)

## 📂 프로젝트 구조
```
04-auth-form/
├── src/
│   ├── routes/
│   │   ├── +page.svelte           # 홈 (리다이렉트)
│   │   ├── +layout.svelte         # 레이아웃
│   │   ├── signup/
│   │   │   └── +page.svelte       # 회원가입
│   │   ├── login/
│   │   │   └── +page.svelte       # 로그인
│   │   └── profile/
│   │       └── +page.svelte       # 프로필
│   ├── lib/
│   │   ├── types/
│   │   │   └── auth.ts            # 타입 정의
│   │   └── utils/
│   │       └── validation.ts      # Zod 스키마
│   ├── app.css                    # 글로벌 스타일
│   └── app.html                   # HTML 템플릿
├── server/
│   ├── index.js                   # Express 서버
│   ├── routes/
│   │   └── auth.js                # 인증 라우트
│   ├── middleware/
│   │   └── auth.js                # JWT 검증
│   ├── models/
│   │   └── User.js                # 사용자 모델
│   └── db/
│       └── database.sqlite        # SQLite DB
├── tests/
│   └── auth.spec.ts               # Playwright 테스트
├── svelte.config.js               # SvelteKit 설정
├── vite.config.js                 # Vite 설정
├── playwright.config.ts           # Playwright 설정
├── start-servers.sh               # 서버 시작 스크립트
└── package.json
```

## 💡 중요 코드 스니펫

### JWT 토큰 생성 및 쿠키 설정
```javascript
const token = jwt.sign(
  { userId: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '1h' }
);

res.cookie('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000
});
```

### Svelte에서 API 호출 (credentials 포함)
```javascript
const response = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password })
});
```

### 인증 확인 및 리다이렉트
```javascript
onMount(async () => {
  const response = await fetch('http://localhost:3002/api/auth/profile', {
    credentials: 'include'
  });

  if (!response.ok) {
    goto('/login');
    return;
  }

  const data = await response.json();
  user = data.user;
});
```

## 🎯 테스트 시나리오 요약
1. ✅ 회원가입 → 로그인 → 프로필 → 로그아웃 전체 플로우
2. ✅ 비밀번호 검증 (길이, 특수문자)
3. ✅ 비밀번호 불일치 검증
4. ✅ 로그인 실패 (잘못된 비밀번호)
5. ✅ 중복 이메일 가입 방지

**참고**: 테스트 코드는 완성되었으나, 서버 두 개를 동시에 관리하는 설정이 필요하여 수동 실행 필요
