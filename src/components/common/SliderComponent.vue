<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import { shopAPI } from '@/api/endpoints'
import { useLanguage } from '@/composables/useLanguage'

const router = useRouter()
const { locale } = useLanguage()

const props = defineProps({
  autoplayDelay: {
    type: Number,
    default: 3000
  },
  showPagination: {
    type: Boolean,
    default: true
  }
})

const slides = ref([])
const loading = ref(true)

const fetchSlides = async () => {
  loading.value = true
  try {
    const response = await shopAPI.getSlider()
    slides.value = response.slides || []
  } catch (err) {
    console.error('Failed to fetch slider:', err)
  } finally {
    loading.value = false
  }
}

const handleSlideClick = (slide) => {
  if (slide.link && slide.link.url) {
    if (slide.link.targetBlank) {
      window.open(slide.link.url, '_blank')
    } else {
      // Handle internal navigation
      if (slide.link.url.startsWith('/')) {
        router.push(slide.link.url)
      } else {
        window.location.href = slide.link.url
      }
    }
  }
}

onMounted(fetchSlides)
</script>

<template>
  <div v-if="!loading && slides.length > 0" class="slider-section">
    <Swiper
      :slides-per-view="1"
      :autoplay="{ delay: autoplayDelay }"
      :loop="true"
      :pagination="showPagination ? { clickable: true } : false"
      class="slider-swiper"
    >
      <SwiperSlide v-for="slide in slides" :key="slide.id">
        <div
          class="slide"
          :style="{ backgroundImage: `url(${slide.images.desktop})` }"
          @click="handleSlideClick(slide)"
        >
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style scoped>
.slider-section {
  margin-bottom: 30px;
}

.slider-swiper {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.slide {
  position: relative;
  height: 675px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.slide:hover {
  transform: scale(1.02);
}

@media (max-width: 640px) {
  .slide {
    height: 375px;
  }

  .slide-content {
    padding: 16px;
    max-width: 300px;
  }

  .slide h2 {
    font-size: 20px;
  }

  .slide p {
    font-size: 14px;
  }
}
</style>