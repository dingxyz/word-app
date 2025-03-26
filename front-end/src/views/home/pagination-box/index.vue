<script setup lang="ts">
import {defineComponent} from 'vue'
import {usePaginationStore} from "@/stores/usePagination";

defineComponent({
  name: 'PaginationBox',
})

const props = defineProps({
  totalItems: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:currentPage'])

const paginationStore = usePaginationStore()
</script>

<template>
  <van-pagination
    v-model="paginationStore.currentPage"
    @change="emit('update:currentPage')"
    :items-per-page="paginationStore.pageSize"
    :total-items="totalItems"
    :show-prev-button="false"
    :show-next-button="false"
    force-ellipses
  />
</template>