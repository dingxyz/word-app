<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {computed, defineComponent, ref, watch} from 'vue'
import IconBtn from '@/components/IconBtn.vue'
import {useAppStore} from '@/stores/useApp'
import {showConfirmDialog, showNotify} from 'vant'
import {copyToClipboard} from '@/utils/common-util'
import {marked} from 'marked'
import 'github-markdown-css/github-markdown.css'
import {ORDER_TYPE, useVoiceStore} from '@/stores/useVoice'
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'WordItem'
})

const props = defineProps<{
  wordData: IWord
  index: number
}>()

const appStore = useAppStore()
const voiceStore = useVoiceStore()
const paginationStore = usePaginationStore()
const wordItemRef = ref()
const emit = defineEmits(['refresh-list', 'edit-word'])
const showDetailPopup = ref(false)
const showChinese = ref(appStore.showChineseChecked)
const compiledMarkdown = computed(
  () => `<h3>${appStore.isLiteMode ? '' : props.wordData.english}</h3>` + marked(props.wordData.annotation)
)
const isPlaying = computed(() => !voiceStore.isPaused && voiceStore.playingId === props.wordData.id)
const isPlayingByClick = ref(false) // Manual click play

const observer = new IntersectionObserver((entries) => {
  const entry = entries[0]
  if (!entry.isIntersecting || appStore.isLiteMode) {
    wordItemRef.value?.scrollIntoView({
      block: voiceStore.playOrder === ORDER_TYPE.SEQUENTIAL ? 'start' : 'center'
    })
    observer.disconnect()
  }
})

watch(
  () => voiceStore.playingId,
  () => {
    if (isPlaying.value && wordItemRef.value) {
      observer.observe(wordItemRef.value)
    } else {
      observer?.disconnect()
    }
  }
)
watch(
  () => appStore.showChineseChecked,
  (val) => (showChinese.value = val)
)

const removeHandler = async (id: string) => {
  const confirm = await showConfirmDialog({
    message: 'Are you sure you want to delete?',
    width: '280px',
    theme: 'round-button',
    closeOnClickOverlay: true,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#c7c7c7',
    confirmButtonText: 'Confirm'
  }).catch(() => false)
  if (!confirm) return
  await WordApi.remove(id, {
    wordType: appStore.wordType
  })
  emit('refresh-list')
}

let timeoutId = null
const mouseHandler = (isClick?: boolean) => {
  showChinese.value = !showChinese.value
  if (!props.wordData.chinese) {
    showChinese.value = false
  }
  if (isClick) {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    } else {
      timeoutId = setTimeout(() => {
        mouseHandler()
        timeoutId = null
      }, 1500)
    }
  }
}

let longPressTimer = null
const startLongPress = () => {
  longPressTimer = setTimeout(() => {
    copyToClipboard(showChinese.value ? props.wordData.chinese : props.wordData.english)
  }, 500)
}

const endLongPress = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
}

const detailPopupClickHandler = (event: MouseEvent) => {
  if (event.target instanceof HTMLElement) {
    const tagName = event.target.tagName.toLowerCase()
    if (tagName === 'strong') {
      const oldColor = (event.target as HTMLElement).style.color
      event.target.style.color = '#02c3ff'
      const text = event.target.textContent
      voiceStore.voiceSpeak(text, false, () => {
        ;(event.target as HTMLElement).style.color = oldColor
      })
    }
  }
}

const toggleCollect = async () => {
  // eslint-disable-next-line vue/no-mutating-props
  props.wordData.collect =!props.wordData.collect
  await WordApi.collectToggle(props.wordData)
}

const playSound = (english: string) => {
  isPlayingByClick.value = true
  voiceStore.voiceSpeak(english, false, () => {
    isPlayingByClick.value = false
  })
}

const openDetail = () => (showDetailPopup.value = true)
</script>

<template>
  <div
    ref="wordItemRef"
    class="word-list-item text-[#fff] text-lg bg-[#006633] odd:bg-[#124f33]"
    :class="{ '!text-blue-300': isPlaying || isPlayingByClick, 'is-worldview': appStore.isWorldview }"
  >
    <van-swipe-cell>
      <li class="flex items-center">
        <div
          class="word-box self-start flex-1 leading-normal pl-2"
          :class="{ 'show-chinese': showChinese }"
          @click="playSound(wordData.english)"
        >
          <div
            @touchstart="startLongPress"
            @touchmove="endLongPress"
            @touchend="endLongPress"
            class="first-text min-h-16 btn h-auto py-2 flex items-center"
          >
            {{ wordData.english }}
          </div>
          <div
            @touchstart="startLongPress"
            @touchmove="endLongPress"
            @touchend="endLongPress"
            class="second-text min-h-16 btn h-auto py-2 flex items-center text-slate-400 text-base"
          >
            {{ wordData.chinese ?? '--' }}
          </div>
        </div>
        <IconBtn
          v-if="appStore.isWorldview && paginationStore.showStar"
          :icon="wordData.collect ? 'star' : 'star-o'"
          :color="wordData.collect ? 'yellow' : 'white'"
          @click="toggleCollect"
        />
        <IconBtn v-if="wordData.annotation" icon="eye-o" @click="openDetail"/>
        <IconBtn v-if="wordData.chinese" icon="exchange" @click="mouseHandler(true)"/>
      </li>
      <template #left>
        <div class="p-1 text-sm text-fuchsia-500">
          {{ index + 1 }}
        </div>
      </template>
      <template #right>
        <div class="flex items-center">
          <IconBtn icon="delete-o" @click="removeHandler(wordData.id)" color="red"/>
          <IconBtn icon="edit" @click="emit('edit-word', wordData)"/>
        </div>
      </template>
    </van-swipe-cell>
    <van-popup
      v-model:show="showDetailPopup"
      v-if="wordData.annotation"
      closeable
      lazy-render
      class="flex p-4 bg-black"
      position="bottom"
    >
      <div class="flex-1 flex flex-col">
        <div
          v-html="compiledMarkdown"
          v-bold-english
          @click="detailPopupClickHandler"
          class="markdown-body flex-auto overflow-auto bg-black text-white"
        ></div>
        <div class="text-center mt-4">
          <van-button type="success" @click="showDetailPopup = false" class="w-full">
            CLOSE
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.word-list-item.is-worldview {
  background-color: #006633;

  &:nth-child(4n - 1), &:nth-child(4n - 2) {
    background-color: #124f33;
  }
}

.word-box {
  .second-text {
    display: none;
  }

  &.show-chinese {
    .first-text {
      display: none;
    }

    .second-text {
      display: flex;
    }
  }
}

:deep(.van-swipe-cell__right),
:deep(.van-swipe-cell__left) {
  display: flex;
  align-items: center;
}
</style>
