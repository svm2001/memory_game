<template>
  <div class="game-card"
       @click="handleClick">
    <div class="card-inner" 
         :style="{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }">
      <div class="card-front">
        ?
      </div>
      <div class="card-back" :class="{ 'matched': isMatched }">
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import './index.css'

const props = defineProps<{
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}>()

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.isFlipped && !props.isMatched) {
    emit('click')
  }
}
</script> 