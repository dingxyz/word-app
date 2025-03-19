<script setup lang="ts">
import {RouterView} from 'vue-router'
</script>

<template>
  <van-config-provider
    theme="dark"
    class="h-full"
  >
    <RouterView/>
  </van-config-provider>
</template>
