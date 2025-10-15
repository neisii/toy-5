import { test, expect } from "@playwright/test";

/**
 * Shopping Mall 스크린샷 촬영
 *
 * 실행 방법:
 * 1. 터미널 1: npm run dev (http://localhost:3000)
 * 2. 터미널 2: npx json-server --watch db.json --port 3001
 * 3. npx playwright test screenshots.spec.ts
 */

test.describe("Shopping Mall Screenshots", () => {
  test.beforeEach(async ({ page }) => {
    // JSON Server API 모킹
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
            image: "https://picsum.photos/300?random=1",
            stock: 10,
          },
          {
            id: 2,
            name: "나이키 에어맥스",
            price: 150000,
            category: "fashion",
            description: "편안한 운동화",
            image: "https://picsum.photos/300?random=2",
            stock: 25,
          },
          {
            id: 3,
            name: "iPhone 15 Pro",
            price: 1500000,
            category: "electronics",
            description: "티타늄 디자인",
            image: "https://picsum.photos/300?random=3",
            stock: 15,
          },
          {
            id: 4,
            name: "책상 세트",
            price: 350000,
            category: "furniture",
            description: "심플한 디자인",
            image: "https://picsum.photos/300?random=4",
            stock: 8,
          },
          {
            id: 5,
            name: "운동복 세트",
            price: 89000,
            category: "sports",
            description: "통기성 좋은 소재",
            image: "https://picsum.photos/300?random=5",
            stock: 30,
          },
          {
            id: 6,
            name: "Python 프로그래밍",
            price: 35000,
            category: "books",
            description: "입문자를 위한 책",
            image: "https://picsum.photos/300?random=6",
            stock: 20,
          },
        ]),
      });
    });

    await page.goto("http://localhost:3000");
    await page.waitForLoadState("networkidle");
  });

  test("1. 홈 화면 - 상품 목록", async ({ page }) => {
    await page.waitForSelector(".product-card");

    await page.screenshot({
      path: "docs/images/01-home-products.png",
      fullPage: true,
    });
  });

  test("2. 검색 기능", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 검색어 입력
    await page.fill('input[placeholder*="검색"]', "맥북");
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/02-search-macbook.png",
      fullPage: true,
    });
  });

  test("3. 카테고리 필터링", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 전자제품 카테고리 클릭
    await page.click('button:has-text("전자제품")');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/03-filter-electronics.png",
      fullPage: true,
    });
  });

  test("4. 장바구니 추가 - Toast", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 첫 번째 상품 장바구니 담기
    await page.click('.product-card:first-child button:has-text("장바구니")');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/04-add-to-cart-toast.png",
      fullPage: true,
    });
  });

  test("5. 장바구니 아이콘 배지", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 여러 상품 추가
    await page.click('.product-card:nth-child(1) button:has-text("장바구니")');
    await page.waitForTimeout(300);
    await page.click('.product-card:nth-child(2) button:has-text("장바구니")');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/05-cart-badge.png",
      fullPage: true,
    });
  });

  test("6. 장바구니 페이지", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 상품 추가
    await page.click('.product-card:first-child button:has-text("장바구니")');
    await page.waitForTimeout(300);

    // 장바구니로 이동
    await page.click('[aria-label="장바구니"]');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/06-cart-page.png",
      fullPage: true,
    });
  });

  test("7. 장바구니 수량 조절", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 상품 추가
    await page.click('.product-card:first-child button:has-text("장바구니")');
    await page.waitForTimeout(300);

    // 장바구니로 이동
    await page.click('[aria-label="장바구니"]');
    await page.waitForTimeout(500);

    // 수량 증가
    await page.click('button[aria-label="수량 증가"]');
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/07-cart-quantity.png",
      fullPage: true,
    });
  });

  test("8. 페이지네이션", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 페이지네이션 버튼 스크롤
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);

    await page.screenshot({
      path: "docs/images/08-pagination.png",
      fullPage: true,
    });
  });

  test("9. 검색 + 카테고리 조합", async ({ page }) => {
    await page.waitForSelector(".product-card");

    // 카테고리 선택
    await page.click('button:has-text("전자제품")');
    await page.waitForTimeout(300);

    // 검색어 입력
    await page.fill('input[placeholder*="검색"]', "Pro");
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/09-combined-filter.png",
      fullPage: true,
    });
  });

  test("10. 모바일 화면", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForSelector(".product-card");

    await page.screenshot({
      path: "docs/images/10-mobile-view.png",
      fullPage: true,
    });
  });

  test("11. 빈 장바구니", async ({ page }) => {
    // 장바구니로 바로 이동 (빈 상태)
    await page.goto("http://localhost:3000/cart");
    await page.waitForTimeout(500);

    await page.screenshot({
      path: "docs/images/11-empty-cart.png",
      fullPage: true,
    });
  });
});
