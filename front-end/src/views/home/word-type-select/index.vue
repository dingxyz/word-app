<script setup lang="ts">
import {computed, defineComponent, ref} from 'vue'
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore, WORD_TYPE} from "@/stores/useApp";
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'WordTypeSelect',
})

const emit = defineEmits(['refresh-list'])

const appStore = useAppStore()
const popoverShow = ref(false)
const {resetCurrentPage} = usePaginationStore()

const wordType = computed({
  get: () => appStore.wordType,
  set: value => appStore.wordType = value
})

const typeChange = () => {
  popoverShow.value = false
  resetCurrentPage()
  emit('refresh-list')
}
</script>

<template>
  <van-popover v-model:show="popoverShow" placement="bottom-end">
    <van-radio-group v-model="wordType" @change="typeChange" shape="dot">
      <van-radio v-for="i in WORD_TYPE" :key="i" :name="i" class="m-4">
        {{ i }}
      </van-radio>
    </van-radio-group>
    <template #reference>
      <IconBtn icon="list-switch"/>
    </template>
  </van-popover>
</template>
