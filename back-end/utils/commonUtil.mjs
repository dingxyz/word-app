import Word from '../models/Word.js';

export const STATISTICS_WORD_TYPE = 'Worldview'

export const generateUniqueId = () => 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000)
