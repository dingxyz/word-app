<script setup lang="ts">
import { ref, computed } from 'vue';
import { useVoiceStore } from "@/stores/useVoice";

const voiceStore = useVoiceStore();
const show = defineModel<boolean>('show');
const checkboxRefs = ref([]);

const toggle = (index) => {
  checkboxRefs.value[index]?.toggle();
};

const onChirp3Confirm = () => {
  // 使用voiceStore中的方法更新Chirp3声音列表
  voiceStore.updateChirp3VoiceList();
  show.value = false;
};
</script>

<template>
  <van-popup
    v-model:show="show"
    destroy-on-close
    position="bottom"
    class="h-full flex flex-col"
  >
    <van-checkbox-group v-model="voiceStore.selectedChirp3Voices" class="flex-1 overflow-auto">
      <van-cell-group inset class="m-0">
        <van-cell
          v-for="(voice, index) in voiceStore.allChirp3Voices"
          clickable
          :key="voice.name"
          :title="voice.name + ' - ' + voice.ssmlGender"
          @click="toggle(index)"
        >
          <template #right-icon>
            <van-checkbox
              :name="voice.name"
              :ref="el => checkboxRefs[index] = el"
              @click.stop
            />
          </template>
        </van-cell>
      </van-cell-group>
    </van-checkbox-group>
    <div class="flex justify-center p-4">
      <van-button type="primary" @click="onChirp3Confirm" block>Confirm ({{ voiceStore.selectedChirp3Voices.length }}/{{ voiceStore.allChirp3Voices.length }})</van-button>
    </div>
  </van-popup>
</template>
