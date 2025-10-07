<script setup lang="ts">
import type { CurrentWeather } from '../types/weather';

defineProps<{
  weather: CurrentWeather;
}>();

function getIconUrl(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}
</script>

<template>
  <div class="weather-card">
    <h2 class="city-name">{{ weather.city }}</h2>

    <div class="weather-main">
      <img
        :src="getIconUrl(weather.icon)"
        :alt="weather.description"
        class="weather-icon"
      />
      <div class="temperature">{{ weather.temperature }}°C</div>
    </div>

    <p class="description">{{ weather.description }}</p>

    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-label">체감온도</span>
        <span class="detail-value">{{ weather.feelsLike }}°C</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">습도</span>
        <span class="detail-value">{{ weather.humidity }}%</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">풍속</span>
        <span class="detail-value">{{ weather.windSpeed }} m/s</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.city-name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.weather-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.weather-icon {
  width: 100px;
  height: 100px;
}

.temperature {
  font-size: 3.5rem;
  font-weight: 700;
}

.description {
  text-align: center;
  font-size: 1.25rem;
  color: #666;
  margin: 0 0 2rem 0;
  text-transform: capitalize;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.875rem;
  color: #999;
}

.detail-value {
  font-size: 1.125rem;
  font-weight: 600;
}
</style>
