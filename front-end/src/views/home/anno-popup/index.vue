<script setup lang="ts">
import {computed, defineComponent, reactive, ref} from 'vue'
import WordApi, {IWord} from "@/api/word-api";
import marked from "@/utils/markedRenderer";
import {useAppStore} from "@/stores/useApp";
import {useVoiceStore} from "@/stores/useVoice";

defineComponent({
  name: 'AnnoPopup'
})

const appStore = useAppStore()
const voiceStore = useVoiceStore()
const isShow = ref(false)
const showEditTextarea = ref(false)
const wordData = reactive<IWord>({} as IWord)
let wordOriginalData = null
const compiledMarkdown = computed(() => marked(wordData.annotation ?? ''))

const saveAnnotation = async () => {
  showEditTextarea.value = false
  await WordApi.update(wordData)
  wordOriginalData.english = wordData.english
  wordOriginalData.context = wordData.context
  wordOriginalData.annotation = wordData.annotation
}

const detailPopupClickHandler = (event: MouseEvent) => {
  if (event.target instanceof HTMLElement) {
    const tagName = event.target.tagName.toLowerCase()
    if (tagName === 'span' && event.target.classList.contains('text-red')) {
      playSound(event)
    }
  }
}

const playSound = (event: MouseEvent) => {
  const oldColor = (event.target as HTMLElement).style.color;
  ;(event.target as HTMLElement).style.color = '#28c7ff'
  const text = (event.target as HTMLElement).textContent
  voiceStore.voiceSpeak(text, false, () => {
    ;(event.target as HTMLElement).style.color = oldColor
  })
}

const open = async (data: IWord) => {
  isShow.value = true
  showEditTextarea.value = false
  Object.assign(wordData, data)
  wordOriginalData = data
  const res = await WordApi.getAnnotation({
    id: wordData.id,
    wordType: wordData.wordType,
  })
  if (res.code === '000000') {
    wordData.annotation = res.data.annotation
  }
}

defineExpose({open})
</script>

<template>
  <van-popup
    v-model:show="isShow"
    closeable
    lazy-render
    class="flex p-4 bg-green-900"
    position="bottom"
  >
    <div class="flex-1 flex flex-col min-h-[60vh]">
      <div v-if="!showEditTextarea" class="text-red mb-2">
        <h3 @click="playSound" class="text-2xl mb-2">{{ wordData.english }}</h3>
        <span v-if="wordData.context" @click="playSound" class="">{{ wordData.context }}</span>
      </div>
      <div v-if="showEditTextarea">
        <van-field
          v-model="wordData.english"
          label=""
          class="bg-green-900 px-0 py-2"
        />
        <van-field
          v-if="appStore.isWorldview"
          v-model="wordData.context"
          label="Context"
          label-width="60px"
          placeholder="Context"
          class="bg-green-900 px-0 py-2"
          clearable
        />
      </div>
      <div
        v-if="!showEditTextarea"
        v-html="compiledMarkdown"
        v-bold-english
        @click="detailPopupClickHandler"
        class="markdown-body flex-auto overflow-auto bg-green-900 text-white"
      />
      <van-field
        v-if="showEditTextarea"
        v-model="wordData.annotation"
        type="textarea"
        class="anno-textarea flex-auto overflow-auto bg-green-900"
        autosize
        label=""
      />
      <div class="close-box text-center mt-4 flex gap-4">
        <van-button icon="edit" @click="showEditTextarea = !showEditTextarea" class="basis-4">
          EDIT
        </van-button>
        <van-button v-if="showEditTextarea" type="success" icon="success" @click="saveAnnotation" class="flex-1">
          SAVE
        </van-button>
        <van-button v-if="!showEditTextarea" icon="cross" @click="isShow = false" class="flex-1">
          CLOSE
        </van-button>
      </div>
    </div>
  </van-popup>
</template>
