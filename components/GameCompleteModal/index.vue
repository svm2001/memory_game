<template>
  <div class="game-complete-overlay">
    <div class="game-complete-modal">
      <div class="modal-header">
        <div class="confetti-animation">
          <svg width="100" height="100" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="15" fill="none" stroke="#FFD700" stroke-width="2">
              <animate attributeName="r" from="15" to="20" dur="1s" begin="0s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="20" r="10" fill="none" stroke="#FF6347" stroke-width="2">
              <animate attributeName="r" from="10" to="15" dur="1s" begin="0.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.3s" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="20" r="5" fill="none" stroke="#7FFF00" stroke-width="2">
              <animate attributeName="r" from="5" to="10" dur="1s" begin="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        <h2 class="modal-title">Игра завершена!</h2>
      </div>
      
      <div class="modal-content">
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
        
        <div v-if="!scoreSaved" class="save-score-section">
          <h3 class="save-score-title">Сохранить результат</h3>
          <input
            v-model="playerName"
            class="name-input"
            type="text"
            placeholder="Введите ваше имя"
            maxlength="20"
          />
        </div>
        
        <div v-if="scoreSaved" class="score-saved-message">
          Результат сохранен!
        </div>
        
        <div class="action-buttons">
          <button v-if="!scoreSaved" class="btn btn-primary" @click="saveScore" :disabled="!playerName.trim()">
            Сохранить
          </button>
          <button class="btn btn-primary" @click="playAgain">
            Играть снова
          </button>
          <button class="btn btn-secondary" @click="showLeaderboard">
            Таблица лидеров
          </button>
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
  score: number;
  moves: number;
  time: string;
  timeInSeconds: number;
  difficulty: string;
  theme: string;
}>()

const emit = defineEmits(['save-score', 'play-again', 'show-leaderboard'])

const playerName = ref('')
const scoreSaved = ref(false)

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeInSeconds / 60)
  const seconds = props.timeInSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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
    name: playerName.value.trim(),
    score: props.score,
    moves: props.moves,
    time: props.time,
    timeInSeconds: props.timeInSeconds,
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
  if (!scoreSaved.value && playerName.value.trim()) {
    saveScore()
  }
  emit('show-leaderboard')
}
</script> 