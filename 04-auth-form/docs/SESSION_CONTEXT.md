# Auth Form - Session Context

**Purpose**: Provide complete context for new Claude sessions to continue the Auth Form project.

**Last Updated**: 2025-10-14

---

## Project Overview

**Goal**: Build a login and signup form with JWT authentication and Playwright E2E testing.

**Tech Stack**:
- Frontend: Svelte + SvelteKit
- Backend: Express + JWT
- Database: SQLite (development)
- Validation: Zod
- Testing: Playwright

**Project Status**: Complete

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

### Authentication Flow
1. **Signup**: Email + password with validation
2. **Login**: Email + password with JWT token
3. **Profile**: Protected page showing user info
4. **Logout**: Clear JWT cookie and redirect

### Validation Rules
- **Email**: Valid email format
- **Password**: 
  - Minimum 8 characters
  - Must contain letters (A-Za-z)
  - Must contain numbers (0-9)
  - Must contain special characters
- **Password Confirmation**: Must match password

### Security Features
- Password hashing with bcrypt
- JWT token stored in httpOnly cookie
- Token expiration (1 hour)
- XSS prevention via input sanitization
- Protected routes with authentication middleware

---

## File Structure

```
04-auth-form/
├── src/
│   ├── routes/
│   │   ├── +page.svelte          # Home
│   │   ├── signup/
│   │   │   └── +page.svelte      # Signup form
│   │   ├── login/
│   │   │   └── +page.svelte      # Login form
│   │   └── profile/
│   │       └── +page.svelte      # Protected profile page
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Input.svelte
│   │   │   └── Button.svelte
│   │   ├── stores/
│   │   │   └── auth.ts
│   │   └── utils/
│   │       └── validation.ts     # Zod schemas
├── server/
│   ├── index.js                   # Express server
│   ├── routes/
│   │   └── auth.js                # Auth routes
│   ├── middleware/
│   │   └── auth.js                # JWT verification
│   ├── models/
│   │   └── User.js                # User model
│   └── db/
│       └── database.sqlite        # SQLite database
├── tests/
│   └── auth.spec.ts
├── docs/
│   └── SESSION_CONTEXT.md
└── README.md
```

---

## Data Models

### User
```typescript
interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### JWT Payload
```typescript
interface JWTPayload {
  userId: number;
  email: string;
  iat: number;     // issued at
  exp: number;     // expires
}
```

---

## API Endpoints

### POST /api/auth/signup
Request:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response (201):
```json
{
  "message": "회원가입이 완료되었습니다",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Error (400):
```json
{
  "error": "이미 등록된 이메일입니다"
}
```

### POST /api/auth/login
Request:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response (200):
```json
{
  "message": "로그인 성공",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

Cookie: `auth-token` (httpOnly, Secure, SameSite=Strict)

Error (401):
```json
{
  "error": "이메일 또는 비밀번호가 올바르지 않습니다"
}
```

### GET /api/auth/profile
Headers: Cookie with auth-token

Response (200):
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

Error (401):
```json
{
  "error": "인증이 필요합니다"
}
```

### POST /api/auth/logout
Response (200):
```json
{
  "message": "로그아웃 되었습니다"
}
```

Cookie: Cleared auth-token

---

## Test Coverage

**Total Tests**: 6 (all passing)

1. Signup → Login → Profile flow
2. Password validation
3. Login failure with wrong password
4. Protected page access without auth
5. Logout
6. Cookie management

**Test File**: `tests/auth.spec.ts`

---

## Completed Phases

### Phase 1: Setup
- Created SvelteKit project
- Set up Express backend
- Installed dependencies (Zod, bcrypt, jsonwebtoken, SQLite)

### Phase 2: Backend API
- Created Express server with auth routes
- Implemented user signup with bcrypt hashing
- Implemented login with JWT generation
- Added authentication middleware
- Set up SQLite database

### Phase 3: Frontend Forms
- Built signup form with Zod validation
- Built login form
- Implemented client-side validation
- Added error message display

### Phase 4: Authentication Flow
- Implemented JWT cookie storage
- Created protected profile page
- Added logout functionality
- Implemented redirect logic

### Phase 5: Testing
- Created 6 Playwright E2E tests
- Verified complete auth flow
- Tested validation and error handling
- 100% test pass rate

---

## Troubleshooting History

### Issue 1: Zod Validation Error Handling (2025-10-14)

**Problem**:
- Console error: `Cannot read properties of undefined (reading 'forEach')`
- Occurred in signup and login pages when validation failed

**Cause**:
- Used `err.errors.forEach()` but Zod uses `err.issues` not `err.errors`
- Password "asdf" failed validation (too short, no special chars)

**Solution**:
```typescript
// Before (incorrect)
catch (err) {
  err.errors.forEach(error => {
    errors[error.path[0]] = error.message;
  });
}

// After (correct)
catch (err) {
  if (err.issues) {
    err.issues.forEach(issue => {
      errors[issue.path[0]] = issue.message;
    });
  } else {
    errors.general = '검증 오류가 발생했습니다';
  }
}
```

**Files Modified**:
- `src/routes/signup/+page.svelte`
- `src/routes/login/+page.svelte`

**Result**: Validation errors now display correctly without console errors.

---

## User Decisions

None recorded yet. Future decisions should be documented here.

---

## Running the Project

### Backend Server
```bash
cd 04-auth-form
node server/index.js
# Runs on http://localhost:3002
```

### Frontend Dev Server
```bash
cd 04-auth-form
npm install
npm run dev
# Runs on http://localhost:5173
```

### Testing
```bash
# Run both servers first, then:
npx playwright test
npx playwright show-report
```

---

## Environment Variables

`.env` file:
```env
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
DATABASE_PATH=./server/db/database.sqlite
```

---

## References

- SvelteKit Docs: https://kit.svelte.dev/
- Zod Documentation: https://zod.dev/
- JWT (jsonwebtoken): https://github.com/auth0/node-jsonwebtoken
- bcrypt: https://github.com/kelektiv/node.bcrypt.js
- Express: https://expressjs.com/

---

**Version**: 1.0.0  
**Status**: Production Ready
