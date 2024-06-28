import { App } from 'vue'
import IconBtn from '@/components/IconBtn.vue'

export const registerGlobalComponents = (app: App) => {
  app.component('IconBtn', IconBtn)
}