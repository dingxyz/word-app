import { ref } from 'vue'
import { defineStore } from 'pinia'
import { IWord } from '@/api/word-api'
import VoiceApi from '@/api/voice-api'
import { showNotify } from 'vant'
import WordStatisticsApi from '@/api/word-statistics-api'
import {groupWords, methodTracker} from '@/utils/common-util'
import {useWorldStore} from "@/stores/useWorldview";

export enum ORDER_TYPE {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random'
}

export enum SSML_GENDER {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum LANGUAGE_CODE {
  EN_US = 'en-US',
  EN_GB = 'en-GB'
}

const PLAY_TIME_MS = 30 * 60 * 1000

export const useVoiceStore = defineStore(`voice`, () => {
  const playOrder = ref(ORDER_TYPE.SEQUENTIAL)
  const ssmlGender = ref(SSML_GENDER.FEMALE)
  const languageCode = ref(LANGUAGE_CODE.EN_US)
  const isAutoVoiceName = ref(true)
  const voiceName = ref('en-US-Wavenet-C')
  const isLoopPlayback = ref(false)
  const speakingRate = ref(1)
  const playNumber = ref(1)
  const nowPlaying = ref(false) // Is it playing automatically?
  const playingId = ref(null)
  const isPaused = ref(false) // Is it paused?
  const audio = new Audio('')
  const voiceNameList = ref<any[]>([])
  let loading = false
  let playIndex = 0
  let playedNumber = 1
  let playSequence: number[] = []
  let playWords: IWord[] = []
  let playStartTime = 0
  let autoVoiceTypeIndex = 0

  const worldStore = useWorldStore()

  const voiceSpeak = async (english: string, isAutoPlay: boolean = false, onEnd?: () => void) => {
    if (isAutoVoiceName.value) {
      voiceName.value = voiceNameList.value[autoVoiceTypeIndex].name
      autoVoiceTypeIndex++
      if (autoVoiceTypeIndex >= voiceNameList.value.length - 1) {
        autoVoiceTypeIndex = 0
      }
    }
    if (!isAutoPlay) {
      pauseSpeak()
    }

    // add word to statistics
    WordStatisticsApi.add({
      date: new Date().toLocaleDateString('zh-CN'),
      english
    })

    const data = {
      input: { text: english },
      voice: {
        languageCode: languageCode.value,
        name: voiceName.value
        // ssmlGender: ssmlGender.value,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: voiceName.value.includes('Journey') ? 1 : speakingRate.value
      }
    }
    if (loading) return
    loading = true
    const res = await VoiceApi.getVoice(data)
      .catch(() => {
        showNotify({ type: 'danger', message: 'Failed to get voice' })
        onEnd()
      })
      .finally(() => (loading = false))

    const audioContent = res.audioContent
    audio.src = `data:audio/mp3;base64,${audioContent}`
    audio.load()
    audio.onended = onEnd
    if (playNumber.value > 1 && playNumber.value > playedNumber) {
      playIndex--
      playedNumber++
    } else {
      playedNumber = 1
    }
    audio.play()
  }

  const autoSpeak = (words: IWord[]) => {
    if (words.length === 0) {
      return
    }
    if (words[0].wordType === "Worldview") {
      words = groupWords(words, worldStore.isPlayContext)
    }
    if (nowPlaying.value && !isPaused.value) {
      // playIndex--
      pauseSpeak()
      return
    }

    if (nowPlaying.value && isPaused.value) {
      resumeSpeak()
      return
    }

    nowPlaying.value = true
    isPaused.value = false
    playWords = words
    playStartTime = Date.now()
    playIndex = 0

    const totalWords = words.length
    playSequence = []

    if (playOrder.value === ORDER_TYPE.SEQUENTIAL) {
      playSequence = Array.from({ length: totalWords }, (_, i) => i)
    } else if (playOrder.value === ORDER_TYPE.RANDOM) {
      playSequence = Array.from({ length: totalWords }, (_, i) => i)
      for (let i = totalWords - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playSequence[i], playSequence[j]] = [playSequence[j], playSequence[i]];
      }
    }

    playNext()
  }

  const playNext = () => {
    if (isPaused.value || !nowPlaying.value) return

    if (Date.now() - playStartTime >= PLAY_TIME_MS) {
      stopSpeak()
      return
    }

    if (playIndex >= playWords.length) {
      if (isLoopPlayback.value) {
        playIndex = 0
      } else {
        stopSpeak()
        return
      }
    }

    const word = playWords[playSequence[playIndex]]
    playingId.value = word.id
    playIndex++
    voiceSpeak(word.english, true, playNext)
  }

  const pauseSpeak = () => {
    if (nowPlaying.value) {
      isPaused.value = true
    }
  }

  const resumeSpeak = () => {
    if (nowPlaying.value && isPaused.value) {
      isPaused.value = false
      playNext()
    }
  }

  const stopSpeak = () => {
    nowPlaying.value = false
    isPaused.value = false
    playingId.value = null
    audio?.pause()
    audio && (audio.currentTime = 0)
  }

  const resetSpeak = (isTrack = false) => {
    stopSpeak()
    playIndex = 0
    playedNumber = 1
    playSequence = []
    playWords = []
    playStartTime = 0
    isTrack && methodTracker()
  }

  return {
    nowPlaying,
    ssmlGender,
    languageCode,
    speakingRate,
    playNumber,
    isPaused,
    playingId,
    playOrder,
    isLoopPlayback,
    isAutoVoiceName,
    voiceName,
    voiceNameList,
    voiceSpeak,
    autoSpeak,
    resetSpeak
  }
})
