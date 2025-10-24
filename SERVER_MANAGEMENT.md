# 서버 관리 가이드

개발 서버를 안전하게 시작하고 종료하는 방법

---

## 🚀 서버 시작

### 기본 방법
```bash
cd 02-weather-app  # 프로젝트 디렉토리로 이동
npm run dev
```

### 백그라운드 실행 (비추천)
```bash
nohup npm run dev > /dev/null 2>&1 &
```
⚠️ 백그라운드 실행은 좀비 프로세스를 만들기 쉬우므로 비추천

---

## 🛑 서버 종료

### 방법 1: Ctrl+C (일반적, 하지만 불완전할 수 있음)

**장점**:
- 빠르고 간단
- 대부분의 경우 정상 작동

**단점**:
- 때때로 자식 프로세스가 살아남음
- npm 프로세스는 종료되지만 node/vite 프로세스가 좀비로 남을 수 있음
- 특히 터미널을 닫거나 세션이 끊기면 프로세스가 고아(orphan)가 됨

**왜 문제가 생기나?**
```
npm run dev (PID 1000)
  └─ node vite (PID 1001)
      └─ esbuild (PID 1002)

Ctrl+C → npm (PID 1000) 종료
         BUT node (PID 1001), esbuild (PID 1002)는 살아있을 수 있음!
```

---

### 방법 2: 안전한 셸 스크립트 (추천) ⭐

**사용법**:
```bash
cd 02-weather-app
./stop-server.sh
```

**동작 방식**:
1. SIGTERM(15) 전송 → graceful shutdown 시도
2. 3초 대기
3. 여전히 살아있으면 SIGKILL(9) 전송 → 강제 종료
4. npm 부모 프로세스도 정리
5. 포트 5173 해제 확인

**장점**:
- ✅ 모든 자식 프로세스까지 완전히 종료
- ✅ Graceful shutdown 시도 (데이터 손실 방지)
- ✅ 포트 해제 확인
- ✅ 좀비 프로세스 방지

---

### 방법 3: 수동 종료

**특정 포트 프로세스 찾기**:
```bash
lsof -i :5173
```

**프로세스 종료**:
```bash
# Graceful shutdown (권장)
kill -15 <PID>

# 3초 대기 후에도 살아있으면
kill -9 <PID>
```

**모든 관련 프로세스 종료**:
```bash
# npm 프로세스와 자식들 모두 종료
pkill -f "npm run dev"
pkill -f "vite"
```

---

## 📊 시그널 비교

| 시그널 | 이름 | 설명 | 차단 가능 | 권장 순서 |
|--------|------|------|-----------|-----------|
| **SIGTERM (15)** | Terminate | 정상 종료 요청 | ✅ | 1번째 |
| **SIGINT (2)** | Interrupt | Ctrl+C | ✅ | - |
| **SIGKILL (9)** | Kill | 강제 종료 | ❌ | 2번째 (최후) |
| **SIGHUP (1)** | Hangup | 터미널 종료 | ✅ | - |

**Graceful Shutdown이 중요한 이유**:
- 파일 핸들 정리
- 네트워크 연결 정리
- 임시 파일 삭제
- 캐시 저장

---

## 🔍 좀비 프로세스 확인

### 현재 실행 중인 dev 서버 확인
```bash
ps -ef | grep -E "(npm run dev|vite|next)" | grep -v grep
```

### 오래된 프로세스 확인
```bash
ps -eo pid,etime,command | grep vite
```

### 포트 점유 확인
```bash
lsof -i :5173
lsof -i :5174
lsof -i :5175
```

---

## 🧹 좀비 프로세스 정리

### 자동 정리 (추천)
```bash
cd /Users/neisii/Development/playwright-project
./kill-dev-servers.sh
```

### 수동 정리
```bash
# 모든 npm dev 프로세스 종료
pkill -f "npm run dev"

# 모든 vite 프로세스 종료
pkill -f "vite"

# 특정 포트 해제
kill -9 $(lsof -ti :5173)
```

---

## 💡 베스트 프랙티스

### ✅ 권장

1. **개발 중**: `npm run dev` (포그라운드)
2. **종료 시**: `./stop-server.sh` 또는 `Ctrl+C` 후 포트 확인
3. **하루 종료 시**: `./kill-dev-servers.sh` 실행
4. **터미널 닫기 전**: 반드시 서버 종료 확인

### ❌ 비추천

1. ~~백그라운드 실행 (`nohup`, `&`)~~
2. ~~터미널 그냥 닫기~~
3. ~~`kill -9`를 첫 번째 선택으로 사용~~
4. ~~여러 dev 서버 동시 실행~~

---

## 🎯 일반적인 시나리오

### 시나리오 1: 정상적인 하루 종료
```bash
# 1. 서버 종료
cd 02-weather-app
./stop-server.sh

# 2. 포트 확인
lsof -i :5173

# 3. 좀비 프로세스 정리 (선택)
cd ..
./kill-dev-servers.sh --dry-run  # 미리보기
./kill-dev-servers.sh            # 실행
```

### 시나리오 2: 서버가 응답 없음
```bash
# 1. Ctrl+C 시도
^C

# 2. 여전히 응답 없으면
./stop-server.sh

# 3. 그래도 안 되면
../kill-dev-servers.sh --port 5173
```

### 시나리오 3: 포트가 이미 사용 중
```bash
# 1. 포트 점유 프로세스 확인
lsof -i :5173

# 2. 해당 프로세스 종료
kill -15 <PID>

# 3. 3초 후에도 살아있으면
kill -9 <PID>
```

### 시나리오 4: 여러 프로젝트 동시 작업
```bash
# 각 프로젝트마다 다른 포트 사용

# 02-weather-app (포트 5173)
cd 02-weather-app
npm run dev

# 03-shopping-mall (포트 3000)
cd ../03-shopping-mall
npm run dev

# 종료 시
cd 02-weather-app && ./stop-server.sh
cd ../03-shopping-mall && ./stop-server.sh

# 또는 한 번에
cd ..
./kill-dev-servers.sh
```

---

## 🐛 문제 해결

### 문제: "Port 5173 is already in use"

**원인**: 이전 프로세스가 완전히 종료되지 않음

**해결**:
```bash
# 1. 포트 점유 프로세스 찾기
lsof -i :5173

# 2. 프로세스 종료
kill -9 $(lsof -ti :5173)

# 3. 서버 재시작
npm run dev
```

### 문제: Ctrl+C 후에도 프로세스 살아있음

**원인**: 자식 프로세스가 SIGINT를 무시

**해결**:
```bash
# 안전한 스크립트 사용
./stop-server.sh
```

### 문제: 여러 개의 좀비 프로세스

**원인**: 반복된 부적절한 종료

**해결**:
```bash
# 전체 정리
cd ..
./kill-dev-servers.sh

# 정리 확인
ps -ef | grep -E "(npm|vite|node)" | grep -v grep
```

---

## 📚 참고 자료

### 유용한 명령어

```bash
# 프로세스 트리 보기 (macOS에서는 설치 필요)
brew install pstree
pstree -p <PID>

# 실시간 프로세스 모니터링
top
htop  # brew install htop

# 포트 사용 현황
netstat -an | grep LISTEN
lsof -i -P | grep LISTEN
```

### 시그널 전송

```bash
# 프로세스에 시그널 전송
kill -<SIGNAL> <PID>

# 시그널 목록
kill -l

# 프로세스 그룹 종료
pkill -<SIGNAL> -f <pattern>
```

---

## ✅ 체크리스트

### 서버 시작 전
- [ ] 이전 서버가 완전히 종료되었는지 확인
- [ ] 포트 5173이 비어있는지 확인 (`lsof -i :5173`)
- [ ] 올바른 디렉토리에 있는지 확인 (`pwd`)

### 서버 종료 후
- [ ] `./stop-server.sh` 실행 또는 `Ctrl+C` 후 확인
- [ ] 포트 5173이 해제되었는지 확인
- [ ] 좀비 프로세스 없는지 확인 (`ps -ef | grep vite`)

### 하루 종료 시
- [ ] 모든 dev 서버 종료
- [ ] `./kill-dev-servers.sh --dry-run` 실행
- [ ] 필요시 `./kill-dev-servers.sh` 실행

---

**최종 업데이트**: 2025-10-23  
**작성**: Claude Code AI
