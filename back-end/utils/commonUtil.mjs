import Word from '../models/Word.js';
import WordStatistics from "../models/WordStatistics.js"

export const STATISTICS_WORD_TYPE = 'WordCount'

export const generateUniqueId = () => 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000)

/*
* Count the number of words in a string
* */
const countEnglishWords = (text) => {
    if (typeof text !== 'string') {
        return {};
    }
    const words = text.match(/[a-zA-Z]+(?:'[a-zA-Z]+)?/g) || [];
    const wordCount = new Map();
    words.forEach(word => {
        // Convert all words to lowercase to avoid duplicate counting caused by different uppercase and lowercase letters
        const lowerCaseWord = word.toLowerCase();
        if (lowerCaseWord?.length > 1) {
            wordCount.set(lowerCaseWord, (wordCount.get(lowerCaseWord) || 0) + 1);
        }
    });
    return Object.fromEntries(wordCount);
}

/*
* Count all words
* */
const countAllWords = async () => {
    const words = await Word.find({wordType: {$ne: STATISTICS_WORD_TYPE}}).sort({createdAt: 1});
    // const words = await Word.find({wordType: 'test'}).sort({createdAt: 1});
    const allWordCount = new Map();
    for (const word of words) {
        const wordFrequency = countEnglishWords(word.english + ' ' + word.annotation);
        for (const [key, value] of Object.entries(wordFrequency)) {
            allWordCount.set(key, (allWordCount.get(key) || 0) + value);
        }
    }
    let allWordCountObj = Array.from(allWordCount.entries()).map(([key, value]) => ({
        english: key,
        count: value,
        annotation: ''
    }));
    // allWordCountObj.sort((a, b) => b.count - a.count);
    allWordCountObj.sort((a, b) => a.english.localeCompare(b.english));
    // Filter count greater than 1
    allWordCountObj = allWordCountObj.filter(word => word.count > 1);

    return allWordCountObj;
}

/*
* Count all words and store them in the database
* */
export const setWordStatistics = async () => {
    const allWordCountObj = await countAllWords();

    console.log(allWordCountObj)

    await Promise.all(
        allWordCountObj.map(async (word) => {
            const {english, annotation, count} = word;
            const existingWord = await WordStatistics.findOne({english, wordType: STATISTICS_WORD_TYPE});
            if (existingWord) {
                // 单词存在,就更新单词的count
                existingWord.count = count;
                await existingWord.save();
            } else {
                const newWord = new WordStatistics({
                    id: generateUniqueId(),
                    english,
                    chinese: '',
                    annotation,
                    wordType: STATISTICS_WORD_TYPE,
                });
                await newWord.save();
            }

        })
    );
};

/*
* Delete a word of a certain type
* */
export const removeWordByType = async () => {
    const wordType = STATISTICS_WORD_TYPE;

    const words = await WordStatistics.find({wordType: wordType})
    await Promise.all(
        words.map(async (word) => {
            const {id} = word;
            // 谨慎操作！
            // await WordStatistics.findOneAndDelete({id, wordType});
        })
    );
}