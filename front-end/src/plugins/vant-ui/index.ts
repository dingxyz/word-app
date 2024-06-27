import { type App } from "vue"
import 'vant/lib/index.css';
import {ActionSheet, Button, CellGroup, Field, FloatingBubble, Form, Icon, Notify, Popup, Search, SwipeCell, Switch} from "vant";

export function loadVantUI(app: App) {
  app.use(Popup);
  app.use(Form);
  app.use(Field);
  app.use(CellGroup);
  app.use(Icon);
  app.use(SwipeCell);
  app.use(Button);
  app.use(FloatingBubble);
  app.use(ActionSheet);
  app.use(Notify);
  app.use(Search);
  app.use(Switch);
}
