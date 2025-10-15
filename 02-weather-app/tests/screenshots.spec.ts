import { test, expect } from '@playwright/test';

/**
 * Weather App 스크린샷 촬영
 *
 * 실행 방법:
 * 1. npm run dev (http://localhost:5173)
 * 2. npx playwright test screenshots.spec.ts
 */

test.describe('Weather App Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('1. 초기 화면', async ({ page }) => {
    await page.screenshot({
      path: 'docs/images/01-initial-screen.png',
      fullPage: true,
    });
  });

  test('2. 도시 검색 - 서울', async ({ page }) => {
    // 검색어 입력
    await page.fill('input[type="text"]', '서울');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: 'docs/images/02-search-seoul.png',
      fullPage: true,
    });
  });

  test('3. 날씨 결과 표시', async ({ page }) => {
    // 서울 검색
    await page.fill('input[type="text"]', 'Seoul');
    await page.click('button:has-text("검색")');

    // 결과 로딩 대기
    await page.waitForSelector('.weather-result, [class*="weather"]', { timeout: 5000 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'docs/images/03-weather-result.png',
      fullPage: true,
    });
  });

  test('4. Provider 선택 UI', async ({ page }) => {
    // Provider 선택기가 있다면 캡처
    const providerSelector = page.locator('select, [role="listbox"], button:has-text("Provider")');

    if (await providerSelector.count() > 0) {
      await page.screenshot({
        path: 'docs/images/04-provider-selector.png',
        fullPage: true,
      });
    }
  });

  test('5. 다양한 도시 - 부산', async ({ page }) => {
    await page.fill('input[type="text"]', 'Busan');
    await page.click('button:has-text("검색")');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'docs/images/05-busan-weather.png',
      fullPage: true,
    });
  });

  test('6. 에러 상태 - 잘못된 도시', async ({ page }) => {
    await page.fill('input[type="text"]', 'InvalidCityNameXYZ123');
    await page.click('button:has-text("검색")');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'docs/images/06-error-state.png',
      fullPage: true,
    });
  });

  test('7. 로딩 상태', async ({ page }) => {
    // 검색 버튼 클릭 직후 로딩 상태 캡처
    await page.fill('input[type="text"]', 'Tokyo');

    // 클릭과 동시에 스크린샷 (로딩 스피너 캡처 시도)
    await Promise.all([
      page.click('button:has-text("검색")'),
      page.waitForTimeout(300),
    ]);

    await page.screenshot({
      path: 'docs/images/07-loading-state.png',
      fullPage: true,
    });
  });

  test('8. 모바일 화면', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    await page.fill('input[type="text"]', 'London');
    await page.click('button:has-text("검색")');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: 'docs/images/08-mobile-view.png',
      fullPage: true,
    });
  });

  test('9. 정확도 추적 페이지 (있다면)', async ({ page }) => {
    // Accuracy 페이지가 있는지 확인
    const accuracyLink = page.locator('a:has-text("Accuracy"), a:has-text("정확도")');

    if (await accuracyLink.count() > 0) {
      await accuracyLink.click();
      await page.waitForTimeout(1000);

      await page.screenshot({
        path: 'docs/images/09-accuracy-page.png',
        fullPage: true,
      });
    }
  });
});
