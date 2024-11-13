<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify} from "vant";
import {useAppStore} from "@/stores/useApp";

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

const open = (word?: IWord) => {
  isShow.value = true
  Object.assign(wordData, word || {})
  nextTick(() => {
    fieldRef.value?.focus()
  })
}

defineExpose({open})
</script>

<template>
  <van-action-sheet v-model:show="isShow" :title="wordData.id? `Edit ${wordData.wordType}` : `Add ${appStore.wordType}`" @closed="resetData">
    <div>
      <van-cell-group inset>
        <van-field v-model="wordData.english" ref="fieldRef" label="en" placeholder="Please input english" label-width="40px"/>
        <van-field v-model="wordData.chinese" label="cn" placeholder="Please input chinese" label-width="40px"/>
        <van-field v-model="wordData.annotation" type="textarea" label="annotation" placeholder="Please input annotation" clearable
                   label-align="top"
                   :autosize="{minHeight: 50, maxHeight: wordData.id ? 180 : 120}"
        />
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button type="success" @click="saveWord" :loading="loading" loading-text="SAVE WORD" block>SAVE WORD</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>
