<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {computed, defineComponent, ref, watch} from 'vue'
import {voiceSpeak} from "@/utils/responsive-voice";
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore, WORD_TYPE} from "@/stores/useApp";
import {showConfirmDialog, showNotify} from "vant";
import {copyToClipboard} from "@/utils/common-util";
import {marked} from "marked";
import 'github-markdown-css/github-markdown.css';

defineComponent({
  name: 'WordItem',
})

const poops = defineProps<{
  wordData: IWord
  index: number
}>()

const appStore = useAppStore()
const emit = defineEmits(['refresh-list', 'edit-word'])
const showDetailPopup = ref(false)
const showChinese = ref(false)
watch(() => appStore.showChineseChecked, (val) => showChinese.value = val)
const compiledMarkdown = computed(() => marked(poops.wordData.annotation));

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

const mouseHandler = (isHover: boolean) => {
  setTimeout(() => {
    showChinese.value = isHover ? !showChinese.value : appStore.showChineseChecked;
  }, 0)
}

const playSound = (english: string) => voiceSpeak(english)

const openDetail = () => showDetailPopup.value = true

</script>

<template>
  <div class="text-lg odd:bg-violet-100">
    <van-swipe-cell>
      <li class="flex items-center h-14">
        <div
          class="word-box self-start flex-1 leading-tight pl-2"
          :class="{'show-chinese': showChinese}"
          @mouseover="mouseHandler(true)"
          @mouseleave="mouseHandler(false)"
        >
          <div class="btn h-14 flex items-center">{{ wordData.english }}</div>
          <div class="btn h-14 flex items-center text-slate-400 text-base">{{ wordData.chinese }}</div>
        </div>
        <IconBtn v-if="wordData.annotation" icon="eye-o" @click="openDetail"/>
        <IconBtn icon="notes-o" @click.stop="copyToClipboard(showChinese ? wordData.chinese : wordData.english)"/>
        <IconBtn icon="volume-o" @click="playSound(wordData.english)"/>
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
          <IconBtn v-if="wordData.wordType !== WORD_TYPE.LEARNED" icon="minus" @click="moveToLearned"/>
        </div>
      </template>
    </van-swipe-cell>
    <van-popup v-model:show="showDetailPopup" v-if="wordData.annotation" closeable lazy-render class="flex p-4" position="bottom">
      <div class="flex-1 flex flex-col">
        <div v-html="compiledMarkdown" class="markdown-body flex-auto overflow-auto"></div>
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
