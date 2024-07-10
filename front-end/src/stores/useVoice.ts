import {ref} from 'vue'
import {defineStore} from 'pinia'
import {IWord} from "@/api/word-api";

export enum ORDER_TYPE {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random'
}

const responsiveVoice = window['responsiveVoice'];
const PLAY_TIME_MS = 30 * 60 * 1000;

export const useVoiceStore = defineStore('voice', () => {
  const nowPlaying = ref(false)
  const playingId = ref(null)
  const isPaused = ref(false)
  let playIndex = 0;
  let playSequence: number[] = [];
  let playWords: IWord[] = [];
  let playStartTime = 0;

  const voiceSpeak = (english: string, onEnd?: () => void) => {
    responsiveVoice?.speak(english, "UK English Male", {
      onend: onEnd
    });
  }

  const autoSpeak = (words: IWord[], autoPlayOrder: ORDER_TYPE) => {
    if (!autoPlayOrder) {
      stopSpeak();
      return
    }

    if (nowPlaying.value && !isPaused.value) {
      pauseSpeak();
      return;
    }

    if (nowPlaying.value && isPaused.value) {
      resumeSpeak();
      return;
    }

    nowPlaying.value = true;
    isPaused.value = false;
    playWords = words;
    playStartTime = Date.now();
    playIndex = 0;

    const totalWords = words.length;
    playSequence = [];

    if (autoPlayOrder === ORDER_TYPE.SEQUENTIAL) {
      playSequence = Array.from({length: totalWords}, (_, i) => i);
    } else if (autoPlayOrder === ORDER_TYPE.RANDOM) {
      playSequence = Array.from({length: totalWords}, (_, i) => i);
      for (let i = totalWords - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playSequence[i], playSequence[j]] = [playSequence[j], playSequence[i]];
      }
    }

    playNext();
  }

  const playNext = () => {
    if (isPaused.value || !nowPlaying.value) return;

    if (Date.now() - playStartTime >= PLAY_TIME_MS) {
      stopSpeak();
      return;
    }

    if (playIndex >= playWords.length) {
      playIndex = 0;
    }

    const word = playWords[playSequence[playIndex]];
    playingId.value = word.id;
    playIndex++;
    voiceSpeak(word.english, playNext);
  }

  const pauseSpeak = () => {
    if (nowPlaying.value) {
      isPaused.value = true;
      responsiveVoice?.pause();
    }
  }

  const resumeSpeak = () => {
    if (nowPlaying.value && isPaused.value) {
      isPaused.value = false;
      responsiveVoice?.resume();
      playNext();
    }
  }

  const stopSpeak = () => {
    nowPlaying.value = false;
    isPaused.value = false;
    playingId.value = null;
    responsiveVoice?.cancel();
  }

  return {nowPlaying, isPaused, playingId, voiceSpeak, autoSpeak, stopSpeak}
})
