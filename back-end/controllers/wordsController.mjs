import Word from '../models/Word.js';
import {generateUniqueId} from "../utils/commonUtil.mjs";

export const getWords = async (req, res) => {
    const {searchKey, wordType} = req.query;
    let sendData = [];
    try {
        if (searchKey) {
            sendData = await Word.find({
                $or: [
                    {english: {$regex: searchKey, $options: 'i'}},
                    {chinese: {$regex: searchKey, $options: 'i'}}
                ]
            }).maxTimeMS(9000).sort({createdAt: 1});
        } else if (wordType) {
            sendData = await Word.find({wordType}).sort({createdAt: 1});
        }
        res.sendSuccess(sendData ?? []);
    } catch (error) {
        res.sendError(error.message);
    }
};

export const addWord = async (req, res) => {
    const {body} = req;
    const {wordType, english} = body;

    try {
        const existingWord = await Word.findOne({english: english});
        if (existingWord) {
            res.sendError("Word already exists");
            return;
        }

        body.id = generateUniqueId();
        const newWord = new Word(body);
        await newWord.save();
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};

export const moveWord = async (req, res) => {
    const {body} = req;
    const {id, wordType, toType} = body;

    try {
        const word = await Word.findOneAndUpdate(
            {id, wordType},
            {wordType: toType, createdAt: new Date()},
            {new: true}
        );
        if (!word) {
            res.sendError("Word not found");
            return;
        }

        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};

export const updateWord = async (req, res) => {
    const {id} = req.params;
    const {body} = req;
    const {wordType, english, chinese, annotation} = body;

    try {
        const word = await Word.findOneAndUpdate(
            {id, wordType},
            {english, chinese, annotation},
            {new: true}
        );
        if (!word) {
            res.sendError("Word not found");
            return;
        }
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};

export const deleteWord = async (req, res) => {
    const {id} = req.params;
    const {wordType} = req.query;

    try {
        const word = await Word.findOneAndDelete({id, wordType});
        if (!word) {
            res.sendError("Word not found");
            return;
        }
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};
