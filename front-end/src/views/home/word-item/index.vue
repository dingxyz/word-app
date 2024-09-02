<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {computed, defineComponent, ref, watch} from 'vue'
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore, WORD_TYPE} from "@/stores/useApp";
import {showConfirmDialog, showNotify} from "vant";
import {copyToClipboard} from "@/utils/common-util";
import {marked} from "marked";
import 'github-markdown-css/github-markdown.css';
import {ORDER_TYPE, useVoiceStore} from "@/stores/useVoice";

defineComponent({
  name: 'WordItem',
})

const poops = defineProps<{
  wordData: IWord
  index: number
}>()

const appStore = useAppStore()
const voiceStore = useVoiceStore()
const wordItemRef = ref()
const emit = defineEmits(['refresh-list', 'edit-word'])
const showDetailPopup = ref(false)
const showChinese = ref(appStore.showChineseChecked)
const compiledMarkdown = computed(() => marked(poops.wordData.annotation));
const isPlaying = computed(() => !voiceStore.isPaused && voiceStore.playingId === poops.wordData.id)
const isPlayingByClick = ref(false) // Manual click play

const observer = new IntersectionObserver((entries) => {
  const entry = entries[0];
  if (!entry.isIntersecting) {
    wordItemRef.value?.scrollIntoView({
      block: voiceStore.playOrder === ORDER_TYPE.SEQUENTIAL ? 'start' : 'center'
    });
    observer.disconnect();
  }
});

watch(() => voiceStore.playingId, () => {
  if (isPlaying.value && wordItemRef.value) {
    observer.observe(wordItemRef.value);
  } else {
    observer?.disconnect();
  }
})
watch(() => appStore.showChineseChecked, (val) => showChinese.value = val)

const removeHandler = async (id: string) => {
  const confirm = await showConfirmDialog({
    message: 'Are you sure you want to delete?',
    width: '280px',
    theme: 'round-button',
    closeOnClickOverlay: true,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#c7c7c7',
    confirmButtonText: 'Confirm',
  })
  if (!confirm) return
  await WordApi.remove(id, {
    wordType: appStore.wordType,
  })
  emit('refresh-list')
}

const moveToLearned = async () => {
  await WordApi.moveTo({
    id: poops.wordData.id,
    wordType: poops.wordData.wordType,
    toType: WORD_TYPE.LEARNED,
  }).then(() => {
    showNotify({type: 'success', message: 'Moved to learned successfully'});
  })
  emit('refresh-list')
}

let timeoutId = null;
const mouseHandler = (isClick?: boolean) => {
  showChinese.value = !showChinese.value;
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

const playSound = (english: string) => {
  isPlayingByClick.value = true
  voiceStore.voiceSpeak(english, false, () => {
    isPlayingByClick.value = false
  })
}

const openDetail = () => showDetailPopup.value = true

</script>

<template>
  <div ref="wordItemRef" class="text-lg odd:bg-violet-100 border-red-300 rounded-md" :class="{'border': isPlaying }">
    <van-swipe-cell>
      <li class="flex items-center h-14">
        <div
          class="word-box self-start flex-1 leading-tight pl-2"
          :class="{'show-chinese': showChinese}"
          @click="mouseHandler(true)"
        >
          <div class="btn h-14 flex items-center">{{ wordData.english }}</div>
          <div class="btn h-14 flex items-center text-slate-400 text-base">{{ wordData.chinese ?? '--' }}</div>
        </div>
        <IconBtn v-if="wordData.annotation" icon="eye-o" @click="openDetail"/>
        <IconBtn icon="notes-o" @click.stop="copyToClipboard(showChinese ? wordData.chinese : wordData.english)"/>
        <IconBtn icon="volume-o" :color="isPlaying || isPlayingByClick ? '#49e05c' : ''" @click="playSound(wordData.english)"/>
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
          <IconBtn v-if="wordData.wordType === WORD_TYPE.WORDS" icon="minus" @click="moveToLearned"/>
        </div>
      </template>
    </van-swipe-cell>
    <van-popup v-model:show="showDetailPopup" v-if="wordData.annotation" closeable lazy-render class="flex p-4 bg-black" position="bottom">
      <div class="flex-1 flex flex-col">
        <div v-html="compiledMarkdown" v-bold-english class="markdown-body flex-auto overflow-auto bg-black text-white"></div>
        <div class="text-center mt-4">
          <van-button type="success" @click="showDetailPopup = false" class="w-full">CLOSE</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<style scoped lang="scss">
.word-box {
  transform: translateY(0);
  transition: transform 0.3s ease;

  &.show-chinese {
    transform: translateY(-50%);
  }
}

:deep(.van-swipe-cell__right), :deep(.van-swipe-cell__left) {
  display: flex;
  align-items: center;
}
</style>
