<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent} from 'vue'
import {voiceSpeak} from "@/utils/responsive-voice";

defineComponent({
  name: 'WordItem',
})

defineProps<{
  wordData: IWord
}>()

const playSound = (english: string) => {
  voiceSpeak(english);
}

const emit = defineEmits(['refresh-list', 'edit-word'])

const removeHandler = async (id: string) => {
  await WordApi.remove(id)
  emit('refresh-list')
}

</script>

<template>
  <div class="px-4">
    <van-swipe-cell>
      <li class="li-box">
        <div class="word-box">
          <div class="content">{{ wordData.english }}</div>
          <div class="chinese-box">{{ wordData.chinese }}</div>
        </div>
        <van-icon name="volume-o" @click="playSound(wordData.english)"/>
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
    font-size: 12px;
    color: #838383;
  }
}


.word-box {
  height: 44px;
  @apply flex-1;
  transform: translateY(8px);
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
