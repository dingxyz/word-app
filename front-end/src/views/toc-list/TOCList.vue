<template>
  <div class="toc-container">
    <header class="toc-header">
      <van-search
        v-model="searchKey"
        placeholder="搜索目录"
        @search="onSearch"
        shape="round"
        background="transparent"
      />
      <van-dropdown-menu>
        <van-dropdown-item v-model="selectedBook" :options="bookOptions" @change="onBookChange" />
      </van-dropdown-menu>
    </header>

    <van-empty v-if="tocList.length === 0" description="暂无目录数据" />

    <van-list
      v-else
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <van-cell
        v-for="item in tocList"
        :key="item.id"
        :title="item.title"
        :label="item.bookName"
        is-link
        @click="showDetail(item)"
      />
    </van-list>

    <van-dialog
      v-model:show="showDetailDialog"
      title="目录详情"
      width="90%"
      :show-confirm-button="false"
    >
      <div class="toc-detail" v-if="currentTOC">
        <h3>{{ currentTOC.title }}</h3>
        <p class="book-name">{{ currentTOC.bookName }}</p>
        <div class="markdown-body" v-if="currentTOC.detail" v-html="renderMarkdown(currentTOC.detail)"></div>
        <div class="action-buttons">
          <van-button type="primary" size="small" @click="editTOC">编辑</van-button>
          <van-button type="danger" size="small" @click="confirmDelete">删除</van-button>
        </div>
      </div>
    </van-dialog>

    <van-dialog
      v-model:show="showEditDialog"
      :title="isEditing ? '编辑目录' : '添加目录'"
      width="90%"
      @confirm="saveTOC"
    >
      <van-form>
        <van-field
          v-model="formData.bookName"
          name="bookName"
          label="书名"
          placeholder="请输入书名"
          :rules="[{ required: true, message: '请输入书名' }]"
        />
        <van-field
          v-model="formData.title"
          name="title"
          label="目录名"
          placeholder="请输入目录名"
          :rules="[{ required: true, message: '请输入目录名' }]"
        />
        <van-field
          v-model="formData.detail"
          name="detail"
          label="详情"
          type="textarea"
          rows="4"
          placeholder="请输入详情（支持Markdown格式）"
        />
      </van-form>
    </van-dialog>

    <van-floating-bubble
      v-model:offset="{ x: 0, y: 10 }"
      axis="xy"
      magnetic="x"
      @click="addNewTOC"
    >
      <van-icon name="plus" size="20" />
    </van-floating-bubble>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { marked } from 'marked'
import TOCApi, { ITOC } from '@/api/toc-api'
import 'github-markdown-css/github-markdown.css'

// 数据列表
const tocList = ref<ITOC[]>([])
const loading = ref(false)
const finished = ref(false)
const searchKey = ref('')
const selectedBook = ref('')
const bookOptions = ref([{ text: '全部书籍', value: '' }])
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const currentTOC = ref<ITOC | null>(null)
const isEditing = ref(false)

// 表单数据
const formData = ref<ITOC>({
  bookName: '',
  title: '',
  detail: ''
})

// 初始化
onMounted(async () => {
  await fetchTOCList()
  await fetchBookList()
})

// 获取目录列表
const fetchTOCList = async () => {
  try {
    loading.value = true
    const params: any = {}
    
    if (selectedBook.value) {
      params.bookName = selectedBook.value
    }
    
    const res = await TOCApi.getAll(params)
    if (res.code === '000000') {
      tocList.value = res.data || []
    } else {
      showToast(res.message || '获取目录失败')
    }
  } catch (error) {
    console.error('获取目录失败', error)
    showToast('获取目录失败')
  } finally {
    loading.value = false
    finished.value = true
  }
}

// 获取书籍列表（去重）
const fetchBookList = async () => {
  try {
    const res = await TOCApi.getAll({})
    if (res.code === '000000' && res.data) {
      const books = [...new Set(res.data.map((item: ITOC) => item.bookName))]
      bookOptions.value = [
        { text: '全部书籍', value: '' },
        ...books.map(book => ({ text: book, value: book }))
      ]
    }
  } catch (error) {
    console.error('获取书籍列表失败', error)
  }
}

// 搜索
const onSearch = async () => {
  try {
    const data = {
      searchKey: searchKey.value,
      bookName: selectedBook.value
    }
    
    const res = await TOCApi.search(data)
    if (res.code === '000000') {
      tocList.value = res.data || []
    } else {
      showToast(res.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索失败', error)
    showToast('搜索失败')
  }
}

// 切换书籍
const onBookChange = () => {
  fetchTOCList()
}

// 加载更多
const onLoad = () => {
  // 由于后端没有分页，这里直接设置完成
  finished.value = true
}

// 显示详情
const showDetail = (item: ITOC) => {
  currentTOC.value = item
  showDetailDialog.value = true
}

// 渲染Markdown
const renderMarkdown = (content: string) => {
  return marked(content)
}

// 编辑目录
const editTOC = () => {
  if (currentTOC.value) {
    formData.value = { ...currentTOC.value }
    isEditing.value = true
    showDetailDialog.value = false
    showEditDialog.value = true
  }
}

// 添加新目录
const addNewTOC = () => {
  formData.value = {
    bookName: '',
    title: '',
    detail: ''
  }
  isEditing.value = false
  showEditDialog.value = true
}

// 保存目录
const saveTOC = async () => {
  try {
    if (!formData.value.bookName || !formData.value.title) {
      showToast('书名和目录名不能为空')
      return
    }
    
    let res
    if (isEditing.value) {
      res = await TOCApi.update(formData.value)
    } else {
      res = await TOCApi.add(formData.value)
    }
    
    if (res.code === '000000') {
      showToast(isEditing.value ? '更新成功' : '添加成功')
      await fetchTOCList()
      showEditDialog.value = false
    } else {
      showToast(res.message || (isEditing.value ? '更新失败' : '添加失败'))
    }
  } catch (error) {
    console.error(isEditing.value ? '更新失败' : '添加失败', error)
    showToast(isEditing.value ? '更新失败' : '添加失败')
  }
}

// 确认删除
const confirmDelete = () => {
  if (!currentTOC.value) return
  
  showConfirmDialog({
    title: '确认删除',
    message: `确定要删除"${currentTOC.value.title}"吗？`,
  }).then(async () => {
    try {
      const res = await TOCApi.remove(currentTOC.value!.id!)
      if (res.code === '000000') {
        showToast('删除成功')
        await fetchTOCList()
        showDetailDialog.value = false
      } else {
        showToast(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败', error)
      showToast('删除失败')
    }
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.toc-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-background);
}

.toc-header {
  display: flex;
  align-items: center;
  padding: 8px;
}

.toc-detail {
  padding: 16px;
}

.toc-detail h3 {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: bold;
}

.book-name {
  color: #999;
  margin-bottom: 16px;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.markdown-body {
  padding: 10px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
}
</style> 