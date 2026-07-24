<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-950">
    <nav class="w-14 bg-sidebar-bg flex flex-col items-center py-3 gap-1 border-r border-sidebar-border shrink-0">
      <div class="mb-3 text-lg font-bold text-white/80 select-none">H</div>

      <button
        v-for="item in navItems"
        :key="item.id"
        @click="activeView = item.id"
        :title="item.label"
        class="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150"
        :class="activeView === item.id
          ? 'bg-sidebar-active text-sidebar-activeText'
          : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-activeText'"
        v-html="item.icon"
      />

      <div class="flex-1" />

      <button
        title="暗色/亮色模式"
        @click="toggleDark"
        class="w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-activeText transition-all"
        v-html="darkIcon"
      />
    </nav>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-11 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-3 bg-white dark:bg-gray-900 shrink-0">
        <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ navTitle }}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500 truncate hidden sm:inline">{{ hexoInfo.hexoDir }}</span>
        <div class="flex-1" />
        <template v-if="activeView === 'posts'">
          <button class="btn btn-outline btn-sm" title="预览" @click="onPreview" :disabled="generating" v-html="iconEye" />
          <button class="btn btn-outline btn-sm" title="生成静态文件" @click="onGenerate" :disabled="generating" v-html="generating ? iconSpinner : iconBuild" />
        </template>
      </header>

      <main class="flex-1 flex overflow-hidden">
        <div v-if="activeView === 'posts'" class="flex flex-1 overflow-hidden">
          <PostList
            :posts="posts"
            :currentSlug="currentSlug"
            :loading="postsLoading"
            @select="selectPost"
            @new="newPost"
          />

          <div class="flex-1 flex flex-col overflow-hidden">
            <div v-if="!currentSlug" class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
              <div class="text-center">
                <div class="text-5xl mb-3">📝</div>
                <p class="text-lg">选择文章开始编辑</p>
                <p class="text-sm mt-1">或点击「+ 新建」创建新文章</p>
              </div>
            </div>

            <PostEditor
              v-if="currentSlug"
              ref="editorRef"
              :content="editorContent"
              :frontmatter="editorFrontmatter"
              :slug="currentSlug"
              :saving="saving"
              :status="saveStatus"
              @save="savePost"
              @save-deploy="saveAndDeploy"
              @delete="confirmDelete"
              @content-change="onContentChange"
              @meta-change="onMetaChange"
            />
          </div>
        </div>

        <div v-if="activeView === 'settings'" class="flex-1 overflow-auto p-6">
          <SettingsPanel
            @saved="showToast('设置已保存')"
            :hexoInfo="hexoInfo"
            @hexo-dir-changed="onHexoDirChanged"
          />
        </div>
      </main>
    </div>

    <Modal ref="modalRef" @confirm="onModalConfirm" />

    <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PostList from './components/PostList.vue'
import PostEditor from './components/PostEditor.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import Modal from './components/Modal.vue'
import {
  fetchPosts, fetchPost, createPost, updatePost, deletePost as apiDeletePost,
  deploySite, generateSite, previewSite, fetchHexoInfo
} from './api.js'

const darkIcon = computed(() => isDark.value
  ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
  : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>')

const iconEye = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
const iconBuild = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/><polyline points="16 16 12 12 8 16"/></svg>'
const iconRocket = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4l.5.5a2.5 2.5 0 0 0 3.5 0z"/><path d="M15 12h5l-.5-.5a2.5 2.5 0 0 0-3.5 0z"/></svg>'
const iconSpinner = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/></svg>'

const navItems = [
  { id: 'posts', label: '文章', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>' },
  { id: 'settings', label: '设置', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>' },
]

const activeView = ref('posts')
const navTitle = computed(() => navItems.find(n => n.id === activeView.value)?.label || '')

const isDark = ref(false)
function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('hexo-upload-theme', isDark.value ? 'dark' : 'light')
}

const posts = ref([])
const postsLoading = ref(false)
const currentSlug = ref('')
const editorContent = ref('')
const editorFrontmatter = ref({})
const hexoInfo = ref({})
const saving = ref(false)
const saveStatus = ref('')
const generating = ref(false)
const toastMsg = ref('')

const editorRef = ref(null)
const modalRef = ref(null)

let pendingMeta = null
let pendingDeleteSlug = ''

function showToast(msg, duration = 2000) {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, duration)
}

async function loadPosts() {
  postsLoading.value = true
  try { posts.value = await fetchPosts() } catch (e) { showToast('加载文章列表失败') }
  postsLoading.value = false
}

async function loadHexoInfo() {
  try { hexoInfo.value = await fetchHexoInfo() } catch (e) { /* ignore */ }
}

async function selectPost(slug) {
  try {
    const post = await fetchPost(slug)
    currentSlug.value = slug
    editorContent.value = post.content
    editorFrontmatter.value = post.frontmatter
    pendingMeta = { ...post.frontmatter }
    saveStatus.value = ''
  } catch (e) { showToast('加载文章失败') }
}

async function newPost() {
  const title = prompt('请输入文章标题：')
  if (!title) return
  try {
    const result = await createPost({ title, content: '', tags: [], categories: [] })
    if (result.success) {
      await loadPosts()
      await selectPost(result.slug)
    }
  } catch (e) { showToast('创建文章失败') }
}

function onContentChange(content) {
  editorContent.value = content
}

function onMetaChange(meta) {
  pendingMeta = meta
}

async function savePost() {
  if (!currentSlug.value) return
  saving.value = true
  saveStatus.value = '保存中...'
  try {
    const content = editorRef.value?.getContent() || editorContent.value
    await updatePost(currentSlug.value, { frontmatter: pendingMeta, content })
    saveStatus.value = '已保存'
    setTimeout(() => { saveStatus.value = '' }, 2000)
    await loadPosts()
  } catch (e) { saveStatus.value = '保存失败' }
  saving.value = false
}

async function saveAndDeploy() {
  await savePost()
  await onDeploy()
}

function confirmDelete() {
  pendingDeleteSlug = currentSlug.value
  modalRef.value?.open({ title: '确认删除', message: '确定要删除这篇文章吗？此操作不可恢复。', confirmText: '删除' })
}

async function onModalConfirm() {
  if (pendingDeleteSlug) {
    try {
      await apiDeletePost(pendingDeleteSlug)
      currentSlug.value = ''
      editorContent.value = ''
      editorFrontmatter.value = {}
      await loadPosts()
      showToast('已删除')
    } catch (e) { showToast('删除失败') }
    pendingDeleteSlug = ''
  }
}

async function onGenerate() {
  generating.value = true
  try {
    await generateSite()
    showToast('静态文件生成完成')
  } catch (e) { showToast('生成失败') }
  generating.value = false
}

async function onDeploy() {
  try {
    await deploySite()
    showToast('正在部署到 GitHub Pages...')
  } catch (e) { showToast('部署失败') }
}

function onPreview() {
  previewSite()
  showToast('正在启动预览服务器...')
  setTimeout(() => { window.open('http://localhost:4000', '_blank') }, 2000)
}

async function onHexoDirChanged() {
  await loadHexoInfo()
  await loadPosts()
}

onMounted(() => {
  const saved = localStorage.getItem('hexo-upload-theme')
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  loadPosts()
  loadHexoInfo()
})
</script>