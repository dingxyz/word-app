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
  <div class="px-4 text-lg">
    <van-swipe-cell>
      <li class="li-box">
        <div class="word-box">
          <div class="content">{{ wordData.english }}</div>
          <div class="chinese-box text-base">{{ wordData.chinese }}</div>
        </div>
<!--        <van-icon name="volume-o" />-->
        <van-button icon="volume-o" @click="playSound(wordData.english)" plain hairline type="primary" class="px-2 h-8 border-0 bg-transparent border-transparent"  />
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
