import {JSONFile, Low} from 'lowdb';

const adapter = new JSONFile('db/db.json');
export const db = new Low(adapter);

export const WORD_TYPE = {
    WORDS: 'words',
    PHRASE: 'phrase',
    SENTENCE: 'sentence',
    ANSWER: 'answer',
    NOTEBOOK: 'notebook',
    LEARNED: 'learned',
};

export async function initDatabase() {
    await db.read();
    db.data ||= {
        users: []
    };
    for (const key in WORD_TYPE) {
        db.data[WORD_TYPE[key]] ||= [];
    }
    await db.write();
}
