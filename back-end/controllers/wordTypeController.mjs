import WordType from '../models/WordType.js';
import {generateUniqueId} from "../utils/commonUtil.mjs";
import {changeTypeName} from "./wordsController.mjs";

// 获取词汇类型
export const getWordTypes = async (req, res) => {
  const {searchKey} = req.query;
  try {
    let query = {};
    if (searchKey) {
      query = {name: {$regex: searchKey, $options: 'i'}};
    }
    const wordTypes = await WordType.find(query).sort({order: 1});
    res.sendSuccess(wordTypes ?? []);
  } catch (error) {
    res.sendError(error.message);
  }
};

// 添加词汇类型
export const addWordType = async (req, res) => {
  const {body} = req;
  const {name} = body;

  try {
    const existingWordType = await WordType.findOne({name: name.trim()});
    if (existingWordType) {
      res.sendError("Book type already exists");
      return;
    }

    body.id = generateUniqueId();
    const newWordType = new WordType(body);
    await newWordType.save();
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

// 更新词汇类型
export const updateWordType = async (req, res) => {
  const {id} = req.params;
  const {body} = req;
  const {name, order, parentId, hasTOC} = body;

  try {
    const oldWordType = await WordType.findOne({id});
    if (oldWordType) {
      await WordType.findOneAndUpdate(
        {id: id},
        {name, order, parentId, hasTOC},
        {new: true}
      );
      if (oldWordType.name !== name) {
        await changeTypeName(oldWordType.id, id);
      }
      res.sendSuccess();
    } else {
      res.sendError("Book type not found");
    }
  } catch (error) {
    res.sendError(error.message);
  }
};

// 删除词汇类型
export const deleteWordType = async (req, res) => {
  const {id} = req.params;

  try {
    const wordType = await WordType.findOneAndDelete({id});
    if (!wordType) {
      res.sendError("Book type not found");
      return;
    }
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};
