[Use BaseInput.vue code from above]
<!-- src/components/common/BaseInput.vue -->
<script setup>
const props = defineProps({
  modelValue: [String, Number],
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  label: String,
  error: String,
  maxlength: Number,
  pattern: String
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <div class="input-wrapper">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :pattern="pattern"
      @input="updateValue"
      class="base-input"
      :class="{ 'input-error': error }"
    />
    <span v-if="error" class="error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.input-wrapper {
  width: 100%;
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.base-input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  transition: all 0.3s ease;
  font-family: inherit;
}

.base-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.base-input.input-error {
  border-color: #ef4444;
}

.error-message {
  display: block;
  font-size: 13px;
  color: #ef4444;
  margin-top: 6px;
}
</style>
