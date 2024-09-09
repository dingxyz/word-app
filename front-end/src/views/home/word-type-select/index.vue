<script setup lang="ts">
import {defineComponent, ref} from 'vue'
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore, WORD_TYPE} from "@/stores/useApp";
import WordTypeApi, {WordType} from "@/api/word-type-api";

defineComponent({
  name: 'WordTypeSelect',
})

const emit = defineEmits(['refresh-list'])

const appStore = useAppStore()
const popoverShow = ref(false)
const typeDialog = ref(false)

const typeData = ref<WordType>({
  name: '',
  order: 0,
})

const typeList = ref<WordType[]>([])
const getTypeList = async () => {
  const res = await WordTypeApi.get()
  typeList.value = res.data
}
getTypeList()

const openTypeDialog = () => {
  popoverShow.value = false
  typeDialog.value = true
}

const addOrEditType = async () => {
  if (typeData.value.id) {
    //
  } else {
    await WordTypeApi.add(typeData.value)
  }
  typeDialog.value = false
  popoverShow.value = true
  getTypeList()
}

const typeChange = () => {
  popoverShow.value = false
  emit('refresh-list')
}
</script>

<template>
  <van-popover v-model:show="popoverShow" placement="bottom-end">
    <van-radio-group v-model="appStore.wordType" @change="typeChange" shape="dot">
      <van-radio v-for="(item) in typeList" :key="item.id" :name="item.name" class="m-4">
        {{ item.name }}
      </van-radio>
    </van-radio-group>
    <div class="flex justify-center m-2">
      <van-button icon="plus" @click="openTypeDialog" block plain type="primary" size="mini" />
    </div>
    <template #reference>
      <IconBtn icon="list-switch"/>
    </template>
  </van-popover>
  <van-dialog v-model:show="typeDialog" title="word type" show-cancel-button @confirm="addOrEditType">
    <van-cell-group inset>
      <van-field v-model="typeData.name" label="name" placeholder="Please input name" label-width="40px"/>
      <van-field v-model.number="typeData.order" label="parentId" placeholder="Please input chinese" label-width="40px"/>
    </van-cell-group>
  </van-dialog>
</template>
