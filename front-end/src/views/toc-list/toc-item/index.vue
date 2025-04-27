<script setup lang="ts">
import {computed, defineComponent, onMounted, ref, watch} from 'vue'
import IconBtn from '@/components/IconBtn.vue'
import {useAppStore} from '@/stores/useApp'
import {useTOCStore} from '@/stores/useTOC'
import 'github-markdown-css/github-markdown.css'
import TocDetailPopup from "@/views/toc-list/toc-detail-popup/index.vue";
import router from "@/router";
import TOCApi, {ITOC} from "@/api/toc-api";
import {showConfirmDialog} from "vant";

defineComponent({
  name: 'TOCItem'
})
const props = defineProps<{
  tocData: ITOC
  isHome?: boolean
  wordsNum?: number
}>()

const appStore = useAppStore()
const docStore = useTOCStore()
const TOCRef = ref()
const tocDetailPopupRef = ref<InstanceType<typeof TocDetailPopup>>()
const emit = defineEmits(['refresh-list'])
const isActiveToc = computed(() => {
  return docStore.currentTOC?.order === props.tocData?.order
})

// 暴露滚动到视口方法
const scrollIntoView = () => {
  if (isActiveToc.value && TOCRef.value) {
    TOCRef.value.scrollIntoView()
  }
}

// 在激活状态变化时尝试滚动
watch(isActiveToc, (newVal) => {
  if (newVal) {
    scrollIntoView()
  }
})

// 挂载时如果是激活项则滚动到视口
onMounted(() => {
  if (isActiveToc.value) {
    scrollIntoView()
  }
})

defineExpose({
  scrollIntoView
})

const titleClickHandler = () => {
  if (props.isHome) {
    router.push({name: 'TOCList'})
  } else {
    docStore.currentTOC = props.tocData
    router.push({name: 'Home'})
  }
}


const removeTOCHandler = async () => {
  const confirm = await showConfirmDialog({
    message: 'Are you sure you want to delete?',
    width: '280px',
    theme: 'round-button',
    closeOnClickOverlay: true,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '#c7c7c7',
    confirmButtonText: 'Confirm'
  }).catch(() => false)
  if (!confirm) return
  await TOCApi.remove(props.tocData.order, {
    bookId: props.tocData.bookId,
  })
  docStore.fetchTOCList()
}

</script>

<template>
  <div
    ref="TOCRef"
    class="text-[#fff] bg-[#5a5a5a]"
    :class="{'bg-[#333]': isActiveToc}"
  >
    <van-swipe-cell>
      <li class="flex items-center justify-between w-full px-2 relative">
        <span @click="titleClickHandler" class="flex py-4 w-full gap-2 items-center">
          <span class="text-l text-slate-400 bg-[#ffd] px-2 rounded-md">{{ tocData?.order }}</span>
          <span class="flex-1">{{ tocData?.title }}</span>
          <span v-if="tocData?.wordsNum && !isHome" class="text-slate-400 bg-[#8c0000] px-2 rounded">{{ tocData?.wordsNum }}</span>
        </span>
        <div
          class="triangle-btn absolute top-0 bottom-0 right-0 w-1/3 active:bg-[#ffffff33]"
          @click="tocDetailPopupRef?.open(tocData)"
        >
        </div>
      </li>
      <template #left>
        <div class="p-1 text-sm text-fuchsia-500">
          {{ tocData?.order }}
        </div>
      </template>
      <template #right>
        <div class="flex items-center">
          <IconBtn v-if="tocData?.order && !isActiveToc" icon="delete-o"
                   @click="removeTOCHandler" color="red"/>
        </div>
      </template>
    </van-swipe-cell>

    <TocDetailPopup :tocData="tocData" ref="tocDetailPopupRef"/>
  </div>
</template>

<style scoped lang="scss">

</style>
