<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent} from 'vue'
import {voiceSpeak} from "@/utils/responsive-voice";
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore} from "@/stores/app";
import {showConfirmDialog} from "vant";

defineComponent({
  name: 'WordItem',
})

defineProps<{
  wordData: IWord
}>()

const appStore = useAppStore()

const playSound = (english: string) => {
  voiceSpeak(english);
}

const emit = defineEmits(['refresh-list', 'edit-word'])

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

</script>

<template>
  <div class="px-4 text-lg odd:bg-violet-100">
    <van-swipe-cell>
      <li class="li-box">
        <div class="word-box">
          <div class="content">{{ wordData.english }}</div>
          <div class="chinese-box text-base">{{ wordData.chinese }}</div>
        </div>
        <IconBtn icon="volume-o" @click="playSound(wordData.english)" color="blue"/>
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
.li-box {
  display: flex;
  align-items: center;

  .chinese-box {
    color: #838383;
  }
}


.word-box {
  @apply h-14 flex-1;
  transform: translateY(12px);
  transition: transform 0.3s ease;

  .chinese-box {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(0);

    .chinese-box {
      opacity: 1;
    }
  }
}

:deep(.van-swipe-cell__right) {
  display: flex;
  align-items: center;
}
</style>
