<template>
  <div class="provider-comparison">
    <div v-for="stat in sortedStats" :key="stat.provider" class="provider-card" :class="{ 'is-best': stat === bestStat }">
      <div class="card-header">
        <div class="provider-info">
          <h3 class="provider-name">{{ providerDisplayName(stat.provider) }}</h3>
          <span v-if="stat === bestStat" class="best-badge">🏆 최고 정확도</span>
        </div>
        <div class="overall-score">
          <div class="score-value">{{ stat.overallScore.toFixed(1) }}</div>
          <div class="score-label">종합 점수</div>
        </div>
      </div>

      <div class="card-body">
        <div class="metrics">
          <div class="metric">
            <div class="metric-icon">🌡️</div>
            <div class="metric-content">
              <div class="metric-label">평균 온도 오차</div>
              <div class="metric-value">{{ stat.avgTempError.toFixed(1) }}°C</div>
              <div class="metric-bar">
                <div class="bar-fill" :style="{ width: tempErrorPercentage(stat) + '%', backgroundColor: tempErrorColor(stat) }"></div>
              </div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">☁️</div>
            <div class="metric-content">
              <div class="metric-label">날씨 조건 일치율</div>
              <div class="metric-value">{{ stat.conditionMatchRate.toFixed(0) }}%</div>
              <div class="metric-bar">
                <div class="bar-fill" :style="{ width: stat.conditionMatchRate + '%', backgroundColor: conditionColor(stat) }"></div>
              </div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">💧</div>
            <div class="metric-content">
              <div class="metric-label">평균 습도 오차</div>
              <div class="metric-value">{{ stat.avgHumidityError.toFixed(0) }}%</div>
              <div class="metric-bar">
                <div class="bar-fill" :style="{ width: humidityErrorPercentage(stat) + '%', backgroundColor: humidityErrorColor(stat) }"></div>
              </div>
            </div>
          </div>

          <div class="metric">
            <div class="metric-icon">💨</div>
            <div class="metric-content">
              <div class="metric-label">평균 풍속 오차</div>
              <div class="metric-value">{{ stat.avgWindSpeedError.toFixed(1) }} m/s</div>
              <div class="metric-bar">
                <div class="bar-fill" :style="{ width: windErrorPercentage(stat) + '%', backgroundColor: windErrorColor(stat) }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="data-points">📊 {{ stat.totalDays }}일 데이터</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProviderStats } from '@/composables/useAccuracyData';

const props = defineProps<{
  providerStats: ProviderStats[];
}>();

// Sort by overall score (descending)
const sortedStats = computed(() => {
  return [...props.providerStats].sort((a, b) => b.overallScore - a.overallScore);
});

const bestStat = computed(() => sortedStats.value[0]);

function providerDisplayName(provider: string): string {
  const names: Record<string, string> = {
    openweather: 'OpenWeatherMap',
    weatherapi: 'WeatherAPI',
    openmeteo: 'Open-Meteo',
  };
  return names[provider] || provider;
}

// Temperature error percentage (0-5°C range)
function tempErrorPercentage(stat: ProviderStats): number {
  return Math.min(100, (stat.avgTempError / 5) * 100);
}

function tempErrorColor(stat: ProviderStats): string {
  if (stat.avgTempError < 1.5) return '#10b981'; // green
  if (stat.avgTempError < 3) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

// Condition match color
function conditionColor(stat: ProviderStats): string {
  if (stat.conditionMatchRate >= 80) return '#10b981';
  if (stat.conditionMatchRate >= 60) return '#f59e0b';
  return '#ef4444';
}

// Humidity error percentage (0-20% range)
function humidityErrorPercentage(stat: ProviderStats): number {
  return Math.min(100, (stat.avgHumidityError / 20) * 100);
}

function humidityErrorColor(stat: ProviderStats): string {
  if (stat.avgHumidityError < 5) return '#10b981';
  if (stat.avgHumidityError < 10) return '#f59e0b';
  return '#ef4444';
}

// Wind error percentage (0-3 m/s range)
function windErrorPercentage(stat: ProviderStats): number {
  return Math.min(100, (stat.avgWindSpeedError / 3) * 100);
}

function windErrorColor(stat: ProviderStats): string {
  if (stat.avgWindSpeedError < 1) return '#10b981';
  if (stat.avgWindSpeedError < 2) return '#f59e0b';
  return '#ef4444';
}
</script>

<style scoped>
.provider-comparison {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.provider-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.provider-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.provider-card.is-best {
  border-color: #8b5cf6;
  background: linear-gradient(to bottom, #faf5ff 0%, white 100%);
}

.card-header {
  padding: 1.5rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.is-best .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.provider-info {
  flex: 1;
}

.provider-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: #1a202c;
}

.is-best .provider-name {
  color: white;
}

.best-badge {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.overall-score {
  text-align: right;
}

.score-value {
  font-size: 2rem;
  font-weight: 700;
  color: #8b5cf6;
  line-height: 1;
}

.is-best .score-value {
  color: white;
}

.score-label {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.25rem;
}

.is-best .score-label {
  color: rgba(255, 255, 255, 0.9);
}

.card-body {
  padding: 1.5rem;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.metric {
  display: flex;
  gap: 1rem;
}

.metric-icon {
  font-size: 1.5rem;
  width: 2rem;
  text-align: center;
}

.metric-content {
  flex: 1;
}

.metric-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.metric-bar {
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease, background-color 0.3s ease;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}
</style>
