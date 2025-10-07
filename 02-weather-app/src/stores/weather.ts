import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CurrentWeather } from '../types/weather';
import { weatherApi } from '../services/weatherApi';

export const useWeatherStore = defineStore('weather', () => {
  const currentWeather = ref<CurrentWeather | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchWeather(city: string) {
    loading.value = true;
    error.value = null;

    try {
      const data = await weatherApi.getCurrentWeather(city);

      currentWeather.value = {
        city: data.name,
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        error.value = '도시를 찾을 수 없습니다';
      } else if (err.response?.status === 401) {
        error.value = 'API 키가 유효하지 않습니다';
      } else {
        error.value = '오류가 발생했습니다. 다시 시도해주세요';
      }
      currentWeather.value = null;
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    currentWeather,
    loading,
    error,
    fetchWeather,
    clearError,
  };
});
