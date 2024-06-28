<script setup lang="ts">
import {defineComponent, ref} from 'vue'

defineComponent({
  name: 'SearchInput',
})
const searchValue = ref('')
const searchFocus = ref(false)
</script>

<template>
  <van-field
    v-model="searchValue"
    @focus="searchFocus = true"
    @blur="searchFocus = false"
    placeholder="Search"
    left-icon="search"
    clear-trigger="always"
    class="search-field"
    :class="{ 'is-focus': searchFocus }"
    clearable
  />
</template>


<style scoped lang="scss">
.search-field {
  @apply flex items-center;
  width: 8rem;
  height: 2.2rem;
  padding: 0 .5rem;
  border-radius: 2rem;
  transition: width 0.3s;

  &.is-focus {
    width: 12rem;
  }
}
</style>