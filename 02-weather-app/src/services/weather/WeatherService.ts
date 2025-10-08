import type { WeatherProvider } from '@/adapters/weather/WeatherProvider';
import { createWeatherProvider } from '@/adapters/weather/WeatherProvider';
import type {
  CurrentWeather,
  QuotaInfo,
  ProviderStatus,
  WeatherProviderConfig
} from '@/types/domain/weather';

/**
 * Provider type identifier
 */
export type ProviderType = 'mock' | 'openweather' | 'weatherapi' | 'openmeteo';

/**
 * Weather service configuration
 */
export interface WeatherServiceConfig {
  defaultProvider: ProviderType;
  providers: Record<ProviderType, WeatherProviderConfig>;
}

/**
 * Weather service
 *
 * This service manages weather providers and handles business logic
 * such as provider selection, quota management, and error handling.
 */
export class WeatherService {
  private currentProvider: WeatherProvider;
  private providerType: ProviderType;
  private config: WeatherServiceConfig;

  constructor(config: WeatherServiceConfig) {
    this.config = config;
    this.providerType = config.defaultProvider;
    this.currentProvider = this.createProvider(this.providerType);
  }

  /**
   * Get current weather for a city
   */
  async getCurrentWeather(cityName: string): Promise<CurrentWeather> {
    try {
      // Check quota before making request
      const quota = await this.currentProvider.checkQuota();

      if (quota.status === 'exceeded') {
        throw new Error(
          `Provider ${this.currentProvider.name} has exceeded its quota. ` +
          `Resets at ${quota.resetTime.toLocaleString()}`
        );
      }

      return await this.currentProvider.getCurrentWeather(cityName);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get weather: ${error.message}`);
      }
      throw new Error('Failed to get weather: Unknown error');
    }
  }

  /**
   * Get quota information for current provider
   */
  async getQuota(): Promise<QuotaInfo> {
    return await this.currentProvider.checkQuota();
  }

  /**
   * Get current provider status
   */
  async getProviderStatus(): Promise<ProviderStatus> {
    const quota = await this.currentProvider.checkQuota();

    return {
      name: this.currentProvider.name,
      isActive: true,
      quotaInfo: quota,
      lastUpdated: new Date()
    };
  }

  /**
   * Switch to a different weather provider
   */
  async switchProvider(providerType: ProviderType): Promise<void> {
    try {
      const newProvider = this.createProvider(providerType);

      // Validate new provider configuration
      await newProvider.validateConfig();

      // Switch to new provider
      this.currentProvider = newProvider;
      this.providerType = providerType;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to switch provider: ${error.message}`);
      }
      throw new Error('Failed to switch provider: Unknown error');
    }
  }

  /**
   * Get current provider type
   */
  getCurrentProviderType(): ProviderType {
    return this.providerType;
  }

  /**
   * Get current provider name
   */
  getCurrentProviderName(): string {
    return this.currentProvider.name;
  }

  /**
   * Get all available provider types
   */
  getAvailableProviders(): ProviderType[] {
    return Object.keys(this.config.providers) as ProviderType[];
  }

  /**
   * Get status for all configured providers
   */
  async getAllProviderStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    for (const providerType of this.getAvailableProviders()) {
      try {
        const provider = this.createProvider(providerType);
        const quota = await provider.checkQuota();

        statuses.push({
          name: provider.name,
          isActive: providerType === this.providerType,
          quotaInfo: quota,
          lastUpdated: new Date()
        });
      } catch (error) {
        statuses.push({
          name: providerType,
          isActive: false,
          quotaInfo: {
            used: 0,
            limit: 0,
            resetTime: new Date(),
            percentage: 0,
            status: 'exceeded'
          },
          lastUpdated: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return statuses;
  }

  /**
   * Validate a provider configuration
   */
  async validateProvider(providerType: ProviderType): Promise<boolean> {
    try {
      const provider = this.createProvider(providerType);
      return await provider.validateConfig();
    } catch (error) {
      return false;
    }
  }

  /**
   * Create a provider instance
   */
  private createProvider(providerType: ProviderType): WeatherProvider {
    const config = this.config.providers[providerType];

    if (!config) {
      throw new Error(`Provider configuration not found: ${providerType}`);
    }

    return createWeatherProvider(providerType, config);
  }
}

/**
 * Create default weather service configuration
 */
export function createDefaultConfig(): WeatherServiceConfig {
  return {
    defaultProvider: 'mock',
    providers: {
      mock: {
        name: 'Mock'
      },
      openweather: {
        name: 'OpenWeatherMap',
        apiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        timeout: 10000
      },
      weatherapi: {
        name: 'WeatherAPI',
        apiKey: import.meta.env.VITE_WEATHERAPI_API_KEY || '',
        baseUrl: 'https://api.weatherapi.com/v1',
        timeout: 10000
      },
      openmeteo: {
        name: 'Open-Meteo',
        baseUrl: 'https://api.open-meteo.com/v1',
        timeout: 10000
      }
    }
  };
}
