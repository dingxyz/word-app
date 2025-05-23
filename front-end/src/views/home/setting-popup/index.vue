<script setup lang="ts">
import {defineComponent, nextTick, ref, onMounted, computed} from 'vue'
import {useAppStore} from "@/stores/useApp";
import {ORDER_TYPE, usePaginationStore} from "@/stores/usePagination";
import {LANGUAGE_CODE, SSML_GENDER, useVoiceStore} from "@/stores/useVoice";
import VoiceApi from "@/api/voice-api";
import {useWorldStore} from "@/stores/useWorldview";
import {useTOCStore} from "@/stores/useTOC";
import ChirpVoicePopup from './chirp-voice-popup/index.vue';

defineComponent({
  name: 'SettingPopup',
})
const appStore = useAppStore();
const voiceStore = useVoiceStore()
const worldStore = useWorldStore()
const docStore = useTOCStore()
const paginationStore = usePaginationStore()
const isShow = ref(false)
const showNamePicker = ref(false);
const showChirpCheck = ref(false);

const emit = defineEmits(['update'])

const onNameConfirm = ({selectedOptions}) => {
  showNamePicker.value = false;
  voiceStore.voiceName = selectedOptions[0].name;
  nextTick(() => {
    isShow.value = false;
  })
};

const saveWord = () => isShow.value = false

const chirp3Result = computed(() => {
  return `${voiceStore.selectedChirp3Voices.length}/${voiceStore.allChirp3Voices.length}`;
});

voiceStore.initVoiceList()

const open = () => isShow.value = true
defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round>
    <van-form @submit="saveWord" class="pt-8">
      <van-cell-group inset label-width="300px" class="m-0">
        <van-field v-if="docStore.isSetToc || !paginationStore.isByToc" name="switch" label-width="120px" input-align="right" label="Pagination">
          <template #input>
            <van-switch v-model="paginationStore.isPaging" size="20"/>
          </template>
        </van-field>
        <van-field v-if="(docStore.isSetToc || !paginationStore.isByToc) && paginationStore.isPaging" name="radio" input-align="right" label="Page size">
          <template #input>
            <van-radio-group v-model="paginationStore.pageSize" direction="horizontal">
              <van-radio :name="30" v-if="!appStore.isWorldview">30</van-radio>
              <van-radio :name="50">50</van-radio>
              <van-radio :name="70" v-if="!appStore.isWorldview">70</van-radio>
              <van-radio :name="100">100</van-radio>
              <van-radio :name="200">200</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field name="radio" input-align="right" label="Order" label-width="80px">
          <template #input>
            <van-radio-group v-model="paginationStore.renderOrder" direction="horizontal" @change="emit('update')">
              <van-radio :name="ORDER_TYPE.LETTER" v-show="appStore.isWorldview">{{ ORDER_TYPE.LETTER }}</van-radio>
              <van-radio :name="ORDER_TYPE.BY_TOC" v-show="appStore.currentBook?.hasTOC">{{ ORDER_TYPE.BY_TOC }}</van-radio>
              <van-radio :name="ORDER_TYPE.TIME">{{ ORDER_TYPE.TIME }}</van-radio>
              <van-radio :name="ORDER_TYPE.RANDOM">{{ ORDER_TYPE.RANDOM }}</van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field v-show="appStore.currentBook?.hasTOC" name="switch" label-width="120px" input-align="right" label="Always Show TOC">
          <template #input>
            <van-switch v-model="docStore.isSetToc" @change="emit('update')" size="20"/>
          </template>
        </van-field>
        <van-field v-show="appStore.isWorldview" name="switch" label-width="120px" input-align="right" label="Play Context">
          <template #input>
            <van-switch v-model="worldStore.isPlayContext" size="20"/>
          </template>
        </van-field>
        <van-field v-show="appStore.isWorldview" name="switch" label-width="120px" input-align="right" label="Show Star">
          <template #input>
            <van-switch v-model="worldStore.showStar" size="20"/>
          </template>
        </van-field>
        <van-field v-show="appStore.isWorldview" name="switch" label-width="120px" input-align="right" label="Only Collect">
          <template #input>
            <van-switch v-model="worldStore.onlyCollect" @change="emit('update')" size="20"/>
          </template>
        </van-field>
        <van-divider/>
        <van-field name="switch" label-width="120px" input-align="right" label="Loop Playback">
          <template #input>
            <van-switch v-model="voiceStore.isLoopPlayback" size="20"/>
          </template>
        </van-field>
        <van-field name="radio" input-align="right" label="Language">
          <template #input>
            <van-radio-group v-model="voiceStore.languageCode" @change="voiceStore.initVoiceList" direction="horizontal">
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
          v-model="chirp3Result"
          is-link
          readonly
          name="picker"
          label="Chirp3"
          input-align="right"
          placeholder="Select Chirp3 voices"
          @click="showChirpCheck = true"
        />
        <van-field
          v-model="voiceStore.voiceName"
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

    <ChirpVoicePopup v-model:show="showChirpCheck" />
  </van-popup>
</template>
