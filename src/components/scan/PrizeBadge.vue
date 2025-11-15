<script setup>
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    class="prize-badge"
    :animate="{
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, 0]
    }"
    :transition="{
      duration: 2,
      repeat: Infinity,
      repeatDelay: 1
    }"
  >
    <div class="badge-shine"></div>
    <span class="badge-text">🎊 WIN AMAZING PRIZES! 🎊</span>
  </motion.div>
</template>

<style scoped>
.prize-badge {
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #000;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.6),
              inset 0 2px 4px rgba(255, 255, 255, 0.5);
  border: 3px solid #fff;
  overflow: hidden;
}

.badge-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  to { left: 200%; }
}

@media (max-width: 640px) {
  .prize-badge {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>