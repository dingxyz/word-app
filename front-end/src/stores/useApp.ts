import {computed, ref} from 'vue'
import {defineStore} from 'pinia'
import WordTypeApi, {WordType} from "@/api/word-type-api";

const WORLD_VIEW = 'Worldview'

export const useAppStore = defineStore(`app`, () => {
  const bookId = ref('')
  const typeList = ref<WordType[]>([])
  const showChineseChecked = ref(false)
  const isLiteMode = ref(false)

  const currentBook = computed(() => typeList.value.find((item) => item.id === bookId.value))
  const wordType = computed(() => currentBook.value?.name ?? WORLD_VIEW)
  const isWorldview = computed(() => currentBook.value?.name === WORLD_VIEW)
  const isGrammarInUse1 = computed(() => currentBook.value?.name === 'GrammarInUse1')

  const getTypeList = async (id?: string) => {
    const res = await WordTypeApi.get()
    typeList.value = res.data
    if (!bookId.value) {
      bookId.value = id ?? typeList.value.find((item) => item.name === 'GrammarInUse1').id
    }
  }

  const isWorldviewById = (id: string) => {
    return typeList.value.find((item) => item.id === id)?.name === WORLD_VIEW
  }


  return {wordType, bookId,typeList, showChineseChecked, isLiteMode, isWorldview, isGrammarInUse1,currentBook, getTypeList, isWorldviewById }
}, {
  persist: {
    paths: ['wordType', 'bookId','showChineseChecked', 'isLiteMode'],
  },
})
