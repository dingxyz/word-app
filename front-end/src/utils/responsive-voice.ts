import {IWord} from "@/api/word-api";

export enum ORDER_TYPE {
    SEQUENTIAL = 'sequential',
    RANDOM = 'random'
}

const responsiveVoice = window['responsiveVoice'];


export const voiceSpeak = (english: string, onEnd?: () => void) => {
    // let words = new SpeechSynthesisUtterance(english);
    // window.speechSynthesis.speak(words);
    responsiveVoice?.speak(english, "UK English Male", {
        onend: onEnd
    });
}

export const autoSpeak = (words: IWord[], autoPlayOrder: ORDER_TYPE) => {
    console.log(autoPlayOrder)
    if (!autoPlayOrder) {
        stopSpeak();
        return
    }
    // If autoPlayOrder === ORDER_TYPE.SEQUENTIAL, play in sequence
    // If autoPlayOrder === ORDER_TYPE.RANDOM, play randomly
    let index = 0;
    const totalWords = words.length;
    let sequence: number[] = [];

    if (autoPlayOrder === ORDER_TYPE.SEQUENTIAL) {
        sequence = Array.from({ length: totalWords }, (_, i) => i);
    } else if (autoPlayOrder === ORDER_TYPE.RANDOM) {
        sequence = Array.from({ length: totalWords }, (_, i) => i);
        for (let i = totalWords - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
        }
    }

    const playNext = () => {
        if (index < totalWords) {
            const word = words[sequence[index]];
            index++;
            voiceSpeak(word.english, playNext);
        }
    }

    playNext();
}

const stopSpeak = () => {
    responsiveVoice?.cancel();
}