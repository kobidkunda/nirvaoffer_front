<script setup>
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    class="winner-showcase"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ delay: 0.6 }"
  >
    <div class="winner-badge">🏅 Recent Winners</div>
    <div class="winners-scroll">
      <motion.div
        class="winner-item"
        :animate="{ x: [-300, 0] }"
        :transition="{ duration: 20, repeat: Infinity, ease: 'linear' }"
      >
        <span>Raj K. won <strong>₹500</strong> 💰</span>
        <span>Priya S. won <strong>Mixer</strong> 🥤</span>
        <span>Amit P. won <strong>₹1000</strong> 💵</span>
      </motion.div>
    </div>
  </motion.div>
</template>

<style scoped>
.winner-showcase {
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.winner-badge {
  font-size: 13px;
  font-weight: 700;
  color: #ffd700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.winners-scroll {
  overflow: hidden;
  white-space: nowrap;
}

.winner-item {
  display: inline-flex;
  gap: 24px;
}

.winner-item span {
  display: inline-block;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 14px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 8px;
}

.winner-item strong {
  color: #ffd700;
}
</style>