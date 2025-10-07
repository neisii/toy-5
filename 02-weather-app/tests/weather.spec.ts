import { test, expect } from "@playwright/test";

test.describe("Weather App", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("서울 날씨 검색 (API 모킹)", async ({ page }) => {
    // Mock API 응답
    await page.route(
      "**/api.openweathermap.org/data/2.5/weather**",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            name: "서울",
            main: { temp: 15, feels_like: 13, humidity: 60 },
            weather: [{ main: "Clear", description: "맑음", icon: "01d" }],
            wind: { speed: 3.5 },
          }),
        });
      },
    );

    // 도시 입력
    await page.fill('input[placeholder="도시 이름"]', "서울");
    await page.click('button:has-text("검색")');

    // 날씨 정보 표시 확인 (로딩이 너무 빨라서 생략)
    await expect(page.locator("text=서울")).toBeVisible();
    await expect(page.locator("text=15°C")).toBeVisible();
    await expect(page.locator("text=맑음")).toBeVisible();

    // 상세 정보 확인
    await expect(page.locator("text=13°C")).toBeVisible(); // 체감온도
    await expect(page.locator("text=60%")).toBeVisible(); // 습도
    await expect(page.locator("text=3.5 m/s")).toBeVisible(); // 풍속
  });

  test("잘못된 도시 이름 처리", async ({ page }) => {
    // Mock 404 응답
    await page.route(
      "**/api.openweathermap.org/data/2.5/weather**",
      async (route) => {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "city not found" }),
        });
      },
    );

    await page.fill('input[placeholder="도시 이름"]', "InvalidCity");
    await page.click('button:has-text("검색")');

    // 에러 메시지 확인
    await expect(page.locator(".error")).toHaveText("도시를 찾을 수 없습니다");
  });

  test("로딩 상태 표시", async ({ page }) => {
    // 느린 응답 시뮬레이션
    await page.route(
      "**/api.openweathermap.org/data/2.5/weather**",
      async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            name: "대구",
            main: { temp: 18, feels_like: 17, humidity: 55 },
            weather: [{ description: "흐림", icon: "03d" }],
            wind: { speed: 2.1 },
          }),
        });
      },
    );

    await page.fill('input[placeholder="도시 이름"]', "대구");
    await page.click('button:has-text("검색")');

    // 로딩 표시 확인
    await expect(page.locator(".loading")).toBeVisible();

    // 결과 표시 후 로딩 사라짐
    await expect(page.locator("text=대구")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".loading")).not.toBeVisible();
  });

  test("API 키 오류 처리", async ({ page }) => {
    // Mock 401 응답
    await page.route(
      "**/api.openweathermap.org/data/2.5/weather**",
      async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "Invalid API key" }),
        });
      },
    );

    await page.fill('input[placeholder="도시 이름"]', "부산");
    await page.click('button:has-text("검색")');

    // 에러 메시지 확인
    await expect(page.locator(".error")).toHaveText(
      "API 키가 유효하지 않습니다",
    );
  });

  test("빈 문자열 검색 방지", async ({ page }) => {
    // 빈 문자열 입력
    await page.fill('input[placeholder="도시 이름"]', "   ");
    await page.click('button:has-text("검색")');

    // 날씨 정보가 표시되지 않음
    await expect(page.locator(".weather-card")).not.toBeVisible();
  });

  test("Enter 키로 검색", async ({ page }) => {
    await page.route(
      "**/api.openweathermap.org/data/2.5/weather**",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            name: "인천",
            main: { temp: 14, feels_like: 12, humidity: 65 },
            weather: [{ description: "비", icon: "10d" }],
            wind: { speed: 4.2 },
          }),
        });
      },
    );

    await page.fill('input[placeholder="도시 이름"]', "인천");
    await page.press('input[placeholder="도시 이름"]', "Enter");

    // 날씨 정보 표시 확인
    await expect(page.locator("text=인천")).toBeVisible();
    await expect(page.locator("text=14°C")).toBeVisible();
  });
});
