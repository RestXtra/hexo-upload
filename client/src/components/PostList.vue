<template>
  <aside class="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shrink-0">
    <div class="p-3 border-b border-gray-100 dark:border-gray-800 space-y-2">
      <div class="flex gap-2">
        <input
          type="text"
          placeholder="搜索文章..."
          v-model="search"
          class="input flex-1"
        />
        <button class="btn btn-primary btn-sm shrink-0" @click="$emit('new')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新建
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-4 text-center text-sm text-gray-400">加载中...</div>
      <template v-else>
        <div
          v-for="post in filteredPosts"
          :key="post.slug"
          @click="$emit('select', post.slug)"
          class="px-3 py-2.5 cursor-pointer border-b border-gray-50 dark:border-gray-800/50
                 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
          :class="post.slug === currentSlug ? 'bg-blue-50 dark:bg-blue-950/30 border-l-2 border-l-blue-500' : ''"
        >
          <div class="flex items-center gap-1.5">
            <span v-if="!post.published" class="text-xs text-orange-500">●</span>
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ post.title }}</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatDate(post.date) }}</span>
            <span v-for="tag in post.tags?.slice(0, 2)" :key="tag"
              class="text-xs px-1.5 py-px rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            >{{ tag }}</span>
          </div>
          <div v-if="post.excerpt" class="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{{ post.excerpt }}</div>
        </div>
        <div v-if="filteredPosts.length === 0" class="p-4 text-center text-sm text-gray-400">
          {{ search ? '未找到匹配文章' : '暂无文章' }}
        </div>
      </template>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  currentSlug: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})
defineEmits(['select', 'new'])

const search = ref('')

const filteredPosts = computed(() => {
  if (!search.value) return props.posts
  const q = search.value.toLowerCase()
  return props.posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.tags?.some(t => t.toLowerCase().includes(q)) ||
    p.categories?.some(c => c.toLowerCase().includes(q))
  )
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>