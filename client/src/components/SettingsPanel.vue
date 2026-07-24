<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="card p-5">
      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Hexo 博客路径
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
        设置你的 Hexo 博客根目录路径，这样管理后台才能找到文章和主题配置。
      </p>
      <div class="flex gap-2">
        <input type="text" class="input flex-1" v-model="hexoDir" placeholder="F:\github\myblog" />
        <button class="btn btn-primary btn-sm" @click="saveHexoDir" :disabled="hexoDirSaving">
          {{ hexoDirSaving ? '保存中...' : '保存' }}
        </button>
      </div>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        当前路径: {{ hexoInfo?.hexoDir || '未设置' }}
      </p>
    </div>

    <div class="card p-5">
      <h3 class="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        个人资料
      </h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            头像
          </label>
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <img v-if="previewAvatar" :src="previewAvatar + '?t=' + avatarKey" @error="onImgError" class="w-full h-full object-cover" />
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-600"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
            </div>
            <label class="btn btn-outline btn-sm cursor-pointer">
              <input type="file" accept="image/*" @change="onUpload($event, 'avatar')" hidden />
              选择图片
            </label>
            <span class="text-xs text-gray-400 truncate">{{ config.avatar || '未设置' }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            首页背景 - 浅色模式
            <span class="text-xs text-gray-400 font-normal">(图片或 MP4 视频)</span>
          </label>
          <div class="flex items-center gap-3">
            <div class="w-28 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <video v-if="isBannerVideo(previewBannerLight)" :src="previewBannerLight + '?t=' + bannerLightKey" muted loop autoplay playsinline class="w-full h-full object-cover"></video>
              <img v-else-if="previewBannerLight" :src="previewBannerLight + '?t=' + bannerLightKey" @error="onImgError" class="w-full h-full object-cover" />
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <label class="btn btn-outline btn-sm cursor-pointer">
              <input type="file" accept="image/*,video/*" @change="onUpload($event, 'banner-light')" hidden />
              选择文件
            </label>
            <span class="text-xs text-gray-400 truncate">{{ config.bannerLight || '未设置' }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            首页背景 - 深色模式
            <span class="text-xs text-gray-400 font-normal">(图片或 MP4 视频)</span>
          </label>
          <div class="flex items-center gap-3">
            <div class="w-28 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <video v-if="isBannerVideo(previewBannerDark)" :src="previewBannerDark + '?t=' + bannerDarkKey" muted loop autoplay playsinline class="w-full h-full object-cover"></video>
              <img v-else-if="previewBannerDark" :src="previewBannerDark + '?t=' + bannerDarkKey" @error="onImgError" class="w-full h-full object-cover" />
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-300 dark:text-gray-600"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <label class="btn btn-outline btn-sm cursor-pointer">
              <input type="file" accept="image/*,video/*" @change="onUpload($event, 'banner-dark')" hidden />
              选择文件
            </label>
            <span class="text-xs text-gray-400 truncate">{{ config.bannerDark || '未设置' }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            Banner 标题
          </label>
          <input type="text" class="input" v-model="editTitle" placeholder="你在首页看到的那句话" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            Banner 副标题
          </label>
          <div class="space-y-1.5 mb-2">
            <div v-for="(item, idx) in editSubtitle" :key="idx" class="flex gap-1.5">
              <input type="text" class="input flex-1" v-model="editSubtitle[idx]" placeholder="副标题..." />
              <button class="btn-icon shrink-0" @click="editSubtitle.splice(idx, 1)" title="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
          <button class="btn btn-outline btn-sm" @click="editSubtitle.push('')">+ 添加一行</button>
        </div>
      </div>

      <div class="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchThemeConfig, updateThemeConfig, uploadProfileImage, fetchHexoInfo, updateHexoDir } from '../api.js'

const props = defineProps({
  hexoInfo: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['saved', 'hexo-dir-changed'])

const config = ref({})
const editTitle = ref('')
const editSubtitle = ref([])
const saving = ref(false)
const hexoDirSaving = ref(false)
const hexoDir = ref('')
const previewAvatar = ref('')
const previewBannerLight = ref('')
const previewBannerDark = ref('')
const avatarKey = ref(0)
const bannerLightKey = ref(0)
const bannerDarkKey = ref(0)

onMounted(async () => {
  try {
    const data = await fetchThemeConfig()
    config.value = data
    editTitle.value = data.title || ''
    editSubtitle.value = Array.isArray(data.subtitle) ? [...data.subtitle] : []
    previewAvatar.value = data.avatar || ''
    previewBannerLight.value = data.bannerLight || ''
    previewBannerDark.value = data.bannerDark || ''
  } catch (e) { /* ignore */ }
  hexoDir.value = props.hexoInfo?.hexoDir || ''
})

function onImgError(e) {
  e.target.style.opacity = '0'
}

function isBannerVideo(url) {
  return url && /\.(mp4|webm|mov)$/i.test(url)
}

async function onUpload(e, type) {
  const file = e.target.files[0]
  if (!file) return
  const fd = new FormData()
  fd.append('image', file)
  fd.append('type', type)
  try {
    const res = await uploadProfileImage(fd)
    if (res.success) {
      const url = res.url
      if (type === 'avatar') { previewAvatar.value = url; avatarKey.value++ }
      else if (type === 'banner-light') { previewBannerLight.value = url; bannerLightKey.value++ }
      else if (type === 'banner-dark') { previewBannerDark.value = url; bannerDarkKey.value++ }
    }
  } catch (e) { alert('上传失败') }
  e.target.value = ''
}

async function saveProfile() {
  saving.value = true
  try {
    await updateThemeConfig({
      title: editTitle.value,
      subtitle: editSubtitle.value.filter(s => s.trim())
    })
    emit('saved')
  } catch (e) { alert('保存失败') }
  finally { saving.value = false }
}

async function saveHexoDir() {
  if (!hexoDir.value.trim()) return
  hexoDirSaving.value = true
  try {
    await updateHexoDir(hexoDir.value.trim())
    emit('hexo-dir-changed')
  } catch (e) { alert('保存失败') }
  finally { hexoDirSaving.value = false }
}
</script>