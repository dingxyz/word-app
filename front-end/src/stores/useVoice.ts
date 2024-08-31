import {ref} from 'vue'
import {defineStore} from 'pinia'
import {IWord} from "@/api/word-api";
import {PERSIST_CONFIG} from "@/utils/local-storage";
import {SYSTEM_NAME} from "@/utils/cache-key";
import VoiceApi from "@/api/voice-api";
import {showNotify} from "vant";

export enum ORDER_TYPE {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random'
}

export enum SSML_GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

const PLAY_TIME_MS = 30 * 60 * 1000;

export const useVoiceStore = defineStore(`${SYSTEM_NAME}-voice`, () => {
  const playOrder = ref(ORDER_TYPE.SEQUENTIAL)
  const ssmlGender = ref(SSML_GENDER.FEMALE)
  const speakingRate = ref(1)
  const nowPlaying = ref(false)   // Is it playing automatically?
  const playingId = ref(null)
  const isPaused = ref(false)    // Is it paused?
  const audio = new Audio('');
  let loading = false;
  let playIndex = 0;
  let playSequence: number[] = [];
  let playWords: IWord[] = [];
  let playStartTime = 0;
  const lastPlayInfo = {
    english: '',
    ssmlGender: '',
    speakingRate: 0,
    onEnd: () => {
    }
  };

  const voiceSpeak = async (english: string, isAutoPlay: boolean = false, onEnd?: () => void) => {
    if (!isAutoPlay) {
      pauseSpeak();
      if (
        english === lastPlayInfo.english &&
        ssmlGender.value === lastPlayInfo.ssmlGender &&
        speakingRate.value === lastPlayInfo.speakingRate
      ) {
        audio.play()
        return
      } else {
        lastPlayInfo.onEnd && lastPlayInfo.onEnd();
        lastPlayInfo.english = english;
        lastPlayInfo.ssmlGender = ssmlGender.value;
        lastPlayInfo.speakingRate = speakingRate.value;
        lastPlayInfo.onEnd = onEnd;
      }
    }
    const data = {
      input: {text: english},
      voice: {
        languageCode: 'en-US',
        ssmlGender: ssmlGender.value,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speakingRate.value,
      },
    };
    if (loading) return;
    loading = true;
    const res = await VoiceApi.getVoice(data)
      .catch(() => {
        showNotify({type: 'danger', message: "Failed to get voice"});
        onEnd()
      })
      .finally(() => loading = false)

    const audioContent = res.audioContent;
    audio.src = `data:audio/mp3;base64,${audioContent}`;
    audio.load();
    audio.onended = onEnd
    audio.play()
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
    voiceSpeak(word.english, true, playNext);
  }

  const pauseSpeak = () => {
    if (nowPlaying.value) {
      isPaused.value = true;
      audio?.pause();
    }
  }

  const resumeSpeak = () => {
    if (nowPlaying.value && isPaused.value) {
      isPaused.value = false;
      playNext();
    }
  }

  const stopSpeak = () => {
    nowPlaying.value = false;
    isPaused.value = false;
    playingId.value = null;
    audio?.pause();
    audio && (audio.currentTime = 0);
  }

  const resetSpeak = () => {
    stopSpeak();
    playIndex = 0;
    playSequence = [];
    playWords = [];
    playStartTime = 0;
  }

  return {nowPlaying, ssmlGender, speakingRate, isPaused, playingId, playOrder, voiceSpeak, autoSpeak, resetSpeak}
}, {
  // @ts-ignore
  persist: PERSIST_CONFIG,
})
