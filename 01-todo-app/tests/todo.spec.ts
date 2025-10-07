import { test, expect } from "@playwright/test";

test.describe("Todo App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState("networkidle");
    // LocalStorage 초기화
    await page.evaluate(() => localStorage.clear());
  });

  test("할 일 추가", async ({ page }) => {
    // 입력 필드에 텍스트 입력
    await page.fill('input[name="todo"]', "우유 사기");

    // Enter 키로 추가
    await page.press('input[name="todo"]', "Enter");

    // 추가된 항목 확인
    await expect(page.locator("text=우유 사기")).toBeVisible();

    // 입력 필드 초기화 확인
    await expect(page.locator('input[name="todo"]')).toHaveValue("");
  });

  test("빈 문자열 추가 방지", async ({ page }) => {
    // 빈 문자열 입력
    await page.fill('input[name="todo"]', "   ");
    await page.press('input[name="todo"]', "Enter");

    // "할 일이 없습니다" 메시지 확인
    await expect(page.locator("text=할 일이 없습니다")).toBeVisible();
  });

  test("할 일 완료 처리", async ({ page }) => {
    // 할 일 추가
    await page.fill('input[name="todo"]', "청소하기");
    await page.press('input[name="todo"]', "Enter");

    // 체크박스 클릭
    await page.click('input[type="checkbox"]');

    // 완료 스타일 확인 (line-through 클래스)
    const todoText = page.locator("text=청소하기");
    await expect(todoText).toHaveClass(/line-through/);
  });

  test("할 일 삭제", async ({ page }) => {
    // 할 일 추가
    await page.fill('input[name="todo"]', "운동하기");
    await page.press('input[name="todo"]', "Enter");

    // 삭제 버튼 클릭
    await page.click('button[aria-label="삭제"]');

    // 항목이 사라졌는지 확인
    await expect(page.locator("text=운동하기")).not.toBeVisible();
    await expect(page.locator("text=할 일이 없습니다")).toBeVisible();
  });

  test("필터링 - 완료된 항목만 보기", async ({ page }) => {
    // 여러 할 일 추가
    await page.fill('input[name="todo"]', "할 일 1");
    await page.press('input[name="todo"]', "Enter");
    await page.fill('input[name="todo"]', "할 일 2");
    await page.press('input[name="todo"]', "Enter");
    await page.fill('input[name="todo"]', "할 일 3");
    await page.press('input[name="todo"]', "Enter");

    // 첫 번째와 세 번째 완료
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(2).click();

    // "완료" 필터 클릭
    await page.click('button:has-text("완료")');

    // 완료된 항목만 표시
    await expect(page.locator("text=할 일 1")).toBeVisible();
    await expect(page.locator("text=할 일 2")).not.toBeVisible();
    await expect(page.locator("text=할 일 3")).toBeVisible();
  });

  test("필터링 - 진행중 항목만 보기", async ({ page }) => {
    // 여러 할 일 추가
    await page.fill('input[name="todo"]', "작업 A");
    await page.press('input[name="todo"]', "Enter");
    await page.fill('input[name="todo"]', "작업 B");
    await page.press('input[name="todo"]', "Enter");

    // 첫 번째 완료
    await page.locator('input[type="checkbox"]').first().click();

    // "진행중" 필터 클릭
    await page.click('button:has-text("진행중")');

    // 미완료 항목만 표시
    await expect(page.locator("text=작업 A")).not.toBeVisible();
    await expect(page.locator("text=작업 B")).toBeVisible();
  });

  test("LocalStorage 데이터 유지", async ({ page }) => {
    // 할 일 추가
    await page.fill('input[name="todo"]', "장보기");
    await page.press('input[name="todo"]', "Enter");

    // 완료 처리
    await page.click('input[type="checkbox"]');

    // 페이지 새로고침
    await page.reload();

    // 데이터 유지 확인
    await expect(page.locator("text=장보기")).toBeVisible();

    // 완료 상태 유지 확인
    const checkbox = page.locator('input[type="checkbox"]');
    await expect(checkbox).toBeChecked();
  });

  test("통계 정보 표시", async ({ page }) => {
    // 여러 할 일 추가
    await page.fill('input[name="todo"]', "Task 1");
    await page.press('input[name="todo"]', "Enter");
    await page.fill('input[name="todo"]', "Task 2");
    await page.press('input[name="todo"]', "Enter");
    await page.fill('input[name="todo"]', "Task 3");
    await page.press('input[name="todo"]', "Enter");

    // 하나 완료
    await page.locator('input[type="checkbox"]').first().click();

    // 통계 확인
    await expect(page.locator("text=총 3개")).toBeVisible();
    await expect(page.locator("text=완료 1개")).toBeVisible();
    await expect(page.locator("text=진행중 2개")).toBeVisible();
  });
});
