import {db} from '../db/initDatabase.mjs';
import {generateUniqueId} from "../utils/commonUtil.mjs";

export const getWords = async (req, res) => {
    const { searchKey } = req.query;
    let sendData = [];
    await db.read();
    if (searchKey) {
        sendData = db.data.words.filter(w => w.english.toLowerCase().includes(searchKey.toLowerCase()) || w.chinese.toLowerCase().includes(searchKey.toLowerCase()));
    } else {
        sendData = db.data.words;
    }
    res.sendSuccess(sendData);
};

export const addWord = async (req, res) => {
    const { body } = req;
    const newId = body.english.trim().toLowerCase();
    const existingWord = db.data.words?.find(w => w.english.trim().toLowerCase() === body.english.trim().toLowerCase());

    if (existingWord) {
        res.sendError("Word already exists");
        return;
    }

    body.id = generateUniqueId();
    await db.read();
    db.data.words.push(body);
    await db.write();
    res.sendSuccess();
};

export const updateWord = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const existingWord = db.data.words?.find(w => w.english.trim().toLowerCase() === body.english.trim().toLowerCase());

    if (existingWord) {
        res.sendError("Word already exists");
        return;
    }

    await db.read();
    const index = db.data.words.findIndex(w => w.id === id);
    db.data.words[index] = body;
    await db.write();
    res.sendSuccess();
};

export const deleteWord = async (req, res) => {
    const { id } = req.params;
    await db.read();
    db.data.words = db.data.words.filter(n => n.id !== id);
    await db.write();
    res.sendSuccess();
};
