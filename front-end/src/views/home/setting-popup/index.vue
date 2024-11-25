<script setup lang="ts">
import {defineComponent, nextTick, ref} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {usePaginationStore} from "@/stores/usePagination";
import {LANGUAGE_CODE, ORDER_TYPE, SSML_GENDER, useVoiceStore} from "@/stores/useVoice";
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
  // const excludeTypes = ['Studio', 'Polyglot', 'Casual', 'News', 'Standard', 'Neural2'];
  const includeTypes = ['Journey', 'Wavenet'];
  const {voices} = await VoiceApi.getVoicesList(voiceStore.languageCode)
  voiceStore.voiceNameList = voices.filter(voice => includeTypes.includes(voice.name.split('-')[2]))
  voiceStore.voiceNameList.forEach(voice => {
    voice.text = voice.name + '---' + voice.ssmlGender
  })
  voiceStore.voiceName = voiceStore.voiceNameList[0].name
}
initVoiceList()

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round>
    <van-form @submit="saveWord" class="pt-8">
      <van-cell-group inset label-width="300px" class="m-0">
        <van-field name="switch" label-width="120px" input-align="right" label="Pagination">
          <template #input>
            <van-switch v-model="paginationStore.isPaging" size="20"/>
          </template>
        </van-field>
        <van-field v-if="paginationStore.isPaging" name="radio" input-align="right" label="Page size">
          <template #input>
            <van-radio-group v-model="paginationStore.pageSize" direction="horizontal">
              <van-radio :name="30">30</van-radio>
              <van-radio :name="50">50</van-radio>
              <van-radio :name="70">70</van-radio>
              <van-radio :name="100">100</van-radio>
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
        <van-field name="radio" input-align="right" label="Language">
          <template #input>
            <van-radio-group v-model="voiceStore.languageCode" @change="initVoiceList" direction="horizontal">
              <van-radio :name="LANGUAGE_CODE.EN_US">{{ LANGUAGE_CODE.EN_US }}</van-radio>
              <van-radio :name="LANGUAGE_CODE.EN_GB">{{ LANGUAGE_CODE.EN_GB }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="switch" label-width="120px" input-align="right" label="Auto Voice Type">
          <template #input>
            <van-switch v-model="voiceStore.isAutoVoiceName" size="20"/>
          </template>
        </van-field>
        <van-field
          v-model="voiceStore.voiceName"
          :disabled="voiceStore.isAutoVoiceName"
          is-link
          readonly
          label="Voice Name"
          input-align="right"
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
        <van-field name="slider" label-width="100px" input-align="right" label="Speech rate">
          <template #input>
            <van-slider v-model.number="voiceStore.speakingRate" :step="0.2" :min="0.6" :max="1.4"/>
          </template>
        </van-field>
        <van-field name="stepper" label-width="120px" input-align="right" label="Play Number">
          <template #input>
            <van-stepper v-model="voiceStore.playNumber" min="1" max="10" />
          </template>
        </van-field>
        <van-field v-if="false" name="switch" label-width="120px" input-align="right" label="Display Chinese">
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
        :visible-option-num="9"
        @cancel="showNamePicker = false"
        @confirm="onNameConfirm"
      />
    </van-popup>
  </van-popup>
</template>
