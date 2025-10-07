# 프로젝트 5: 실시간 채팅 앱

## 📋 프로젝트 개요

**난이도**: ⭐⭐⭐⭐ 고급  
**개발 시간**: 5-7일  
**Playwright 학습 효과**: ⭐⭐⭐⭐⭐  
**실무 유사도**: ⭐⭐⭐⭐

## 🎯 학습 목표

이 프로젝트를 통해 다음을 학습합니다:
- WebSocket 실시간 통신
- 멀티 브라우저 컨텍스트
- 네트워크 상태 제어 (offline)
- 스크롤 위치 검증

## 🛠 기술 스택

- **Frontend**: React + TypeScript
- **실시간**: Socket.IO
- **Backend**: Express + Socket.IO
- **스타일링**: Styled Components

## ✨ 주요 기능 요구사항

### 1. 닉네임 설정 및 입장

#### 입장 화면
- 닉네임 입력 필드
- 닉네임 규칙:
  - 2-10자 제한
  - 한글, 영문, 숫자만 허용
  - 중복 닉네임 불가
- "입장하기" 버튼
- 입장 시 채팅방으로 이동

#### 서버 검증
- 닉네임 유효성 검사
- 중복 닉네임 확인
- 입장 시 모든 사용자에게 알림

### 2. 메시지 전송/수신 (실시간)

#### 메시지 입력
- 입력 필드 (하단 고정)
- Enter 키로 전송
- Shift + Enter로 줄바꿈
- 빈 메시지 전송 불가
- 최대 500자 제한

#### 메시지 표시
- **본인 메시지**: 오른쪽 정렬, 파란색
- **타인 메시지**: 왼쪽 정렬, 회색
- **시스템 메시지**: 중앙 정렬, 연한 회색
- 닉네임 + 메시지 + 시간

#### 메시지 타입
```typescript
interface Message {
  id: string;
  type: 'user' | 'system';
  sender: string;
  content: string;
  timestamp: number;
}
```

### 3. 접속 사용자 목록

#### 표시 정보
- 현재 접속 중인 사용자 목록
- 총 사용자 수
- 사용자 아이콘/아바타 (선택사항)
- 온라인 상태 표시 (🟢)

#### 실시간 업데이트
- 사용자 입장 시 목록 추가
- 사용자 퇴장 시 목록 제거
- WebSocket 이벤트로 동기화

### 4. 타이핑 인디케이터

#### 기능
- 사용자가 입력 중일 때 표시
- "홍길동님이 입력 중..." 메시지
- 3초 동안 입력 없으면 자동 사라짐
- 여러 사용자 동시 입력 지원

#### 이벤트
```typescript
socket.emit('typing', { user: 'nickname' });
socket.emit('stop-typing', { user: 'nickname' });
```

### 5. 메시지 타임스탬프

#### 표시 형식
- **오늘**: "오후 3:45"
- **어제**: "어제 오후 3:45"
- **그 외**: "2025-01-15 오후 3:45"

#### 그룹화
- 같은 날짜 메시지 그룹화
- 날짜 구분선 표시

## 🎨 UI/UX 요구사항

### 입장 화면
```
┌──────────────────────────────────┐
│  💬 채팅방                        │
├──────────────────────────────────┤
│                                  │
│  닉네임을 입력하세요              │
│  [................]               │
│                                  │
│  [    입장하기    ]              │
│                                  │
└──────────────────────────────────┘
```

### 채팅방 화면
```
┌──────────────────────────────────────────┐
│  💬 채팅방                    [사용자 3명]│
├────────────────────┬─────────────────────┤
│  [시스템 메시지]    │ 👥 접속 중          │
│  철수님이 입장     │  🟢 철수            │
│                    │  🟢 영희            │
│  철수               │  🟢 민수            │
│  안녕하세요!        │                     │
│  14:30             │                     │
│                    │                     │
│           영희      │                     │
│      반가워요!      │                     │
│           14:31    │                     │
│                    │                     │
│  민수가 입력 중...  │                     │
├────────────────────┴─────────────────────┤
│  [메시지 입력......................]  [전송]│
└──────────────────────────────────────────┘
```

## 🔧 Socket.IO 이벤트

### 클라이언트 → 서버

```typescript
// 입장
socket.emit('join', { nickname: 'string' });

// 메시지 전송
socket.emit('send-message', { content: 'string' });

// 타이핑 시작
socket.emit('typing');

// 타이핑 종료
socket.emit('stop-typing');

// 퇴장
socket.emit('leave');
```

### 서버 → 클라이언트

```typescript
// 입장 성공
socket.on('joined', { user: User, users: User[] });

// 새 사용자 입장
socket.on('user-joined', { user: User });

// 사용자 퇴장
socket.on('user-left', { user: User });

// 메시지 수신
socket.on('new-message', { message: Message });

// 타이핑 중
socket.on('user-typing', { user: string });

// 타이핑 종료
socket.on('user-stop-typing', { user: string });

// 사용자 목록 업데이트
socket.on('users-update', { users: User[] });

// 에러
socket.on('error', { message: string });
```

## 🧪 Playwright 테스트 시나리오

### 1. 두 사용자 간 채팅
```typescript
test('두 사용자 간 채팅', async ({ browser }) => {
  // 두 개의 독립적인 브라우저 컨텍스트 생성
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const user1 = await context1.newPage();
  const user2 = await context2.newPage();
  
  // 사용자 1 입장
  await user1.goto('http://localhost:3000');
  await user1.fill('input[name="nickname"]', '철수');
  await user1.click('button:has-text("입장")');
  
  // 사용자 2 입장
  await user2.goto('http://localhost:3000');
  await user2.fill('input[name="nickname"]', '영희');
  await user2.click('button:has-text("입장")');
  
  // 사용자 1 화면에서 영희 입장 알림 확인
  await expect(user1.locator('.system-message'))
    .toHaveText('영희님이 입장하셨습니다');
  
  // 사용자 목록 확인
  await expect(user1.locator('.user-list')).toContainText(['철수', '영희']);
  await expect(user2.locator('.user-list')).toContainText(['철수', '영희']);
  
  // 철수가 메시지 전송
  await user1.fill('input[name="message"]', '안녕하세요!');
  await user1.press('input[name="message"]', 'Enter');
  
  // 영희 화면에 메시지 표시
  await expect(user2.locator('.message').last())
    .toContainText('철수: 안녕하세요!');
  
  // 영희가 답장
  await user2.fill('input[name="message"]', '반가워요!');
  await user2.press('input[name="message"]', 'Enter');
  
  // 철수 화면에 답장 표시
  await expect(user1.locator('.message').last())
    .toContainText('영희: 반가워요!');
  
  await context1.close();
  await context2.close();
});
```

### 2. 타이핑 인디케이터
```typescript
test('타이핑 인디케이터', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const user1 = await context1.newPage();
  const user2 = await context2.newPage();
  
  // 입장
  await user1.goto('http://localhost:3000');
  await user1.fill('input[name="nickname"]', '민수');
  await user1.click('button:has-text("입장")');
  
  await user2.goto('http://localhost:3000');
  await user2.fill('input[name="nickname"]', '지영');
  await user2.click('button:has-text("입장")');
  
  // 민수가 타이핑 시작
  await user1.fill('input[name="message"]', 'ㅎㅇ');
  
  // 지영 화면에 타이핑 표시
  await expect(user2.locator('.typing-indicator'))
    .toHaveText('민수님이 입력 중...');
  
  // 메시지 전송
  await user1.press('input[name="message"]', 'Enter');
  
  // 타이핑 표시 사라짐
  await expect(user2.locator('.typing-indicator')).not.toBeVisible();
  
  await context1.close();
  await context2.close();
});
```

### 3. 메시지 스크롤 자동화
```typescript
test('메시지 스크롤 자동화', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="nickname"]', '테스터');
  await page.click('button:has-text("입장")');
  
  // 많은 메시지 전송
  for (let i = 1; i <= 50; i++) {
    await page.fill('input[name="message"]', `메시지 ${i}`);
    await page.press('input[name="message"]', 'Enter');
    await page.waitForTimeout(50);
  }
  
  // 채팅창이 자동으로 맨 아래로 스크롤되었는지 확인
  const chatContainer = page.locator('.chat-messages');
  const scrollTop = await chatContainer.evaluate(el => el.scrollTop);
  const scrollHeight = await chatContainer.evaluate(el => el.scrollHeight);
  const clientHeight = await chatContainer.evaluate(el => el.clientHeight);
  
  // 맨 아래에 있음 (오차 범위 10px)
  expect(scrollTop + clientHeight).toBeGreaterThan(scrollHeight - 10);
});
```

### 4. 연결 끊김 처리
```typescript
test('연결 끊김 처리', async ({ page, context }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="nickname"]', '홍길동');
  await page.click('button:has-text("입장")');
  
  // 네트워크 오프라인
  await context.setOffline(true);
  
  // 연결 끊김 메시지 표시
  await expect(page.locator('.connection-status'))
    .toHaveText('연결이 끊겼습니다');
  
  // 메시지 전송 버튼 비활성화
  await expect(page.locator('button[type="submit"]')).toBeDisabled();
  
  // 네트워크 복구
  await context.setOffline(false);
  await page.waitForTimeout(1000);
  
  // 재연결 메시지
  await expect(page.locator('.connection-status'))
    .toHaveText('다시 연결되었습니다');
});
```

### 5. 닉네임 중복 확인
```typescript
test('닉네임 중복 확인', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const user1 = await context1.newPage();
  const user2 = await context2.newPage();
  
  // 사용자 1 입장
  await user1.goto('http://localhost:3000');
  await user1.fill('input[name="nickname"]', '철수');
  await user1.click('button:has-text("입장")');
  
  // 사용자 2 동일한 닉네임으로 입장 시도
  await user2.goto('http://localhost:3000');
  await user2.fill('input[name="nickname"]', '철수');
  await user2.click('button:has-text("입장")');
  
  // 에러 메시지 확인
  await expect(user2.locator('.error'))
    .toHaveText('이미 사용 중인 닉네임입니다');
  
  await context1.close();
  await context2.close();
});
```

## 📁 프로젝트 구조

```
05-chat-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinForm.tsx         # 입장 폼
│   │   │   ├── ChatRoom.tsx         # 채팅방
│   │   │   ├── MessageList.tsx      # 메시지 목록
│   │   │   ├── MessageItem.tsx      # 개별 메시지
│   │   │   ├── MessageInput.tsx     # 메시지 입력
│   │   │   ├── UserList.tsx         # 사용자 목록
│   │   │   ├── TypingIndicator.tsx  # 타이핑 표시
│   │   │   └── ConnectionStatus.tsx # 연결 상태
│   │   ├── hooks/
│   │   │   └── useSocket.ts         # Socket.IO 훅
│   │   ├── types/
│   │   │   └── chat.ts              # 타입 정의
│   │   ├── utils/
│   │   │   ├── format.ts            # 날짜/시간 포맷
│   │   │   └── validation.ts        # 닉네임 검증
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts                 # Express + Socket.IO
│   │   ├── handlers/
│   │   │   └── chatHandler.ts       # 채팅 이벤트 핸들러
│   │   ├── models/
│   │   │   ├── User.ts              # 사용자 모델
│   │   │   └── Message.ts           # 메시지 모델
│   │   └── utils/
│   │       └── validation.ts        # 서버 검증
│   └── package.json
├── tests/
│   ├── chat.spec.ts
│   ├── typing.spec.ts
│   └── connection.spec.ts
├── playwright.config.ts
└── README.md
```

## 📊 데이터 모델

### User 타입
```typescript
interface User {
  id: string;          // Socket ID
  nickname: string;
  joinedAt: number;
}
```

### Message 타입
```typescript
interface Message {
  id: string;
  type: 'user' | 'system';
  sender: string;
  content: string;
  timestamp: number;
}
```

### TypingUser 타입
```typescript
interface TypingUser {
  nickname: string;
  timestamp: number;
}
```

## 🚀 시작하기

### 1. 프로젝트 생성

**Client:**
```bash
npm create vite@latest client -- --template react-ts
cd client
npm install
```

**Server:**
```bash
mkdir server
cd server
npm init -y
```

### 2. 의존성 설치

**Client:**
```bash
npm install socket.io-client styled-components
npm install -D @types/styled-components
```

**Server:**
```bash
npm install express socket.io cors
npm install -D @types/express @types/cors typescript ts-node
```

**Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

### 3. 서버 실행

**터미널 1 (서버):**
```bash
cd server
npm run dev  # ts-node src/index.ts
```

**터미널 2 (클라이언트):**
```bash
cd client
npm run dev
```

### 4. 테스트 실행
```bash
npx playwright test
```

## ✅ 완료 체크리스트

> ⚠️ **프로젝트 상태**: 기본 구조만 설정됨 (시간 및 컨텍스트 제약)
> 
> 완성을 위한 상세 가이드는 `PROGRESS.md` 참조

### 기능 구현
- [x] 프로젝트 구조 생성
- [x] 의존성 설치 (React, Socket.IO, Express, Playwright)
- [ ] 닉네임 설정 및 입장
- [ ] 실시간 메시지 전송/수신
- [ ] 접속 사용자 목록
- [ ] 타이핑 인디케이터
- [ ] 메시지 타임스탬프
- [ ] 시스템 메시지 (입장/퇴장)
- [ ] 자동 스크롤
- [ ] 연결 상태 표시

### 테스트 작성
- [ ] 두 사용자 채팅 테스트
- [ ] 타이핑 인디케이터 테스트
- [ ] 스크롤 자동화 테스트
- [ ] 연결 끊김 처리 테스트
- [ ] 닉네임 중복 확인 테스트
- [ ] 멀티 브라우저 컨텍스트 테스트

### UI/UX
- [ ] 반응형 디자인
- [ ] 메시지 그룹화
- [ ] 날짜 구분선
- [ ] 로딩 상태 표시

## 💡 추가 개선 아이디어

### 기본
- [ ] 이모지 선택기
- [ ] 파일 전송 (이미지, 문서)
- [ ] 메시지 삭제/수정

### 중급
- [ ] 다중 채팅방
- [ ] 1:1 DM (Direct Message)
- [ ] 메시지 검색
- [ ] 알림 (소리, 데스크톱)

### 고급
- [ ] 음성/영상 채팅 (WebRTC)
- [ ] 메시지 암호화
- [ ] 메시지 DB 저장 (MongoDB)
- [ ] 읽음 확인
- [ ] 답장 기능

## 🐛 디버깅 팁

### Socket.IO 연결 문제
```typescript
// 클라이언트
const socket = io('http://localhost:3001', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### CORS 설정
```typescript
// 서버
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});
```

## 📚 참고 자료

- [Socket.IO 공식 문서](https://socket.io/docs/v4/)
- [React 공식 문서](https://react.dev/)
- [Styled Components 문서](https://styled-components.com/)
- [Playwright 멀티 컨텍스트](https://playwright.dev/docs/browser-contexts)
