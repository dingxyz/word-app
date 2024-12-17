import {marked} from 'marked'
// 自定义 renderer
const renderer = new marked.Renderer();

renderer.strong = ({text}) => {
  return text; // 返回纯文本，去掉 <strong> 标签
};

marked.setOptions({
  renderer,
});

export default marked;