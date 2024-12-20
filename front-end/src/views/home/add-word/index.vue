<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify} from "vant";
import {useAppStore} from "@/stores/useApp";
import {trimEnd} from "lodash-es";

defineComponent({
  name: 'AddWord',
})

const emit = defineEmits(['add-complete'])

const appStore = useAppStore()
const fieldRef = ref<FieldInstance>();
const isShow = ref(false)
const loading = ref(false)
const wordData = reactive<IWord>(new IWord())

const saveWord = () => {
  const {id, english, chinese, annotation} = wordData
  if (!english) {
    alert('Please input english')
    return
  }
  const params = {
    id: id ?? undefined,
    english,
    chinese,
    annotation,
  }
  params['wordType'] = wordData.id ? wordData.wordType : appStore.wordType

  loading.value = true
  const apiFunc = wordData.id ? WordApi.update : WordApi.add
  apiFunc(params).then(res => {
    if (res.code === '000000') {
      isShow.value = false
      emit('add-complete')
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
  isShow.value = true
  Object.assign(wordData, word || {})
  wordData.annotation = trimEnd(wordData.annotation)
  if (wordData.id) {
    const res = await WordApi.getAnnotation({
      id: wordData.id,
      wordType: appStore.wordType,
    })
    if (res.code === '000000') {
      wordData.annotation = res.data.annotation
    }
  }
  await nextTick()
  fieldRef.value?.focus()
}

defineExpose({open})
</script>

<template>
  <van-action-sheet
    v-model:show="isShow" :title="wordData.id? `Edit ${wordData.wordType}` : `Add ${appStore.wordType}`"
    @closed="resetData"
  >
    <div>
      <van-cell-group inset>
        <van-field
          v-model.trim="wordData.english"
          ref="fieldRef"
          type="textarea"
          label="en"
          label-width="40px"
          placeholder="Please input english"
          clearable
          :autosize="{maxHeight: 150}"
        />
        <van-field v-model="wordData.chinese" label="cn" placeholder="Please input chinese" label-width="40px"/>
        <van-field
          v-model.trim="wordData.annotation"
          type="textarea"
          label="annotation"
          placeholder="Please input annotation"
          clearable
          label-align="top"
          :autosize="{minHeight: 50, maxHeight: 150}"
        />
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button type="success" @click="saveWord" :loading="loading" loading-text="SAVE WORD" block>SAVE WORD
        </van-button>
      </div>
    </div>
  </van-action-sheet>
</template>
