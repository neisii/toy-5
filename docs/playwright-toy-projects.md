# Playwright로 테스트 자동화 가능한 토이 프로젝트 5선

**작성일**: 2025-10-07  
**목적**: Chrome Extension 자동화가 불가능하므로, 일반 웹 애플리케이션 테스트 연습용 프로젝트 제안

---

## 🎯 Playwright가 적합한 이유

### ✅ 일반 웹 애플리케이션
- DOM 직접 접근 가능
- 네트워크 요청 제어
- 브라우저 이벤트 시뮬레이션
- 스크린샷/비디오 녹화

### ❌ Chrome Extension
- ERR_BLOCKED_BY_CLIENT 차단
- Extension API 접근 불가
- chrome:// 프로토콜 제한
- Service Worker 격리

---

## 프로젝트 1: 할 일 관리 앱 (Todo List)

### 📝 프로젝트 개요

**난이도**: ⭐ 초급  
**개발 시간**: 1-2일  
**Playwright 학습 효과**: ⭐⭐  
**실무 유사도**: ⭐⭐

### 기술 스택
- **Frontend**: React + TypeScript + Vite
- **상태 관리**: Context API 또는 Zustand
- **스타일링**: Tailwind CSS
- **저장소**: LocalStorage

### 주요 기능
1. 할 일 추가
2. 할 일 삭제
3. 완료 상태 토글
4. 필터링 (전체/진행중/완료)
5. LocalStorage 자동 저장

### Playwright 테스트 예시

```javascript
// tests/todo.spec.js
import { test, expect } from '@playwright/test';

test.describe('Todo List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('할 일 추가', async ({ page }) => {
    // 입력 필드에 텍스트 입력
    await page.fill('input[name="todo"]', '우유 사기');
    
    // Enter 또는 추가 버튼 클릭
    await page.press('input[name="todo"]', 'Enter');
    
    // 추가된 항목 확인
    await expect(page.locator('text=우유 사기')).toBeVisible();
  });

  test('할 일 완료 처리', async ({ page }) => {
    // 할 일 추가
    await page.fill('input[name="todo"]', '청소하기');
    await page.press('input[name="todo"]', 'Enter');
    
    // 체크박스 클릭
    await page.click('input[type="checkbox"]');
    
    // 완료 스타일 확인
    const todoItem = page.locator('text=청소하기');
    await expect(todoItem).toHaveClass(/completed/);
  });

  test('할 일 삭제', async ({ page }) => {
    // 할 일 추가
    await page.fill('input[name="todo"]', '운동하기');
    await page.press('input[name="todo"]', 'Enter');
    
    // 삭제 버튼 클릭
    await page.click('button[aria-label="삭제"]');
    
    // 항목이 사라졌는지 확인
    await expect(page.locator('text=운동하기')).not.toBeVisible();
  });

  test('필터링 - 완료된 항목만 보기', async ({ page }) => {
    // 여러 할 일 추가
    await page.fill('input[name="todo"]', '할 일 1');
    await page.press('input[name="todo"]', 'Enter');
    await page.fill('input[name="todo"]', '할 일 2');
    await page.press('input[name="todo"]', 'Enter');
    
    // 첫 번째 완료
    await page.click('input[type="checkbox"]:first-child');
    
    // "완료됨" 필터 클릭
    await page.click('button:has-text("완료됨")');
    
    // 완료된 항목만 표시
    await expect(page.locator('text=할 일 1')).toBeVisible();
    await expect(page.locator('text=할 일 2')).not.toBeVisible();
  });
});
```

### 학습 포인트
- ✅ 기본 DOM 조작 테스트
- ✅ LocalStorage 상태 확인
- ✅ CSS 클래스 검증
- ✅ 리스트 필터링 테스트

---

## 프로젝트 2: 날씨 검색 앱

### 📝 프로젝트 개요

**난이도**: ⭐⭐ 초중급  
**개발 시간**: 2-3일  
**Playwright 학습 효과**: ⭐⭐⭐  
**실무 유사도**: ⭐⭐⭐

### 기술 스택
- **Frontend**: Vue 3 + TypeScript + Vite
- **API**: OpenWeatherMap API
- **상태 관리**: Pinia
- **스타일링**: CSS Modules

### 주요 기능
1. 도시 이름 입력 및 검색
2. 현재 날씨 표시 (온도, 습도, 풍속)
3. 5일 예보
4. 로딩 상태 표시
5. 에러 처리 (도시 없음, 네트워크 오류)

### Playwright 테스트 예시

```javascript
// tests/weather.spec.js
import { test, expect } from '@playwright/test';

test.describe('Weather App', () => {
  test('서울 날씨 검색', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Mock API 응답
    await page.route('**/api.openweathermap.org/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          name: '서울',
          main: { temp: 15, humidity: 60 },
          weather: [{ description: '맑음' }],
          wind: { speed: 3.5 }
        })
      });
    });
    
    // 도시 입력
    await page.fill('input[placeholder="도시 이름"]', '서울');
    await page.click('button:has-text("검색")');
    
    // 로딩 표시 확인
    await expect(page.locator('.loading')).toBeVisible();
    
    // 날씨 정보 표시 확인
    await expect(page.locator('text=서울')).toBeVisible();
    await expect(page.locator('text=15°C')).toBeVisible();
    await expect(page.locator('text=맑음')).toBeVisible();
  });

  test('잘못된 도시 이름 처리', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // Mock 404 응답
    await page.route('**/api.openweathermap.org/**', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'city not found' })
      });
    });
    
    await page.fill('input[placeholder="도시 이름"]', 'InvalidCity');
    await page.click('button:has-text("검색")');
    
    // 에러 메시지 확인
    await expect(page.locator('.error')).toHaveText('도시를 찾을 수 없습니다');
  });

  test('네트워크 요청 추적', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 네트워크 요청 대기
    const responsePromise = page.waitForResponse(
      response => response.url().includes('openweathermap.org') && response.status() === 200
    );
    
    await page.fill('input[placeholder="도시 이름"]', '부산');
    await page.click('button:has-text("검색")');
    
    const response = await responsePromise;
    const data = await response.json();
    
    // API 응답 데이터 검증
    expect(data.name).toBe('부산');
    expect(data.main.temp).toBeGreaterThan(-50);
  });
});
```

### 학습 포인트
- ✅ API 모킹 (route.fulfill)
- ✅ 네트워크 요청 대기 (waitForResponse)
- ✅ 로딩 상태 테스트
- ✅ 에러 핸들링 검증

---

## 프로젝트 3: 간단한 쇼핑몰 (상품 목록)

### 📝 프로젝트 개요

**난이도**: ⭐⭐⭐ 중급  
**개발 시간**: 3-5일  
**Playwright 학습 효과**: ⭐⭐⭐⭐  
**실무 유사도**: ⭐⭐⭐⭐⭐

### 기술 스택
- **Frontend**: Next.js 14 + TypeScript
- **스타일링**: Tailwind CSS
- **상태 관리**: Zustand
- **Mock API**: JSON Server

### 주요 기능
1. 상품 목록 표시 (페이지네이션)
2. 카테고리별 필터링
3. 검색 기능
4. 장바구니 추가/삭제
5. 장바구니 페이지
6. 총 금액 계산

### Playwright 테스트 예시

```javascript
// tests/shop.spec.js
import { test, expect } from '@playwright/test';

test.describe('Shopping Mall', () => {
  test('장바구니 전체 시나리오', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 상품 목록 로딩 확인
    await expect(page.locator('.product-card')).toHaveCount(10);
    
    // 첫 번째 상품 클릭
    await page.click('.product-card:first-child');
    
    // 상품 상세 페이지 확인
    await expect(page).toHaveURL(/.*\/product\/\d+/);
    await expect(page.locator('h1')).toBeVisible();
    
    // 장바구니 추가
    await page.click('button:has-text("장바구니 담기")');
    
    // Toast 알림 확인
    await expect(page.locator('.toast')).toHaveText('장바구니에 추가되었습니다');
    
    // 장바구니 아이콘 배지 확인
    await expect(page.locator('.cart-badge')).toHaveText('1');
    
    // 장바구니 페이지로 이동
    await page.click('[aria-label="장바구니"]');
    await expect(page).toHaveURL(/.*\/cart/);
    
    // 장바구니 항목 확인
    await expect(page.locator('.cart-item')).toHaveCount(1);
    
    // 수량 증가
    await page.click('button[aria-label="수량 증가"]');
    await expect(page.locator('.quantity')).toHaveText('2');
    
    // 총 금액 확인
    const price = await page.locator('.item-price').textContent();
    const total = await page.locator('.total-price').textContent();
    expect(parseInt(total)).toBe(parseInt(price) * 2);
    
    // 항목 삭제
    await page.click('button[aria-label="삭제"]');
    await expect(page.locator('.cart-empty')).toBeVisible();
  });

  test('검색 기능', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 검색어 입력
    await page.fill('input[placeholder="상품 검색"]', '맥북');
    await page.press('input[placeholder="상품 검색"]', 'Enter');
    
    // URL 파라미터 확인
    await expect(page).toHaveURL(/.*\?search=맥북/);
    
    // 검색 결과 확인
    const products = page.locator('.product-card');
    await expect(products).toHaveCount.greaterThan(0);
    
    // 모든 상품 제목에 "맥북" 포함 확인
    const titles = await products.locator('h3').allTextContents();
    titles.forEach(title => {
      expect(title.toLowerCase()).toContain('맥북');
    });
  });

  test('카테고리 필터링', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // "전자제품" 카테고리 클릭
    await page.click('button:has-text("전자제품")');
    
    // URL 확인
    await expect(page).toHaveURL(/.*\?category=electronics/);
    
    // 필터링된 상품만 표시
    const productCount = await page.locator('.product-card').count();
    expect(productCount).toBeGreaterThan(0);
    expect(productCount).toBeLessThan(20); // 전체 상품보다 적음
  });

  test('페이지네이션', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 첫 페이지 상품 ID 저장
    const firstProductId = await page.locator('.product-card:first-child').getAttribute('data-id');
    
    // 2페이지로 이동
    await page.click('button:has-text("2")');
    await expect(page).toHaveURL(/.*\?page=2/);
    
    // 다른 상품 표시 확인
    const secondPageProductId = await page.locator('.product-card:first-child').getAttribute('data-id');
    expect(firstProductId).not.toBe(secondPageProductId);
  });
});
```

### 학습 포인트
- ✅ E2E 시나리오 테스트
- ✅ URL 파라미터 검증
- ✅ 복잡한 상태 관리
- ✅ 동적 데이터 처리

---

## 프로젝트 4: 로그인/회원가입 폼

### 📝 프로젝트 개요

**난이도**: ⭐⭐ 초중급  
**개발 시간**: 2-3일  
**Playwright 학습 효과**: ⭐⭐⭐⭐  
**실무 유사도**: ⭐⭐⭐⭐⭐

### 기술 스택
- **Frontend**: Svelte + SvelteKit
- **Backend**: Express + JWT
- **Database**: SQLite (개발용)
- **검증**: Zod

### 주요 기능
1. 회원가입 (이메일/비밀번호 검증)
2. 로그인
3. JWT 토큰 관리 (Cookie)
4. 프로필 페이지 (인증 필요)
5. 로그아웃

### Playwright 테스트 예시

```javascript
// tests/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('회원가입 → 로그인 → 프로필 전체 플로우', async ({ page }) => {
    // 1. 회원가입 페이지
    await page.goto('http://localhost:5173/signup');
    
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("가입하기")');
    
    // 2. 성공 메시지 및 리다이렉트
    await expect(page.locator('.success')).toHaveText('가입 완료!');
    await expect(page).toHaveURL(/.*\/login/);
    
    // 3. 로그인
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("로그인")');
    
    // 4. 프로필 페이지로 리다이렉트
    await expect(page).toHaveURL(/.*\/profile/);
    await expect(page.locator('text=' + email)).toBeVisible();
  });

  test('비밀번호 검증', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    
    // 짧은 비밀번호
    await page.fill('input[name="password"]', '123');
    await page.blur('input[name="password"]');
    
    await expect(page.locator('.error'))
      .toHaveText('비밀번호는 최소 8자 이상이어야 합니다');
    
    // 숫자/특수문자 없음
    await page.fill('input[name="password"]', 'abcdefgh');
    await page.blur('input[name="password"]');
    
    await expect(page.locator('.error'))
      .toContain('숫자와 특수문자를 포함해야 합니다');
  });

  test('비밀번호 확인 불일치', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');
    
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password456!');
    await page.blur('input[name="confirmPassword"]');
    
    await expect(page.locator('.error'))
      .toHaveText('비밀번호가 일치하지 않습니다');
  });

  test('로그인 실패 - 잘못된 비밀번호', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button:has-text("로그인")');
    
    await expect(page.locator('.error'))
      .toHaveText('이메일 또는 비밀번호가 올바르지 않습니다');
  });

  test('인증 필요 페이지 접근 제한', async ({ page }) => {
    // 로그인 없이 프로필 페이지 접근
    await page.goto('http://localhost:5173/profile');
    
    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('.message'))
      .toHaveText('로그인이 필요합니다');
  });

  test('로그아웃', async ({ page, context }) => {
    // 로그인
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("로그인")');
    
    // 쿠키 확인
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name === 'auth-token');
    expect(authCookie).toBeDefined();
    
    // 로그아웃
    await page.click('button:has-text("로그아웃")');
    
    // 로그인 페이지로 리다이렉트
    await expect(page).toHaveURL(/.*\/login/);
    
    // 쿠키 삭제 확인
    const cookiesAfter = await context.cookies();
    const authCookieAfter = cookiesAfter.find(c => c.name === 'auth-token');
    expect(authCookieAfter).toBeUndefined();
  });
});
```

### 학습 포인트
- ✅ 폼 검증 테스트
- ✅ 인증 플로우 (JWT)
- ✅ 쿠키 관리
- ✅ 페이지 리다이렉트

---

## 프로젝트 5: 실시간 채팅 앱

### 📝 프로젝트 개요

**난이도**: ⭐⭐⭐⭐ 고급  
**개발 시간**: 5-7일  
**Playwright 학습 효과**: ⭐⭐⭐⭐⭐  
**실무 유사도**: ⭐⭐⭐⭐

### 기술 스택
- **Frontend**: React + TypeScript
- **실시간**: Socket.IO
- **Backend**: Express + Socket.IO
- **스타일링**: Styled Components

### 주요 기능
1. 닉네임 설정 및 입장
2. 메시지 전송/수신 (실시간)
3. 접속 사용자 목록
4. 타이핑 인디케이터
5. 메시지 타임스탬프

### Playwright 테스트 예시

```javascript
// tests/chat.spec.js
import { test, expect } from '@playwright/test';

test.describe('Real-time Chat', () => {
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
});
```

### 학습 포인트
- ✅ WebSocket 실시간 통신
- ✅ 멀티 브라우저 컨텍스트
- ✅ 네트워크 상태 제어 (offline)
- ✅ 스크롤 위치 검증

---

## 📊 프로젝트 비교표

| 프로젝트 | 난이도 | 개발 시간 | Playwright 학습 | 실무 유사도 | 추천 대상 |
|---------|--------|----------|----------------|------------|----------|
| 할 일 앱 | ⭐ | 1-2일 | ⭐⭐ | ⭐⭐ | Playwright 입문자 |
| 날씨 앱 | ⭐⭐ | 2-3일 | ⭐⭐⭐ | ⭐⭐⭐ | API 테스트 연습 |
| 쇼핑몰 | ⭐⭐⭐ | 3-5일 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | E2E 시나리오 학습 |
| 로그인 폼 | ⭐⭐ | 2-3일 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 인증 플로우 필수 |
| 채팅 앱 | ⭐⭐⭐⭐ | 5-7일 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 실시간 앱 고급 |

---

## 🎓 학습 로드맵

### 초보자 (Playwright 처음)
```
1주차: 할 일 앱 (기본 DOM 조작)
2주차: 날씨 앱 (API 모킹)
3주차: 로그인 폼 (인증 플로우)
```

### 중급자 (기본 익힌 상태)
```
1-2주차: 쇼핑몰 (E2E 시나리오)
3-4주차: 채팅 앱 (WebSocket + 멀티 컨텍스트)
```

### 고급자 (실무 적용)
```
모든 프로젝트에 다음 추가:
- CI/CD (GitHub Actions)
- Visual Regression Testing
- Performance Testing
- Accessibility Testing
```

---

## 🚀 프로젝트 시작 가이드

### 공통 설정

1. **프로젝트 생성**
```bash
npm create vite@latest my-project -- --template react-ts
cd my-project
npm install
```

2. **Playwright 설치**
```bash
npm install -D @playwright/test
npx playwright install
```

3. **Playwright 설정** (`playwright.config.js`)
```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

4. **첫 테스트 실행**
```bash
npm run dev  # 개발 서버
npx playwright test  # 테스트 실행
npx playwright show-report  # 리포트 보기
```

---

## 💡 Playwright 핵심 패턴

### 1. Page Object Model
```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/login.spec.js
import { LoginPage } from '../pages/LoginPage';

test('로그인', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@example.com', 'password');
});
```

### 2. Fixtures (재사용 가능한 설정)
```javascript
// fixtures/auth.js
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button:has-text("로그인")');
    await use(page);
  },
});

// tests/profile.spec.js
import { test } from '../fixtures/auth';

test('프로필 페이지', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/profile');
  // 이미 로그인된 상태
});
```

### 3. API 모킹
```javascript
test('API 모킹', async ({ page }) => {
  await page.route('**/api/users', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: '철수' },
        { id: 2, name: '영희' }
      ])
    });
  });
  
  await page.goto('/users');
});
```

---

## 📚 추가 학습 자료

### 공식 문서
- [Playwright 공식 문서](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen)

### 유용한 도구
- **Playwright Inspector**: 디버깅 도구
- **Trace Viewer**: 실행 과정 시각화
- **VS Code Extension**: 테스트 실행/디버깅

### 명령어
```bash
npx playwright codegen localhost:5173  # 테스트 자동 생성
npx playwright test --debug  # 디버그 모드
npx playwright test --headed  # 브라우저 표시
npx playwright show-trace trace.zip  # Trace 보기
```

---

**문서 작성**: 2025-10-07  
**목적**: Chrome Extension 대신 일반 웹 앱으로 Playwright 학습  
**결론**: 일반 웹 앱은 Playwright 자동화가 완벽하게 작동함
