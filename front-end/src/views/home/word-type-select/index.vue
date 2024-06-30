<script setup lang="ts">
import {computed, defineComponent, ref} from 'vue'
import IconBtn from "@/components/IconBtn.vue";
import {useAppStore} from "@/stores/app";

defineComponent({
  name: 'WordTypeSelect',
})

const emit = defineEmits(['refresh-list'])

const appStore = useAppStore();

const wordType = computed({
  get: () => appStore.wordType,
  set: value => appStore.wordType = value
})
</script>

<template>
  <van-popover placement="bottom-end">
    <van-radio-group v-model="wordType" @change="emit('refresh-list')" shape="dot">
      <van-radio name="words" class="m-4">words</van-radio>
      <van-radio name="phrase" class="m-4">phrase</van-radio>
      <van-radio name="sentence" class="m-4">sentence</van-radio>
      <van-radio name="answer" class="m-4">answer</van-radio>
    </van-radio-group>
    <template #reference>
      <IconBtn icon="list-switch"/>
    </template>
  </van-popover>
</template>
