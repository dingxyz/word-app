import TOC from '../models/TOC.js';
import { generateUniqueId } from "../utils/commonUtil.mjs";
import {getWordsNumByTOCOrder} from "./wordsController.mjs";

// 获取所有 TOC 记录
export const getAllTOCs = async (req, res) => {
  const { bookId } = req.query;
  try {
    let query = {};
    if (bookId) {
      query.bookId = bookId;
    }
    const tocList = await TOC.find(query).sort({ order: 1 });
    res.sendSuccess(tocList);
  } catch (error) {
    res.sendError(error.message);
  }
};

// 获取单个 TOC 记录
export const getTOCById = async (req, res) => {
  const { order } = req.params;
  try {
    const toc = await TOC.findOne({ order });
    if (!toc) {
      return res.sendError("TOC not found");
    }
    res.sendSuccess(toc);
  } catch (error) {
    res.sendError(error.message);
  }
};

// 这里报错
// message
//   :
//   "E11000 duplicate key error collection: test.toc_schemas index: id_1 dup key: { id: null }"
// 但是第一次调用时不报错，第二次调用就报错了，不知道为什么
export const addTOC = async (req, res) => {
  const { body } = req;
  const { bookId, order } = body;

  try {
    const existingTOC = await TOC.findOne({ bookId, order });
    if (existingTOC) {
      return res.sendError("TOC already exists");
    }

    const newTOC = new TOC(body);
    await newTOC.save();
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

// 更新 TOC 记录
export const updateTOC = async (req, res) => {
  const { body } = req;
  const { order, bookId, title, detail } = body;

  try {
    const toc = await TOC.findOneAndUpdate(
      { order },
      { bookId, title, detail },
      { new: true }
    );

    if (!toc) {
      return res.sendError("TOC not found");
    }
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

export const deleteTOC = async (req, res) => {
  const order = +req.params.order;
  const { bookId } = req.query;
  try {
    // const num = await getWordsNumByTOCOrder({ bookId, order });
    const toc = await TOC.findOneAndDelete({ order });
    if (!toc) {
      return res.sendError("TOC not found");
    }
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

// 按书名搜索 TOC
export const searchTOC = async (req, res) => {
  const { body } = req;
  const { searchKey, bookId } = body;

  try {
    let query = {};

    if (searchKey) {
      query.title = { $regex: searchKey, $options: 'i' };
    }

    if (bookId) {
      query.bookId = bookId;
    }

    const tocList = await TOC.find(query).sort({ title: 1 });
    res.sendSuccess(tocList || []);
  } catch (error) {
    res.sendError(error.message);
  }
};
