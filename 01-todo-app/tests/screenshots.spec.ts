import { test, expect } from '@playwright/test';

/**
 * 스크린샷 촬영 전용 테스트
 * README.md에 사용할 프로젝트 소개 이미지 생성
 *
 * 실행 방법:
 * 1. 터미널에서 npm run dev 실행 (http://localhost:5173)
 * 2. npx playwright test screenshots.spec.ts
 */

test.describe('Todo App Screenshots for Documentation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('1. 초기 화면 - 빈 상태', async ({ page }) => {
    // 빈 상태의 초기 화면
    await page.screenshot({
      path: 'docs/images/01-empty-state.png',
      fullPage: true,
    });
  });

  test('2. Todo 추가 기능', async ({ page }) => {
    // 입력 필드에 텍스트 입력
    await page.fill('input[placeholder="할 일을 입력하세요..."]', 'Playwright 학습하기');

    await page.screenshot({
      path: 'docs/images/02-input-filled.png',
      fullPage: true,
    });
  });

  test('3. Todo 목록 - 여러 항목', async ({ page }) => {
    // 여러 개의 Todo 추가
    const todos = [
      'Playwright 학습하기',
      'E2E 테스트 작성하기',
      'README 문서 업데이트',
      '프로젝트 배포하기',
    ];

    for (const todo of todos) {
      await page.fill('input[placeholder="할 일을 입력하세요..."]', todo);
      await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
      await page.waitForTimeout(100);
    }

    await page.screenshot({
      path: 'docs/images/03-todo-list.png',
      fullPage: true,
    });
  });

  test('4. Todo 완료 체크', async ({ page }) => {
    // Todo 추가
    const todos = [
      'Playwright 학습하기 ✅',
      'E2E 테스트 작성하기',
      'README 문서 업데이트',
    ];

    for (const todo of todos) {
      await page.fill('input[placeholder="할 일을 입력하세요..."]', todo);
      await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
      await page.waitForTimeout(100);
    }

    // 첫 번째 Todo 완료 체크
    await page.click('input[type="checkbox"]:first-of-type');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: 'docs/images/04-todo-completed.png',
      fullPage: true,
    });
  });

  test('5. Todo 필터링 - All/Active/Completed', async ({ page }) => {
    // Todo 추가
    const todos = ['완료된 작업', '진행 중인 작업', '대기 중인 작업'];

    for (const todo of todos) {
      await page.fill('input[placeholder="할 일을 입력하세요..."]', todo);
      await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
      await page.waitForTimeout(100);
    }

    // 첫 번째 완료 처리
    await page.click('input[type="checkbox"]:first-of-type');
    await page.waitForTimeout(300);

    // All 탭
    await page.screenshot({
      path: 'docs/images/05-filter-all.png',
      fullPage: true,
    });

    // Active 탭 (미완료 항목만)
    const activeButton = page.locator('button:has-text("Active")');
    if (await activeButton.count() > 0) {
      await activeButton.click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: 'docs/images/06-filter-active.png',
        fullPage: true,
      });
    }

    // Completed 탭 (완료된 항목만)
    const completedButton = page.locator('button:has-text("Completed")');
    if (await completedButton.count() > 0) {
      await completedButton.click();
      await page.waitForTimeout(300);
      await page.screenshot({
        path: 'docs/images/07-filter-completed.png',
        fullPage: true,
      });
    }
  });

  test('6. Todo 삭제 기능', async ({ page }) => {
    // Todo 추가
    await page.fill('input[placeholder="할 일을 입력하세요..."]', '삭제할 항목');
    await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
    await page.waitForTimeout(300);

    // 삭제 버튼에 호버
    await page.hover('li:first-of-type');
    await page.waitForTimeout(200);

    await page.screenshot({
      path: 'docs/images/08-delete-hover.png',
      fullPage: true,
    });
  });

  test('7. 전체 플로우 - 최종 화면', async ({ page }) => {
    // 완성된 Todo 앱의 모습
    const todos = [
      { text: 'Vite + React 프로젝트 생성 ✅', completed: true },
      { text: 'Zustand 상태 관리 구현 ✅', completed: true },
      { text: 'Playwright E2E 테스트 작성 ✅', completed: true },
      { text: 'LocalStorage 연동', completed: false },
      { text: '반응형 UI 개선', completed: false },
    ];

    for (const todo of todos) {
      await page.fill('input[placeholder="할 일을 입력하세요..."]', todo.text);
      await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
      await page.waitForTimeout(100);
    }

    // 완료된 항목 체크
    const completedCount = todos.filter(t => t.completed).length;
    for (let i = 0; i < completedCount; i++) {
      await page.click(`input[type="checkbox"]:nth-of-type(${i + 1})`);
      await page.waitForTimeout(100);
    }

    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'docs/images/09-final-state.png',
      fullPage: true,
    });
  });

  test('8. 모바일 화면 - 반응형', async ({ page }) => {
    // 모바일 사이즈로 변경
    await page.setViewportSize({ width: 375, height: 812 });

    // Todo 추가
    const todos = ['Mobile Test 1', 'Mobile Test 2', 'Mobile Test 3'];

    for (const todo of todos) {
      await page.fill('input[placeholder="할 일을 입력하세요..."]', todo);
      await page.press('input[placeholder="할 일을 입력하세요..."]', 'Enter');
      await page.waitForTimeout(100);
    }

    await page.screenshot({
      path: 'docs/images/10-mobile-view.png',
      fullPage: true,
    });
  });
});
