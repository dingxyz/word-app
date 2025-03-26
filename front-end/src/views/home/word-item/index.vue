<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {computed, defineComponent, ref, watch} from 'vue'
import IconBtn from '@/components/IconBtn.vue'
import {useAppStore} from '@/stores/useApp'
import {showConfirmDialog} from 'vant'
import {copyToClipboard} from '@/utils/common-util'
import 'github-markdown-css/github-markdown.css'
import {useVoiceStore} from '@/stores/useVoice'
import AnnoPopup from "@/views/home/word-item/anno-popup/index.vue";
import {useWorldStore} from "@/stores/useWorldview";

defineComponent({
  name: 'WordItem'
})

const props = defineProps<{
  wordData: IWord
  index: number
}>()

const appStore = useAppStore()
const voiceStore = useVoiceStore()
const worldStore = useWorldStore()
const wordItemRef = ref()
const annoPopupRef = ref<InstanceType<typeof AnnoPopup>>()
const emit = defineEmits(['refresh-list', 'edit-word'])
const showChinese = ref(appStore.showChineseChecked)
const isPlaying = computed(() => !voiceStore.isPaused && voiceStore.playingId === props.wordData.id)
const isPlayingByClick = ref(false) // Manual click play

const observer = new IntersectionObserver((entries) => {
  const entry = entries[0]
  if (!entry.isIntersecting || appStore.isLiteMode) {
    wordItemRef.value?.scrollIntoView({
      block: 'start'
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
    bookId: appStore.bookId
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


const toggleCollect = async () => {
  // eslint-disable-next-line vue/no-mutating-props
  props.wordData.collect = !props.wordData.collect
  await WordApi.collectToggle(props.wordData)
}

const playSound = () => {
  const str = props.wordData.english + (props.wordData.context ? ';' + props.wordData.context : '')
  isPlayingByClick.value = true
  voiceStore.voiceSpeak(str, false, () => {
    isPlayingByClick.value = false
  })
}

const openDetail = () => annoPopupRef.value.open(props.wordData)
</script>

<template>
  <div
    ref="wordItemRef"
    class="word-list-item text-[#fff] bg-[#006633] odd:bg-[#124f33]"
    :class="{ '!text-blue-300': isPlaying || isPlayingByClick }"
  >
    <van-swipe-cell>
      <li class="flex items-center">
        <div
          class="word-box text-lg self-start flex-1 leading-normal pl-2 relative"
          :class="{ 'show-chinese': showChinese }"
          @click="playSound"
        >
          <div
            @touchstart="startLongPress"
            @touchmove="endLongPress"
            @touchend="endLongPress"
            class="first-text min-h-16 py-2 btn h-auto gap-4 flex items-center justify-between"
          >
            {{ wordData.english }}
            <div
              class="text-sm pr-2 text-slate-300"
              :class="{ '!text-blue-300': isPlaying || isPlayingByClick }"
              v-html="wordData.context?.replace(/;/g,`<br/>`)"
            />
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
        <div
          class="triangle-btn absolute top-0 bottom-0 right-0 w-1/3 active:bg-[#ffffff33]"
          @click="openDetail"
        >
          <div v-if="wordData.annotation" class="absolute top-0 right-0 w-0 h-0 border-l-9 border-t-9 border-red-700 border-l-transparent"></div>
          <!--          <IconBtn icon="eye-o"/>-->
        </div>
        <IconBtn
          v-if="appStore.isWorldview && worldStore.showStar"
          :icon="wordData.collect ? 'star' : 'star-o'"
          :color="wordData.collect ? 'yellow' : 'white'"
          @click="toggleCollect"
        />
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

    <AnnoPopup ref="annoPopupRef"/>
  </div>
</template>

<style scoped lang="scss">
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
</style>
