# Chat App - 학습 회고

> **목적**: Socket.IO 실시간 통신 및 Playwright 멀티 컨텍스트 학습

## 📅 개발 기간
- 초기 설정: 2025-10-07
- 상태: 미완성 (기본 구조만 설정)

## 🎯 학습 목표
- Socket.IO 실시간 양방향 통신 구현
- Playwright 멀티 브라우저 컨텍스트 테스트
- WebSocket 기반 채팅 애플리케이션 구조 이해

## 🛠 기술 스택
- **Frontend**: React + TypeScript + Vite
- **실시간**: Socket.IO (Client + Server)
- **Backend**: Express + Socket.IO
- **테스트**: Playwright (멀티 브라우저 컨텍스트)

## 📦 프로젝트 상태
이 프로젝트는 시간 및 컨텍스트 제약으로 인해 **기본 구조만 설정**되었습니다.

### 완료된 작업
- ✅ package.json 초기화
- ✅ 의존성 설치 (React, Socket.IO, Express, Playwright)
- ✅ 프로젝트 디렉토리 구조 생성 (src, server, tests)
- ✅ README.md 복구

### 미완성 작업
- ⏸️ Socket.IO 서버 구현
- ⏸️ React 컴포넌트 (JoinForm, ChatRoom, MessageList 등)
- ⏸️ WebSocket 이벤트 핸들러
- ⏸️ Playwright 멀티 컨텍스트 테스트
- ⏸️ 타이핑 인디케이터
- ⏸️ 접속자 목록

## 🎓 학습 포인트 (README 기준)

### 핵심 Playwright 학습 내용
1. **멀티 브라우저 컨텍스트**
   ```typescript
   const context1 = await browser.newContext();
   const context2 = await browser.newContext();
   const user1 = await context1.newPage();
   const user2 = await context2.newPage();
   ```

2. **WebSocket 실시간 통신 테스트**
   - 사용자 1이 메시지 전송
   - 사용자 2 화면에서 메시지 수신 확인

3. **네트워크 상태 제어**
   ```typescript
   await context.setOffline(true);  // 오프라인
   await context.setOffline(false); // 재연결
   ```

4. **스크롤 위치 검증**
   ```typescript
   const scrollTop = await chatContainer.evaluate(el => el.scrollTop);
   const scrollHeight = await chatContainer.evaluate(el => el.scrollHeight);
   ```

## 💡 권장 구현 순서 (다음 세션용)

### 1단계: Socket.IO 서버 (`server/index.js`)
```javascript
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = require('http').createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

const users = new Map();

io.on('connection', (socket) => {
  socket.on('join', ({ nickname }) => {
    if (Array.from(users.values()).includes(nickname)) {
      socket.emit('error', { message: '이미 사용 중인 닉네임입니다' });
      return;
    }
    
    users.set(socket.id, nickname);
    socket.emit('joined', { user: { id: socket.id, nickname } });
    socket.broadcast.emit('user-joined', { nickname });
    io.emit('users-update', { users: Array.from(users.values()) });
  });

  socket.on('send-message', ({ content }) => {
    const nickname = users.get(socket.id);
    io.emit('new-message', {
      id: Date.now().toString(),
      type: 'user',
      sender: nickname,
      content,
      timestamp: Date.now()
    });
  });

  socket.on('disconnect', () => {
    const nickname = users.get(socket.id);
    users.delete(socket.id);
    socket.broadcast.emit('user-left', { nickname });
    io.emit('users-update', { users: Array.from(users.values()) });
  });
});

server.listen(3003, () => console.log('Socket.IO server on :3003'));
```

### 2단계: React App (`src/App.tsx`)
```typescript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3003');

function App() {
  const [nickname, setNickname] = useState('');
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on('joined', () => setJoined(true));
    socket.on('new-message', (msg) => setMessages(prev => [...prev, msg]));
    socket.on('users-update', ({ users }) => setUsers(users));
    
    return () => {
      socket.off('joined');
      socket.off('new-message');
      socket.off('users-update');
    };
  }, []);

  const handleJoin = () => {
    if (nickname.trim()) {
      socket.emit('join', { nickname });
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('send-message', { content: message });
      setMessage('');
    }
  };

  if (!joined) {
    return (
      <div>
        <input name="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
        <button onClick={handleJoin}>입장</button>
      </div>
    );
  }

  return (
    <div>
      <div className="user-list">
        {users.map(user => <div key={user}>{user}</div>)}
      </div>
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className="message">
            {msg.sender}: {msg.content}
          </div>
        ))}
      </div>
      <input name="message" value={message} onChange={e => setMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} />
      <button onClick={handleSend}>전송</button>
    </div>
  );
}

export default App;
```

### 3단계: Playwright 테스트 (`tests/chat.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('두 사용자 간 채팅', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const user1 = await context1.newPage();
  const user2 = await context2.newPage();
  
  await user1.goto('http://localhost:5173');
  await user1.fill('input[name="nickname"]', '철수');
  await user1.click('button:has-text("입장")');
  
  await user2.goto('http://localhost:5173');
  await user2.fill('input[name="nickname"]', '영희');
  await user2.click('button:has-text("입장")');
  
  await user1.fill('input[name="message"]', '안녕하세요!');
  await user1.press('input[name="message"]', 'Enter');
  
  await expect(user2.locator('.message').last()).toContainText('철수: 안녕하세요!');
  
  await context1.close();
  await context2.close();
});
```

## 📚 참고 자료
- [Socket.IO 공식 문서](https://socket.io/docs/v4/)
- [Playwright Browser Contexts](https://playwright.dev/docs/browser-contexts)
- [React + Socket.IO Tutorial](https://socket.io/get-started/chat)

## 🎯 다음 세션 작업 목록
1. server/index.js 작성 (Socket.IO 서버)
2. src/App.tsx 작성 (React 컴포넌트)
3. src/main.tsx, index.html, vite.config.ts 작성
4. tests/chat.spec.ts 작성
5. package.json 스크립트 추가
6. 서버 + 클라이언트 동시 실행 후 테스트
7. README 체크리스트 업데이트
8. 최종 커밋

## 💭 프로젝트 회고
이 프로젝트는 5개 프로젝트 중 가장 복잡한 프로젝트로, 실시간 양방향 통신과 멀티 브라우저 컨텍스트 테스트를 다룹니다. 시간 제약으로 인해 완성하지 못했지만, README.md에 상세한 구현 가이드가 있어 다음 세션에서 완성할 수 있습니다.
