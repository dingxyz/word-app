<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify, showToast} from "vant";
import {useAppStore} from "@/stores/useApp";
import {trimEnd} from "lodash-es";
import {useTOCStore} from "@/stores/useTOC";
import {readFromClipboard} from "@/utils/common-util";
defineComponent({
  name: 'AddWord',
})

const emit = defineEmits(['add-complete'])

const appStore = useAppStore()
const docStore = useTOCStore()
const fieldRef = ref<FieldInstance>();
const isShow = ref(false)
const loading = ref(false)
const wordData = reactive<IWord>(new IWord())
let wordOriginalData = null

const saveWord = () => {
  const {id, english, context, chinese, annotation} = wordData
  if (!english) {
    showNotify({ type: 'warning', message: 'Please input english' });
    return
  }
  const {currentTOC} = docStore
  if (appStore.isGrammarInUse1 && !currentTOC?.order) {
    showNotify({ type: 'warning', message: 'Please input order' });
    return
  }
  const params = {
    id: id ?? undefined,
    TOC_Order: appStore.currentBook?.hasTOC ? currentTOC?.order : undefined,
    context,
    english,
    chinese,
    annotation,
  }
  params['bookId'] = wordData.id ? wordData.bookId : appStore.bookId

  loading.value = true
  const apiFunc = wordData.id ? WordApi.update : WordApi.add
  apiFunc(params).then(res => {
    if (res.code === '000000') {
      showNotify({type:'success', message: 'Save success'});
      isShow.value = false
      if (wordData.id) {
        wordOriginalData.context = context
      } else {
        emit('add-complete', {toBottom: !wordData.id})
      }
    } else {
      showNotify({type: 'danger', message: res.message});
    }
  }).finally(() => {
    loading.value = false
  })
}

const resetData = () => {
  Object.assign(wordData, new IWord())
}

const open = async (word?: IWord) => {
  wordOriginalData = word
  isShow.value = true
  Object.assign(wordData, word || {})
  wordData.annotation = trimEnd(wordData.annotation)
  if (wordData.id) {
    const res = await WordApi.getAnnotation({
      id: wordData.id,
      bookId: appStore.bookId,
    })
    if (res.code === '000000') {
      wordData.annotation = res.data.annotation
    }
  }
  await nextTick()
  fieldRef.value?.focus()

  // 如果不是编辑模式（没有id），则尝试读取剪贴板
  if (!wordData.id) {
    const clipboardContent = await readFromClipboard()
    if (clipboardContent) {
      wordData.annotation = clipboardContent
    }
  }
}

defineExpose({open})
</script>

<template>
  <van-action-sheet
    v-model:show="isShow"
    :title="wordData.id? `Edit ${appStore.currentBook?.name}` : `Add ${appStore.currentBook?.name}`"
    @closed="resetData"
  >
    <div>
      <van-cell-group inset>
        <van-field
          v-model.trim="wordData.english"
          ref="fieldRef"
          type="textarea"
          label="US"
          label-width="20px"
          placeholder="Please input english"
          clearable
          :autosize="{maxHeight: appStore.isWorldview ? 24 : 150}"
        />
        <van-field v-if="appStore.isWorldview && false" v-model="wordData.context" label="context" placeholder="" label-width="50px"/>
        <van-field v-if="!appStore.isWorldview && !appStore.currentBook?.name.includes('GrammarInUse')" v-model="wordData.chinese" label="cn" placeholder="Please input chinese" label-width="40px" clearable/>
        <van-field
          v-if="appStore.isWorldview ? !wordData?.id : true"
          v-model.trim="wordData.annotation"
          type="textarea"
          label="annotation"
          placeholder="Please input annotation"
          clearable
          label-align="top"
          :autosize="{minHeight: 50, maxHeight: 250}"
        />
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button type="success" @click="saveWord" :loading="loading" loading-text="SAVE WORD" block>
          SAVE WORD
        </van-button>
      </div>
    </div>
  </van-action-sheet>
</template>
