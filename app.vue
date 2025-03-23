<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MemoryGame from './components/MemoryGame/index.vue'
import PlayerNameModal from './components/PlayerNameModal/index.vue'
import LeaderboardModal from './components/LeaderboardModal/index.vue'
import type { LeaderboardEntry } from './types/game'

const playerName = ref('')
const isGameStarted = ref(false)
const showLeaderboard = ref(false)
const leaderboard = ref<LeaderboardEntry[]>([])

onMounted(() => {
  loadLeaderboard()
})

const handleStartGame = (name: string) => {
  playerName.value = name
  isGameStarted.value = true
}

const toggleLeaderboard = () => {
  showLeaderboard.value = !showLeaderboard.value
}

const handleGameComplete = (result: Omit<LeaderboardEntry, 'name' | 'timestamp'>) => {
  const newEntry: LeaderboardEntry = {
    name: playerName.value,
    ...result,
    timestamp: Date.now()
  }
  
  const existingEntryIndex = leaderboard.value.findIndex(entry => 
    entry.name === playerName.value && 
    entry.difficulty === result.difficulty && 
    entry.theme === result.theme
  )
  
  if (existingEntryIndex !== -1) {
    const existingEntry = leaderboard.value[existingEntryIndex]
    if (result.score > existingEntry.score || 
      (result.score === existingEntry.score && result.timeInSeconds < existingEntry.timeInSeconds)) {
      leaderboard.value[existingEntryIndex] = newEntry
    }
  } else {
    leaderboard.value.push(newEntry)
  }
  
  saveLeaderboard()
}

const resetGame = () => {
  isGameStarted.value = false
}

const resetLeaderboard = () => {
  leaderboard.value = []
  saveLeaderboard()
  showLeaderboard.value = false
}

const saveLeaderboard = () => {
  localStorage.setItem('memoryGameLeaderboard', JSON.stringify(leaderboard.value))
}

const loadLeaderboard = () => {
  const savedLeaderboard = localStorage.getItem('memoryGameLeaderboard')
  if (savedLeaderboard) {
    try {
      let loadedLeaderboard = JSON.parse(savedLeaderboard)
      
      loadedLeaderboard = loadedLeaderboard.map((entry: any) => {
        if (!entry.theme) {
          entry.theme = 'animals'
        }
        
        if (typeof entry.difficulty === 'number') {
          if (entry.difficulty === 6) {
            entry.difficulty = 'Легкий'
          } else if (entry.difficulty === 8) {
            entry.difficulty = 'Средний'
          } else if (entry.difficulty === 12) {
            entry.difficulty = 'Сложный'
          } else {
            entry.difficulty = String(entry.difficulty)
          }
        }
        
        return entry
      })
      
      leaderboard.value = loadedLeaderboard
      
      if (savedLeaderboard !== JSON.stringify(loadedLeaderboard)) {
        saveLeaderboard()
      }
    } catch (e) {
      console.error('Ошибка при загрузке таблицы лидеров:', e)
      leaderboard.value = []
    }
  }
}

const handleChangePlayer = () => {
  isGameStarted.value = false
}
</script>

<template>
  <div class="app-container">
    <div class="author">author:
      <a href="https://t.me/svm_2001" target="_blank">@svm_2001</a>
    </div>
    <div class="app-header">
      <h1 class="app-title">
        <img src="./assets/images/brain.avif" alt="Memory Game" class="logo">
        Memory Game</h1>
      <p class="app-description">Найдите пары одинаковых карточек. <br>Развивайте память и получайте удовольствие!</p>
    </div>
    
    <MemoryGame 
      v-if="isGameStarted" 
      :playerName="playerName" 
      @game-complete="handleGameComplete"
      @show-leaderboard="toggleLeaderboard"
      @change-player="handleChangePlayer"
    />
    
    <PlayerNameModal 
      v-if="!isGameStarted" 
      :hasLeaderboard="leaderboard.length > 0"
      @start-game="handleStartGame"
      @show-leaderboard="toggleLeaderboard"
    />
    
    <LeaderboardModal 
      v-if="showLeaderboard" 
      :leaderboard="leaderboard"
      :highlightName="playerName"
      @close="toggleLeaderboard"
      @reset="resetLeaderboard"
    />
  </div>
</template>

<style>
#__nuxt {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
}

.author {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 1rem;
  color: #64748b;
}

.author a {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s ease;
  &:hover {
    color: #0a1e2c;
  }
}

.logo {
  width: 60px;
  height: 60px;
}

.app-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

.app-header {
  text-align: center;
}

.app-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-top: 0;
  font-size: 2.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  background: linear-gradient(to right, #3498db, #2c3e50);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-description {
  white-space: nowrap;
  color: #64748b;
  max-width: 36rem;
  margin: 0 auto;
  line-height: 1.6;
}

html {
  min-height: 100dvh;
  scroll-behavior: smooth;
  background-color: white;
}

body {
  background-color: white;
  font-family: 'Roboto', sans-serif;
  margin: 0;
  padding: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.5s ease forwards;
}

:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --accent-color: #9b59b6;
  --success-color: #27ae60;
  --background-color: #f9fafb;
  --text-color: #2c3e50;
  --text-light: #64748b;
  --border-color: #e2e8f0;
  --font-family: 'Roboto', sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  font-family: 'Roboto', sans-serif;
}
</style>