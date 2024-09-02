import { type App } from "vue"
import {createPinia} from "pinia";
import {createPersistedState} from "pinia-plugin-persistedstate";
import {SYSTEM_NAME} from "@/utils/cache-key";

export function loadPinia(app: App) {
  const pinia = createPinia();
  pinia.use(createPersistedState({
    auto: true,
    key: id => `${SYSTEM_NAME}_${id}`,
    storage: localStorage,
  }));
  app.use(pinia)
}
