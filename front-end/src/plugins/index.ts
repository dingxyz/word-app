import { type App } from "vue"
import {loadVantUI} from "@/plugins/vant-ui";

export function loadPlugins(app: App) {
  loadVantUI(app)
}
