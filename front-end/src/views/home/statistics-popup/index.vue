<script setup lang="ts">
import {defineComponent, defineExpose, ref} from 'vue'
import WordStatisticsApi from "@/api/word-statistics-api";

defineComponent({
  name: 'StatisticsPopup',
})

const isShow = ref(false)
const totalCount = ref(0)
const countList = ref([])

const open = async () => {
  isShow.value = true
  const res = await WordStatisticsApi.get()
  if (res.code === '000000') {
    countList.value = res.data.sort((a, b) => new Date(b.date) - new Date(a.date))
    totalCount.value = countList.value.reduce((acc, cur) => acc + cur.count, 0)
  }
}

defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" round class="w-4/5 p-5">
    <h1 class="text-2xl font-bold">{{ totalCount }}</h1>
    <div>
      <div v-for="item in countList" :key="item.date" class="flex justify-between items-center">
        <span>{{ item.date }}</span>
        <span>{{ item.count }}</span>
      </div>
    </div>
  </van-popup>
</template>
