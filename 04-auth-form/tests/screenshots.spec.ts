import { test, expect } from "@playwright/test";

/**
 * Auth Form 스크린샷 촬영 (실제 서버 사용)
 *
 * 실행 방법:
 * 1. ./start-servers.sh (백엔드 + 프론트엔드 실행)
 * 2. npx playwright test screenshots.spec.ts
 *
 * 테스트 계정: asdf@aaa.com / Qwer!234
 */

test.describe("Auth Form Screenshots", () => {
  const testEmail = "asdf@aaa.com";
  const testPassword = "Qwer!234";

  test("1. 회원가입 페이지 - 빈 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForSelector('h1:has-text("회원가입")', { timeout: 10000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/01-signup-empty.png",
      fullPage: true,
    });
  });

  test("2. 회원가입 페이지 - 입력 완료 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/02-signup-filled.png",
      fullPage: true,
    });
  });

  test("3. 회원가입 페이지 - 비밀번호 불일치 에러", async ({ page }) => {
    await page.goto("http://localhost:5173/signup");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", "DifferentPassword123!");

    // 폼 제출로 검증 에러 트리거
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: "docs/images/03-signup-error.png",
      fullPage: true,
    });
  });

  test("4. 로그인 페이지 - 빈 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector('h1:has-text("로그인")', { timeout: 10000 });
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/04-login-empty.png",
      fullPage: true,
    });
  });

  test("5. 로그인 페이지 - 입력 완료 상태", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/05-login-filled.png",
      fullPage: true,
    });
  });

  test("6. 회원가입 → 로그인 → 프로필 전체 플로우", async ({ page }) => {
    // Step 1: 회원가입 (이미 등록되어 있을 수 있음)
    await page.goto("http://localhost:5173/signup");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Step 2: 로그인 페이지로 이동
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.click('button[type="submit"]');

    // 프로필 페이지로 리다이렉트 대기
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: "docs/images/06-profile-page.png",
      fullPage: true,
    });
  });

  test("7. 로그인 실패 - 에러 메시지", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "WrongPassword123!");
    await page.click('button[type="submit"]');

    // 에러 메시지 대기
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: "docs/images/07-login-error.png",
      fullPage: true,
    });
  });

  test("8. 모바일 화면 - 회원가입", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:5173/signup");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/08-mobile-signup.png",
      fullPage: true,
    });
  });

  test("9. 모바일 화면 - 로그인", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:5173/login");
    await page.waitForSelector("#email", { timeout: 10000 });

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/09-mobile-login.png",
      fullPage: true,
    });
  });
});
