import Word from '../models/Word.js';
import {generateUniqueId, STATISTICS_WORD_TYPE} from "../utils/commonUtil.mjs";
import Worldview from "../models/Worldview.js";

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
      if (wordType === STATISTICS_WORD_TYPE) {
        sendData = await Worldview.find().sort({english: 1});
      } else {
        sendData = await Word.find({wordType}).sort({createdAt: 1});
      }
    } else {
      sendData = await Word.find().sort({createdAt: 1});
    }
    res.sendSuccess(sendData ?? []);
    // await setWordStatistics()
    // removeWordByType()
  } catch (error) {
    res.sendError(error.message);
  }
};

export const addWord = async (req, res) => {
  const {body} = req;
  const {wordType, english} = body;

  try {
    const Model = wordType === STATISTICS_WORD_TYPE ? Worldview : Word;
    const existingWord = await Model.findOne({english, wordType});
    if (existingWord) {
      res.sendError("Word already exists");
      return;
    }

    body.id = generateUniqueId();
    const newWord = new Model(body);
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
    const Model = wordType === STATISTICS_WORD_TYPE ? Worldview : Word;
    const word = await Model.findOneAndUpdate(
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
    const Model = wordType === STATISTICS_WORD_TYPE ? Worldview : Word;
    const word = await Model.findOneAndDelete({id, wordType});
    if (!word) {
      res.sendError("Word not found");
      return;
    }
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

export const changeTypeName = async (wordType, newTypeName) => {
  try {
    const result = await Word.updateMany(
      {wordType},
      {$set: {wordType: newTypeName}}
    );
    return true
  } catch (error) {
    return false
  }
};
