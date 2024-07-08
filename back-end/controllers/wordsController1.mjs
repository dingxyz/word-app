import {db} from '../db/initDatabase.mjs';
import {generateUniqueId} from "../utils/commonUtil.mjs";

export const WORD_TYPE = {
    WORDS: 'words',
    PHRASE: 'phrase',
    SENTENCE: 'sentence',
    ANSWER: 'answer',
    NOTEBOOK: 'notebook'
};

// 写一个方法，遍历所有的db.data的所有WORD_TYPE，然后给其中每个数据添加wordType属性，值为对应的WORD_TYPE
const addWordTypeToData = async () => {
    await db.read();
    Object.values(WORD_TYPE).forEach(type => {
        if (db.data[type]) {
            db.data[type].forEach(w => {
                w['wordType'] = type;
            });
        }
    });
    await db.write();
};




export const getWords = async (req, res) => {
    const {searchKey, wordType} = req.query;
    let sendData = [];
    await db.read();
    if (searchKey) {
        Object.values(WORD_TYPE).forEach(type => {
            if (db.data[type]) {
                sendData = sendData.concat(
                    db.data[type].filter(w =>
                        w.english.toLowerCase().includes(searchKey.toLowerCase()) ||
                        w.chinese.toLowerCase().includes(searchKey.toLowerCase())
                    )
                );
            }
        });
    } else {
        sendData = db.data[wordType];
    }
    res.sendSuccess(sendData ?? []);
};

export const addWord = async (req, res) => {
    const {body} = req;
    const {wordType} = body

    let existingWord = null;
    Object.values(WORD_TYPE).some(type => {
        if (db.data[type]) {
            existingWord = db.data[type].find(w => w.english.trim().toLowerCase() === body.english.trim().toLowerCase());
            if (existingWord) {
                return true;
            }
        }
        return false;
    });
    if (existingWord) {
        res.sendError("Word already exists");
        return;
    }

    body.id = generateUniqueId();
    await db.read();
    db.data[wordType].push(body);
    await db.write();
    res.sendSuccess();
};

export const moveWord = async (req, res) => {
    const {body} = req;
    const {id, wordType, toType} = body
    await db.read();
    const index = db.data[wordType].findIndex(w => w.id === id);
    if (index === -1) {
        res.sendError("Word not found");
        return;
    }
    const word = db.data[wordType][index];
    db.data[wordType].splice(index, 1);
    db.data[toType].push(word);
    await db.write();
    res.sendSuccess();
};

export const updateWord = async (req, res) => {
    const {id} = req.params;
    const {body} = req;
    const {wordType, english, chinese, annotation} = body
    await db.read();
    const index = db.data[wordType].findIndex(w => w.id === id);
    db.data[wordType][index] = {
        id, english, chinese, annotation
    };
    await db.write();
    res.sendSuccess();
};

export const deleteWord = async (req, res) => {
    const {id} = req.params;
    const {wordType} = req.query;
    await db.read();
    db.data[wordType] = db.data[wordType].filter(n => n.id !== id);
    await db.write();
    res.sendSuccess();
};