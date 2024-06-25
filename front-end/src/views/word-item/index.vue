<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent} from 'vue'

defineComponent({
  name: 'WordItem',
})

defineProps<{
  wordData: IWord
}>()

const playSound = (english: string) => {
  let words = new SpeechSynthesisUtterance(english);
  window.speechSynthesis.speak(words);
}

const emit = defineEmits(['refresh-list', 'edit-word'])

const removeHandler = async (id: string) => {
  await WordApi.remove(id)
  emit('refresh-list')
}

</script>

<template>

  <van-swipe-cell class="swipe-cell">
    <li class="li-box">
      <div class="word-box">
        <div class="content">{{ wordData.english }}</div>
        <div class="chinese-box">{{ wordData.chinese }}</div>
      </div>
      <van-icon name="volume-o" @click="playSound(wordData.english)"/>
    </li>


    <template #right>
      <div class="flex items-center gap-2">
        <van-icon class="text-red-500" name="delete-o" @click="removeHandler(wordData.id)"/>
        <van-icon name="edit" @click="emit('edit-word', wordData)"/>
      </div>
    </template>
  </van-swipe-cell>
</template>

<style scoped lang="scss">
.swipe-cell {
  padding: 2px 0;
  border-bottom: 1px dashed #fff;
}

.li-box {
  display: flex;
  align-items: center;

  .chinese-box {
    font-size: 12px;
    color: #838383;
  }
}


.word-box {
  @apply flex-1;
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
