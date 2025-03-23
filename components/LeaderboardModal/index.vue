<template>
  <div class="leaderboard-overlay">
    <div class="leaderboard-modal">
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">Таблица лидеров</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      
      <div class="leaderboard-content">
        <template v-if="leaderboard.length > 0">
          <div class="leaderboard-table">
            <div class="leaderboard-table-header">
              <span class="column-player">Игрок</span>
              <span class="column-score">Очки</span>
              <span class="column-moves">Ходы</span>
              <span class="column-time">Время</span>
              <span class="column-theme">Режим</span>
              <span class="column-difficulty">Сложность</span>
            </div>
            
            <div 
              v-for="(entry, index) in sortedLeaderboard" 
              :key="`${entry.name}-${entry.timestamp}`" 
              :class="['leaderboard-row', entry.name === highlightName ? 'highlighted-row' : '']"
            >
              <span class="column-player">{{ entry.name }}</span>
              <span class="column-score">{{ entry.score }}</span>
              <span class="column-moves">{{ entry.moves }}</span>
              <span class="column-time">{{ formatTime(entry.timeInSeconds) }}</span>
              <span class="column-theme">{{ getThemeLabel(entry.theme) }}</span>
              <span class="column-difficulty">{{ getLevelLabel(entry.difficulty) }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-primary" @click="$emit('close')">
              Закрыть
            </button>
            <button class="btn reset-btn" @click="showResetConfirm = true">
              Сбросить
            </button>
          </div>
        </template>
        
        <div v-else class="empty-message">
          <p>Нет сохраненных результатов.</p>
          <button class="btn btn-primary" @click="$emit('close')">
            Закрыть
          </button>
        </div>
      </div>
      
      <div v-if="showResetConfirm" class="reset-confirm-overlay">
        <div class="reset-confirm-modal">
          <h3 class="confirm-title">Подтверждение сброса</h3>
          <p class="confirm-message">Вы действительно хотите сбросить таблицу лидеров? Все результаты будут удалены.</p>
          
          <div class="confirm-buttons">
            <button class="btn btn-primary" @click="showResetConfirm = false">
              Отмена
            </button>
            <button class="btn reset-btn" @click="resetLeaderboard">
              Да, сбросить
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LeaderboardEntry } from '../../types/game'
import './index.css'

const props = defineProps<{
  leaderboard: LeaderboardEntry[];
  highlightName?: string;
}>()

const emit = defineEmits(['close', 'reset'])

const showResetConfirm = ref(false)

const sortedLeaderboard = computed(() => {
  return [...props.leaderboard].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }
    return a.timeInSeconds - b.timeInSeconds
  })
})

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const getLevelLabel = (level: any) => {
  if (level === 6 || level === '6' || level === 'Легкий' || level === 'easy') {
    return 'Легкий';
  } else if (level === 8 || level === '8' || level === 'Средний' || level === 'medium') {
    return 'Средний';
  } else if (level === 12 || level === '12' || level === 'Сложный' || level === 'hard') {
    return 'Сложный';
  }
  
  return String(level);
}

const getThemeLabel = (theme: string) => {
  const labels: Record<string, string> = {
    animals: 'Животные',
    food: 'Еда',
    travel: 'Транспорт'
  }
  return labels[theme] || theme
}

const resetLeaderboard = () => {
  emit('reset')
  showResetConfirm.value = false
}
</script> 