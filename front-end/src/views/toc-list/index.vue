<script setup lang="ts">
import router from "@/router";
import {useTOCStore} from "@/stores/useTOC";
import {defineComponent, ref} from "vue";
import IconBtn from "@/components/IconBtn.vue";
import AddToc from "@/views/toc-list/add-toc/index.vue";
import TOCItem from "@/views/toc-list/toc-item/index.vue";

defineComponent({
  name: 'TOCList'
})

const docStore = useTOCStore()
const addTocRef = ref<InstanceType<typeof AddToc>>()

const gotoBack = () => {
  router.push({name: 'Home'})
}
</script>


<template>
  <div
    class="toc-container bg-black"
    :class="{'opacity-30': (import.meta.env.VITE_ENV === 'DEVELOPMENT') }"
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
    <div>
      <TOCItem
        v-for="item in docStore.tocList"
        :key="item.order"
        :tocData="item"
      />
    </div>

    <AddToc ref="addTocRef"/>
  </div>
</template>

<style scoped lang="scss">

</style>
