import type { CurrentWeather, QuotaInfo, WeatherProviderConfig } from '@/types/domain/weather';

/**
 * Weather provider interface
 *
 * All weather API adapters must implement this interface to ensure
 * consistent behavior across different providers.
 */
export interface WeatherProvider {
  /**
   * Provider name (e.g., "OpenWeatherMap", "Mock")
   */
  readonly name: string;

  /**
   * Get current weather for a city
   *
   * @param cityName - Name of the city (Korean or English)
   * @returns Promise resolving to current weather data in domain format
   * @throws Error if the city is not found or API request fails
   */
  getCurrentWeather(cityName: string): Promise<CurrentWeather>;

  /**
   * Check current API quota status
   *
   * @returns Promise resolving to quota information
   */
  checkQuota(): Promise<QuotaInfo>;

  /**
   * Validate provider configuration
   *
   * @returns Promise resolving to true if configuration is valid
   * @throws Error if configuration is invalid
   */
  validateConfig(): Promise<boolean>;
}

/**
 * Factory function to create weather provider instances
 *
 * @param type - Provider type ('mock', 'openweather', 'weatherapi', 'openmeteo')
 * @param config - Provider configuration
 * @returns WeatherProvider instance
 * @throws Error if provider type is unknown
 */
export function createWeatherProvider(
  type: 'mock' | 'openweather' | 'weatherapi' | 'openmeteo',
  config?: WeatherProviderConfig
): WeatherProvider {
  switch (type) {
    case 'mock':
      // Import dynamically to avoid bundling all providers
      return new (require('./MockWeatherAdapter').MockWeatherAdapter)(config);
    case 'openweather':
      return new (require('./OpenWeatherAdapter').OpenWeatherAdapter)(config);
    case 'weatherapi':
      throw new Error('WeatherAPI adapter not implemented yet');
    case 'openmeteo':
      throw new Error('Open-Meteo adapter not implemented yet');
    default:
      throw new Error(`Unknown provider type: ${type}`);
  }
}
