<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {reactive, ref} from 'vue'
import WordItem from "@/views/word-item/index.vue";
import AddWord from "@/views/add-word/index.vue";

const addWordRef = ref<InstanceType<typeof AddWord>>()
const words = reactive<IWord[]>([])

const onClick = () => {
  addWordRef.value?.open()
}

const editWordOpen = (word: IWord) => {
  addWordRef.value?.open(word)
}


const getWord = async () => {
  const res = await WordApi.get()
  words.splice(0, words.length, ...res)
}
getWord()

</script>

<template>
  <div class="container">
    <header class="text-xl">
      welcome
    </header>
    <article class="home-view">
      <ul>
        <WordItem
          v-for="word in words"
          :key="word.id"
          :wordData="word"
          @refresh-list="getWord"
          @edit-word="editWordOpen"
        />
      </ul>
    </article>
    <footer>

      <AddWord ref="addWordRef" @add-complete="getWord"/>
    </footer>
    <van-floating-bubble icon="plus" @click="onClick"/>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  max-width: 600px;
  width: auto;
  height: 100%;
  margin: 10px;
  padding: 20px;
  background: #e1eef5;
  border-radius: 20px;
  flex-direction: column;
}

.home-view {
  flex: 1;
  overflow: auto;
}

</style>
