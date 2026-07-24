<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="show = false">
    <div class="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 w-96 p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{{ title }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">{{ message }}</p>
      <div v-if="loading" class="flex justify-center py-4">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p v-if="hint" class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ hint }}</p>
      <div v-if="!loading" class="flex justify-end gap-2 mt-5">
        <button class="btn btn-outline" @click="show = false">关闭</button>
        <button v-if="confirmText" class="btn btn-primary" @click="$emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const show = ref(false)
const title = ref('')
const message = ref('')
const hint = ref('')
const loading = ref(false)
const confirmText = ref('')

defineEmits(['confirm'])

function open(opts = {}) {
  title.value = opts.title || ''
  message.value = opts.message || ''
  hint.value = opts.hint || ''
  loading.value = opts.loading || false
  confirmText.value = opts.confirmText || ''
  show.value = true
}

function close() {
  show.value = false
}

defineExpose({ open, close })
</script>