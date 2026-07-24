<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <MetaPanel
      :frontmatter="frontmatter"
      :slug="slug"
      @update="onMetaUpdate"
    />

    <div class="flex-1 overflow-hidden" ref="vditorWrap">
      <div id="vditor-container" class="h-full"></div>
    </div>

    <div class="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <span v-if="status" class="text-xs text-gray-500 dark:text-gray-400">{{ status }}</span>
      <span v-else class="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{{ slug }}</span>
      <div class="flex gap-1.5">
        <button class="btn btn-danger btn-sm" title="删除" @click="$emit('delete')" v-html="iconTrash" />
        <button class="btn btn-outline btn-sm" title="保存" @click="$emit('save')" :disabled="saving" v-html="saving ? iconSpinner : iconSave" />
        <button class="btn btn-primary btn-sm" title="保存并部署" @click="$emit('save-deploy')" :disabled="saving" v-html="iconDeploy" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import MetaPanel from './MetaPanel.vue'

const props = defineProps({
  content: { type: String, default: '' },
  frontmatter: { type: Object, default: () => ({}) },
  slug: { type: String, default: '' },
  saving: { type: Boolean, default: false },
  status: { type: String, default: '' }
})

const emit = defineEmits(['save', 'save-deploy', 'delete', 'content-change', 'meta-change'])

const iconTrash = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
const iconSave = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
const iconDeploy = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4l.5.5a2.5 2.5 0 0 0 3.5 0z"/><path d="M15 12h5l-.5-.5a2.5 2.5 0 0 0-3.5 0z"/></svg>'
const iconSpinner = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/></svg>'

let vditor = null
let ignoreContentWatch = false

function onMetaUpdate(meta) {
  emit('meta-change', meta)
}

function initVditor() {
  if (vditor) return

  vditor = new window.Vditor('vditor-container', {
    height: '100%',
    mode: 'ir',
    placeholder: '开始写作...',
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'line', 'quote', 'list', 'ordered-list', 'check', '|',
      'table', 'code', 'inline-code', '|',
      'link', 'upload', 'emoji', '|',
      'undo', 'redo', '|',
      'edit-mode', 'outline', 'preview', 'fullscreen'
    ],
    cache: { enable: false },
    preview: {
      hljs: { style: 'github' }
    },
    upload: {
      accept: 'image/*',
      url: '/api/upload-image',
      fieldName: 'image',
      multiple: false,
      // Pass article slug so images are organized by article
      extraData: { slug: props.slug || '' },
      // Vditor handles insertion automatically from { code: 0, data: { url } } response
    },
    input: () => {
      if (vditor) emit('content-change', vditor.getValue())
    },
    after: () => {
      if (props.content) {
        ignoreContentWatch = true
        vditor.setValue(props.content)
        nextTick(() => { ignoreContentWatch = false })
      }
    }
  })
}

onMounted(() => {
  nextTick(() => initVditor())
})

watch(() => props.content, (newContent) => {
  if (ignoreContentWatch) return
  if (vditor && newContent !== undefined) {
    const current = vditor.getValue()
    if (current !== newContent) {
      ignoreContentWatch = true
      vditor.setValue(newContent || '')
      nextTick(() => { ignoreContentWatch = false })
    }
  }
})

function getContent() {
  return vditor ? vditor.getValue() : ''
}

onBeforeUnmount(() => {
  if (vditor) {
    vditor.destroy()
    vditor = null
  }
})

defineExpose({ getContent })
</script>