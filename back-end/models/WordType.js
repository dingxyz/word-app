// models/Word.js
import mongoose from '../db/mongoose.js';

const wordTypeSchema = new mongoose.Schema({
    id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    order: { type: Number, required: false, default: 0 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'WordType', default: null }
});

const WordType = mongoose.model('WordType', wordTypeSchema);

export default WordType;
