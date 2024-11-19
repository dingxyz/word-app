<script setup lang="ts">
import { defineComponent, ref } from 'vue'
import WordStatisticsApi from '@/api/word-statistics-api'

defineComponent({
  name: 'StatisticsPopup'
})

const isShow = ref(false)
const totalCount = ref(0)
const countList = ref([])
const groupedData = ref([])

const open = async () => {
  isShow.value = true
  const res = await WordStatisticsApi.get()
  if (res.code === '000000') {
    countList.value = res.data.sort((a, b) => +new Date(b.date) - +new Date(a.date))
    totalCount.value = countList.value.reduce((acc, cur) => acc + cur.count, 0)
    groupedData.value = countList.value.reduce((acc, item) => {
      const date = new Date(item.date)
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      let monthGroup = acc.find((group) => group.yearMonth === yearMonth)
      if (!monthGroup) {
        monthGroup = { yearMonth, totalCount: 0, items: [], showItems: false }
        acc.push(monthGroup)
      }
      monthGroup.items.push(item)
      monthGroup.totalCount += item.count
      return acc
    }, [])
  }
}

defineExpose({ open })
</script>

<template>
  <van-popup v-model:show="isShow" round lazy-render closeable class="w-4/5 p-4">
    <h3 class="text-2xl font-bold">{{ totalCount }}</h3>
    <div>
      <div v-for="group in groupedData" :key="group.yearMonth" class="month-group">
        <van-cell
          :title="group.yearMonth"
          :value="group.totalCount"
          is-link
          size="large"
          class="px-0"
          :arrow-direction="group.showItems ? 'down' : 'right'"
          @click="group.showItems = !group.showItems"
        />
        <div v-if="group.showItems">
          <van-cell
            v-for="item in group.items"
            :key="item.date"
            :title="item.date"
            :value="item.count"
          />
        </div>
      </div>
    </div>
  </van-popup>
</template>
