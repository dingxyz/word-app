import {type Directive} from "vue"
// directives/boldEnglish.js

function wrapEnglishText(node) {
  const queue = [node];
  const englishRegex = /[A-Za-z\u0250-\u02AF]+/g;

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
            const strong = document.createElement('strong');
            strong.textContent = matches[i];
            strong.style.color = 'red'
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
  }
}
