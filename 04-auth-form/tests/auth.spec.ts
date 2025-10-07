import { test, expect } from '@playwright/test';

test.describe('인증 플로우', () => {
  test('회원가입 → 로그인 → 프로필 전체 플로우', async ({ page }) => {
    // 1. 회원가입 페이지
    await page.goto('/signup');

    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("가입하기")');

    // 2. 성공 메시지 및 리다이렉트
    await expect(page.locator('.success')).toHaveText('회원가입 완료!');
    await expect(page).toHaveURL(/.*\/login/);

    // 3. 로그인
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("로그인")');

    // 4. 프로필 페이지로 리다이렉트
    await expect(page).toHaveURL(/.*\/profile/);
    await expect(page.locator(`text=${email}`)).toBeVisible();

    // 5. 로그아웃
    await page.click('button:has-text("로그아웃")');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('비밀번호 검증 - 짧은 비밀번호', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.fill('input[name="confirmPassword"]', '123');
    await page.click('button:has-text("가입하기")');

    await expect(page.locator('.error')).toContainText('비밀번호는 최소 8자 이상이어야 합니다');
  });

  test('비밀번호 검증 - 특수문자 없음', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="confirmPassword"]', 'Password123');
    await page.click('button:has-text("가입하기")');

    await expect(page.locator('.error')).toContainText('특수문자를 포함해야 합니다');
  });

  test('비밀번호 불일치', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
    await page.click('button:has-text("가입하기")');

    await expect(page.locator('.error')).toContainText('비밀번호가 일치하지 않습니다');
  });

  test('로그인 실패 - 잘못된 비밀번호', async ({ page, context }) => {
    // 먼저 사용자 생성
    const timestamp = Date.now();
    const email = `fail${timestamp}@example.com`;

    await page.goto('/signup');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("가입하기")');
    await page.waitForURL(/.*\/login/);

    // 잘못된 비밀번호로 로그인 시도
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button:has-text("로그인")');

    await expect(page.locator('.error')).toContainText('이메일 또는 비밀번호가 올바르지 않습니다');
  });

  test('중복 이메일 가입 방지', async ({ page }) => {
    const timestamp = Date.now();
    const email = `dup${timestamp}@example.com`;

    // 첫 번째 가입
    await page.goto('/signup');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("가입하기")');
    await page.waitForURL(/.*\/login/);

    // 같은 이메일로 다시 가입 시도
    await page.goto('/signup');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="confirmPassword"]', 'Password123!');
    await page.click('button:has-text("가입하기")');

    await expect(page.locator('.error')).toContainText('이미 등록된 이메일입니다');
  });
});
