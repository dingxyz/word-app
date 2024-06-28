import {IWord} from "@/api/word-api";

const responsiveVoice = window['responsiveVoice'];

export const voiceSpeak = (english: string, onEnd?: () => void) => {
    // let words = new SpeechSynthesisUtterance(english);
    // window.speechSynthesis.speak(words);
    responsiveVoice?.speak(english, "UK English Male", {
        onend: onEnd
    });
}

export const autoSpeak = (words: IWord[], value: boolean) => {
    if (!value) {
        stopSpeak();
        return
    }

    let index = 0
    const onEnd = () => {
        const word = words[index];
        index++;
        if (index < words.length) {
            voiceSpeak(word.english, onEnd);
        }
    }
    onEnd();
}

const stopSpeak = () => {
    responsiveVoice?.cancel();
}