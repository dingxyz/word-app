<script setup lang="ts">
import {computed, defineComponent, ref} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {ORDER_TYPE} from "@/utils/responsive-voice";

defineComponent({
  name: 'SettingPopup',
})
const emit = defineEmits(['auto-play-change'])
const appStore = useAppStore();
const isShow = ref(false)
const autoPlayChecked1 = ref(false)
const autoPlayChecked2 = ref(false)
const showChineseChecked = computed({
  get: () => appStore.showChineseChecked,
  set: value => appStore.showChineseChecked = value
})

const playOrderChange = (order: ORDER_TYPE) => {
  if (order === ORDER_TYPE.SEQUENTIAL) {
    autoPlayChecked2.value = false
  } else {
    autoPlayChecked1.value = false
  }
  const val = autoPlayChecked1.value ? ORDER_TYPE.SEQUENTIAL : (autoPlayChecked2.value? ORDER_TYPE.RANDOM : null)
  emit('auto-play-change', val)
}

const saveWord = () => isShow.value = false
const resetData = () => {}

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round @close="resetData">
    <van-form @submit="saveWord" class="pt-4">
      <van-cell-group inset label-width="300px">
        <van-field name="checkbox" label-width="100px" input-align="right" label="Autoplay">
          <template #input>
            <van-checkbox v-model="autoPlayChecked1" @click="playOrderChange(ORDER_TYPE.SEQUENTIAL)">{{ ORDER_TYPE.SEQUENTIAL }}</van-checkbox>
            <van-checkbox v-model="autoPlayChecked2" @click="playOrderChange(ORDER_TYPE.RANDOM)" class="ml-4">{{ ORDER_TYPE.RANDOM }}</van-checkbox>
          </template>
        </van-field>
        <van-field name="switch" label-width="120px" input-align="right" label="Display Chinese">
          <template #input>
            <van-switch v-model="showChineseChecked" size="20"/>
          </template>
        </van-field>
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button class="px-4" type="success" @click="saveWord" size="small" block>SAVE</van-button>
      </div>
    </van-form>
  </van-popup>
</template>
