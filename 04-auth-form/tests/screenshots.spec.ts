import { test, expect } from "@playwright/test";

/**
 * Auth Form 스크린샷 촬영
 *
 * 실행 방법:
 * 1. ./start-servers.sh (백엔드 + 프론트엔드 동시 실행)
 * 2. npx playwright test screenshots.spec.ts
 */

test.describe("Auth Form Screenshots", () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = "Password123!";

  test("1. 회원가입 페이지 - 초기 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('h1:has-text("회원가입")', { timeout: 10000 });

    await page.screenshot({
      path: "docs/images/01-signup-empty.png",
      fullPage: true,
    });
  });

  test("2. 회원가입 - 입력 완료 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("##email", testEmail);
    await page.fill("##password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/02-signup-filled.png",
      fullPage: true,
    });
  });

  test("3. 회원가입 - 비밀번호 불일치 에러", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", "Password123!");
    await page.fill("#confirmPassword", "Different123!");

    // 폼 제출해서 검증 트리거
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/03-password-mismatch.png",
      fullPage: true,
    });
  });

  test("4. 로그인 페이지 - 초기 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector('h1:has-text("로그인")', { timeout: 10000 });

    await page.screenshot({
      path: "docs/images/04-login-empty.png",
      fullPage: true,
    });
  });

  test("5. 로그인 - 입력 완료 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", "test@example.com");
    await page.fill("#password", "password123");
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/05-login-filled.png",
      fullPage: true,
    });
  });

  test("6. 로그인 - 에러 메시지", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    // 에러 메시지 대기
    await page.waitForTimeout(1500);

    await page.screenshot({
      path: "docs/images/06-login-error.png",
      fullPage: true,
    });
  });

  test("7. 회원가입 → 로그인 → 프로필 플로우", async ({ page }) => {
    const uniqueEmail = `test${Date.now()}@example.com`;

    // 7-1. 회원가입
    await page.goto("http://localhost:5173/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", uniqueEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.click('button[type="submit"]');

    // 성공 메시지 또는 리다이렉트 대기
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: "docs/images/07-signup-success.png",
      fullPage: true,
    });

    // 7-2. 로그인 페이지로 이동
    if (!page.url().includes("/login")) {
      await page.goto("http://localhost:5173/login");
      await page.waitForLoadState("networkidle");
    }

    await page.waitForSelector("#email", { timeout: 10000 });
    await page.fill("#email", uniqueEmail);
    await page.fill("#password", testPassword);
    await page.click('button[type="submit"]');

    // 프로필 페이지로 리다이렉트 대기
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: "docs/images/08-profile-page.png",
      fullPage: true,
    });
  });

  test("8. 모바일 화면 - 회원가입", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:5173/signup");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/09-mobile-signup.png",
      fullPage: true,
    });
  });

  test("9. 모바일 화면 - 로그인", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:5173/login");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", "test@example.com");
    await page.fill("#password", "password123");
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/10-mobile-login.png",
      fullPage: true,
    });
  });
});
