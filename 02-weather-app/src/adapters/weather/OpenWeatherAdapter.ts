import type { WeatherProvider } from './WeatherProvider';
import type {
  CurrentWeather,
  QuotaInfo,
  WeatherProviderConfig,
  CurrentWeatherData,
  WeatherCondition,
  LocationInfo
} from '@/types/domain/weather';
import { getCityCoordinate } from '@/config/cityCoordinates';

/**
 * OpenWeatherMap API response type (Current Weather API 2.5)
 */
interface OpenWeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * LocalStorage key for quota tracking
 */
const QUOTA_STORAGE_KEY = 'openweather_quota';

/**
 * Quota data structure in LocalStorage
 */
interface QuotaData {
  used: number;
  limit: number;
  resetTime: string; // ISO 8601 format (UTC)
}

/**
 * OpenWeatherMap adapter
 *
 * Uses OpenWeatherMap Current Weather API 2.5
 * Free tier: 1,000 calls/day, no credit card required
 */
export class OpenWeatherAdapter implements WeatherProvider {
  readonly name = 'OpenWeatherMap';
  private config: WeatherProviderConfig;
  private baseUrl: string;
  private apiKey: string;

  constructor(config: WeatherProviderConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.openweathermap.org/data/2.5';

    if (!config.apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }
    this.apiKey = config.apiKey;
  }

  /**
   * Get current weather for a city
   */
  async getCurrentWeather(cityName: string): Promise<CurrentWeather> {
    // Get coordinates for the city
    const cityCoord = getCityCoordinate(cityName);
    if (!cityCoord) {
      throw new Error(`City coordinates not found: ${cityName}`);
    }

    // Check quota before making request
    const quota = await this.checkQuota();
    if (quota.status === 'exceeded') {
      throw new Error('API quota exceeded. Please wait until reset time.');
    }

    try {
      // Make API request
      const url = new URL(`${this.baseUrl}/weather`);
      url.searchParams.append('lat', cityCoord.lat.toString());
      url.searchParams.append('lon', cityCoord.lon.toString());
      url.searchParams.append('appid', this.apiKey);
      url.searchParams.append('units', 'metric');
      url.searchParams.append('lang', 'en');

      const response = await fetch(url.toString(), {
        timeout: this.config.timeout || 10000
      } as RequestInit);

      // Handle rate limit response
      if (response.status === 429) {
        this.incrementQuota();
        throw new Error('API rate limit exceeded (HTTP 429)');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();

      // Increment quota counter
      this.incrementQuota();

      return this.transformToDomain(data, cityCoord.name, cityCoord.name_en);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch weather data from OpenWeatherMap');
    }
  }

  /**
   * Check current API quota status
   */
  async checkQuota(): Promise<QuotaInfo> {
    const quotaData = this.getQuotaData();
    const now = new Date();
    const resetTime = new Date(quotaData.resetTime);

    // Reset quota if reset time has passed
    if (now >= resetTime) {
      this.resetQuota();
      return this.checkQuota(); // Recursive call after reset
    }

    const percentage = (quotaData.used / quotaData.limit) * 100;
    let status: 'normal' | 'warning' | 'exceeded' = 'normal';

    if (percentage >= 95) {
      status = 'exceeded';
    } else if (percentage >= 80) {
      status = 'warning';
    }

    return {
      used: quotaData.used,
      limit: quotaData.limit,
      resetTime,
      percentage,
      status
    };
  }

  /**
   * Validate configuration
   */
  async validateConfig(): Promise<boolean> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    // Test API key with a simple request (서울)
    try {
      const url = new URL(`${this.baseUrl}/weather`);
      url.searchParams.append('lat', '37.5683');
      url.searchParams.append('lon', '126.9778');
      url.searchParams.append('appid', this.apiKey);
      url.searchParams.append('units', 'metric');

      const response = await fetch(url.toString(), {
        timeout: 5000
      } as RequestInit);

      if (response.status === 401) {
        throw new Error('Invalid API key');
      }

      return response.ok;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to validate API configuration');
    }
  }

  /**
   * Transform OpenWeatherMap response to domain types
   */
  private transformToDomain(
    data: OpenWeatherResponse,
    nameKo: string,
    nameEn: string
  ): CurrentWeather {
    const location: LocationInfo = {
      name: nameEn,
      nameKo: nameKo,
      country: data.sys.country,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      }
    };

    const current: CurrentWeatherData = {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      uvIndex: 0 // Current Weather API doesn't provide UV index
    };

    const weatherInfo = data.weather[0];
    const weather: WeatherCondition = {
      main: weatherInfo.main,
      description: weatherInfo.description,
      descriptionKo: this.translateDescription(weatherInfo.description),
      icon: weatherInfo.icon
    };

    const timestamp = new Date(data.dt * 1000);

    return {
      location,
      current,
      weather,
      timestamp
    };
  }

  /**
   * Translate English weather description to Korean
   * (Simple static mapping for now)
   */
  private translateDescription(description: string): string {
    const translations: Record<string, string> = {
      'clear sky': '맑음',
      'few clouds': '구름 조금',
      'scattered clouds': '구름 많음',
      'broken clouds': '구름 많음',
      'overcast clouds': '흐림',
      'light rain': '약한 비',
      'moderate rain': '비',
      'heavy rain': '강한 비',
      'shower rain': '소나기',
      'thunderstorm': '천둥번개',
      'snow': '눈',
      'light snow': '약한 눈',
      'heavy snow': '강한 눈',
      'mist': '안개',
      'fog': '안개',
      'haze': '실안개'
    };

    return translations[description.toLowerCase()] || description;
  }

  /**
   * Get quota data from LocalStorage
   */
  private getQuotaData(): QuotaData {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);

    if (!stored) {
      return this.createNewQuotaData();
    }

    try {
      const data: QuotaData = JSON.parse(stored);
      return data;
    } catch {
      return this.createNewQuotaData();
    }
  }

  /**
   * Create new quota data with next UTC midnight reset time
   */
  private createNewQuotaData(): QuotaData {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));

    const data: QuotaData = {
      used: 0,
      limit: 1000,
      resetTime: tomorrow.toISOString()
    };

    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  /**
   * Increment quota usage counter
   */
  private incrementQuota(): void {
    const data = this.getQuotaData();
    data.used += 1;
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Reset quota counter
   */
  private resetQuota(): void {
    const data = this.createNewQuotaData();
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(data));
  }
}
