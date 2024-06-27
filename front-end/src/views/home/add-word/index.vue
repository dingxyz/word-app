<script setup lang="ts">
import WordApi, { IWord } from '@/api/word-api'
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify} from "vant";

defineComponent({
  name: 'AddWord',
})

const emit = defineEmits(['add-complete'])

const fieldRef = ref<FieldInstance>();
const isShow = ref(false)
const wordData = reactive<IWord>(new IWord())

const addHandler = () => {
  const {english, chinese} = wordData
  WordApi.add({
    english,
    chinese,
  }).then(res => {
    if (res.code === '000000') {
      emit('add-complete')
    } else {
      showNotify({ type: 'danger', message: res.message });
    }
  }).finally(() => {
    isShow.value = false
  })
}

const editHandler = () => {
  const {id, english, chinese} = wordData
  WordApi.update({
    id,
    english,
    chinese,
  }).then(res => {
    if (res.code === '000000') {
      emit('add-complete')
    } else {
      showNotify({ type: 'danger', message: res.message });
    }
  }).finally(() => {
    isShow.value = false
  })
}

const saveWord = () => {
  const {english} = wordData
  if (!english) {
    alert('Please input english')
    return
  }
  if (wordData.id) {
    editHandler()
  } else {
    addHandler()
  }
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
  <van-action-sheet v-model:show="isShow" title="add" @close="resetData">
    <div>
      <van-cell-group inset>
        <van-field v-model="wordData.english" ref="fieldRef" label="en" placeholder="Please input english" label-width="40px"/>
        <van-field v-model="wordData.chinese" label="cn" placeholder="Please input chinese" label-width="40px"/>
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button type="success" @click="saveWord" size="small">SAVE WORD</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>

<style scoped lang="scss">

</style>
