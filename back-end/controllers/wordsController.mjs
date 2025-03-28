import Word from '../models/Word.js';
import {generateUniqueId, STATISTICS_WORD_TYPE} from "../utils/commonUtil.mjs";
import Worldview from "../models/Worldview.js";
// import {removeAnnotationStr} from "../utils/removeSpacesFromIds.mjs";

export const getWords = async (req, res) => {
  const {bookId, collect, page, pageSize, renderOrder} = req.query;
  let sendData = [];
  let totalCount = 0;
  let skip = 0;
  let limit = 0;
  
  // 处理分页参数
  if (page && pageSize) {
    skip = (parseInt(page) - 1) * parseInt(pageSize);
    limit = parseInt(pageSize);
  }
  
  try {
    // await removeWordTypeFromWords();

    if (bookId) {
      if (bookId === 'all') {
        // 当bookId为'all'时，查询所有记录
        // 先获取总数
        totalCount = await Word.countDocuments();
        
        // 查询分页数据
        let aggregation = [
          {$sort: {createdAt: 1}}
        ];
        
        // 添加排序
        if (renderOrder === 'letter') {
          aggregation[0] = {$sort: {english: 1}};
        }
        
        // 添加分页
        if (page && pageSize) {
          aggregation.push({$skip: skip});
          aggregation.push({$limit: limit});
        }
        
        aggregation.push({
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
        });
        
        sendData = await Word.aggregate(aggregation);
      }
      else if (bookId === mappingNameAndId.find(item => item.name === STATISTICS_WORD_TYPE)?.id) {
        // 构建查询条件
        const matchCondition = collect ? {collect: true} : {};
        
        // 获取总数
        totalCount = await Worldview.countDocuments(matchCondition);
        
        // 构建聚合查询
        let aggregation = [
          {$match: matchCondition},
          {$sort: {english: 1}}
        ];
        
        // 处理排序
        if (renderOrder === 'time') {
          aggregation[1] = {$sort: {createdAt: 1}};
        }
        
        // 添加分页
        if (page && pageSize) {
          aggregation.push({$skip: skip});
          aggregation.push({$limit: limit});
        }
        
        aggregation.push({
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
        });
        
        sendData = await Worldview.aggregate(aggregation);
      } else {
        let TOC_Order = +req.query.TOC_Order ?? -1;
        let matchCondition = {bookId};

        if (TOC_Order === 0) {
          matchCondition.TOC_Order = {$exists: false}; // 只查询没有 TOC_Order 的数据
        } else if (TOC_Order > 0) {
          matchCondition.TOC_Order = TOC_Order;
        }
        
        // 获取总数
        totalCount = await Word.countDocuments(matchCondition);
        
        // 构建聚合查询
        let aggregation = [
          {$match: matchCondition},
          {$sort: {createdAt: 1}}
        ];
        
        // 处理排序
        if (renderOrder === 'letter') {
          aggregation[1] = {$sort: {english: 1}};
        }
        
        // 添加分页
        if (page && pageSize) {
          aggregation.push({$skip: skip});
          aggregation.push({$limit: limit});
        }
        
        aggregation.push({
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
        });
        
        sendData = await Word.aggregate(aggregation);
      }
    } else {
      // 当bookId不存在时，查询所有不含bookId字段的记录
      const matchCondition = {bookId: {$exists: false}};
      
      // 获取总数
      totalCount = await Word.countDocuments(matchCondition);
      
      // 构建聚合查询
      let aggregation = [
        {$match: matchCondition},
        {$sort: {createdAt: 1}}
      ];
      
      // 处理排序
      if (renderOrder === 'letter') {
        aggregation[1] = {$sort: {english: 1}};
      }
      
      // 添加分页
      if (page && pageSize) {
        aggregation.push({$skip: skip});
        aggregation.push({$limit: limit});
      }
      
      aggregation.push({
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
      });
      
      sendData = await Word.aggregate(aggregation);
    }
    res.sendSuccess({
      list: sendData ?? [],
      total: totalCount
    });
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

// 写个函数根据 bookId 查 TOC_Order 的分布, 返回一个map对象，key 是 TOC_Order，value 是单词的数量
// 如果没有 TOC_Order 则认为该单词的 TOC_Order 为 0
export const getWordsNumByBookId = async (bookId) => {
  if (!bookId) {
    return {};
  }

  // 创建结果对象
  const distribution = {};
  
  // 获取无TOC_Order的单词数量
  const noTOCOrderCount = await Word.countDocuments({
    bookId,
    TOC_Order: { $exists: false }
  });
  // 使用数字0作为键
  distribution[0] = noTOCOrderCount;
  
  // 获取所有不同的TOC_Order值
  const tocOrders = await Word.distinct('TOC_Order', { 
    bookId, 
    TOC_Order: { $exists: true }
  });
  
  // 为每个TOC_Order计算单词数量
  for (const order of tocOrders) {
    // 确保order是数字类型
    const numericOrder = Number(order);
    const count = await Word.countDocuments({
      bookId,
      TOC_Order: numericOrder
    });
    // 使用数字作为键
    distribution[numericOrder] = count;
  }
  
  console.log("Distribution in getWordsNumByBookId:", distribution);
  return distribution;
};

// 写个函数，
export const getTOCDistributed = async (req, res) => {
  const {bookId} = req.query;
  try {
    if (!bookId) {
      return res.sendError("BookId is required");
    }
    
    // 使用getWordsNumByBookId获取TOC分布
    const distribution = await getWordsNumByBookId(bookId);
    
    res.sendSuccess(distribution);
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
