<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {reactive, ref, watch, nextTick} from 'vue'
import {debounce} from 'lodash-es';
import WordItem from "@/views/home/word-item/index.vue";
import AddWord from "@/views/home/add-word/index.vue";
import SettingPopup from "@/views/home/setting-popup/index.vue";
import WordTypeSelect from "@/views/home/word-type-select/index.vue";
import {useAppStore} from "@/stores/useApp";
import SearchInput from "@/views/home/search-input/index.vue";
import PaginationBox from "@/views/home/pagination-box/index.vue";
import {ORDER_TYPE, usePaginationStore} from "@/stores/usePagination";
import {showNotify} from "vant";
import {useVoiceStore} from "@/stores/useVoice";
import AddType from "@/views/home/add-type/index.vue";
import StatisticsPopup from "@/views/home/statistics-popup/index.vue";
import {useWorldStore} from "@/stores/useWorldview";
import {useTOCStore} from "@/stores/useTOC";
import TOCItem from "@/views/toc-list/toc-item/index.vue";

const appStore = useAppStore();
const voiceStore = useVoiceStore()
const worldStore = useWorldStore()
const docStore = useTOCStore()
const paginationStore = usePaginationStore()

const addWordRef = ref<InstanceType<typeof AddWord>>()
const addTypeRef = ref<InstanceType<typeof AddType>>()
const listRef = ref<HTMLDivElement>(null)
const settingPopupRef = ref<InstanceType<typeof SettingPopup>>()
const statisticsPopupRef = ref<InstanceType<typeof StatisticsPopup>>()
const words = reactive<IWord[]>([])
const renderList = ref<IWord[]>([])
const loading = ref(true)
const isDev = import.meta.env.VITE_ENV === 'DEVELOPMENT'
const totalItems = ref(0)

const openAddWord = () => addWordRef.value?.open()
const openTypeDialog = () => addTypeRef.value?.open(appStore?.bookId, totalItems.value)
const openSettingPopup = () => settingPopupRef.value?.open()
const openStatisticsPopup = () => statisticsPopupRef.value?.open()
const editWordOpen = (word: IWord) => addWordRef.value?.open(word)
const autoPlayChange = () => voiceStore.autoSpeak(renderList.value)
const goToBottom = (toBottom = false) => {
  nextTick(() => {
    if (toBottom === true) {
      listRef.value.scrollTop = listRef.value.scrollHeight
    } else {
      listRef.value.scrollTop = 0
    }
  })
}

watch([
  () => paginationStore.isPaging,
  () => paginationStore.pageSize,
  () => paginationStore.currentPage,
  () => paginationStore.renderOrder
], () => getWord());

const typeChange = () => {
  renderList.value = []
  getWord()
}

const getWord = async ({toBottom = false} = {}) => {
  loading.value = true
  const {data, code, message} = await WordApi.get({
    bookId: appStore.bookId,
    TOC_Order: paginationStore.isByToc && !docStore.isSetToc ? (docStore.currentTOC?.order ?? undefined) : undefined,
    collect: worldStore.onlyCollect ? true : undefined,
    page: (paginationStore.isPaging && !paginationStore.isByToc) ? paginationStore.currentPage : undefined,
    pageSize: (paginationStore.isPaging && !paginationStore.isByToc) ? paginationStore.pageSize : undefined,
    renderOrder: paginationStore.renderOrder
  }).finally(() => {
    loading.value = false
  })
  if (code !== '000000') {
    showNotify({type: 'danger', message});
  }

  // 更新数据结构
  if (data && data.list) {
    words.splice(0, words.length, ...data.list)
    renderList.value = data.list
    totalItems.value = data.total
  } else {
    words.splice(0, words.length, ...(data || []))
    renderList.value = data || []
    totalItems.value = (data || []).length
  }
  voiceStore.resetSpeak()

  goToBottom(toBottom)
}

const search = async ({searchKey}) => {
  if (searchKey?.length === 1) {
    return
  }
  if (searchKey) {
    loading.value = true
    const {data, code, message} = await WordApi.search({
      searchKey: searchKey?.trim()
    }).finally(() => {
      loading.value = false
    })
    if (code !== '000000') {
      showNotify({type: 'danger', message});
    }
    words.splice(0, words.length, ...data)
    renderList.value = data
    totalItems.value = data.length
    goToBottom()
  } else {
    getWord()
  }
}
const searchWord = debounce(search, 500)
const initialize = async () => {
  await appStore.getTypeList()
  docStore.initialize()
  getWord()
}
initialize()
</script>

<template>
  <div
    class="w-auto h-full max-w-xl flex flex-1 flex-col container text-lg overflow-auto"
    :class="{'opacity-20': isDev && !appStore.isLiteMode, 'is-lite-mode': appStore.isLiteMode }"
  >
    <header class="flex items-center justify-between h-12 px-4 bg-[#993333] text-center text-white">
      <span class="w-10" @click="openStatisticsPopup">{{ totalItems }}</span>
      <span class="text-xl" @click="openTypeDialog">{{ appStore?.currentBook?.name }}</span>
      <WordTypeSelect @refresh-list="typeChange"/>
    </header>
    <TOCItem
      v-if="appStore.currentBook?.hasTOC && (docStore.isSetToc || paginationStore.isByToc)"
      :tocData="docStore.currentTOC"
      isHome
    />
    <article ref="listRef" class="relative flex-1 bg-[#006633] overflow-auto" :class="{'overflow-hidden': loading }">
      <div v-if="loading" class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-[#d9dae25a]">
        <van-loading type="spinner"/>
      </div>
      <van-list :class="{'grid000': appStore.isWorldview}" class="grid-cols-2">
        <WordItem
          v-for="(word, index) in renderList"
          :key="word.id"
          :wordData="word"
          :index="index"
          @refresh-list="getWord"
          @edit-word="editWordOpen"
        />
      </van-list>
    </article>
    <div class="mt-2" v-if="paginationStore.isPaging && !paginationStore.isByToc && totalItems > paginationStore.pageSize">
      <PaginationBox
        :total-items="totalItems"
      />
    </div>
    <footer class="home-footer flex items-center justify-between h-14 m-2 px-2 bg-[#003300] text-white rounded-xl">
      <van-icon
        :name="voiceStore.nowPlaying && !voiceStore.isPaused ? 'pause-circle-o' : 'play-circle-o'"
        @click="autoPlayChange" size="20"
      />
      <van-icon name="replay" @click="voiceStore.resetSpeak(true)" size="20"/>
      <SearchInput @update:modelValue="(value) => searchWord({searchKey: value})"/>
      <van-icon name="setting-o" @click="openSettingPopup" size="20"/>
      <van-icon name="add-o" @click="openAddWord" size="20"/>
    </footer>
    <AddWord ref="addWordRef" @add-complete="getWord"/>
    <AddType ref="addTypeRef"/>
    <SettingPopup
      ref="settingPopupRef"
      @update="getWord"
    />
    <StatisticsPopup ref="statisticsPopupRef"/>
  </div>
</template>

<style scoped lang="scss">
.home-footer .van-icon{
  font-size: 26px !important;
}
</style>
