import {ref, computed} from 'vue'
import {defineStore} from 'pinia'
import {useAppStore} from "@/stores/useApp"
import TOCApi, {ITOC} from '@/api/toc-api'

const EMPTY_TOC: ITOC = {
  order: 0,
  title: 'empty',
  detail: '',
  bookId: '',
}

export const useTOCStore = defineStore("toc", () => {
  // 状态
  const tocList = ref<ITOC[]>([])
  const currentTOC = ref<ITOC | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const bookList = ref<string[]>([])
  const selectedBook = ref<string>('')
  const searchKey = ref<string>('')
  const isLoaded = ref(false)
  const isSetToc = ref(false)

  const appStore = useAppStore()

  // 计算属性
  const filteredTOCList = computed(() => {
    let result = [...tocList.value]

    if (selectedBook.value) {
      result = result.filter(item => item.bookId === selectedBook.value)
    }

    if (searchKey.value) {
      const keyword = searchKey.value.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        (item.detail && item.detail.toLowerCase().includes(keyword))
      )
    }

    return result
  })

  // 获取所有 TOC 列表
  const fetchTOCList = async () => {
    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.getList({
        bookId: appStore.currentBook.id
      })
      if (res.code === '000000') {
        tocList.value = res.data || []
        // tocList.value.push(EMPTY_TOC)
        if (currentTOC.value === null) {
          currentTOC.value = tocList.value[0]
        }

        isLoaded.value = true
      } else {
        error.value = res.message || '获取目录列表失败'
      }
    } catch (err) {
      console.error('获取目录列表出错:', err)
      error.value = '获取目录列表出错'
    } finally {
      loading.value = false
    }
  }

  // 根据 ID 获取单个 TOC
  const fetchTOCById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.getById(id)
      if (res.code === '000000') {
        currentTOC.value = res.data
        return res.data
      } else {
        error.value = res.message || '获取目录详情失败'
        return null
      }
    } catch (err) {
      console.error('获取目录详情出错:', err)
      error.value = '获取目录详情出错'
      return null
    } finally {
      loading.value = false
    }
  }

  // 搜索 TOC
  const searchTOC = async (params: { searchKey?: string, bookName?: string }) => {
    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.search(params)
      if (res.code === '000000') {
        tocList.value = res.data || []
        return res.data
      } else {
        error.value = res.message || '搜索目录失败'
        return []
      }
    } catch (err) {
      console.error('搜索目录出错:', err)
      error.value = '搜索目录出错'
      return []
    } finally {
      loading.value = false
    }
  }

  // 添加 TOC
  const addTOC = async (toc: ITOC) => {
    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.add(toc)
      if (res.code === '000000') {
        // 添加成功后刷新列表
        await fetchTOCList()
        return true
      } else {
        error.value = res.message || '添加目录失败'
        return false
      }
    } catch (err) {
      console.error('添加目录出错:', err)
      error.value = '添加目录出错'
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新 TOC
  const updateTOC = async (toc: ITOC) => {
    if (!toc.order) {
      error.value = '目录ID不能为空'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.update(toc)
      if (res.code === '000000') {
        // 更新成功后刷新列表
        await fetchTOCList()

        // 如果当前正在查看的是这个 TOC，也更新当前 TOC
        if (currentTOC.value && currentTOC.value.order === toc.order) {
          currentTOC.value = toc
        }

        return true
      } else {
        error.value = res.message || '更新目录失败'
        return false
      }
    } catch (err) {
      console.error('更新目录出错:', err)
      error.value = '更新目录出错'
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除 TOC
  const deleteTOC = async (order: number) => {
    loading.value = true
    error.value = null

    try {
      const res = await TOCApi.remove(order)
      if (res.code === '000000') {
        // 删除成功后刷新列表
        await fetchTOCList()

        // 如果当前正在查看的是这个 TOC，清空当前 TOC
        if (currentTOC.value && currentTOC.value.order === order) {
          currentTOC.value = null
        }

        return true
      } else {
        error.value = res.message || '删除目录失败'
        return false
      }
    } catch (err) {
      console.error('删除目录出错:', err)
      error.value = '删除目录出错'
      return false
    } finally {
      loading.value = false
    }
  }

  // 设置搜索关键词
  const setSearchKey = (key: string) => {
    searchKey.value = key
  }

  // 设置选中的书籍
  const setSelectedBook = (book: string) => {
    selectedBook.value = book
  }

  // 初始化方法
  const initialize = async () => {
    await fetchTOCList()

  }

  return {
    // state
    tocList,
    currentTOC,
    loading,
    error,
    bookList,
    selectedBook,
    searchKey,
    isLoaded,
    isSetToc,
    filteredTOCList,

    // methods
    fetchTOCList,
    fetchTOCById,
    searchTOC,
    addTOC,
    updateTOC,
    deleteTOC,
    setSearchKey,
    setSelectedBook,
    initialize
  }
})
