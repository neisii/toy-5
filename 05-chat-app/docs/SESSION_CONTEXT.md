# Chat App - Session Context

**Purpose**: Provide complete context for new Claude sessions to continue the Chat App project.

**Last Updated**: 2025-10-14

---

## Project Overview

**Goal**: Build a real-time chat application with WebSocket and Playwright multi-context testing.

**Tech Stack**:
- Frontend: React + TypeScript
- Real-time: Socket.IO
- Backend: Express + Socket.IO
- Styling: Styled Components
- Testing: Playwright (multi-browser contexts)

**Project Status**: Basic structure only (0% complete)

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

## Planned Features

### Core Features (Not Implemented)
1. **Nickname Entry**: Set nickname before joining
2. **Real-time Messaging**: Send and receive messages via WebSocket
3. **User List**: Show currently connected users
4. **Typing Indicator**: Display when users are typing
5. **System Messages**: Join/leave notifications
6. **Message Timestamps**: Display message time

### Advanced Features (Future)
7. **Message History**: Scroll to load older messages
8. **Emoji Picker**: Select and send emojis
9. **File Upload**: Send images and documents
10. **Multiple Rooms**: Create and join different chat rooms
11. **Private Messages**: 1:1 direct messaging

---

## File Structure

```
05-chat-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinForm.tsx         # Not implemented
│   │   │   ├── ChatRoom.tsx         # Not implemented
│   │   │   ├── MessageList.tsx      # Not implemented
│   │   │   ├── MessageItem.tsx      # Not implemented
│   │   │   ├── MessageInput.tsx     # Not implemented
│   │   │   ├── UserList.tsx         # Not implemented
│   │   │   ├── TypingIndicator.tsx  # Not implemented
│   │   │   └── ConnectionStatus.tsx # Not implemented
│   │   ├── hooks/
│   │   │   └── useSocket.ts         # Not implemented
│   │   ├── types/
│   │   │   └── chat.ts              # Not implemented
│   │   ├── utils/
│   │   │   └── format.ts            # Not implemented
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts                 # Not implemented
│   │   ├── handlers/
│   │   │   └── chatHandler.ts       # Not implemented
│   │   ├── models/
│   │   │   ├── User.ts              # Not implemented
│   │   │   └── Message.ts           # Not implemented
│   │   └── utils/
│   │       └── validation.ts        # Not implemented
│   └── package.json
├── tests/
│   ├── chat.spec.ts                 # Not implemented
│   ├── typing.spec.ts               # Not implemented
│   └── connection.spec.ts           # Not implemented
├── docs/
│   └── SESSION_CONTEXT.md
└── README.md
```

---

## Data Models

### User
```typescript
interface User {
  id: string;          // Socket ID
  nickname: string;
  joinedAt: number;
}
```

### Message
```typescript
interface Message {
  id: string;
  type: 'user' | 'system';
  sender: string;
  content: string;
  timestamp: number;
}
```

### TypingUser
```typescript
interface TypingUser {
  nickname: string;
  timestamp: number;
}
```

---

## Socket.IO Events

### Client → Server
- `join`: Join with nickname
- `send-message`: Send message
- `typing`: Start typing
- `stop-typing`: Stop typing
- `leave`: Leave chat

### Server → Client
- `joined`: Successfully joined
- `user-joined`: New user joined
- `user-left`: User left
- `new-message`: New message received
- `user-typing`: User is typing
- `user-stop-typing`: User stopped typing
- `users-update`: User list updated
- `error`: Error occurred

---

## Completed Phases

### Phase 0: Setup Only (2025-10-14)
- Created project directory structure
- Installed dependencies:
  - Client: React, TypeScript, Socket.IO client, Styled Components
  - Server: Express, Socket.IO, TypeScript
  - Testing: Playwright
- No actual features implemented yet

---

## Pending Work

### Phase 1: Basic Chat (Priority 1)
1. Set up Express + Socket.IO server
2. Implement join with nickname validation
3. Build message send/receive functionality
4. Create basic UI components
5. Add system messages (join/leave)

### Phase 2: User Experience (Priority 2)
6. Display user list with online status
7. Add typing indicator
8. Implement message timestamps
9. Auto-scroll to latest message
10. Handle connection loss/reconnection

### Phase 3: Testing (Priority 3)
11. Multi-browser context tests
12. Two-user chat scenario test
13. Typing indicator test
14. Connection offline/online test
15. Nickname validation test

### Phase 4: Polish (Priority 4)
16. Styled Components styling
17. Responsive design
18. Message grouping by date
19. Scroll to load history
20. Error handling and user feedback

---

## Troubleshooting History

No issues yet (project not started).

---

## User Decisions

None recorded yet. Future decisions should be documented here.

---

## Running the Project (When Implemented)

### Backend Server
```bash
cd 05-chat-app/server
npm install
npm run dev
# Should run on http://localhost:3001
```

### Frontend Client
```bash
cd 05-chat-app/client
npm install
npm run dev
# Should run on http://localhost:5173
```

### Testing
```bash
npx playwright test
npx playwright show-report
```

---

## Technical Challenges

### 1. Multi-Browser Context Testing
Playwright can simulate multiple users by creating separate browser contexts. This is essential for testing real-time chat between users.

Example:
```typescript
test('two users chat', async ({ browser }) => {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  
  const user1 = await context1.newPage();
  const user2 = await context2.newPage();
  
  // User1 joins
  await user1.goto('http://localhost:5173');
  await user1.fill('input[name="nickname"]', 'Alice');
  await user1.click('button:has-text("Join")');
  
  // User2 joins
  await user2.goto('http://localhost:5173');
  await user2.fill('input[name="nickname"]', 'Bob');
  await user2.click('button:has-text("Join")');
  
  // Alice sees Bob joined
  await expect(user1.locator('.system-message'))
    .toHaveText('Bob joined');
  
  // Alice sends message
  await user1.fill('input[name="message"]', 'Hello Bob!');
  await user1.press('input[name="message"]', 'Enter');
  
  // Bob receives message
  await expect(user2.locator('.message').last())
    .toContainText('Alice: Hello Bob!');
});
```

### 2. WebSocket Connection Management
Need to handle:
- Connection established
- Connection lost (network offline)
- Reconnection
- Clean disconnect on page close

### 3. Typing Indicator Debounce
Prevent spamming typing events. Only send when:
- User starts typing (after 1 second idle)
- Stop event after 3 seconds of no input

---

## References

- Socket.IO Docs: https://socket.io/docs/v4/
- React Documentation: https://react.dev/
- Styled Components: https://styled-components.com/
- Playwright Multi-Context: https://playwright.dev/docs/browser-contexts
- Express: https://expressjs.com/

---

**Version**: 0.0.0 (Not Started)  
**Status**: Planning Phase
