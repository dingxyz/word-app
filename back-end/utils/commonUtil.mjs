import Word from '../models/Word.js';

export const STATISTICS_WORD_TYPE = 'Worldview'

export const generateUniqueId = () => 'id-' + Date.now() + '-' + Math.floor(Math.random() * 10000)

/*
* Delete a word of a certain type
* */
export const removeWordByType = async () => {
    const wordType = STATISTICS_WORD_TYPE;

    // const words = await Word.find({wordType: wordType})
    await Promise.all(
        words.map(async (word) => {
            const {id} = word;
            // 谨慎操作！
            // await Word.findOneAndDelete({id, wordType});
        })
    );
}