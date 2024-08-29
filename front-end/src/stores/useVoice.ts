import {ref} from 'vue'
import {defineStore} from 'pinia'
import {IWord} from "@/api/word-api";
import {showNotify} from "vant";

export enum ORDER_TYPE {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random'
}

const responsiveVoice = window['responsiveVoice'];
const PLAY_TIME_MS = 30 * 60 * 1000;

export const useVoiceStore = defineStore('voice', () => {
  const playOrder = ref(ORDER_TYPE.SEQUENTIAL)
  const nowPlaying = ref(false)
  const playingId = ref(null)
  const isPaused = ref(false)
  let playIndex = 0;
  let playSequence: number[] = [];
  let playWords: IWord[] = [];
  let playStartTime = 0;

  const voiceSpeak = (english: string, onEnd?: () => void) => {
    // responsiveVoice?.speak(english, "UK English Male", {
    //   onend: onEnd
    // });

    const apiKey = 'AIzaSyAJKCS3ks02UA8wqtq4U-AHPL85JWAUEus';

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const data = {
      input: { text: english },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then(result => {
        const audioContent = result.audioContent;
        const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
        audio.addEventListener('ended', onEnd);
        audio.play();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const autoSpeak = (words: IWord[]) => {
    if (words.length === 0) {
      return;
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

    if (playOrder.value === ORDER_TYPE.SEQUENTIAL) {
      playSequence = Array.from({length: totalWords}, (_, i) => i);
    } else if (playOrder.value === ORDER_TYPE.RANDOM) {
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

  const resetSpeak = () => {
    stopSpeak();
    playIndex = 0;
    playSequence = [];
    playWords = [];
    playStartTime = 0;
  }

  return {nowPlaying, isPaused, playingId, playOrder,voiceSpeak, autoSpeak, stopSpeak, resetSpeak}
})
