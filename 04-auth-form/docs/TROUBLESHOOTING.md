# Auth Form 트러블슈팅 가이드

## 📋 개요

이 문서는 Auth Form App (Svelte 5 + Express + JWT) 개발 과정에서 마주한 모든 기술적 이슈와 해결 과정을 상세히 기록합니다.

**프로젝트**: 04-auth-form  
**프레임워크**: Svelte 5 + SvelteKit 2 + Express  
**인증**: JWT + bcrypt  
**개발 기간**: 2025-10-07  
**마주친 이슈 수**: 6개 (Critical: 3, Medium: 2, Minor: 1)

---

## 🔴 Critical Issues

### Issue #1: Svelte 4/5 버전 충돌

**심각도**: Critical  
**발생 시각**: 2025-10-07  
**소요 시간**: ~20분  
**영향 범위**: 프로젝트 초기 설정

#### 증상

SvelteKit 2와 Svelte 4 설치 시 peer dependency 에러:

```bash
$ npm install svelte@4 @sveltejs/kit@2

npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve
npm ERR! 
npm ERR! While resolving: @sveltejs/vite-plugin-svelte@6.2.1
npm ERR! Found: svelte@4.2.19
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer svelte@"^5.0.0" from @sveltejs/vite-plugin-svelte@6.2.1
```

#### 원인 분석

1. **SvelteKit 2 요구사항**
   - SvelteKit 2는 Svelte 5를 peer dependency로 요구
   - `@sveltejs/vite-plugin-svelte@6.x`도 Svelte 5 필요

2. **의도와 실제 버전 불일치**
   - 초기 계획: Svelte 4 + SvelteKit
   - 실제 설치: SvelteKit 2 → Svelte 5 필수

3. **Breaking Change**
   - Svelte 5는 major 버전 업그레이드
   - 새로운 runes API (`$state`, `$derived`, `$effect`)
   - 이전 문법과 일부 호환성 문제

#### 해결 방법

**Svelte 5로 업그레이드:**

```bash
# 정확한 버전 설치
npm install svelte@5 @sveltejs/kit@2

# Vite plugin도 호환 버전
npm install -D @sveltejs/vite-plugin-svelte@6
```

**Svelte 5 호환 코드 작성:**

```svelte
<script>
  // ✅ Svelte 5 호환 (기존 문법도 지원)
  let email = '';
  let password = '';
  let errorMessage = '';
  
  async function handleSubmit() {
    // ...
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input bind:value={email} />
  <input bind:value={password} type="password" />
  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}
</form>
```

**Svelte 5 Runes 사용 (선택적):**

```svelte
<script>
  // 새로운 runes API (Svelte 5)
  let email = $state('');
  let password = $state('');
  
  let isValid = $derived(email && password.length >= 8);
  
  $effect(() => {
    console.log('Email changed:', email);
  });
</script>
```

#### 대안: Svelte 4 유지 방법

SvelteKit 1 사용:

```bash
npm install svelte@4 @sveltejs/kit@1
npm install -D @sveltejs/vite-plugin-svelte@3
```

하지만 이 경우 최신 기능 사용 불가.

#### 학습 포인트

1. **Peer Dependency 이해**
   - `package.json`의 `peerDependencies` 확인 필수
   - 특히 major 버전 업그레이드 시 주의

2. **SvelteKit 버전 정책**
   - SvelteKit 2 = Svelte 5 필수
   - SvelteKit 1 = Svelte 4 호환

3. **버전 호환성 체크**
   ```bash
   # package.json의 peerDependencies 확인
   npm info @sveltejs/kit@2 peerDependencies
   
   # 출력:
   # { svelte: '^5.0.0' }
   ```

4. **Migration Guide 참고**
   - Svelte 4 → 5 마이그레이션 가이드 존재
   - Breaking changes 사전 확인 필요

#### 참고 자료

- [Svelte 5 Migration Guide](https://svelte-5-preview.vercel.app/docs/introduction)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [npm peer dependencies](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies)

---

### Issue #2: Express 쿠키 파싱 실패

**심각도**: Critical  
**발생 시각**: 2025-10-07  
**소요 시간**: ~25분  
**영향 범위**: JWT 인증 미들웨어

#### 증상

JWT 인증 미들웨어에서 토큰 추출 실패:

```javascript
// server/middleware/auth.js
const token = req.cookies['auth-token'];
console.log('Token:', token); // undefined

// 로그:
// Cookies object: {}
// Token: undefined
```

클라이언트는 정상적으로 쿠키 전송:

```http
Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 원인 분석

1. **cookie-parser 미들웨어 누락**
   - Express는 기본적으로 쿠키를 파싱하지 않음
   - `req.cookies`는 `cookie-parser` 미들웨어가 생성하는 객체
   - 미들웨어 없으면 `req.cookies`는 `undefined`

2. **원시 헤더만 접근 가능**
   ```javascript
   console.log(req.headers.cookie);
   // "auth-token=eyJhbGci...; session=abc123"
   // 파싱되지 않은 문자열
   ```

3. **의존성 설치 누락**
   - `package.json`에 `cookie-parser` 없음
   - 초기 설정에서 누락

#### 해결 방법

**방법 1**: cookie-parser 패키지 설치 (권장)

```bash
npm install cookie-parser
```

```javascript
// server/index.js
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser()); // ✅ 쿠키 파싱 미들웨어

// 이제 req.cookies 사용 가능
app.use('/api/auth', authRoutes);
```

**방법 2**: 수동 쿠키 파싱 미들웨어 (현재 프로젝트 적용)

```javascript
// server/index.js
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

// 이제 req.cookies['auth-token'] 접근 가능
```

**장단점 비교:**

| 방법 | 장점 | 단점 |
|------|------|------|
| cookie-parser | 안정적, 테스트됨, 추가 기능 | 의존성 추가 |
| 수동 파싱 | 의존성 없음, 가벼움 | signed cookies 미지원 |

**JWT 인증 미들웨어 (완성):**

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticateToken(req, res, next) {
  const token = req.cookies['auth-token']; // ✅ 정상 접근
  
  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { userId, email, iat, exp }
    next();
  } catch (error) {
    return res.status(403).json({ error: '유효하지 않은 토큰입니다' });
  }
}

module.exports = { authenticateToken };
```

#### 디버깅 과정

1. **원시 쿠키 헤더 확인**
   ```javascript
   console.log('Raw cookie header:', req.headers.cookie);
   // ✅ 쿠키가 전송되고 있음 확인
   ```

2. **req.cookies 타입 확인**
   ```javascript
   console.log('Type of req.cookies:', typeof req.cookies);
   // undefined → 파싱 미들웨어 없음 확인
   ```

3. **미들웨어 순서 확인**
   ```javascript
   app.use(express.json());
   app.use(cookieParserMiddleware); // ✅ 라우트 전에 위치
   app.use('/api/auth', authRoutes);
   ```

#### 학습 포인트

1. **Express 미들웨어 이해**
   - Express는 최소한의 기능만 내장
   - 쿠키, body 파싱은 미들웨어 필요
   - `req.body` → `express.json()` 필요
   - `req.cookies` → `cookie-parser` 필요

2. **미들웨어 실행 순서**
   ```javascript
   app.use(express.json());      // 1. body 파싱
   app.use(cookieParser());      // 2. 쿠키 파싱
   app.use('/api', apiRoutes);   // 3. 라우트
   ```

3. **쿠키 파싱 로직**
   ```javascript
   // "name1=value1; name2=value2; name3=value3"
   // → { name1: 'value1', name2: 'value2', name3: 'value3' }
   
   const cookies = {};
   req.headers.cookie.split(';').forEach(cookie => {
     const [name, value] = cookie.trim().split('=');
     cookies[name] = value;
   });
   ```

4. **Signed Cookies (보안 강화)**
   ```javascript
   // cookie-parser 사용 시
   app.use(cookieParser('secret-key'));
   
   // 쿠키 설정 시
   res.cookie('token', value, { signed: true });
   
   // 읽기
   const token = req.signedCookies.token;
   ```

#### 참고 자료

- [Express cookie-parser](https://expressjs.com/en/resources/middleware/cookie-parser.html)
- [MDN HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)

---

### Issue #3: Playwright 듀얼 서버 관리 문제

**심각도**: Critical  
**발생 시각**: 2025-10-07  
**소요 시간**: ~30분  
**영향 범위**: E2E 테스트 자동화

#### 증상

Playwright 테스트 실행 시 무한 대기:

```bash
$ npx playwright test

Running 6 tests using 1 worker
# 여기서 멈춤, 타임아웃 없이 무한 대기
```

브라우저 창은 열리지만 페이지 로드 실패:
```
Error: net::ERR_CONNECTION_REFUSED at http://localhost:5173
```

#### 원인 분석

1. **2개 서버 필요**
   - SvelteKit 개발 서버 (포트 5173) - Frontend
   - Express 백엔드 서버 (포트 3002) - API

2. **Playwright webServer 설정 한계**
   ```typescript
   // playwright.config.ts
   export default defineConfig({
     webServer: {
       command: 'npm run dev', // ❌ 하나의 서버만 시작 가능
       port: 5173,
     }
   });
   ```

3. **순차 실행 문제**
   ```bash
   # 이렇게 해도 첫 번째 서버만 시작되고 두 번째는 실행 안 됨
   command: 'npm run dev && node server/index.js'
   ```
   - `npm run dev`가 종료되지 않으므로 `&&` 이후 실행 안 됨

4. **백그라운드 실행 시도**
   ```bash
   command: 'npm run dev & node server/index.js'
   # bash subshell 문제, Playwright가 프로세스 관리 못함
   ```

#### 해결 방법

**방법 1**: 수동 서버 시작 (현재 적용)

테스트 실행 전 두 서버를 수동으로 시작:

```bash
# 터미널 1: Frontend
cd 04-auth-form
npm run dev

# 터미널 2: Backend
cd 04-auth-form
node server/index.js

# 터미널 3: Tests
cd 04-auth-form
npx playwright test
```

**방법 2**: 서버 시작 스크립트 작성

`start-servers.sh`:
```bash
#!/bin/bash

# Background에서 서버 시작
npm run dev &
FRONTEND_PID=$!

node server/index.js &
BACKEND_PID=$!

echo "Frontend PID: $FRONTEND_PID"
echo "Backend PID: $BACKEND_PID"

# 종료 시그널 처리
trap "kill $FRONTEND_PID $BACKEND_PID" EXIT

# 대기
wait
```

실행:
```bash
chmod +x start-servers.sh
./start-servers.sh
```

**방법 3**: concurrently 패키지 사용

```bash
npm install -D concurrently
```

`package.json`:
```json
{
  "scripts": {
    "dev": "vite dev",
    "server": "node server/index.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run server\"",
    "test": "playwright test"
  }
}
```

Playwright 설정:
```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev:all',
    port: 5173,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  }
});
```

**방법 4**: Docker Compose (프로덕션급)

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  frontend:
    build: .
    command: npm run dev
    ports:
      - "5173:5173"
  
  backend:
    build: .
    command: node server/index.js
    ports:
      - "3002:3002"
  
  tests:
    build: .
    command: npx playwright test
    depends_on:
      - frontend
      - backend
```

**방법 5**: 멀티 webServer (Playwright 실험적 기능)

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: [
    {
      command: 'npm run dev',
      port: 5173,
    },
    {
      command: 'node server/index.js',
      port: 3002,
    }
  ]
});
```

**참고**: Playwright 1.40+ 부터 webServer 배열 지원 (실험적)

#### 현재 프로젝트 적용 방법

**테스트 실행 가이드 문서화:**

`README.md` 추가:
```markdown
## 테스트 실행 방법

### 1. 서버 시작 (터미널 2개 필요)

터미널 1 - Frontend:
\`\`\`bash
npm run dev
\`\`\`

터미널 2 - Backend:
\`\`\`bash
node server/index.js
\`\`\`

### 2. 테스트 실행 (새 터미널)

\`\`\`bash
npx playwright test
\`\`\`

### 또는 start-servers.sh 사용

\`\`\`bash
./start-servers.sh
# 새 터미널에서
npx playwright test
\`\`\`
```

#### 학습 포인트

1. **Playwright webServer 한계**
   - 기본적으로 단일 서버만 지원
   - 멀티 서버는 실험적 기능 (최신 버전)

2. **프로세스 관리**
   - `&` 백그라운드 실행
   - `$!`로 PID 저장
   - `trap` 시그널 처리로 정리

3. **concurrently 패키지**
   - 여러 npm script 동시 실행
   - 색상 구분으로 로그 가독성
   - 하나 실패 시 전체 종료 옵션

4. **CI/CD 고려사항**
   ```typescript
   reuseExistingServer: !process.env.CI,
   // 로컬: 기존 서버 재사용
   // CI: 항상 새 서버 시작
   ```

#### 대안 비교

| 방법 | 장점 | 단점 | 추천도 |
|------|------|------|--------|
| 수동 시작 | 간단, 디버깅 용이 | 자동화 어려움 | ⭐⭐ (개발) |
| start-servers.sh | 스크립트화 | bash 의존 | ⭐⭐⭐ (개발) |
| concurrently | 크로스 플랫폼, npm 통합 | 의존성 추가 | ⭐⭐⭐⭐ (권장) |
| Docker Compose | 환경 격리, CI 적합 | 복잡도 증가 | ⭐⭐⭐⭐⭐ (프로덕션) |
| 멀티 webServer | 네이티브 지원 | 실험적 기능 | ⭐⭐⭐ (미래) |

#### 참고 자료

- [Playwright webServer](https://playwright.dev/docs/test-webserver)
- [concurrently npm](https://www.npmjs.com/package/concurrently)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🟡 Medium Issues

### Issue #4: CORS 설정 및 credentials 전달

**심각도**: Medium  
**발생 시각**: 2025-10-07  
**소요 시간**: ~15분  
**영향 범위**: Frontend-Backend 통신

#### 증상

SvelteKit에서 Express API 호출 시 CORS 에러:

```
Access to fetch at 'http://localhost:3002/api/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

쿠키가 전송되지 않음:
```javascript
// 로그인 후 프로필 요청
await fetch('http://localhost:3002/api/auth/profile');
// 서버: req.cookies['auth-token'] = undefined
```

#### 원인 분석

1. **CORS (Cross-Origin Resource Sharing)**
   - Frontend: `http://localhost:5173` (다른 포트)
   - Backend: `http://localhost:3002`
   - 브라우저가 보안상 차단

2. **credentials 옵션 누락**
   - 기본적으로 쿠키는 cross-origin 요청에 포함 안 됨
   - `credentials: 'include'` 명시 필요

3. **CORS 헤더 설정 불완전**
   ```javascript
   // ❌ 불완전한 CORS
   res.setHeader('Access-Control-Allow-Origin', '*');
   // credentials 사용 시 '*' 불가, 명시적 origin 필요
   ```

#### 해결 방법

**Backend CORS 설정 (Express):**

```javascript
// server/index.js
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // ✅ 명시적 origin
  credentials: true,                // ✅ 쿠키 허용
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
```

또는 수동 설정:
```javascript
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Preflight 처리
  }
  
  next();
});
```

**Frontend credentials 설정 (SvelteKit):**

```javascript
// 모든 API 호출에 credentials 포함
async function login(email, password) {
  const response = await fetch('http://localhost:3002/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // ✅ 쿠키 포함
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
}

async function getProfile() {
  const response = await fetch('http://localhost:3002/api/auth/profile', {
    credentials: 'include', // ✅ 쿠키 전송
  });
  
  return response.json();
}
```

**API 헬퍼 함수 (권장):**

```javascript
// src/lib/api.js
const API_BASE = 'http://localhost:3002/api';

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // ✅ 모든 요청에 자동 포함
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API 요청 실패');
  }
  
  return response.json();
}

// 사용
import { apiRequest } from '$lib/api';

const data = await apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});
```

#### 학습 포인트

1. **CORS 3가지 시나리오**
   - Same-origin: CORS 불필요
   - Cross-origin (no credentials): `Access-Control-Allow-Origin: *` 가능
   - Cross-origin (with credentials): 명시적 origin 필수

2. **Preflight Request**
   ```http
   OPTIONS /api/auth/login HTTP/1.1
   Origin: http://localhost:5173
   Access-Control-Request-Method: POST
   Access-Control-Request-Headers: Content-Type
   ```
   
   서버 응답:
   ```http
   HTTP/1.1 200 OK
   Access-Control-Allow-Origin: http://localhost:5173
   Access-Control-Allow-Methods: GET, POST, OPTIONS
   Access-Control-Allow-Headers: Content-Type
   Access-Control-Allow-Credentials: true
   ```

3. **credentials 모드**
   ```javascript
   credentials: 'omit'     // 쿠키 전송 안 함 (기본값, cross-origin)
   credentials: 'same-origin' // same-origin만 쿠키 전송
   credentials: 'include'  // 항상 쿠키 전송
   ```

4. **보안 고려사항**
   - Production에서는 명시적 origin 화이트리스트
   - `Access-Control-Allow-Origin: *` + `credentials: true` 불가능
   - HTTPS 환경에서 `secure: true` 쿠키 설정

#### 참고 자료

- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS middleware](https://expressjs.com/en/resources/middleware/cors.html)
- [Fetch credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)

---

### Issue #5: bcrypt 비밀번호 검증 타이밍

**심각도**: Medium  
**발생 시각**: 2025-10-07  
**소요 시간**: ~10분  
**영향 범위**: 보안, 로그인 성능

#### 증상

로그인 응답 시간이 매우 느림:

```bash
# 로그인 API 응답 시간
평균: 250ms ~ 400ms
```

사용자 조회는 빠름:
```javascript
const user = UserModel.findByEmail(email); // ~1ms
```

비밀번호 검증이 느림:
```javascript
const isValid = await bcrypt.compare(password, user.password_hash); // ~300ms
```

#### 원인 분석

1. **bcrypt의 의도적 느린 설계**
   - bcrypt는 brute-force 공격 방지를 위해 의도적으로 느림
   - Salt rounds: 10 = 2^10 = 1024번 해싱
   - 1번 검증에 약 300ms 소요

2. **Salt rounds와 성능 관계**
   ```javascript
   // Salt rounds 10: ~300ms
   // Salt rounds 12: ~1200ms
   // Salt rounds 14: ~5000ms
   ```

3. **보안 vs 성능 트레이드오프**
   - 높은 salt rounds = 안전하지만 느림
   - 낮은 salt rounds = 빠르지만 덜 안전

#### 해결 방법

**현재 설정 (권장):**

```javascript
// server/models/User.js
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10; // ✅ 권장값 (2025년 기준)

async hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password_hash);
}
```

**성능과 보안 균형:**

| Salt Rounds | 해싱 시간 | 보안 수준 | 권장 용도 |
|-------------|-----------|-----------|-----------|
| 8 | ~80ms | 낮음 | 개발 환경 |
| 10 | ~300ms | 적정 | 프로덕션 (권장) |
| 12 | ~1200ms | 높음 | 고보안 시스템 |
| 14 | ~5000ms | 매우 높음 | 극소수 요청 |

**타이밍 공격 방지:**

```javascript
async function login(req, res) {
  const { email, password } = req.body;
  
  const user = UserModel.findByEmail(email);
  
  if (!user) {
    // ⚠️ 타이밍 공격: 사용자 없으면 즉시 반환 (빠름)
    // bcrypt 검증 안 함 (느림)
    // → 공격자가 유효한 이메일 판별 가능
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
  }
  
  const isValid = await UserModel.verifyPassword(user, password);
  
  if (!isValid) {
    // bcrypt 검증 후 반환 (느림)
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
  }
  
  // 로그인 성공
}
```

**타이밍 공격 방지 개선:**

```javascript
async function login(req, res) {
  const { email, password } = req.body;
  
  const user = UserModel.findByEmail(email);
  
  let isValid = false;
  
  if (user) {
    isValid = await UserModel.verifyPassword(user, password);
  } else {
    // ✅ 사용자 없어도 bcrypt 실행 (타이밍 동일)
    await bcrypt.compare(password, '$2b$10$dummy.hash.string.for.timing');
  }
  
  if (!isValid) {
    // 항상 동일한 응답 시간
    return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
  }
  
  // 로그인 성공
}
```

**Rate Limiting 추가 (필수):**

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 최대 5회 시도
  message: '너무 많은 로그인 시도. 15분 후 다시 시도하세요',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // 로그인 로직
});
```

#### 학습 포인트

1. **bcrypt 성능 특성**
   - 의도적으로 느림 (보안 기능)
   - Salt rounds는 2의 지수
   - 매년 1 증가 권장 (하드웨어 성능 향상 고려)

2. **타이밍 공격 (Timing Attack)**
   - 응답 시간으로 정보 유출 방지
   - 사용자 존재 여부 판별 방지
   - 항상 일정한 응답 시간 유지

3. **보안 레이어**
   ```
   1. Rate Limiting (15분에 5회)
   2. bcrypt (느린 해싱)
   3. 타이밍 공격 방지
   4. HTTPS (네트워크 암호화)
   ```

#### 참고 자료

- [bcrypt npm](https://www.npmjs.com/package/bcrypt)
- [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Timing Attacks](https://en.wikipedia.org/wiki/Timing_attack)

---

## 🟢 Minor Issues

### Issue #6: Zod 에러 메시지 한글화

**심각도**: Minor  
**발생 시각**: 2025-10-07  
**소요 시간**: ~10분  
**영향 범위**: 사용자 경험

#### 증상

Zod 기본 에러 메시지가 영문으로 표시:

```javascript
const signupSchema = z.object({
  email: z.string().email(), // "Invalid email"
  password: z.string().min(8), // "String must contain at least 8 character(s)"
});
```

#### 원인 분석

Zod는 기본적으로 영문 에러 메시지 제공.

#### 해결 방법

**커스텀 에러 메시지:**

```typescript
// src/lib/utils/validation.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string()
    .min(1, '이메일을 입력하세요')
    .email('유효한 이메일을 입력하세요'),
  
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다'),
  
  confirmPassword: z.string()
    .min(1, '비밀번호 확인을 입력하세요')
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'] // 특정 필드에 에러 표시
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, '이메일을 입력하세요')
    .email('유효한 이메일을 입력하세요'),
  
  password: z.string()
    .min(1, '비밀번호를 입력하세요')
});
```

**사용 예시:**

```javascript
// src/routes/signup/+page.svelte
import { signupSchema } from '$lib/utils/validation';

async function handleSubmit() {
  try {
    const data = signupSchema.parse({
      email,
      password,
      confirmPassword
    });
    
    // 검증 통과, API 호출
    await signup(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errorMessage = error.errors[0].message; // ✅ 한글 메시지
    }
  }
}
```

#### 학습 포인트

Zod의 모든 검증 메서드에 커스텀 메시지 전달 가능:
```typescript
z.string().min(8, '커스텀 메시지')
z.string().email('커스텀 메시지')
z.string().regex(/pattern/, '커스텀 메시지')
```

#### 참고 자료

- [Zod Error Handling](https://zod.dev/ERROR_HANDLING)
- [Zod Custom Error Messages](https://zod.dev/?id=custom-error-messages)

---

## 📊 이슈 통계

| 심각도 | 개수 | 평균 해결 시간 | 총 소요 시간 |
|--------|------|----------------|--------------|
| Critical | 3 | 25분 | 75분 |
| Medium | 2 | 12.5분 | 25분 |
| Minor | 1 | 10분 | 10분 |
| **합계** | **6** | **18.3분** | **110분** |

---

## 🎯 핵심 학습 내용

### 1. JWT 인증 완전 플로우

**회원가입:**
```javascript
// 1. 비밀번호 해싱
const passwordHash = await bcrypt.hash(password, 10);

// 2. 사용자 생성
const user = UserModel.create({ email, passwordHash });
```

**로그인:**
```javascript
// 1. 사용자 조회
const user = UserModel.findByEmail(email);

// 2. 비밀번호 검증
const isValid = await bcrypt.compare(password, user.password_hash);

// 3. JWT 발급
const token = jwt.sign(
  { userId: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: '1h' }
);

// 4. httpOnly 쿠키 설정
res.cookie('auth-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 3600000
});
```

**인증 확인:**
```javascript
// 1. 쿠키에서 토큰 추출
const token = req.cookies['auth-token'];

// 2. JWT 검증
const decoded = jwt.verify(token, JWT_SECRET);

// 3. 사용자 정보 추가
req.user = decoded;
```

### 2. Svelte 5 + Express 통신 패턴

**API 호출 (credentials 포함):**
```javascript
const response = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ✅ 쿠키 포함
  body: JSON.stringify({ email, password })
});
```

**인증 페이지 가드:**
```javascript
import { onMount } from 'svelte';
import { goto } from '$app/navigation';

let user = null;

onMount(async () => {
  const response = await fetch('http://localhost:3002/api/auth/profile', {
    credentials: 'include'
  });
  
  if (!response.ok) {
    goto('/login'); // ✅ 인증 실패 시 리다이렉트
    return;
  }
  
  const data = await response.json();
  user = data.user;
});
```

### 3. Playwright 멀티 서버 테스트

**테스트 전 초기화:**
```typescript
test.beforeEach(async ({ page }) => {
  await page.goto('/signup');
});

test('full auth flow', async ({ page }) => {
  const email = `test-${Date.now()}@example.com`;
  
  // 회원가입
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'Password123!');
  await page.fill('[name="confirmPassword"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  // 로그인 페이지 리다이렉트 확인
  await expect(page).toHaveURL('/login');
  
  // 로그인
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  
  // 프로필 페이지 확인
  await expect(page).toHaveURL('/profile');
  await expect(page.locator('text=' + email)).toBeVisible();
});
```

---

## 🛡️ 예방 전략

### 개발 시작 전 체크리스트

- [ ] Peer dependencies 확인 (`npm info <package> peerDependencies`)
- [ ] 서버 포트 할당 (Frontend, Backend 분리)
- [ ] CORS 설정 계획 (origin, credentials)
- [ ] 환경 변수 설정 (JWT_SECRET, DATABASE_URL)
- [ ] Rate limiting 계획

### Svelte + Express 베스트 프랙티스

1. **버전 관리**
   - SvelteKit 2 = Svelte 5 필수
   - 명시적 버전 명시

2. **보안 설정**
   ```javascript
   // JWT Secret
   process.env.JWT_SECRET || 'fallback-secret';
   
   // httpOnly 쿠키
   res.cookie('token', value, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict'
   });
   
   // CORS
   cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   });
   ```

3. **에러 처리**
   - 일관된 에러 메시지
   - 타이밍 공격 방지
   - Rate limiting

### 테스트 전략

1. **듀얼 서버 관리**
   - `concurrently` 사용 권장
   - 또는 Docker Compose

2. **테스트 데이터**
   - 타임스탬프로 고유 이메일 생성
   - 각 테스트 독립성 보장

3. **인증 플로우 테스트**
   - 전체 플로우 (회원가입 → 로그인 → 인증)
   - 검증 실패 시나리오
   - 에러 메시지 확인

---

## 📚 참고 자료

### 공식 문서
- [Svelte 5 Documentation](https://svelte-5-preview.vercel.app/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Express Documentation](https://expressjs.com/)
- [JWT Documentation](https://jwt.io/)
- [Playwright Documentation](https://playwright.dev/)

### 보안
- [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [bcrypt Guide](https://github.com/kelektiv/node.bcrypt.js)

### 라이브러리
- [Zod Documentation](https://zod.dev/)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- [cookie-parser](https://expressjs.com/en/resources/middleware/cookie-parser.html)

---

## 🔄 회고

### 잘한 점

1. **완전한 인증 시스템**
   - JWT + bcrypt + httpOnly 쿠키
   - 타이밍 공격 방지 고려
   - CORS + credentials 정확한 설정

2. **체계적인 검증**
   - Zod 스키마로 타입 안전 검증
   - 한글 에러 메시지로 UX 개선
   - 다양한 검증 케이스 테스트

3. **프론트엔드-백엔드 분리**
   - Express 별도 서버로 실무 구조
   - 명확한 API 계층 분리
   - SQLite로 영속성 확보

### 개선할 점

1. **테스트 자동화**
   - concurrently로 듀얼 서버 자동화
   - CI/CD 파이프라인 고려

2. **환경 변수 관리**
   - `.env` 파일 활용
   - JWT_SECRET, DATABASE_PATH 등 관리

3. **에러 핸들링 일관성**
   - 전역 에러 핸들러
   - 에러 로깅

### 다음 프로젝트 적용 사항

1. **Chat App (Socket.IO)**
   - WebSocket 인증 패턴
   - JWT 토큰을 Socket handshake에 전달
   - 실시간 통신 에러 처리

2. **멀티 서버 자동화**
   - Docker Compose 적극 활용
   - 프로덕션급 설정

3. **보안 강화**
   - HTTPS 설정
   - Refresh Token 패턴
   - 소셜 로그인

---

**문서 작성일**: 2025-10-07  
**작성자**: Claude Code Assistant  
**프로젝트 버전**: 1.0.0
