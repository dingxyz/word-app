// models/Word.js
import mongoose from '../db/mongoose.js';

const worldviewSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    english: { type: String, required: true, index: true },
    chinese: { type: String },
    annotation: { type: String },
    wordType: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Worldview = mongoose.model('Worldview', worldviewSchema);

export default Worldview;
