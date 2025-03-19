// models/Word.js
import mongoose from '../db/mongoose.js';

const wordSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    english: { type: String, required: true, index: true },
    TOC_Order: { type: Number },
    chinese: { type: String },
    annotation: { type: String },
    wordType: { type: String, index: true },
    createdAt: { type: Date, default: Date.now },
});

// 添加索引以提高查询性能
wordSchema.index({ id: 1 });
wordSchema.index({ wordType: 1 });
wordSchema.index({ TOC_Order: 1 });

// 添加实例方法
wordSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.__v;
    return obj;
};

// 添加静态方法
wordSchema.statics.findByTOCOrder = function(tocOrder) {
    return this.find({ TOC_Order:  tocOrder});
};

const Word = mongoose.model('Word', wordSchema);

export default Word;
