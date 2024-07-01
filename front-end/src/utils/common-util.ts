import {showNotify} from "vant";

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
  showNotify({ type: 'success', message: 'Copied to clipboard' });
};