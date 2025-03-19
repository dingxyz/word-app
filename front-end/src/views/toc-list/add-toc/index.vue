<script setup lang="ts">
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify} from "vant";
import {useAppStore} from "@/stores/useApp";
import TOCApi, {ITOC} from "@/api/toc-api";
import {useTOCStore} from "@/stores/useTOC";
import {maxBy} from "lodash-es";

defineComponent({
  name: 'AddToc',
})

const emit = defineEmits(['add-complete'])

const appStore = useAppStore()
const docStore = useTOCStore()
const fieldRef = ref<FieldInstance>();
const isShow = ref(false)
const loading = ref(false)
const tocData = reactive<ITOC>(new ITOC())

const saveWord = () => {
  const { order,title, detail} = tocData
  if (!title) {
    alert('Please input english')
    return
  }

  if (!appStore.currentBook?.id) {
    alert('Please select a book')
    return
  }

  const params: ITOC = {
    order,
    bookId: appStore.currentBook.id,
    title,
    detail,
  }

  loading.value = true
  TOCApi.add(params).then(res => {
    if (res.code === '000000') {
      isShow.value = false
      docStore.fetchTOCList()
    } else {
      showNotify({type: 'danger', message: res.message});
    }
  }).finally(() => {
    loading.value = false
  })
}

const resetData = () => {
  Object.assign(tocData, new ITOC())
}

const open = async () => {
  isShow.value = true
  tocData.order = maxBy(docStore.tocList, "order")?.order + 1
  await nextTick()
  fieldRef.value?.focus()
}

defineExpose({open})
</script>

<template>
  <van-action-sheet
    v-model:show="isShow"
    title="Add TOC"
    @closed="resetData"
  >
    <div>
      <van-cell-group inset>
        <van-field
          v-model.number.trim="tocData.order"
          ref="fieldRef"
          type="digit"
          label="TOC Order"
          label-width="80px"
          placeholder="Please input Order"
          clearable
        />
        <van-field
          v-model.trim="tocData.title"
          ref="fieldRef"
          type="textarea"
          label="TOC Title"
          label-width="80px"
          placeholder="Please input Title"
          clearable
        />
        <van-field
          v-model.trim="tocData.detail"
          type="textarea"
          label="Detail"
          placeholder="Please input detail"
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
