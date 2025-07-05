<script setup lang="ts">
import WordApi, {IWord} from '@/api/word-api'
import {defineComponent, nextTick, reactive, ref} from 'vue'
import {FieldInstance, showNotify, showToast} from "vant";
import {useAppStore} from "@/stores/useApp";
import {trimEnd} from "lodash-es";
import {useTOCStore} from "@/stores/useTOC";
import {readFromClipboard} from "@/utils/common-util";
defineComponent({
  name: 'AddWord',
})

const emit = defineEmits(['add-complete'])

const appStore = useAppStore()
const docStore = useTOCStore()
const fieldRef = ref<FieldInstance>();
const isShow = ref(false)
const loading = ref(false)
const wordData = reactive<IWord>(new IWord())
let wordOriginalData = null

const saveWord = () => {
  const {id, english, context, chinese, annotation} = wordData
  if (!english) {
    showNotify({ type: 'warning', message: 'Please input english' });
    return
  }
  const {currentTOC} = docStore
  if (appStore.isGrammarInUse1 && !currentTOC?.order) {
    showNotify({ type: 'warning', message: 'Please input order' });
    return
  }
  const params = {
    id: id ?? undefined,
    TOC_Order: appStore.currentBook?.hasTOC ? currentTOC?.order : undefined,
    context,
    english,
    chinese,
    annotation,
  }
  params['bookId'] = wordData.id ? wordData.bookId : appStore.bookId

  loading.value = true
  const apiFunc = wordData.id ? WordApi.update : WordApi.add
  apiFunc(params).then(res => {
    if (res.code === '000000') {
      showNotify({type:'success', message: 'Save success'});
      isShow.value = false
      if (wordData.id) {
        wordOriginalData.context = context
      } else {
        emit('add-complete', {toBottom: !wordData.id})
      }
    } else {
      showNotify({type: 'danger', message: res.message});
    }
  }).finally(() => {
    loading.value = false
  })
}

// TODO: 批量添加front-end\src\views\home\add-word\oxford_words.json中的单词，
// 把单词放在english中，bookId保持不变，context和chinese为空，annotation为空
// 每100毫秒调用一次WordApi.add来添加单词
const batchAdd = async () => {
  try {
    // 动态导入 JSON 文件
    const oxfordWords = await import('./oxford_words.json');
    const words = oxfordWords.words;
    
    if (!words || words.length === 0) {
      showNotify({ type: 'warning', message: '没有找到要添加的单词' });
      return;
    }

    // 显示确认对话框
    const confirmed = confirm(`确定要批量添加 ${words.length} 个单词吗？这可能需要一些时间。`);
    if (!confirmed) return;

    loading.value = true;
    let successCount = 0;
    let failCount = 0;

    showNotify({ type: 'primary', message: `开始批量添加 ${words.length} 个单词...` });

    // 遍历所有单词
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      const params = {
        context: "",
        english: word,
        chinese: "",
        annotation: "",
        bookId: appStore.bookId || "id-1732776325985-3969"
      };

      try {
        const res = await WordApi.add(params);
        if (res.code === '000000') {
          successCount++;
        } else {
          failCount++;
          console.error(`添加单词 "${word}" 失败:`, res.message);
        }
      } catch (error) {
        failCount++;
        console.error(`添加单词 "${word}" 出错:`, error);
      }

      // 每100毫秒添加一个单词
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 每添加50个单词显示一次进度
      if ((i + 1) % 50 === 0) {
        showNotify({ 
          type: 'primary', 
          message: `已处理 ${i + 1}/${words.length} 个单词，成功: ${successCount}，失败: ${failCount}` 
        });
      }
    }

    // 显示最终结果
    showNotify({ 
      type: successCount > failCount ? 'success' : 'warning', 
      message: `批量添加完成！成功: ${successCount}，失败: ${failCount}` 
    });

    // 如果有成功添加的单词，触发刷新
    if (successCount > 0) {
      emit('add-complete', { toBottom: false });
    }

  } catch (error) {
    console.error('批量添加出错:', error);
    showNotify({ type: 'danger', message: '批量添加失败，请检查控制台错误信息' });
  } finally {
    loading.value = false;
  }
}

const resetData = () => {
  Object.assign(wordData, new IWord())
}

const open = async (word?: IWord) => {
  wordOriginalData = word
  isShow.value = true
  Object.assign(wordData, word || {})
  wordData.annotation = trimEnd(wordData.annotation)
  if (wordData.id) {
    const res = await WordApi.getAnnotation({
      id: wordData.id,
      bookId: appStore.bookId,
    })
    if (res.code === '000000') {
      wordData.annotation = res.data.annotation
    }
  }
  await nextTick()
  fieldRef.value?.focus()

  // 如果不是编辑模式（没有id），则尝试读取剪贴板
  if (!wordData.id) {
    const clipboardContent = await readFromClipboard()
    if (clipboardContent) {
      wordData.annotation = clipboardContent
    }
  }
}

defineExpose({open})
</script>

<template>
  <van-action-sheet
    v-model:show="isShow"
    :title="wordData.id? `Edit ${appStore.currentBook?.name}` : `Add ${appStore.currentBook?.name}`"
    @closed="resetData"
  >
    <div>
      <!-- <div class="flex justify-center mb-4">
        <van-button 
          type="primary" 
          size="small" 
          @click="batchAdd" 
          :loading="loading"
          loading-text="批量添加中..."
        >
          批量添加
        </van-button>
      </div> -->
      <van-cell-group inset>
        <van-field
          v-model.trim="wordData.english"
          ref="fieldRef"
          type="textarea"
          label="US"
          label-width="20px"
          placeholder="Please input english"
          clearable
          :autosize="{maxHeight: appStore.isWorldview ? 24 : 150}"
        />
        <van-field v-if="appStore.isWorldview && false" v-model="wordData.context" label="context" placeholder="" label-width="50px"/>
        <van-field v-if="!appStore.isWorldview && !appStore.currentBook?.name.includes('GrammarInUse')" v-model="wordData.chinese" label="cn" placeholder="Please input chinese" label-width="40px" clearable/>
        <van-field
          v-if="appStore.isWorldview ? !wordData?.id : true"
          v-model.trim="wordData.annotation"
          type="textarea"
          label="annotation"
          placeholder="Please input annotation"
          clearable
          label-align="top"
          :autosize="{minHeight: 50, maxHeight: 250}"
        />
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button type="success" @click="saveWord" :loading="loading" loading-text="SAVE WORD" block>
          SAVE WORD
        </van-button>
      </div>
    </div>
  </van-action-sheet>
</template>
