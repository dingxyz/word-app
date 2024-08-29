<script setup lang="ts">
import {defineComponent} from 'vue'
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'PaginationBox',
})

const emit = defineEmits(['update:currentPage'])

const paginationStore = usePaginationStore()
</script>

<template>
  <van-pagination
    v-model="paginationStore.currentPage"
    @change="emit('update:currentPage')"
    :items-per-page="paginationStore.pageSize"
    :show-prev-button="true"
    :show-next-button="true"
    prev-text="prev"
    next-text="next"
    force-ellipses
  />
</template>