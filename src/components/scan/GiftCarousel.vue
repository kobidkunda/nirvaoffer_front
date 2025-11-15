<script setup>
import { motion } from 'motion-v'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, EffectCoverflow } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-coverflow'

defineProps({
  gifts: {
    type: Array,
    default: () => []
  }
})

// Swiper modules
const modules = [Autoplay, EffectCoverflow]
</script>

<template>
  <motion.div
    class="carousel-section"
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :transition="{ duration: 0.6 }"
  >
    <Swiper
      :modules="modules"
      :slides-per-view="4"
      :space-between="15"
      :loop="true"
      :autoplay="{
        delay: 2000,
        disableOnInteraction: false,
      }"
      :speed="1000"
      :breakpoints="{
        320: { slidesPerView: 2, spaceBetween: 10 },
        480: { slidesPerView: 3, spaceBetween: 12 },
        640: { slidesPerView: 4, spaceBetween: 15 }
      }"
      class="gifts-swiper"
    >
      <SwiperSlide v-for="gift in gifts" :key="gift.id">
        <motion.div
          class="gift-card"
          :whileHover="{ scale: 1.05, y: -5 }"
        >
          <img :src="gift.image" :alt="gift.name" class="gift-image" />
          <div class="gift-name">{{ gift.name }}</div>
        </motion.div>
      </SwiperSlide>
    </Swiper>
  </motion.div>
</template>

<style scoped>
.carousel-section {
  margin-bottom: 24px;
  padding: 0 10px;
}

.gifts-swiper {
  padding: 10px 0;
}

.gift-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 215, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s;
}

.gift-image {
  width: 90px;
  height: 90px;
  object-fit: contain;
  margin: 0 auto 6px auto;
  display: block;
}

.gift-name {
  font-size: 11px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {
  .gift-image {
    width: 100px;
    height: 60px;
  }

  .gift-name {
    font-size: 10px;
  }
}
</style>