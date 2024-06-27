<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {reactive, ref} from 'vue'
import { debounce } from 'lodash-es';
import WordItem from "@/views/home/word-item/index.vue";
import AddWord from "@/views/home/add-word/index.vue";
import SettingPopup from "@/views/home/setting-popup/index.vue";
import {autoSpeak, stopSpeak} from "@/utils/responsive-voice";

const addWordRef = ref<InstanceType<typeof AddWord>>()
const settingPopupRef = ref<InstanceType<typeof SettingPopup>>()
const words = reactive<IWord[]>([])
const loading = ref(false)
const searchValue = ref('')
const searchFocus = ref(false)

const openAddWord = () => {
  addWordRef.value?.open()
}

const openSettingPopup = () => {
  settingPopupRef.value?.open()
}

const editWordOpen = (word: IWord) => {
  addWordRef.value?.open(word)
}

const autoPlayChange = (value: boolean) => {
  if (value) {
    autoSpeak(words)
  } else {
    stopSpeak()
  }
}

const getWord = async (searchKey: string = '') => {
  loading.value = true
  const {data} = await WordApi.get({
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
  <div class="container rounded-t-xl text-lg">
    <header class="flex items-center justify-between h-12 px-4 bg-sky-300 text-center text-white">
      <span class="w-10">{{ words.length }}</span>
      <span class="text-xl">Welcome</span>
      <span class="w-10"> </span>
    </header>
    <article class="home-view bg-violet-50 rounded-b-xl">
      <ul class="word-list-ul">
        <WordItem
            v-for="word in words"
            :key="word.id"
            :wordData="word"
            @refresh-list="getWord"
            @edit-word="editWordOpen"
        />
      </ul>
    </article>
    <footer class="flex items-center justify-between h-12 mt-2 px-4 bg-cyan-400 text-white rounded-xl">
      <van-icon name="setting-o" @click="openSettingPopup" size="20"/>
      <van-field
          v-model="searchValue"
          @focus="searchFocus = true"
          @blur="searchFocus = false"
          @update:modelValue="searchWord"
          placeholder="Search"
          left-icon="search"
          clear-trigger="always"
          class="search-field"
          :class="{ 'is-focus': searchFocus }"
          clearable
      />
      <van-icon name="add-o" @click="openAddWord" size="20" />
    </footer>
    <AddWord ref="addWordRef" @add-complete="getWord"/>
    <SettingPopup
        ref="settingPopupRef"
        @auto-play-change="autoPlayChange"
    />
  </div>
</template>

<style scoped lang="scss">
.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 600px;
  width: auto;
  margin: 10px;
  overflow: auto;
}

.home-view {
  flex: 1;
  overflow: auto;
}

.word-list-ul > div:nth-child(2n) {
  @apply bg-violet-100;
}

.search-field {
  @apply flex items-center;
  width: 8rem;
  height: 2.2rem;
  padding: 0 .5rem;
  border-radius: 2rem;
  transition: width 0.3s;
  &.is-focus {
    width: 12rem;
  }
}
</style>
