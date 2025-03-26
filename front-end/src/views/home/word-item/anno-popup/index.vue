<script setup lang="ts">
import {computed, defineComponent, reactive, ref, watch} from 'vue'
import WordApi, {IWord} from "@/api/word-api";
import marked from "@/utils/markedRenderer";
import {useAppStore} from "@/stores/useApp";
import {useVoiceStore} from "@/stores/useVoice";
import {isWorldviewByItem} from "@/utils/common-util";
import {useTOCStore} from "@/stores/useTOC";

defineComponent({
  name: 'AnnoPopup'
})

const {isWorldviewById} = useAppStore()
const appStore = useAppStore()
const voiceStore = useVoiceStore()
const docStore = useTOCStore()
const isShow = ref(false)
const showEditTextarea = ref(false)
const showSecondContext = ref(false)
const showThirdContext = ref(false)
const wordData = reactive<IWord>({} as IWord)
const contextList = ref({
  first: '',
  second: '',
  third: '',
})
let wordOriginalData = null
const compiledMarkdown = computed(() => marked(String(wordData.annotation) ?? ''))

watch(() => wordData.context, () => {
  if (wordData.context) {
    const contextArr = wordData.context.split(';')
    if (contextArr.length > 0) {
      contextList.value.first = contextArr[0]
    }
    if (contextArr.length > 1) {
      contextList.value.second = contextArr[1]
      showSecondContext.value = true
    }
    if (contextArr.length > 2) {
      contextList.value.third = contextArr[2]
      showThirdContext.value = true
    }
  }
})


const saveAnnotation = async () => {
  showEditTextarea.value = false
  const {first, second, third} = contextList.value
  wordData.context = first + (second ? `;${second}` : '') + (third ? `;${third}` : '')
  wordData.TOC_Order = docStore.currentTOC.order || undefined
  wordData['bookId'] = wordData.bookId ?? appStore.bookId
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
    bookId: wordData.bookId,
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
      <div v-if="!showEditTextarea" class="text-red">
        <h3 @click="playSound" class="text-2xl mb-2">{{ wordData.english }}</h3>
        <div v-if="wordData.context && contextList.first" @click="playSound" class="my-2">{{ contextList.first }}</div>
        <div v-if="wordData.context && contextList.second" @click="playSound" class="my-2">{{ contextList.second }}</div>
        <div v-if="wordData.context && contextList.third" @click="playSound" class="my-2">{{ contextList.third }}</div>
      </div>
      <div v-if="showEditTextarea">
        <van-field
          v-model="wordData.english"
          label=""
          class="bg-green-900 px-0 py-2"
        />
        <van-field
          v-if="isWorldviewById(wordData.bookId)"
          v-model="contextList.first"
          label="Context"
          label-width="56px"
          right-icon="add-o"
          @click-right-icon="showSecondContext ? showThirdContext = true : showSecondContext = true"
          placeholder="Context"
          class="bg-green-900 px-0 py-2"
          clearable
        />
        <van-field
          v-if="isWorldviewById(wordData.bookId) && showSecondContext"
          v-model="contextList.second"
          label="Context"
          label-width="56px"
          placeholder="Context"
          class="bg-green-900 px-0 py-2"
          clearable
        />
        <van-field
          v-if="isWorldviewById(wordData.bookId) && showThirdContext"
          v-model="contextList.third"
          label="Context"
          label-width="56px"
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
        class="markdown-body flex-auto overflow-auto bg-green-900 text-sm"
      />
      <van-field
        v-if="showEditTextarea"
        v-model="wordData.annotation"
        type="textarea"
        class="p-0 flex-auto overflow-auto bg-green-900"
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

<style scoped lang="scss">

</style>

