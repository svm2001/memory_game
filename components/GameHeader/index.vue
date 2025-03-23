<template>
  <div class="game-header">
    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">Ходы:</span>
        <span class="stat-value">{{ moves }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Счет:</span>
        <span class="stat-value">{{ score }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Время:</span>
        <span class="stat-value">{{ time }}</span>
      </div>
    </div>
    <div class="header-buttons">
      <button 
        class="btn btn-accent"
        @click="emit('leaderboard')"
      >
        🏆 Таблица лидеров
      </button>
      <button 
        class="btn btn-primary"
        @click="emit('reset')"
      >
        🔄 Начать заново
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import './index.css'

const props = defineProps<{
  score: number;
  moves: number;
  time: string;
  playerName: string;
}>()

const emit = defineEmits(['reset', 'leaderboard'])
</script> 