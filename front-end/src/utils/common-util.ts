import {showNotify} from "vant";
import {useAppStore} from "@/stores/useApp";
import {IWord} from "@/api/word-api";

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    // showNotify({ type: 'danger', message: 'Copy Failure' });
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
  }
  showNotify({type: 'success', message: 'Copied to clipboard'});
};


export const methodTracker = (() => {
  const timestamps = []; // 用来保存时间戳
  const timeLimit = 1000; // 时间限制（毫秒）
  const callThreshold = 3; // 调用次数限制

  return () => {
    const now = Date.now(); // 当前时间戳
    timestamps.push(now); // 添加当前调用时间戳

    // 移除超出两秒范围的时间戳
    while (timestamps[0] < now - timeLimit) {
      timestamps.shift();
    }
    // 判断是否满足连续调用3次的条件
    if (timestamps.length >= callThreshold) {
      timestamps.length = 0;
      const appStore = useAppStore();
      appStore.isLiteMode = !appStore.isLiteMode
    }
  };
})();

export const groupWords = (words: IWord[]): IWord[] => {
  const result: IWord[] = [];
  const num = 10

  for (let i = 0; i < words.length; i += num) {
    const group = words.slice(i, i + num);
    const combinedWords = group.map(item => item.english).join("; ");
    result.push({...group[0], english: combinedWords});
  }

  return result;
}