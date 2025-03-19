import mongoose from '../db/mongoose.js';
import TOC from '../models/TOC.js';

const migrateTOCData = async () => {
  try {
    const db = mongoose.connection.db;
    const collection = db.collection('toc_schemas'); // 根据实际集合名调整
    
    // 获取所有记录
    const docs = await collection.find({}).toArray();
    
    // 更新每条记录
    for (const doc of docs) {
      if (doc.english && !doc.title) {
        await collection.updateOne(
          { _id: doc._id },
          { 
            $set: { title: doc.english },
            $unset: { english: "" }
          }
        );
      }
      
      if (doc.annotation && !doc.detail) {
        await collection.updateOne(
          { _id: doc._id },
          { 
            $set: { detail: doc.annotation },
            $unset: { annotation: "" }
          }
        );
      }
    }
    
    console.log('TOC 数据迁移完成');
  } catch (error) {
    console.error('TOC 数据迁移失败:', error);
  }
};

// 执行迁移
// migrateTOCData();

export default migrateTOCData; 