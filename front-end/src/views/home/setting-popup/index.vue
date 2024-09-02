<script setup lang="ts">
import {defineComponent, ref} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {usePaginationStore} from "@/stores/usePagination";
import {ORDER_TYPE, SSML_GENDER, useVoiceStore} from "@/stores/useVoice";

defineComponent({
  name: 'SettingPopup',
})
const appStore = useAppStore();
const voiceStore = useVoiceStore()
const paginationStore = usePaginationStore()
const isShow = ref(false)

const saveWord = () => isShow.value = false
const resetData = () => {
}

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round @close="resetData">
    <van-form @submit="saveWord" class="pt-8">
      <van-cell-group inset label-width="300px">
        <van-field name="switch" label-width="120px" input-align="right" label="Pagination">
          <template #input>
            <van-switch v-model="paginationStore.isPaging" size="20"/>
          </template>
        </van-field>
        <van-field v-if="paginationStore.isPaging" name="radio" input-align="right" label="Page size">
          <template #input>
            <van-radio-group v-model="paginationStore.pageSize" direction="horizontal">
              <van-radio :name="20">20</van-radio>
              <van-radio :name="30">30</van-radio>
              <van-radio :name="50">50</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="radio" input-align="right" label="Play order">
          <template #input>
            <van-radio-group v-model="voiceStore.playOrder" direction="horizontal">
              <van-radio :name="ORDER_TYPE.SEQUENTIAL">{{ ORDER_TYPE.SEQUENTIAL }}</van-radio>
              <van-radio :name="ORDER_TYPE.RANDOM">{{ ORDER_TYPE.RANDOM }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="radio" input-align="right" label="Play Gender">
          <template #input>
            <van-radio-group v-model="voiceStore.ssmlGender" direction="horizontal">
              <van-radio :name="SSML_GENDER.MALE">{{ SSML_GENDER.MALE }}</van-radio>
              <van-radio :name="SSML_GENDER.FEMALE">{{ SSML_GENDER.FEMALE }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="slider" input-align="right" label="Speech rate">
          <template #input>
            <van-slider v-model.number="voiceStore.speakingRate" :step="0.2" :min="0.6" :max="1.4"/>
          </template>
        </van-field>
        <van-field name="switch" label-width="120px" input-align="right" label="Display Chinese">
          <template #input>
            <van-switch v-model="appStore.showChineseChecked" size="20"/>
          </template>
        </van-field>
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button class="px-4" type="success" @click="saveWord" block>SAVE</van-button>
      </div>
    </van-form>
  </van-popup>
</template>
