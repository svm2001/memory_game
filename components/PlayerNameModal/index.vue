<template>
  <div class="player-modal-overlay">
    <div class="player-modal">
      <div class="modal-content">
        <h2 class="modal-title">Добро пожаловать в Memory Game!</h2>
        <p class="modal-subtitle">Пожалуйста, введите ваше имя для начала игры</p>
        
        <div class="input-container">
          <input 
            id="playerName"
            v-model="playerName" 
            placeholder="Ваше имя"
            @keyup.enter="startGame" 
            ref="nameInput"
            class="name-input"
            required
          />
        </div>
        
        <div class="button-container">
          <button 
            class="modal-btn start-btn"
            @click="startGame" 
            :disabled="isStartDisabled"
          >
            🎮 Начать игру
          </button>
          <button 
            v-if="hasLeaderboard" 
            class="modal-btn leaderboard-btn"
            @click="showLeaderboard"
          >
            🏆 Таблица лидеров
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import './index.css'

const props = defineProps<{
  hasLeaderboard: boolean;
}>()

const emit = defineEmits(['start-game', 'show-leaderboard'])

const playerName = ref('')
const showError = ref(false)
const nameInput = ref<HTMLInputElement | null>(null)

const isStartDisabled = computed(() => {
  return playerName.value.trim() === ''
})

onMounted(() => {
  // Фокус на поле ввода имени
  if (nameInput.value) {
    nameInput.value.focus()
  }
})

const startGame = () => {
  if (playerName.value.trim() === '') {
    showError.value = true
    return
  }
  
  emit('start-game', playerName.value.trim())
}

const showLeaderboard = () => {
  emit('show-leaderboard')
}
</script> 