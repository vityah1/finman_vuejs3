<template>
  <transition name="p-message">
    <Message v-if="visible" :severity="severity" @close="hideAlert" :closable="true">{{ content }}</Message>
  </transition>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import Message from 'primevue/message';

const visible = ref(false);
const content = ref('');
const severity = ref('info'); // Default severity

let timeoutId = null;

const showAlert = (sev, cont) => {
  content.value = cont;
  // Map bootstrap variants to primevue severities
  const severityMap = {
    danger: 'error',
    success: 'success',
    warning: 'warn',
    info: 'info',
    primary: 'info',
    secondary: 'secondary'
  };
  severity.value = severityMap[sev] || 'info';
  visible.value = true;

  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  // Set a new timeout to hide the alert
  timeoutId = setTimeout(() => {
    visible.value = false;
  }, 5000);
};

const hideAlert = () => {
  visible.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
};

// Expose the showAlert method to parent components
defineExpose({
  showAlert,
});
</script>