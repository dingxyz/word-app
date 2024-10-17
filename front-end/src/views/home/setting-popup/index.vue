<script setup lang="ts">
import {defineComponent, nextTick, ref} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {usePaginationStore} from "@/stores/usePagination";
import {ORDER_TYPE, SSML_GENDER, useVoiceStore} from "@/stores/useVoice";
import VoiceApi from "@/api/voice-api";

defineComponent({
  name: 'SettingPopup',
})
const appStore = useAppStore();
const voiceStore = useVoiceStore()
const paginationStore = usePaginationStore()
const isShow = ref(false)
const showNamePicker = ref(false);

const onNameConfirm = ({selectedOptions}) => {
  showNamePicker.value = false;
  voiceStore.voiceName = selectedOptions[0].name;
  nextTick(() => {
    isShow.value = false;
  })
};

const saveWord = () => isShow.value = false

const initVoiceList = async () => {
  // These prices are too expensive: 'Studio','Polyglot'
  // These have no price: 'Casual','News'
  // Cheap but quality: 'Standard'
  // Repeated with WaveNet: 'Neural2'
  const excludeTypes = ['Studio', 'Polyglot', 'Casual', 'News', 'Standard', 'Neural2'];
  const {voices} = await VoiceApi.getVoicesList()
  voiceStore.voiceNameList = voices.filter(voice => !excludeTypes.includes(voice.name.split('-')[2]))
  voiceStore.voiceNameList.forEach(voice => {
    voice.text = voice.name + '---' + voice.ssmlGender
  })
}
initVoiceList()

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round>
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
        <van-field name="switch" label-width="120px" input-align="right" label="Loop Playback">
          <template #input>
            <van-switch v-model="voiceStore.isLoopPlayback" size="20"/>
          </template>
        </van-field>
        <van-field name="switch" label-width="120px" input-align="right" label="Auto Voice Type">
          <template #input>
            <van-switch v-model="voiceStore.isAutoVoiceName" size="20"/>
          </template>
        </van-field>
        <van-field
          v-if="!voiceStore.isAutoVoiceName"
          v-model="voiceStore.voiceName"
          is-link
          readonly
          label="Voice Name"
          @click="showNamePicker = true"
        />
        <van-field v-if="false" name="radio" input-align="right" label="Play Gender">
          <template #input>
            <van-radio-group v-model="voiceStore.ssmlGender" direction="horizontal">
              <van-radio :name="SSML_GENDER.MALE">{{ SSML_GENDER.MALE }}</van-radio>
              <van-radio :name="SSML_GENDER.FEMALE">{{ SSML_GENDER.FEMALE }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-if="!voiceStore.voiceName.includes('Journey')" name="slider" input-align="right" label="Speech rate">
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
    <van-popup v-model:show="showNamePicker" round position="bottom">
      <van-picker
        :columns="voiceStore.voiceNameList"
        :columns-field-names="{ text: 'text', value: 'name', children: ''}"
        @cancel="showNamePicker = false"
        @confirm="onNameConfirm"
      />
    </van-popup>
  </van-popup>
</template>
