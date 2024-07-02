<script setup lang="ts">
import {computed, defineComponent, ref} from 'vue'
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'PaginationBox',
})

const emit = defineEmits(['update:currentPage'])

const paginationStore = usePaginationStore()


const currentPage = computed({
  get: () => paginationStore.currentPage,
  set: value => paginationStore.currentPage = value
})

console.log('00000000000000',currentPage.value)

</script>

<template>
  <van-pagination
    v-model="currentPage"
    @change="emit('update:currentPage')"
    :items-per-page="paginationStore.PAGE_SIZE"
    :show-prev-button="true"
    :show-next-button="true"
    prev-text="prev"
    next-text="next"
    force-ellipses
  />
</template>