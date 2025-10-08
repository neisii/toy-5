import { test, expect } from "@playwright/test";

test.describe("Weather App - Mock Provider", () => {
  test.beforeEach(async ({ page }) => {
    // Mock provider를 기본값으로 사용하도록 LocalStorage 설정
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.waitForLoadState("networkidle");
  });

  test("서울 날씨 검색 (Mock Provider)", async ({ page }) => {
    // 도시 입력
    await page.fill('input[placeholder="도시 이름"]', "서울");
    await page.click('button:has-text("검색")');

    // 날씨 정보 표시 확인
    await expect(page.locator("text=서울")).toBeVisible();
    await expect(page.locator("text=18°C")).toBeVisible(); // Mock data temperature
    await expect(page.locator("text=맑음")).toBeVisible();

    // 상세 정보 확인
    await expect(page.locator("text=16°C")).toBeVisible(); // 체감온도
    await expect(page.locator("text=55%")).toBeVisible(); // 습도
    await expect(page.locator("text=3.2 m/s")).toBeVisible(); // 풍속
  });

  test("부산 날씨 검색 (Mock Provider)", async ({ page }) => {
    await page.fill('input[placeholder="도시 이름"]', "부산");
    await page.click('button:has-text("검색")');

    await expect(page.locator("text=부산")).toBeVisible();
    await expect(page.locator("text=20°C")).toBeVisible();
  });

  test("존재하지 않는 도시 처리", async ({ page }) => {
    await page.fill('input[placeholder="도시 이름"]', "InvalidCity");
    await page.click('button:has-text("검색")');

    // 에러 메시지 확인 (Mock provider는 default city 반환)
    // 또는 "도시를 찾을 수 없습니다" 표시
    await expect(page.locator(".error")).toBeVisible();
  });

  test("빈 문자열 검색 방지", async ({ page }) => {
    await page.fill('input[placeholder="도시 이름"]', "   ");
    await page.click('button:has-text("검색")');

    // 날씨 정보가 표시되지 않음
    await expect(page.locator(".weather-card")).not.toBeVisible();
  });

  test("Enter 키로 검색", async ({ page }) => {
    await page.fill('input[placeholder="도시 이름"]', "인천");
    await page.press('input[placeholder="도시 이름"]', "Enter");

    // 날씨 정보 표시 확인
    await expect(page.locator("text=인천")).toBeVisible();
  });
});

test.describe("Weather App - OpenWeatherMap Provider", () => {
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
            coord: { lon: 126.9778, lat: 37.5683 },
            weather: [
              { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
            ],
            main: {
              temp: 15,
              feels_like: 13,
              humidity: 60,
              pressure: 1013,
            },
            visibility: 10000,
            wind: { speed: 3.5, deg: 180 },
            clouds: { all: 0 },
            dt: 1609459200,
            sys: { country: "KR", sunrise: 1609455600, sunset: 1609492800 },
            name: "Seoul",
          }),
        });
      },
    );

    // OpenWeatherMap provider로 전환
    await page.click('select[name="provider"]');
    await page.selectOption('select[name="provider"]', "openweather");

    // 도시 입력
    await page.fill('input[placeholder="도시 이름"]', "서울");
    await page.click('button:has-text("검색")');

    // 날씨 정보 표시 확인
    await expect(page.locator("text=Seoul")).toBeVisible();
    await expect(page.locator("text=15°C")).toBeVisible();

    // 상세 정보 확인
    await expect(page.locator("text=13°C")).toBeVisible(); // 체감온도
    await expect(page.locator("text=60%")).toBeVisible(); // 습도
    await expect(page.locator("text=3.5 m/s")).toBeVisible(); // 풍속
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

    await page.click('select[name="provider"]');
    await page.selectOption('select[name="provider"]', "openweather");

    await page.fill('input[placeholder="도시 이름"]', "부산");
    await page.click('button:has-text("검색")');

    // 에러 메시지 확인
    await expect(page.locator(".error")).toContainText("API 키");
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
            coord: { lon: 128.6014, lat: 35.8714 },
            weather: [
              {
                id: 803,
                main: "Clouds",
                description: "broken clouds",
                icon: "04d",
              },
            ],
            main: {
              temp: 18,
              feels_like: 17,
              humidity: 55,
              pressure: 1015,
            },
            visibility: 10000,
            wind: { speed: 2.1, deg: 90 },
            clouds: { all: 75 },
            dt: 1609459200,
            sys: { country: "KR" },
            name: "Daegu",
          }),
        });
      },
    );

    await page.click('select[name="provider"]');
    await page.selectOption('select[name="provider"]', "openweather");

    await page.fill('input[placeholder="도시 이름"]', "대구");
    await page.click('button:has-text("검색")');

    // 로딩 표시 확인
    await expect(page.locator(".loading")).toBeVisible();

    // 결과 표시 후 로딩 사라짐
    await expect(page.locator("text=Daegu")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".loading")).not.toBeVisible();
  });
});

test.describe("Weather App - Provider Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("Provider 전환", async ({ page }) => {
    // 기본값은 Mock provider
    await expect(page.locator('select[name="provider"]')).toHaveValue("mock");

    // OpenWeatherMap으로 전환
    await page.selectOption('select[name="provider"]', "openweather");
    await expect(page.locator('select[name="provider"]')).toHaveValue(
      "openweather",
    );
  });

  test("Quota 상태 표시", async ({ page }) => {
    // Provider status 확인 버튼 클릭
    await page.click('button:has-text("Provider 상태")');

    // Quota 정보 표시 확인
    await expect(page.locator(".quota-info")).toBeVisible();
    await expect(page.locator("text=사용량")).toBeVisible();
    await expect(page.locator("text=제한")).toBeVisible();
  });
});
