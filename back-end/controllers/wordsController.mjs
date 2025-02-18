import Word from '../models/Word.js';
import {generateUniqueId, STATISTICS_WORD_TYPE} from "../utils/commonUtil.mjs";
import Worldview from "../models/Worldview.js";
// import {removeAnnotationStr} from "../utils/removeSpacesFromIds.mjs";

export const getWords = async (req, res) => {
  const {wordType, collect} = req.query;
  let sendData = [];
  try {
    if (wordType) {
      if (wordType === STATISTICS_WORD_TYPE) {
        sendData = await Worldview.find(collect ? {collect: true} : {}).sort({english: 1}).select('-annotation');
      } else {
        sendData = await Word.find({wordType}).sort({createdAt: 1}).select('-annotation');
      }
    } else {
      sendData = await Word.find().sort({createdAt: 1}).select('-annotation');
    }
    res.sendSuccess(sendData ?? []);
  } catch (error) {
    res.sendError(error.message);
  }
};

export const getAnnotation = async (req, res) => {
  const {wordType, id} = req.query;
  let sendData;
  try {
    if (wordType === STATISTICS_WORD_TYPE) {
      sendData = await Worldview.findOne({id});
    } else {
      sendData = await Word.findOne({id, wordType});
    }
    res.sendSuccess(sendData ?? {});
  } catch (error) {
    res.sendError(error.message);
  }
};

export const searchWord = async (req, res) => {
  const {body} = req;
  const {searchKey} = body;
  let sendData = [];
  try {
    sendData = await Worldview.find({
      $or: [
        {english: {$regex: searchKey, $options: 'i'}},
      ]
    }).sort({english: 1});
    res.sendSuccess(sendData ?? []);
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

export const updateWord = async (req, res) => {
  const {id} = req.params;
  const {body} = req;
  const {wordType, english, context,chinese, annotation} = body;

  try {
    let word;
    if (wordType === STATISTICS_WORD_TYPE) {
      word = await Worldview.findOneAndUpdate(
        {id},
        {english, context, chinese, annotation},
        {new: true}
      );
    } else {
      word = await Word.findOneAndUpdate(
        {id, wordType},
        {english, chinese, annotation},
        {new: true}
      );
    }

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

export const toggleCollect = async (req, res) => {
  const {id} = req.params;
  const {body} = req;
  const {collect} = body;

  try {
    const word = await Worldview.findOneAndUpdate(
      {id},
      {collect},
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