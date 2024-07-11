import {type App} from "vue"
import {boldEnglish} from "@/directives/boldEnglish";

export function loadDirectives(app: App) {
  app.directive("bold-english", boldEnglish)
}
