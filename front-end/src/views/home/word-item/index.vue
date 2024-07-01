<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent, nextTick, ref, watch} from 'vue'
import {voiceSpeak} from "@/utils/responsive-voice";
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore} from "@/stores/app";
import {showConfirmDialog} from "vant";
import {copyToClipboard} from "@/utils/common-util";

defineComponent({
  name: 'WordItem',
})

defineProps<{
  wordData: IWord
  index: number
}>()

const appStore = useAppStore()
const emit = defineEmits(['refresh-list', 'edit-word'])
const showChinese = ref(false)
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

const mouseHandler = (isHover: boolean) => {
  setTimeout(() => {
    showChinese.value = isHover ? !appStore.showChineseChecked : appStore.showChineseChecked
  }, 0)
}

const playSound = (english: string) => voiceSpeak(english)

</script>

<template>
  <div class="pl-2 text-lg odd:bg-violet-100">
    <van-swipe-cell>
      <li class="flex items-center h-14">
        <div
          class="word-box self-start flex-1 leading-tight"
          :class="{'show-chinese': showChinese}"
          @mouseover="mouseHandler(true)"
          @mouseleave="mouseHandler(false)"
        >
          <div class="btn h-14 flex items-center" @click="showChinese = true">{{ wordData.english }}</div>
          <div class="btn h-14 flex items-center text-slate-400 text-base" @click="showChinese = false">{{ index + 1 }} --{{ wordData.chinese }}</div>
        </div>
        <IconBtn icon="notes-o" @click.stop="copyToClipboard(showChinese ? wordData.chinese : wordData.english)"/>
        <IconBtn icon="volume-o" @click="playSound(wordData.english)"/>
      </li>
      <template #right>
        <div class="flex items-center gap-3 px-3">
          <van-icon class="text-red-500" name="delete-o" @click="removeHandler(wordData.id)"/>
          <van-icon name="edit" @click="emit('edit-word', wordData)"/>
        </div>
      </template>
    </van-swipe-cell>
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

:deep(.van-swipe-cell__right) {
  display: flex;
  align-items: center;
}
</style>
