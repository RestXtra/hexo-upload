<template>
  <div class="px-4 py-3 space-y-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">标题</label>
        <input type="text" class="input" placeholder="文章标题" v-model="title" />
      </div>
      <div class="flex items-center gap-2 pt-5">
        <input type="checkbox" id="metaPublished" v-model="published" class="rounded" />
        <label for="metaPublished" class="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">发布</label>
      </div>
    </div>

    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">分类</label>
        <input type="text" class="input" placeholder="分类1, 分类2" v-model="categoriesStr" />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">标签</label>
        <input type="text" class="input" placeholder="标签1, 标签2" v-model="tagsStr" />
      </div>
    </div>

    <div>
      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">简介</label>
      <textarea class="input" rows="2" placeholder="文章摘要，会显示在博客首页卡片中..." v-model="excerpt" />
    </div>

    <div class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
      <span>{{ date || '新文章' }}</span>
      <span class="truncate">{{ slug }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  frontmatter: { type: Object, default: () => ({}) },
  slug: { type: String, default: '' }
})
const emit = defineEmits(['update'])

const title = ref('')
const categoriesStr = ref('')
const tagsStr = ref('')
const published = ref(true)
const excerpt = ref('')

const date = computed(() => {
  if (!props.frontmatter?.date) return ''
  const d = new Date(props.frontmatter.date)
  return d.toLocaleString('zh-CN')
})

watch(() => props.frontmatter, (fm) => {
  if (fm) {
    title.value = fm.title || ''
    categoriesStr.value = Array.isArray(fm.categories)
      ? fm.categories.join(', ')
      : (fm.categories || '')
    tagsStr.value = Array.isArray(fm.tags)
      ? fm.tags.join(', ')
      : (fm.tags || '')
    published.value = fm.published !== false
    excerpt.value = fm.excerpt || fm.description || ''
  }
}, { immediate: true, deep: true })

watch([title, categoriesStr, tagsStr, published, excerpt], () => {
  const categories = categoriesStr.value
    ? categoriesStr.value.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const tags = tagsStr.value
    ? tagsStr.value.split(',').map(s => s.trim()).filter(Boolean)
    : []
  emit('update', {
    title: title.value,
    categories,
    tags,
    date: props.frontmatter?.date,
    published: published.value,
    excerpt: excerpt.value
  })
}, { deep: true })
</script>