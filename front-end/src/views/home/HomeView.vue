<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {reactive, ref} from 'vue'
import {debounce} from 'lodash-es';
import WordItem from "@/views/home/word-item/index.vue";
import AddWord from "@/views/home/add-word/index.vue";
import SettingPopup from "@/views/home/setting-popup/index.vue";
import {autoSpeak} from "@/utils/responsive-voice";
import WordTypeSelect from "@/views/home/word-type-select/index.vue";
import {useAppStore} from "@/stores/app";
import SearchInput from "@/views/home/search-input/index.vue";

const appStore = useAppStore();
const addWordRef = ref<InstanceType<typeof AddWord>>()
const settingPopupRef = ref<InstanceType<typeof SettingPopup>>()
const words = reactive<IWord[]>([])
const loading = ref(false)
const openAddWord = () => addWordRef.value?.open()
const openSettingPopup = () => settingPopupRef.value?.open()
const editWordOpen = (word: IWord) => addWordRef.value?.open(word)
const autoPlayChange = (value: boolean) => autoSpeak(words, value)

const getWord = async (searchKey: string = '') => {
  loading.value = true
  const {data} = await WordApi.get({
    wordType: appStore.wordType,
    searchKey: searchKey.trim() || null
  }).finally(() => {
    loading.value = false
  })
  words.splice(0, words.length, ...data)
}
getWord()

const searchWord = debounce(getWord, 300)

</script>

<template>
  <div class="w-auto max-w-xl flex flex-1 flex-col container rounded-t-xl text-lg overflow-auto m-2 opacity-100">
    <header class="flex items-center justify-between h-12 px-4 bg-fuchsia-300 text-center text-white">
      <span class="w-10">{{ words.length }}</span>
      <span class="text-xl">{{ appStore.wordType }}</span>
      <WordTypeSelect @refresh-list="getWord"/>
    </header>
    <article class="flex-1 bg-violet-50 rounded-b-xl overflow-auto">
      <ul>
        <WordItem
          v-for="(word, index) in words"
          :key="word.id"
          :wordData="word"
          :index="index"
          @refresh-list="getWord"
          @edit-word="editWordOpen"
        />
      </ul>
    </article>
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
