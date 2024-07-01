import {JSONFile, Low} from 'lowdb';

const adapter = new JSONFile('db/db.json');
export const db = new Low(adapter);

export const WORD_TYPE = {
    WORDS: 'words',
    PHRASE: 'phrase',
    SENTENCE: 'sentence',
    ANSWER: 'answer',
    NOTEBOOK: 'notebook'
};

export async function initDatabase() {
    await db.read();
    db.data ||= {
        users: []
    };
    db.data[WORD_TYPE.WORDS] ||= [];
    db.data[WORD_TYPE.PHRASE] ||= [];
    db.data[WORD_TYPE.SENTENCE] ||= [];
    db.data[WORD_TYPE.ANSWER] ||= [];
    db.data[WORD_TYPE.NOTEBOOK] ||= [];

    await db.write();
}
