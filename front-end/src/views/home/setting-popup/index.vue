<script setup lang="ts">
import {computed, defineComponent, ref} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {usePaginationStore} from "@/stores/usePagination";
import {ORDER_TYPE, useVoiceStore} from "@/stores/useVoice";

defineComponent({
  name: 'SettingPopup',
})
const appStore = useAppStore();
const voiceStore = useVoiceStore()
const paginationStore = usePaginationStore()
const isShow = ref(false)
const showChineseChecked = computed({
  get: () => appStore.showChineseChecked,
  set: value => appStore.showChineseChecked = value
})
const isPaging = computed({
  get: () => paginationStore.isPaging,
  set: value => paginationStore.isPaging = value
})
const pageSize = computed({
  get: () => paginationStore.pageSize,
  set: value => paginationStore.pageSize = value
})
const playOrder = computed({
  get: () => voiceStore.playOrder,
  set: value => voiceStore.playOrder = value
})

const saveWord = () => isShow.value = false
const resetData = () => {}

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round @close="resetData">
    <van-form @submit="saveWord" class="pt-8">
      <van-cell-group inset label-width="300px">
        <van-field name="switch" label-width="120px" input-align="right" label="Pagination">
          <template #input>
            <van-switch v-model="isPaging" size="20"/>
          </template>
        </van-field>
        <van-field v-if="isPaging" name="radio" input-align="right" label="Page size">
          <template #input>
            <van-radio-group v-model="pageSize" direction="horizontal">
              <van-radio :name="30">30</van-radio>
              <van-radio :name="60">60</van-radio>
              <van-radio :name="120">120</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="radio" input-align="right" label="Play order">
          <template #input>
            <van-radio-group v-model="playOrder" direction="horizontal">
              <van-radio :name="ORDER_TYPE.SEQUENTIAL">{{ ORDER_TYPE.SEQUENTIAL }}</van-radio>
              <van-radio :name="ORDER_TYPE.RANDOM">{{ ORDER_TYPE.RANDOM }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="switch" label-width="120px" input-align="right" label="Display Chinese">
          <template #input>
            <van-switch v-model="showChineseChecked" size="20"/>
          </template>
        </van-field>
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button class="px-4" type="success" @click="saveWord" block>SAVE</van-button>
      </div>
    </van-form>
  </van-popup>
</template>
