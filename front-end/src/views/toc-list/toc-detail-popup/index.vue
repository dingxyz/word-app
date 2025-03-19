<script setup lang="ts">
import {computed, defineComponent, reactive, ref, watch} from 'vue'
import marked from "@/utils/markedRenderer";
import {useVoiceStore} from "@/stores/useVoice";
import TOCApi, {ITOC} from "@/api/toc-api";
import {useTOCStore} from "@/stores/useTOC";

defineComponent({
  name: 'TocDetailPopup'
})

const docStore = useTOCStore()
const voiceStore = useVoiceStore()
const isShow = ref(false)
const showEditTextarea = ref(false)
const compiledMarkdown = computed(() => marked(tocData.value.detail ?? ''))

const tocData = ref({} as ITOC)

const saveAnnotation = async () => {
  showEditTextarea.value = false

  await TOCApi.update(tocData.value)
  docStore.fetchTOCList()
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

const open = async (data: ITOC) => {
  isShow.value = true
  tocData.value = JSON.parse(JSON.stringify(data))
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
        <h3 @click="playSound" class="text-2xl mb-2">{{ tocData.title }}</h3>
      </div>
      <div v-if="showEditTextarea">
        <van-field
          v-model="tocData.title"
          label=""
          class="bg-green-900 px-0 py-2"
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
        v-model="tocData.detail"
        type="textarea"
        class="anno-textarea p-0 flex-auto overflow-auto bg-green-900"
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
.anno-textarea :deep(textarea) {
  width: 95%;
}
</style>

