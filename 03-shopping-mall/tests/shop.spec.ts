import { test, expect } from "@playwright/test";

// 테스트용 상품 데이터 생성 헬퍼
function generateMockProducts(count: number) {
  const categories = ["electronics", "fashion", "furniture", "books", "sports"];
  const products = [];

  for (let i = 1; i <= count; i++) {
    products.push({
      id: i,
      name: `상품 ${i}`,
      price: 10000 + i * 1000,
      category: categories[i % categories.length],
      description: `상품 ${i} 설명`,
      image: "https://via.placeholder.com/300",
      stock: 10,
    });
  }

  return products;
}

test.describe("쇼핑몰 기본 기능", () => {
  test.beforeEach(async ({ page }) => {
    // JSON Server 모킹 (3개 상품)
    await page.route("**/localhost:3001/products", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: 1,
            name: "맥북 프로 M3",
            price: 2500000,
            category: "electronics",
            description: "최신 M3 칩 탑재",
            image: "https://via.placeholder.com/300",
            stock: 10,
          },
          {
            id: 2,
            name: "나이키 에어맥스",
            price: 150000,
            category: "fashion",
            description: "편안한 운동화",
            image: "https://via.placeholder.com/300",
            stock: 25,
          },
          {
            id: 3,
            name: "아이폰 15 Pro",
            price: 1500000,
            category: "electronics",
            description: "티타늄 디자인",
            image: "https://via.placeholder.com/300",
            stock: 15,
          },
        ]),
      });
    });
  });

  test("상품 목록 표시", async ({ page }) => {
    await page.goto("/");

    // 상품 카드 확인
    await expect(page.locator(".product-card")).toHaveCount(3);
    await expect(page.locator("text=맥북 프로 M3")).toBeVisible();
    await expect(page.locator("text=나이키 에어맥스")).toBeVisible();
  });

  test("카테고리 필터링", async ({ page }) => {
    await page.goto("/");

    // 초기 상품 수
    await expect(page.locator(".product-card")).toHaveCount(3);

    // 전자제품 필터
    await page.click('button:has-text("전자제품")');
    await expect(page.locator(".product-card")).toHaveCount(2);
    await expect(page.locator("text=맥북 프로 M3")).toBeVisible();
    await expect(page.locator("text=나이키 에어맥스")).not.toBeVisible();

    // 패션 필터
    await page.click('button:has-text("패션")');
    await expect(page.locator(".product-card")).toHaveCount(1);
    await expect(page.locator("text=나이키 에어맥스")).toBeVisible();

    // 전체 필터
    await page.click('button:has-text("전체")');
    await expect(page.locator(".product-card")).toHaveCount(3);
  });

  test("장바구니 전체 시나리오", async ({ page }) => {
    await page.goto("/");

    // 상품 목록 로딩 확인
    await expect(page.locator(".product-card")).toHaveCount(3);

    // 첫 번째 상품 장바구니 담기
    await page
      .locator(".product-card")
      .first()
      .locator('button:has-text("장바구니 담기")')
      .click();

    // 장바구니 아이콘 배지 확인
    await expect(page.locator(".cart-badge")).toHaveText("1");

    // 두 번째 상품 장바구니 담기
    await page
      .locator(".product-card")
      .nth(1)
      .locator('button:has-text("장바구니 담기")')
      .click();
    await expect(page.locator(".cart-badge")).toHaveText("2");

    // 장바구니 페이지로 이동
    await page.click('[aria-label="장바구니"]');
    await expect(page).toHaveURL(/.*\/cart/);

    // 장바구니 항목 확인
    await expect(page.locator(".cart-item")).toHaveCount(2);
    await expect(page.locator("text=맥북 프로 M3")).toBeVisible();
    await expect(page.locator("text=나이키 에어맥스")).toBeVisible();

    // 수량 증가
    await page
      .locator(".cart-item")
      .first()
      .locator('button[aria-label="수량 증가"]')
      .click();
    await expect(
      page.locator(".cart-item").first().locator(".quantity"),
    ).toHaveText("2");

    // 총 금액 확인 (2,500,000 * 2 + 150,000 = 5,150,000)
    await expect(page.locator(".total-price")).toContainText("5,150,000");

    // 수량 감소
    await page
      .locator(".cart-item")
      .first()
      .locator('button[aria-label="수량 감소"]')
      .click();
    await expect(
      page.locator(".cart-item").first().locator(".quantity"),
    ).toHaveText("1");
    await expect(page.locator(".total-price")).toContainText("2,650,000");

    // 항목 삭제
    await page
      .locator(".cart-item")
      .first()
      .locator('button[aria-label="삭제"]')
      .click();
    await expect(page.locator(".cart-item")).toHaveCount(1);
    await expect(page.locator(".total-price")).toContainText("150,000");

    // 마지막 항목 삭제
    await page
      .locator(".cart-item")
      .first()
      .locator('button[aria-label="삭제"]')
      .click();
    await expect(page.locator(".cart-empty")).toBeVisible();
    await expect(page.locator("text=장바구니가 비어있습니다")).toBeVisible();
  });
});

test.describe("페이지네이션", () => {
  test("페이지 이동", async ({ page }) => {
    // 25개 상품으로 모킹 (12개씩 3페이지)
    await page.route("**/localhost:3001/products", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(generateMockProducts(25)),
      });
    });

    await page.goto("/");

    // 1페이지: 12개 상품 표시
    await expect(page.locator(".product-card")).toHaveCount(12);
    await expect(page.locator('[data-id="1"]')).toBeVisible();

    // 2페이지로 이동
    await page.click('button:has-text("2")');
    await expect(page).toHaveURL(/\?page=2/);
    await expect(page.locator(".product-card")).toHaveCount(12);
    await expect(page.locator('[data-id="13"]')).toBeVisible();

    // 3페이지로 이동
    await page.click('button:has-text("3")');
    await expect(page).toHaveURL(/\?page=3/);
    await expect(page.locator(".product-card")).toHaveCount(1); // 25개 중 마지막 1개
    await expect(page.locator('[data-id="25"]')).toBeVisible();
  });

  test("이전/다음 버튼", async ({ page }) => {
    await page.route("**/localhost:3001/products", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(generateMockProducts(25)),
      });
    });

    await page.goto("/");

    // 1페이지에서 이전 버튼 비활성화
    await expect(page.locator('button:has-text("이전")')).toBeDisabled();

    // 다음 버튼 클릭
    await page.click('button:has-text("다음")');
    await expect(page).toHaveURL(/\?page=2/);
    await expect(page.locator('[data-id="13"]')).toBeVisible();

    // 이전 버튼 활성화됨
    await expect(page.locator('button:has-text("이전")')).toBeEnabled();

    // 이전 버튼 클릭
    await page.click('button:has-text("이전")');
    await expect(page).toHaveURL(/\?page=1/);
    await expect(page.locator('[data-id="1"]')).toBeVisible();
  });

  test("카테고리 변경 시 1페이지로 초기화", async ({ page }) => {
    await page.route("**/localhost:3001/products", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(generateMockProducts(25)),
      });
    });

    // 2페이지로 직접 이동
    await page.goto("/?page=2");
    await expect(page).toHaveURL(/\?page=2/);
    await expect(page.locator('[data-id="13"]')).toBeVisible();

    // 카테고리 변경
    await page.click('button:has-text("전자제품")');

    // 1페이지로 초기화되고 URL에 page 파라미터 포함
    await expect(page).toHaveURL(/\?page=1/);

    // 필터링된 상품 표시 확인 (electronics 카테고리: 5개)
    const productCount = await page.locator(".product-card").count();
    expect(productCount).toBeGreaterThan(0);
  });
});
