# Playwright Learning Projects

Playwright와 E2E 테스팅을 학습하기 위한 프로젝트 모음

---

## 🛠️ 유틸리티 스크립트

### kill-dev-servers.sh

좀비 상태의 개발 서버 프로세스들을 정리하는 스크립트

**사용법**:

```bash
# 모든 좀비 프로세스 정리
./kill-dev-servers.sh

# 실제 삭제 없이 미리보기 (dry-run)
./kill-dev-servers.sh --dry-run

# 특정 포트만 정리
./kill-dev-servers.sh --port 5173

# 도움말
./kill-dev-servers.sh --help
```

**정리 대상**:
- 포트 점유 중인 프로세스 (5173, 5174, 5175, 3000, 3001, 8080)
- 1시간 이상 실행 중인 `npm run dev` 프로세스
- 1시간 이상 실행 중인 vite/next/json-server 프로세스

**예시**:

```bash
# 정리 전 확인
./kill-dev-servers.sh --dry-run

# 실제 정리
./kill-dev-servers.sh

# 결과:
# ✓ Cleanup completed!
#   Killed 9 processes
# 
# 📊 Current port status:
#   Port 5173: FREE
#   Port 5174: FREE
#   Port 5175: FREE
```

---

## 📂 프로젝트 목록

### 02-weather-app (진행 중)

날씨 검색 앱 - Vue 3 + TypeScript + Pinia

**최신 업데이트**: Phase 8-9 Custom AI Weather Prediction (2025-10-23)

**주요 기능**:
- 🤖 AI 통합 날씨 예측 (3개 Provider 가중 평균)
- 📊 정확도 추적 시스템 (GitHub Actions 자동화)
- 🚴 자전거 라이딩 추천
- 🔄 Multi-provider 지원 (OpenWeather, WeatherAPI, Open-Meteo, Mock)

**성능**:
- 온도 예측: 7.9% 개선 (1.86°C 오차)
- 풍속 예측: 26.4% 개선 (0.47 m/s 오차)
- 종합: 17.1% 정확도 향상

**실행**:
```bash
cd 02-weather-app
npm install
npm run dev
# http://localhost:5173
```

**페이지**:
- `/` - 날씨 검색
- `/ai-prediction` - AI 통합 예측 (NEW!)
- `/accuracy` - 정확도 분석

**문서**:
- [Phase 8-9 Summary](02-weather-app/docs/PHASE_8-9_SUMMARY.md)
- [Session Context](02-weather-app/docs/SESSION_CONTEXT.md)

---

### 03-shopping-mall

쇼핑몰 앱 - Next.js

**실행**:
```bash
cd 03-shopping-mall
npm install
npm run dev
# http://localhost:3000
```

---

### 04-auth-form

인증 폼 - SvelteKit

**실행**:
```bash
cd 04-auth-form
npm install
npm run dev
# http://localhost:5173
```

---

## 🚨 문제 해결

### 포트가 이미 사용 중일 때

```bash
# 1. 좀비 프로세스 정리
./kill-dev-servers.sh

# 2. 특정 포트만 정리
./kill-dev-servers.sh --port 5173

# 3. 수동 확인
lsof -i :5173
kill -9 <PID>
```

### npm 관련 에러

```bash
# 프로젝트 디렉토리에서 실행 필수
cd 02-weather-app  # 또는 다른 프로젝트
npm run dev

# 루트 디렉토리에서 실행 시 에러:
# Error: ENOENT: no such file or directory, open '/Users/.../package.json'
```

---

## 📚 학습 리소스

- [Playwright 공식 문서](https://playwright.dev/)
- [Vue 3 문서](https://vuejs.org/)
- [AI-DLC 방법론](02-weather-app/docs/ai-dlc.txt)

---

## 🤝 기여

이 프로젝트는 학습 목적으로 만들어졌습니다.

**Commit Convention**: Conventional Commits (Scope 포함)
```
feat(weather-app): add AI prediction feature
fix(shopping-mall): resolve cart bug
docs(root): update README
```

---

**최종 업데이트**: 2025-10-23  
**라이선스**: MIT
