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
const compiledMarkdown = computed(
  () => `<h3>${appStore.isLiteMode ? '' : wordData.english}</h3>` + marked(wordData.annotation)
)

const saveAnnotation = async () => {
  showEditTextarea.value = false
  WordApi.update(wordData)
}

const detailPopupClickHandler = (event: MouseEvent) => {
  if (event.target instanceof HTMLElement) {
    const tagName = event.target.tagName.toLowerCase()
    if (tagName === 'span' && event.target.classList.contains('text-red')) {
      const oldColor = (event.target as HTMLElement).style.color
      event.target.style.color = '#02c3ff'
      const text = event.target.textContent
      voiceStore.voiceSpeak(text, false, () => {
        ;(event.target as HTMLElement).style.color = oldColor
      })
    }
  }
}

const open = async (data: IWord) => {
  Object.assign(wordData, data)
  const res = await WordApi.getAnnotation({
    id: wordData.id,
    wordType: appStore.wordType,
  })
  if (res.code === '000000') {
    wordData.annotation = res.data.annotation
  }
  isShow.value = true
}

defineExpose({open})
</script>

<template>
  <van-popup
    v-model:show="isShow"
    closeable
    lazy-render
    class="flex p-4 bg-black"
    position="bottom"
  >
    <div class="flex-1 flex flex-col">
      <div
        v-if="!showEditTextarea"
        v-html="compiledMarkdown"
        v-bold-english
        @click="detailPopupClickHandler"
        class="markdown-body flex-auto overflow-auto bg-black text-white"
      ></div>
      <van-field
        v-if="showEditTextarea"
        v-model="wordData.annotation"
        type="textarea"
        class="flex-auto overflow-auto text-base"
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
