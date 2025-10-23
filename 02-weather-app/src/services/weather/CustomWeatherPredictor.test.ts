import { describe, it, expect } from 'vitest';
import { CustomWeatherPredictor } from '@/services/weather/CustomWeatherPredictor';
import type { ProviderPredictions } from '@/types/domain/customPrediction';

describe('CustomWeatherPredictor', () => {
  const predictor = new CustomWeatherPredictor();

  const mockProviders: ProviderPredictions = {
    openweather: {
      location: { name: 'Seoul', name_ko: '서울', country: 'KR', lat: 37.5683, lon: 126.9778, localtime: '2025-10-23 12:00' },
      current: {
        temp_c: 18,
        feelslike_c: 17,
        humidity: 68,
        wind_kph: 7.2,
        condition: { main: 'Clouds', description: '구름 많음', description_ko: '구름 많음', icon: '04d' }
      }
    },
    weatherapi: {
      location: { name: 'Seoul', name_ko: '서울', country: 'KR', lat: 37.5683, lon: 126.9778, localtime: '2025-10-23 12:00' },
      current: {
        temp_c: 17,
        feelslike_c: 16,
        humidity: 62,
        wind_kph: 9.0,
        condition: { main: 'Partly cloudy', description: '부분 흐림', description_ko: '부분 흐림', icon: '02d' }
      }
    },
    openmeteo: {
      location: { name: 'Seoul', name_ko: '서울', country: 'KR', lat: 37.5683, lon: 126.9778, localtime: '2025-10-23 12:00' },
      current: {
        temp_c: 19,
        feelslike_c: 18,
        humidity: 0,
        wind_kph: 7.92,
        condition: { main: '흐림', description: '흐림', description_ko: '흐림', icon: '03d' }
      }
    }
  };

  it('should generate custom prediction', () => {
    const prediction = predictor.predict(mockProviders);
    expect(prediction).toBeDefined();
    expect(prediction.location.name).toBe('Seoul');
  });

  it('should calculate weighted temperature correctly', () => {
    const prediction = predictor.predict(mockProviders);
    expect(prediction.current.temp_c).toBeCloseTo(18.3, 1);
  });

  it('should calculate weighted humidity (excluding OpenMeteo)', () => {
    const prediction = predictor.predict(mockProviders);
    expect(prediction.current.humidity).toBeCloseTo(64, 0);
  });

  it('should use OpenWeather condition', () => {
    const prediction = predictor.predict(mockProviders);
    expect(prediction.current.condition.main).toBe('Clouds');
  });

  it('should include confidence metrics', () => {
    const prediction = predictor.predict(mockProviders);
    expect(prediction.confidence.overall).toBeGreaterThanOrEqual(0);
    expect(prediction.confidence.overall).toBeLessThanOrEqual(100);
  });
});
