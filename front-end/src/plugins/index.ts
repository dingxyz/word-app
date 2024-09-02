import { type App } from "vue"
import {loadVantUI} from "@/plugins/vant-ui";
import {loadPinia} from "@/plugins/pinia";

export function loadPlugins(app: App) {
  loadPinia(app)
  loadVantUI(app)
}
