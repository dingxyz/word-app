import {db} from '../db/initDatabase.mjs';
import {generateUniqueId} from "../utils/commonUtil.mjs";

export const getWords = async (req, res) => {
    const {searchKey, wordType} = req.query;
    let sendData = null;
    await db.read();
    if (searchKey) {
        sendData = db.data[wordType].filter(w => w.english.toLowerCase().includes(searchKey.toLowerCase()) || w.chinese.toLowerCase().includes(searchKey.toLowerCase()));
    } else {
        sendData = db.data[wordType];
    }
    res.sendSuccess(sendData ?? []);
};

export const addWord = async (req, res) => {
    const {body} = req;
    const {wordType} = body
    const existingWord = db.data[wordType]?.find(w => w.english.trim().toLowerCase() === body.english.trim().toLowerCase());

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

export const updateWord = async (req, res) => {
    const {id} = req.params;
    const {body} = req;
    const {wordType} = body
    const existingWord = db.data[wordType]?.find(w => w.english.trim().toLowerCase() === body.english.trim().toLowerCase());
    if (existingWord) {
        res.sendError("Word already exists");
        return;
    }
    await db.read();
    const index = db.data[wordType].findIndex(w => w.id === id);
    db.data[wordType][index] = body;
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
