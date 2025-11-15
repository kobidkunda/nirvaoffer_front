<script setup>
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    class="excitement-chips"
    :initial="{ opacity: 0 }"
    :animate="{ opacity: 1 }"
    :transition="{ delay: 0.3 }"
  >
    <motion.div
      class="chip"
      :animate="{ scale: [1, 1.05, 1] }"
      :transition="{ duration: 1.5, repeat: Infinity, delay: 0 }"
    >
      💵 Instant Cash
    </motion.div>
    <motion.div
      class="chip"
      :animate="{ scale: [1, 1.05, 1] }"
      :transition="{ duration: 1.5, repeat: Infinity, delay: 0.3 }"
    >
      🎁 Free Gifts
    </motion.div>
    <motion.div
      class="chip"
      :animate="{ scale: [1, 1.05, 1] }"
      :transition="{ duration: 1.5, repeat: Infinity, delay: 0.6 }"
    >
      🏆 Big Prizes
    </motion.div>
  </motion.div>
</template>

<style scoped>
.excitement-chips {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.chip {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@media (max-width: 640px) {
  .excitement-chips {
    gap: 8px;
  }

  .chip {
    font-size: 11px;
    padding: 5px 12px;
  }
}
</style>