<script setup lang="ts">
import {defineComponent, ref} from 'vue'
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
const voiceList = ref<any[]>([])
const voiceNameList = ref<any[]>([])
const showTypePicker = ref(false);
const showNamePicker = ref(false);

const onTypeConfirm = ({ selectedOptions }) => {
  showTypePicker.value = false;
  voiceStore.voiceType = selectedOptions[0].type;
  voiceNameList.value = selectedOptions[0].children;
  onNameConfirm({selectedOptions: voiceNameList.value, noClick: true})
};

const onNameConfirm = ({ selectedOptions, noClick }) => {
  if (!noClick) {
    isShow.value = false;
  }
  showNamePicker.value = false;
  voiceStore.voiceName = selectedOptions[0].name;
};

const saveWord = () => isShow.value = false

const initVoiceList = async () => {
  // These prices are too expensive: 'Studio','Polyglot'
  // These have no price: 'Casual','News'
  // Cheap but quality: 'Standard'
  const excludeTypes = ['Studio','Polyglot','Casual','News','Standard'];
  const {voices} = await VoiceApi.getVoicesList()
  voiceList.value = voices.reduce((acc, voice) => {
    const type = voice.name.split('-')[2];
    if (excludeTypes.includes(type)) return acc;
    const gender = voice.ssmlGender;
    let group = acc.find(g => g.type === type);
    if (!group) {
      group = {type, children: []};
      acc.push(group);
    }
    group.children.push({
      name: voice.name,
      gender: voice.name + '---' + gender,
    });
    return acc;
  }, []);
  console.log(voices,voiceList.value)

  if (voiceStore.voiceType) {
    const group = voiceList.value.find(g => g.type === voiceStore.voiceType);
    onTypeConfirm({selectedOptions: [group]})
  } else {
    onTypeConfirm({selectedOptions: voiceList.value})
  }
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
        <van-field
          v-model="voiceStore.voiceType"
          is-link
          readonly
          label="Voice Type"
          @click="showTypePicker = true"
        />
        <van-field
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
        <van-field v-if="voiceStore.voiceType !== 'Journey'" name="slider" input-align="right" label="Speech rate">
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
    <van-popup v-model:show="showTypePicker" round position="bottom">
      <van-picker
        :columns="voiceList"
        :columns-field-names="{ text: 'type', value: 'type', children: ''}"
        @cancel="showTypePicker = false"
        @confirm="onTypeConfirm"
      />
    </van-popup>
    <van-popup v-model:show="showNamePicker" round position="bottom">
      <van-picker
        :columns="voiceNameList"
        :columns-field-names="{ text: 'gender', value: 'name', children: ''}"
        @cancel="showNamePicker = false"
        @confirm="onNameConfirm"
      />
    </van-popup>
  </van-popup>
</template>
