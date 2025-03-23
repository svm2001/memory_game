<template>
  <div class="game-complete-overlay">
      
      <div class="modal-content">
        <h2 class="modal-title">Игра завершена!</h2>
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">Счет</div>
              <div class="stat-value">{{ score }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Ходы</div>
              <div class="stat-value">{{ moves }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Время</div>
              <div class="stat-value">{{ formattedTime }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Сложность</div>
              <div class="stat-value">{{ difficultyLabel }}</div>
            </div>
          </div>
        </div>
        
        <div v-if="scoreSaved" class="score-saved-message">
          Результат сохранен!
        </div>
        
        <div class="action-buttons">

          <button class="btn btn-primary" @click="playAgain">
            Играть снова
          </button>
          <button class="btn btn-secondary" @click="showLeaderboard">
            Таблица лидеров
          </button>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LeaderboardEntry } from '../../types/game'
import './index.css'

const props = defineProps<{
  score: number;
  moves: number;
  time: string;
  timeInSeconds: number;
  difficulty: string;
  theme: string;
}>()

const emit = defineEmits(['save-score', 'play-again', 'show-leaderboard', 'change-name'])

const scoreSaved = ref(false)

const formattedTime = computed(() => {
  if (isNaN(props.timeInSeconds) || props.timeInSeconds === undefined) {
    if (typeof props.time === 'string' && props.time.includes(':')) {
      return props.time;
    }
    
    return '0:00';
  }
  
  const timeValue = parseInt(String(props.timeInSeconds), 10);
  const minutes = Math.floor(timeValue / 60);
  const seconds = timeValue % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
})

const difficultyLabel = computed(() => {
  if (props.difficulty === 'easy' || props.difficulty === '6') {
    return 'Легкий'
  } else if (props.difficulty === 'medium' || props.difficulty === '8') {
    return 'Средний'
  } else if (props.difficulty === 'hard' || props.difficulty === '12') {
    return 'Сложный'
  }
  return props.difficulty
})


const saveScore = () => {
  const leaderboardEntry: LeaderboardEntry = {
    name: "Игрок",
    score: props.score,
    moves: props.moves,
    time: formattedTime.value, 
    timeInSeconds: isNaN(props.timeInSeconds) ? 0 : props.timeInSeconds,
    difficulty: props.difficulty,
    theme: props.theme,
    timestamp: Date.now()
  }
  
  emit('save-score', leaderboardEntry)
  scoreSaved.value = true
}

const playAgain = () => {
  emit('play-again')
}

const showLeaderboard = () => {
  if (!scoreSaved.value) {
    saveScore()
  }
  emit('show-leaderboard')
}
</script> 