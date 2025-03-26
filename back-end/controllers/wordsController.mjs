import Word from '../models/Word.js';
import {generateUniqueId, STATISTICS_WORD_TYPE} from "../utils/commonUtil.mjs";
import Worldview from "../models/Worldview.js";
// import {removeAnnotationStr} from "../utils/removeSpacesFromIds.mjs";

export const getWords = async (req, res) => {
  const {bookId, collect} = req.query;
  let sendData = [];
  try {
    // await removeWordTypeFromWords();

    if (bookId) {
      if (bookId === 'all') {
        // 当bookId为'all'时，查询所有记录
        sendData = await Word.aggregate([
          {$sort: {createdAt: 1}},
          {
            $project: {
              id: 1,
              annotation: {
                $cond: {
                  if: {$and: [{$gt: ["$annotation", null]}, {$ne: ["$annotation", ""]}]},
                  then: true,
                  else: false
                }
              },
              bookId: 1,
              english: 1,
              TOC_Order: 1,
              chinese: 1,
              createdAt: 1
            }
          }
        ]);
      }
      else if (bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id) {
        sendData = await Worldview.aggregate([
          {$match: collect ? {collect: true} : {}},
          {$sort: {english: 1}},
          {
            $project: {
              id: 1,
              annotation: {
                $cond: {
                  if: {$and: [{$gt: ["$annotation", null]}, {$ne: ["$annotation", ""]}]},
                  then: true,
                  else: false
                }
              },
              bookId: 1,
              english: 1,
              context: 1,
              collect: 1,
              createdAt: 1
            }
          }
        ]);
      } else {
        let TOC_Order = +req.query.TOC_Order ?? -1;
        let matchCondition = {bookId};

        if (TOC_Order === 0) {
          matchCondition.TOC_Order = {$exists: false}; // 只查询没有 TOC_Order 的数据
        } else if (TOC_Order > 0) {
          matchCondition.TOC_Order = TOC_Order;
        }
        sendData = await Word.aggregate([
          {$match: matchCondition},
          {$sort: {createdAt: 1}},
          {
            $project: {
              id: 1,
              annotation: {
                $cond: {
                  if: {$and: [{$gt: ["$annotation", null]}, {$ne: ["$annotation", ""]}]},
                  then: true,
                  else: false
                }
              },
              bookId: 1,
              english: 1,
              TOC_Order: 1,
              chinese: 1,
              createdAt: 1
            }
          }
        ]);
      }
    } else {
      // 当bookId不存在时，查询所有不含bookId字段的记录
      sendData = await Word.aggregate([
        {$match: {bookId: {$exists: false}}}, // 只查询没有bookId字段的记录
        {$sort: {createdAt: 1}},
        {
          $project: {
            id: 1,
            annotation: {
              $cond: {
                if: {$and: [{$gt: ["$annotation", null]}, {$ne: ["$annotation", ""]}]},
                then: true,
                else: false
              }
            },
            bookId: 1,
            english: 1,
            TOC_Order: 1,
            chinese: 1,
            createdAt: 1
          }
        }
      ]);
    }
    res.sendSuccess(sendData ?? []);
  } catch (error) {
    res.sendError(error.message);
  }
};

export const getAnnotation = async (req, res) => {
  const {bookId, id} = req.query;
  let sendData;
  try {
    if (bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id) {
      sendData = await Worldview.findOne({id});
    } else {
      sendData = await Word.findOne({id, bookId});
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
  const {bookId, english} = body;

  try {
    // 确保bookId存在
    if (!bookId) {
      res.sendError("BookId is required");
      return;
    }
    
    // 查找对应的bookId是否是Worldview
    const isWorldview = bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id;
    const Model = isWorldview ? Worldview : Word;

    const existingWord = await Model.findOne({english, bookId});
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
  const {bookId, english, context, chinese, annotation, TOC_Order} = body;

  try {
    let word;
    if (bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id) {
      word = await Worldview.findOneAndUpdate(
        {id},
        {english, context, chinese, annotation},
        {new: true}
      );
    } else {
      word = await Word.findOneAndUpdate(
        {id, bookId},
        {english, chinese, annotation, TOC_Order},
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
  const {bookId} = req.query;

  try {
    const isWorldview = bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id;
    const Model = isWorldview ? Worldview : Word;
    const word = await Model.findOneAndDelete({id, bookId});
    if (!word) {
      res.sendError("Word not found");
      return;
    }
    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

export const changeTypeName = async (oldBookId, newBookId) => {
  try {
    const result = await Word.updateMany(
      {bookId: oldBookId},
      {$set: {bookId: newBookId}}
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

// 写个函数，getWordsNumByTOCOrder，根据 TOC_Order 查询单词的数量
export const getWordsNumByTOCOrder = async ({bookId, TOC_Order}) => {
  console.log("bookId", bookId, "TOC_Order", TOC_Order);
  let sendData = await Word.countDocuments({bookId, TOC_Order: +TOC_Order});
  return sendData ?? 0
};

// 写个函数，
export const getTOCDistributed = async (req, res) => {
  const {bookId, TOC_Order} = req.query;
  try {

    res.sendSuccess();
  } catch (error) {
    res.sendError(error.message);
  }
};

const mappingNameAndId = [
  {
    "hasTOC": false,
    "_id": "67481185653dc0c4ba6b7ac7",
    "id": "id-1732776325985-3969",
    "name": "Worldview",
    "order": 0,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "67488aefc830e010179e8ef6",
    "id": "id-1732807407960-8531",
    "name": "Knowledge Points",
    "order": 0,
    "parentId": null,
    "__v": 0
  },
  {
    "_id": "676d6ef00c70d7b50a7c7eba",
    "id": "id-1735225072256-6240",
    "name": "GrammarInUse1",
    "order": 0,
    "parentId": null,
    "__v": 0,
    "hasTOC": true
  },
  {
    "hasTOC": false,
    "_id": "66dec1585e2bfb0de6c1bf97",
    "id": "id-1725874520574-6739",
    "name": "like",
    "order": 1,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66dec19a5e2bfb0de6c1bf9c",
    "id": "id-1725874586269-3848",
    "name": "phrase",
    "order": 1,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "6720fd68afba9ac12f1b02fa",
    "id": "id-1730215272249-8654",
    "name": "ThroughPictures 1",
    "order": 1,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "6745ed17414b2e578fd4a7b2",
    "id": "id-1732635927338-9809",
    "name": "ThroughPictures 2",
    "order": 1,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66dec1b75e2bfb0de6c1bfa4",
    "id": "id-1725874615854-1296",
    "name": "answer",
    "order": 3,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66dec1c55e2bfb0de6c1bfa7",
    "id": "id-1725874629613-7379",
    "name": "learned",
    "order": 4,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66dec1d15e2bfb0de6c1bfaa",
    "id": "id-1725874641253-6083",
    "name": "notebook",
    "order": 5,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66dec2b65e2bfb0de6c1bfb8",
    "id": "id-1725874870706-307",
    "name": "ModernFamily1",
    "order": 6,
    "parentId": null,
    "__v": 0
  },
  {
    "hasTOC": false,
    "_id": "66f3f9b251f4bc0a6ce55099",
    "id": "id-1727265202200-9888",
    "name": "ModernFamily2",
    "order": 7,
    "parentId": null,
    "__v": 0
  }
]

// TODO: 写个函数，查询所有的Word，删除它的wordType
export const removeWordTypeFromWords = async () => {
  await Word.updateMany({}, {$unset: {wordType: ""}});

}
