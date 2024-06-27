<script setup lang="ts">
import {defineComponent, ref} from 'vue'

defineComponent({
  name: 'SettingPopup',
})

const emit = defineEmits(['auto-play-change'])

const isShow = ref(false)
const autoPlayChecked = ref(false)


const saveWord = () => {

}

const resetData = () => {
}

const open = () => {
  isShow.value = true
}

defineExpose({open})
</script>

<template>
  <van-popup v-model:show="isShow" closeable position="bottom" round @close="resetData">
    <van-form @submit="saveWord" class="pt-4">
      <van-cell-group inset>
        <van-field name="switch" label="Autoplay">
          <template #input>
            <van-switch v-model="autoPlayChecked" @change="emit('auto-play-change', autoPlayChecked)" size="20"/>
          </template>
        </van-field>
      </van-cell-group>
      <div class="flex justify-center m-4">
        <van-button class="px-4" type="success" @click="saveWord" size="small">SAVE</van-button>
      </div>
    </van-form>
  </van-popup>
</template>

<style scoped lang="scss">

</style>
