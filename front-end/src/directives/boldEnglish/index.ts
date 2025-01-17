import {type Directive} from "vue"
// directives/boldEnglish.js

function wrapEnglishText(node) {
  const queue = [node];
  // exclude: 1:,2:,aaa
  const englishRegex = /(?!.*(?::\s|aaa))[A-Za-z0-9\u0250-\u02AF\s,$’':;.!?"-]+/g;

  while (queue.length > 0) {
    const currentNode = queue.shift();

    if (currentNode.nodeType === Node.TEXT_NODE) {
      const text = currentNode.textContent;
      const parts = text.split(englishRegex);
      const matches = text.match(englishRegex);

      if (matches) {
        const parent = currentNode.parentNode;
        for (let i = 0; i < parts.length; i++) {
          parent.insertBefore(document.createTextNode(parts[i]), currentNode);
          if (i < matches.length) {
            const strong = document.createElement('span');
            strong.textContent = matches[i];
            strong.classList.add('text-red')
            parent.insertBefore(strong, currentNode);
          }
        }
        parent.removeChild(currentNode);
      }
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      queue.push(...currentNode.childNodes);
    }
  }
}

export const boldEnglish: Directive = {
  mounted(el) {
    wrapEnglishText(el);
  },
  updated(el) {
    wrapEnglishText(el);
  }
}
