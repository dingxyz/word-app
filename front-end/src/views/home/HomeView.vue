<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {reactive, ref, watch} from 'vue'
import {debounce} from 'lodash-es';
import WordItem from "@/views/home/word-item/index.vue";
import AddWord from "@/views/home/add-word/index.vue";
import SettingPopup from "@/views/home/setting-popup/index.vue";
import {autoSpeak, ORDER_TYPE} from "@/utils/responsive-voice";
import WordTypeSelect from "@/views/home/word-type-select/index.vue";
import {useAppStore} from "@/stores/useApp";
import SearchInput from "@/views/home/search-input/index.vue";
import PaginationBox from "@/views/home/pagination-box/index.vue";
import {usePaginationStore} from "@/stores/usePagination";
import {showNotify} from "vant";

const appStore = useAppStore();
const paginationStore = usePaginationStore()
const addWordRef = ref<InstanceType<typeof AddWord>>()
const settingPopupRef = ref<InstanceType<typeof SettingPopup>>()
const words = reactive<IWord[]>([])
const renderList = ref<IWord[]>([])
const loading = ref(true)

const openAddWord = () => addWordRef.value?.open()
const openSettingPopup = () => settingPopupRef.value?.open()
const editWordOpen = (word: IWord) => addWordRef.value?.open(word)
const autoPlayChange = (autoPlayOrder: ORDER_TYPE) => autoSpeak(renderList.value, autoPlayOrder)

const setRenderList = () => {
  const {isPaging, pageSize} = paginationStore
  let {currentPage} = paginationStore
  if (isPaging && words.length > pageSize) {
    let start = (currentPage - 1) * pageSize
    if (start >= words.length) {
      currentPage = Math.ceil(words.length / pageSize)
      start = (currentPage - 1) * pageSize
    }
    const end = start + pageSize
    renderList.value = words.slice(start, end)
  } else {
    renderList.value = words
  }
}

watch(() => paginationStore.isPaging, setRenderList)
watch(() => paginationStore.pageSize, setRenderList)

const getWord = async (searchKey: string = '') => {
  loading.value = true
  const {data, code, message} = await WordApi.get({
    wordType: appStore.wordType,
    searchKey: searchKey.trim() || null
  }).finally(() => {
    loading.value = false
  })
  if (code !== '000000') {
    showNotify({type: 'danger', message});
  }
  words.splice(0, words.length, ...data)
  setRenderList()
}
getWord()

const searchWord = debounce(getWord, 300)
</script>

<template>
  <div class="w-auto max-w-xl flex flex-1 flex-col container rounded-t-xl text-lg overflow-auto m-2 opacity-100">
    <header class="flex items-center justify-between h-12 px-4 bg-fuchsia-300 text-center text-white">
      <span class="w-10">{{ words.length }}</span>
      <span class="text-xl">{{ appStore?.wordType }}</span>
      <WordTypeSelect @refresh-list="getWord"/>
    </header>
    <article class="relative flex-1 bg-violet-50 rounded-b-xl overflow-auto">
      <div v-if="loading" class="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-[#d9dae25a]">
        <van-loading type="spinner"/>
      </div>
      <van-list>
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
    <div class="mt-2" v-if="paginationStore.isPaging && words.length > paginationStore.pageSize">
      <PaginationBox
        :total-items="words.length"
        @update:currentPage="setRenderList"
      />
    </div>
    <footer class="flex items-center justify-between h-12 mt-2 px-4 bg-cyan-400 text-white rounded-xl">
      <van-icon name="setting-o" @click="openSettingPopup" size="20"/>
      <SearchInput @update:modelValue="searchWord"/>
      <van-icon name="add-o" @click="openAddWord" size="20"/>
    </footer>
    <AddWord ref="addWordRef" @add-complete="getWord"/>
    <SettingPopup
      ref="settingPopupRef"
      @auto-play-change="autoPlayChange"
    />
  </div>
</template>
