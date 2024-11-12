// models/Word.js
import mongoose from '../db/mongoose.js';

const wordStatisticsSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    english: { type: String, required: true, index: true },
    chinese: { type: String, index: true },
    annotation: { type: String },
    wordType: { type: String, index: true },
    // createdAt: { type: Date, default: Date.now },
    count: { type: Number, default: 1 },
});

const WordStatistics = mongoose.model('Word_Count', wordStatisticsSchema);

export default WordStatistics;
