<script setup lang="ts">
import {defineComponent, ref} from 'vue'
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore} from "@/stores/useApp";
import AddType from "@/views/home/add-type/index.vue";
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'WordTypeSelect',
})

const emit = defineEmits(['refresh-list'])
const addTypeRef = ref<InstanceType<typeof AddType>>()
const appStore = useAppStore()
const paginationStore = usePaginationStore()
const popoverShow = ref(false)

const openTypeDialog = () => {
  popoverShow.value = false
  addTypeRef.value?.open()
}

const typeChange = () => {
  popoverShow.value = false
  paginationStore.initPagination()
  emit('refresh-list')
}
</script>

<template>
  <van-popover v-model:show="popoverShow" placement="bottom-end">
    <van-radio-group v-model="appStore.bookId" @change="typeChange" shape="dot">
      <van-radio v-for="(item) in appStore.typeList" :key="item.id" :name="item.id" class="m-4">
        {{ item.name }}
      </van-radio>
    </van-radio-group>
    <div class="flex justify-center p-3 border-t-1">
      <van-button icon="plus" @click="openTypeDialog" block plain type="primary" size="small"/>
    </div>
    <template #reference>
      <IconBtn icon="list-switch"/>
    </template>
  </van-popover>
  <AddType ref="addTypeRef"/>
</template>
