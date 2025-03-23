<template>
  <div class="memory-game-container">
    <div class="sidebar">
      <div class="player-info-section">
        <div class="player-name">
          <span>Игрок: {{ playerName }}</span>
        </div>
      </div>
      
      <div class="game-controls-section">
        <h3 class="section-title">Уровень сложности</h3>
        <div class="difficulty-controls">
          <button 
            v-for="level in difficultyLevels" 
            :key="level.value"
            @click="setDifficulty(level.value)"
            :class="{ active: difficulty === level.value }"
            class="difficulty-button"
          >
            {{ getDifficultyEmoji(level.value) }} {{ level.label }}
          </button>
        </div>

        <h3 class="section-title">Тема</h3>
        <div class="theme-controls">
          <button 
            v-for="theme in themes" 
            :key="theme.name"
            @click="setTheme(theme.name)"
            :class="{ active: currentTheme === theme.name }"
            class="theme-button"
          >
            {{ getThemeEmoji(theme.name) }} {{ theme.label }}
          </button>
          <button @click="randomTheme" class="random-button">🎲 Случайно</button>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-primary" @click="confirmReset">
          🔄 Начать заново
        </button>
        <button class="btn btn-accent" @click="showLeaderboard">
          🏆 Таблица лидеров
        </button>
        <button class="btn btn-player-change" @click="changePlayer">
          <span class="player-icon">👤</span> Сменить игрока
        </button>
      </div>
    </div>

    <div class="game-area">
      <div class="game-top-info">
        <div class="game-stats-section">
          <div class="stat-item">
            <span class="stat-label">🎮 Ходы:</span>
            <span class="stat-value">{{ moves }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">🏅 Счет:</span>
            <span class="stat-value">{{ score }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">⏱️ Время:</span>
            <span class="stat-value">{{ formattedTime }}</span>
          </div>
        </div>
        
        <div v-if="!isGameActive" class="game-status">
          <button class="btn btn-success pulse-button" @click="startGame">
            🎮 Начать игру
          </button>
        </div>
      </div>

      <GameBoard 
        :cards="cards" 
        :flippedCards="flippedCards" 
        @flip-card="flipCard"
        :disabled="!isGameActive"
        :difficulty="difficulty"
      />
    </div>

    <GameCompleteModal 
      v-if="isGameComplete" 
      :score="score" 
      :moves="moves"
      :time="formattedTime"
      :timeInSeconds="gameTime.value"
      :difficulty="getDifficultyLabel(difficulty)"
      :theme="currentTheme"
      @save-score="handleSaveScore"
      @play-again="resetGame" 
      @show-leaderboard="showLeaderboard"
    />
    
    <ConfirmModal 
      v-if="showConfirmNewGame" 
      title="Начать новую игру?"
      message="Вы уверены, что хотите начать игру заново?"
      confirm-text="Да"
      cancel-text="Нет"
      @confirm="handleConfirmNewGame" 
      @cancel="showConfirmNewGame = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import GameHeader from '../GameHeader/index.vue'
import GameBoard from '../GameBoard/index.vue'
import GameCompleteModal from '../GameCompleteModal/index.vue'
import ConfirmModal from '../ConfirmModal/index.vue'
import type { Card, LeaderboardEntry } from '../../types/game'
import './index.css'

const props = defineProps<{
  playerName: string;
}>()

const emit = defineEmits<{
  (e: 'game-complete', result: Omit<LeaderboardEntry, 'name' | 'timestamp'>): void;
  (e: 'show-leaderboard'): void;
  (e: 'change-player'): void;
}>()

const difficultyLevels = [
  { label: 'Легкий', value: 6 },
  { label: 'Средний', value: 8 },
  { label: 'Сложный', value: 12 }
]
const difficulty = ref(difficultyLevels[1].value)

const themes = [
  { 
    name: 'animals', 
    label: 'Животные', 
    symbols: [] 
  },
  { 
    name: 'food', 
    label: 'Еда', 
    symbols: [] 
  },
  { 
    name: 'travel', 
    label: 'Транспорт', 
    symbols: [] 
  }
]
const currentTheme = ref('animals')

const FLIP_DELAY = 600 

const cards = ref<Card[]>([])
const flippedCards = ref<number[]>([]) 
const matchedCards = ref<number[]>([])
const isLocked = ref(false) 
const moves = ref(0) 
const score = ref(0) 
const gameTime = ref(0)
const timerInterval = ref<number | null>(null) 
const showConfirmNewGame = ref(false)
const isGameActive = ref(false)

const currentSymbols = computed(() => {
  return themes.find(t => t.name === currentTheme.value)?.symbols || []
})

const isGameComplete = computed(() => {
  return matchedCards.value.length === cards.value.length && cards.value.length > 0
})

const formattedTime = computed(() => {
  const minutes = Math.floor(gameTime.value / 60);
  const seconds = gameTime.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

onMounted(async () => {
  // Загрузка иконок из JSON файлов
  await loadThemeIcons()
  prepareGame()
})

watch(flippedCards, (newValue) => {
  if (newValue.length === 2) setTimeout(() => checkMatch(), 300)
})

const setDifficulty = (level: number) => {
  difficulty.value = level
  prepareGame()
}

const setTheme = (theme: string) => {
  currentTheme.value = theme
  prepareGame()
}

const randomTheme = () => {
  const themeNames = themes.map(t => t.name)
  const randomIndex = Math.floor(Math.random() * themeNames.length)
  currentTheme.value = themeNames[randomIndex]
  prepareGame()
}

const prepareGame = () => {
  cards.value = generateCards()
  flippedCards.value = []
  matchedCards.value = []
  moves.value = 0
  score.value = 0
  gameTime.value = 0
  isLocked.value = false
  
  stopTimer()
  
  isGameActive.value = false
}

const startGame = () => {
  isGameActive.value = true
  startTimer()
}

const initGame = () => {
  prepareGame()
  startGame()
}

const generateCards = () => {
  const shuffledSymbols = shuffleArray([...currentSymbols.value])
  const selectedSymbols = shuffledSymbols.slice(0, difficulty.value)
  
  const cardDeck: Card[] = [...selectedSymbols, ...selectedSymbols].map((symbol, index) => ({
    id: index,
    value: symbol,
    isMatched: false
  }))
  
  return shuffleArray(cardDeck)
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

const flipCard = (cardIndex: number) => {
  if (
    !isGameActive.value ||
    isLocked.value || 
    flippedCards.value.includes(cardIndex) || 
    matchedCards.value.includes(cardIndex) ||
    flippedCards.value.length >= 2
  ) {
    return
  }
  
  flippedCards.value.push(cardIndex)
  
  if (flippedCards.value.length === 2) {
    moves.value++
    
    setTimeout(() => {
      checkMatch()
    }, 300)
  }
}

const startTimer = () => {
  timerInterval.value = window.setInterval(() => {
    gameTime.value++
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval.value !== null) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

const checkMatch = () => {
  if (flippedCards.value.length !== 2) return
  
  isLocked.value = true
  
  const [firstIndex, secondIndex] = flippedCards.value
  const firstCard = cards.value[firstIndex]
  const secondCard = cards.value[secondIndex]
  
  if (firstCard.value === secondCard.value) {
    firstCard.isMatched = true
    secondCard.isMatched = true
    
    matchedCards.value.push(firstIndex, secondIndex)
    
    const baseScore = 10
    const difficultyMultiplier = difficulty.value / 6
    score.value += Math.round(baseScore * difficultyMultiplier)
    
    flippedCards.value = []
    isLocked.value = false
    
    if (matchedCards.value.length === cards.value.length && cards.value.length > 0) {
      stopTimer()
      
      emit('game-complete', {
        score: score.value,
        moves: moves.value,
        time: formattedTime.value,
        timeInSeconds: gameTime.value,
        difficulty: getDifficultyLabel(difficulty.value),
        theme: currentTheme.value
      })
    }
  } else {
    setTimeout(() => {
      flippedCards.value = []
      isLocked.value = false
    }, FLIP_DELAY)
  }
}

const resetGame = () => {
  initGame()
}

const confirmReset = () => {
  if (isGameComplete.value) {
    resetGame()
  } else {
    showConfirmNewGame.value = true
  }
}

const handleConfirmNewGame = () => {
  showConfirmNewGame.value = false
  resetGame()
}

const showLeaderboard = () => {
  emit('show-leaderboard')
}

const changePlayer = () => {
  emit('change-player')
}

const getDifficultyLabel = (difficulty: number): string => {
  const level = difficultyLevels.find(l => l.value === difficulty)
  return level ? level.label : 'Неизвестный'
}

const getDifficultyEmoji = (difficulty: number): string => {
  switch (difficulty) {
    case 6:
      return '😊' 
    case 8:
      return '🤔' 
    case 12:
      return '🧠' 
    default:
      return '🎯'
  }
}

const getThemeEmoji = (theme: string): string => {
  switch (theme) {
    case 'animals':
      return '🦁' 
    case 'food':
      return '🍔' 
    case 'travel':
      return '🚗' 
    default:
      return '🎯'
  }
}

const handleSaveScore = (entry: LeaderboardEntry) => {
  emit('game-complete', {
    score: entry.score,
    moves: entry.moves,
    time: entry.time,
    timeInSeconds: entry.timeInSeconds,
    difficulty: entry.difficulty,
    theme: entry.theme,
    name: entry.name,
    timestamp: entry.timestamp
  })
}

const loadThemeIcons = async () => {
  try {
    const [animalsResponse, foodResponse, travelResponse] = await Promise.all([
      fetch('./assets/images/animal_icons.json'),
      fetch('./assets/images/food_icons.json'),
      fetch('./assets/images/travel_icons.json')
    ])
    
    const animalsData = await animalsResponse.json()
    const foodData = await foodResponse.json()
    const travelData = await travelResponse.json()
    
    themes.find(t => t.name === 'animals')!.symbols = animalsData.map((item: {emoji: string}) => item.emoji)
    themes.find(t => t.name === 'food')!.symbols = foodData.map((item: {emoji: string}) => item.emoji)
    themes.find(t => t.name === 'travel')!.symbols = travelData.map((item: {emoji: string}) => item.emoji)
  } catch (error) {
    console.error('Ошибка при загрузке иконок:', error)
    const defaultAnimals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐮', '🐷']
    const defaultFood = ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🍍', '🥝']
    const defaultTravel = ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸']
    
    themes.find(t => t.name === 'animals')!.symbols = defaultAnimals
    themes.find(t => t.name === 'food')!.symbols = defaultFood
    themes.find(t => t.name === 'travel')!.symbols = defaultTravel
  }
}
</script> 