<script setup lang="ts">
import router from "@/router";
import {useTOCStore} from "@/stores/useTOC";
import {defineComponent, ref, onMounted, nextTick} from "vue";
import IconBtn from "@/components/IconBtn.vue";
import AddToc from "@/views/toc-list/add-toc/index.vue";
import TOCItem from "@/views/toc-list/toc-item/index.vue";

defineComponent({
  name: 'TOCList'
})

const isDev = import.meta.env.VITE_ENV === 'DEVELOPMENT'
const docStore = useTOCStore()
const addTocRef = ref<InstanceType<typeof AddToc>>()
const tocItemsRef = ref<InstanceType<typeof TOCItem>[]>([])

const gotoBack = () => {
  router.push({name: 'Home'})
}

// 页面加载后滚动到激活的TOC项目
onMounted(async () => {
  // 等待DOM更新完成
  await nextTick()
  // 查找激活的TOCItem并滚动到视口
  const activeItem = tocItemsRef.value.find(item => 
    docStore.currentTOC?.order === item.$props.tocData.order
  )
  if (activeItem) {
    activeItem.scrollIntoView()
  }
})
</script>


<template>
  <div
    class="toc-container h-full bg-black flex flex-col"
    :class="{'opacity-30': isDev }"
  >
    <van-nav-bar
      title="TOC"
      left-text=""
      left-arrow
      @click-left="gotoBack"
    >
      <template #right>
        <IconBtn icon="plus" @click="addTocRef?.open()"/>
      </template>
    </van-nav-bar>
    <div class="flex-1 overflow-y-auto">
      <TOCItem
        v-for="item in docStore.tocList"
        :key="item.order"
        :tocData="item"
        ref="tocItemsRef"
      />
    </div>

    <AddToc ref="addTocRef"/>
  </div>
</template>

<style scoped lang="scss">

</style>
