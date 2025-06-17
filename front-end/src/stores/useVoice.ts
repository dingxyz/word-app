import { ref } from 'vue'
import { defineStore } from 'pinia'
import { IWord } from '@/api/word-api'
import VoiceApi from '@/api/voice-api'
import { showNotify } from 'vant'
import WordStatisticsApi from '@/api/word-statistics-api'
import {groupWords, methodTracker} from '@/utils/common-util'
import {useWorldStore} from "@/stores/useWorldview";
import {useAppStore} from "@/stores/useApp";

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
  const ssmlGender = ref(SSML_GENDER.FEMALE)
  const languageCode = ref(LANGUAGE_CODE.EN_US)
  const isAutoVoiceName = ref(true)
  const voiceName = ref('en-US-Wavenet-C')
  const isLoopPlayback = ref(false)
  const speakingRate = ref(1)
  const playNumber = ref(1)     // Number of plays for each
  const nowPlaying = ref(false) // Is it playing automatically?
  const playingId = ref(null)
  const isPaused = ref(false) // Is it paused?
  const audio = new Audio('')
  const voiceNameList = ref<any[]>([])
  const allChirp3Voices = ref<any[]>([])
  const selectedChirp3Voices = ref<string[]>([])
  let loading = false
  let playIndex = 0       // Which word is it playing now?
  let playedNumber = 1    // Which number is it playing now?
  let playSequence: number[] = []
  let playWords: IWord[] = []
  let playStartTime = 0
  let autoVoiceTypeIndex = 0

  const appStore = useAppStore()
  const worldStore = useWorldStore()

  const initVoiceList = async () => {
    // These prices are too expensive: 'Studio','Polyglot'
    // These have no price: 'Casual','News'
    // Cheap but quality: 'Standard'
    // Repeated with WaveNet: 'Neural2'
    // const excludeTypes = ['Studio', 'Polyglot', 'Casual', 'News', 'Standard', 'Neural2'];
    // const includeTypes = ['Chirp', 'Wavenet'];
    const includeTypes = ['Chirp', 'Chirp3'];
    const includeWavenetName = ['B','C']
    const {voices} = await VoiceApi.getVoicesList(languageCode.value)

    // 保存所有的Chirp3声音用于多选框
    allChirp3Voices.value = voices.filter(voice => voice.name.includes('Chirp3'));


    if (!selectedChirp3Voices.value.length && allChirp3Voices.value.length) {
      // 从allChirp3Voices中随机选择3个声音
      const randomChirp3Voices = allChirp3Voices.value.sort(() => 0.5 - Math.random()).slice(0, 3);
      selectedChirp3Voices.value = randomChirp3Voices.map(voice => voice.name);
    }

    // 筛选声音列表
    voiceNameList.value = voices
      .filter(voice => includeTypes.includes(voice.name.split('-')[2]))
      .filter(voice => !voice.name.includes('Wavenet') || includeWavenetName.includes(voice.name.split('-')[3]))

    voiceNameList.value.forEach(voice => {
      voice.text = `${voice.name}---${voice.ssmlGender}`
    })
    updateChirp3VoiceList()
    voiceName.value = voiceNameList.value[0]?.name
  }

  const voiceSpeak = async (english: string, isAutoPlay: boolean = false, onEnd?: () => void) => {
    if (isAutoVoiceName.value) {
      voiceName.value = voiceNameList.value[autoVoiceTypeIndex].name
      autoVoiceTypeIndex++
      if (autoVoiceTypeIndex >= voiceNameList.value.length) {
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
    if (isAutoPlay) {
      if (playNumber.value > 1 && playNumber.value > playedNumber) {
        playIndex--
        playedNumber++
      } else {
        playedNumber = 1
      }
    }
    audio.play()
  }

  const autoSpeak = (words: IWord[]) => {
    if (words.length === 0) {
      return
    }
    if (appStore.isWorldviewById(words[0].bookId)) {
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
    playSequence = Array.from({ length: totalWords }, (_, i) => i)
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

  const updateChirp3VoiceList = () => {
    // 先保留非Chirp3的声音
    const nonChirp3Voices = voiceNameList.value.filter(voice => !voice.name.includes('Chirp3'));

    // 添加用户选择的Chirp3声音
    const selectedVoices = allChirp3Voices.value.filter(voice =>
      selectedChirp3Voices.value.includes(voice.name)
    );

    selectedVoices.forEach(voice => {
      voice.text = voice.name + '---' + voice.ssmlGender;
    });

    voiceNameList.value = [...nonChirp3Voices, ...selectedVoices];
  }

  return {
    nowPlaying,
    ssmlGender,
    languageCode,
    speakingRate,
    playNumber,
    isPaused,
    playingId,
    isLoopPlayback,
    isAutoVoiceName,
    voiceName,
    voiceNameList,
    allChirp3Voices,
    selectedChirp3Voices,
    voiceSpeak,
    autoSpeak,
    resetSpeak,
    updateChirp3VoiceList,
    initVoiceList
  }
})
