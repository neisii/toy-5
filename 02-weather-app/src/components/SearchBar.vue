<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  search: [city: string];
}>();

const city = ref('');

function handleSubmit() {
  const trimmedCity = city.value.trim();
  if (trimmedCity) {
    emit('search', trimmedCity);
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="search-form">
    <input
      v-model="city"
      type="text"
      placeholder="도시 이름"
      class="search-input"
    />
    <button type="submit" class="search-button">검색</button>
  </form>
</template>

<style scoped>
.search-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-button {
  padding: 0.75rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #2563eb;
}
</style>
