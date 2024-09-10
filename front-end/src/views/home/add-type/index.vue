<script setup lang="ts">
import {defineComponent, nextTick, ref} from 'vue'
import WordTypeApi, {WordType} from "@/api/word-type-api";
import {FieldInstance, showNotify} from "vant";
import {useAppStore} from "@/stores/useApp";

defineComponent({
  name: 'AddType',
})

const emit = defineEmits(['type-update'])
const appStore = useAppStore()
const fieldRef = ref<FieldInstance>();
const typeDialog = ref(false)
const wordLength = ref(0)
const typeData = ref<WordType>({
  name: '',
  order: 0,
})

const addOrEditType = async () => {
  if (!typeData.value.name) {
    typeDialog.value = false
    return
  }
  if (typeData.value.id) {
    if (wordLength.value > 0) {
      showNotify({type: 'danger', message: 'This type has words, cannot be edited!'});
    } else {
      await WordTypeApi.update(typeData.value)
    }
  } else {
    await WordTypeApi.add(typeData.value)
  }
  typeDialog.value = false
  appStore.getTypeList()
  emit('type-update')
}

const deleteType = async () => {
  if (wordLength.value > 0) {
    showNotify({type: 'danger', message: 'This type has words, cannot be deleted!'});
    return
  }
  if (typeData.value.id) {
    await WordTypeApi.remove(typeData.value.id)
  }
  typeDialog.value = false
  appStore.getTypeList()
  emit('type-update')
}

const open = async (name: string = null, length: number = 0) => {
  typeDialog.value = true
  wordLength.value = length
  if (name) {
    typeData.value = appStore.typeList.find(item => item.name === name)
  } else {
    typeData.value = new WordType()
  }
  nextTick(() => {
    fieldRef.value?.focus()
  })
}

defineExpose({open})
</script>

<template>
  <van-dialog
    v-model:show="typeDialog" title="word type" show-cancel-button closeOnClickOverlay
    @confirm="addOrEditType" cancelButtonText="cancel" confirmButtonText="confirm"
  >
    <van-cell-group inset>
      <van-field v-model="typeData.name" ref="fieldRef" label="name" placeholder="Please input name"/>
      <van-field v-model.number="typeData.order" label="parentId" placeholder="Please input order"/>
    </van-cell-group>
    <div v-if="typeData.id" class="flex justify-center">
      <van-button icon="delete-o" @click="deleteType" plain type="primary" size="small" color="red" class="m-auto">Remove</van-button>
    </div>
  </van-dialog>
</template>
