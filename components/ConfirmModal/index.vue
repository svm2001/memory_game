<template>
  <div class="confirm-modal-overlay">
    <div class="confirm-modal-container">
      <div class="confirm-modal-content">
        <h2 class="confirm-modal-title">{{ title }}</h2>
        <p class="confirm-modal-message">{{ message }}</p>
        
        <div class="confirm-modal-buttons">
          <button 
            class="confirm-modal-btn confirm-btn"
            @click="$emit('confirm')"
          >
            {{ confirmText }}
          </button>
          <button 
            class="confirm-modal-btn cancel-btn"
            @click="$emit('cancel')"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import './index.css'

const props = defineProps<{
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}>()

const emit = defineEmits(['confirm', 'cancel'])
</script> 