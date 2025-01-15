import { type App } from 'vue'
import 'vant/lib/index.css'
import {
  ActionSheet,
  Button,
  Cell,
  CellGroup,
  Checkbox,
  CheckboxGroup,
  Dialog,
  Field,
  FloatingBubble,
  Form,
  Icon,
  List,
  Loading,
  Notify,
  Pagination,
  Popover,
  Popup,
  Radio,
  RadioGroup,
  Search,
  Slider,
  SwipeCell,
  Switch,
  Picker,
  Stepper,
  ConfigProvider, Divider
} from 'vant'

export function loadVantUI(app: App) {
  app.use(ConfigProvider)
  app.use(Popup)
  app.use(Form)
  app.use(Field)
  app.use(Cell)
  app.use(CellGroup)
  app.use(Icon)
  app.use(SwipeCell)
  app.use(Button)
  app.use(FloatingBubble)
  app.use(ActionSheet)
  app.use(Notify)
  app.use(Search)
  app.use(Switch)
  app.use(Popover)
  app.use(Radio)
  app.use(RadioGroup)
  app.use(Dialog)
  app.use(Pagination)
  app.use(Checkbox)
  app.use(CheckboxGroup)
  app.use(List)
  app.use(Loading)
  app.use(Slider)
  app.use(Picker)
  app.use(Stepper)
  app.use(Divider)
}
