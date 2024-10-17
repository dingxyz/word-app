// models/Word.js
import mongoose from '../db/mongoose.js';

const wordSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    count: {
        type: Number,
        required: true
    }
});

const WordStatistics = mongoose.model('WordStatistics', wordSchema);

export default WordStatistics;
