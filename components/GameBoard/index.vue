<template>
  <div class="game-board" :class="[
    { 'disabled': disabled },
    difficultyClass,
    cardCountClass
  ]">
    <GameCard
      v-for="(card, index) in cards" 
      :key="card.id"
      :value="card.value"
      :isFlipped="isCardFlipped(index)"
      :isMatched="card.isMatched"
      @click="() => !disabled && flipCard(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GameCard from '../GameCard/index.vue'
import type { Card } from '../../types/game'
import './index.css'

interface Props {
  cards: Card[];
  flippedCards: number[];
  disabled?: boolean;
  difficulty?: string | number;
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'flip-card', index: number): void;
}>()

const difficultyClass = computed(() => {
  if (props.difficulty === 6 || props.difficulty === 'easy') {
    return 'difficulty-easy'
  } else if (props.difficulty === 8 || props.difficulty === 'medium') {
    return 'difficulty-medium'
  } else if (props.difficulty === 12 || props.difficulty === 'hard') {
    return 'difficulty-hard'
  }
  return ''
})

const cardCountClass = computed(() => {
  if (props.cards.length === 12) {
    return 'card-count-12'
  } else if (props.cards.length === 16) {
    return 'card-count-16'
  } else if (props.cards.length === 24) {
    return 'card-count-24'
  }
  return ''
})

const isCardFlipped = (index: number): boolean => {
  return props.flippedCards.includes(index) || props.cards[index].isMatched
}

const flipCard = (index: number) => {
  emit('flip-card', index)
}
</script> 