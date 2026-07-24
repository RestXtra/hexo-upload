<template>
  <div class="topbar">
    <div class="topbar-left">
      <span class="logo">✏️ Hexo Upload</span>
      <span class="hexo-path">{{ hexoInfo.hexoDir }}</span>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-outline" @click="$emit('settings')">⚙️ 设置</button>
      <button class="btn btn-outline" @click="$emit('preview')">👁 预览</button>
      <button class="btn btn-outline" @click="$emit('generate')" :disabled="generating">
        {{ generating ? '⏳ 生成中...' : '📦 生成' }}
      </button>
      <button class="btn btn-primary" @click="$emit('deploy')">🚀 一键部署</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hexoInfo: { type: Object, default: () => ({}) },
  generating: { type: Boolean, default: false }
})
defineEmits(['preview', 'generate', 'deploy', 'settings'])
</script>