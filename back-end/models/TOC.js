// models/TOC.js
import mongoose from '../db/mongoose.js';

const TOCSchema = new mongoose.Schema({
  bookId: {type: String, required: true},
  order: {type: Number, required: true},
  title: {type: String, required: true},
  detail: {type: String},
});

// 确保 order 仅在相同 bookId 内部唯一
TOCSchema.index({ bookId: 1, order: 1 }, { unique: true });

// 添加实例方法
TOCSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const TOC = mongoose.model('TOC_Schema', TOCSchema);

export default TOC;
