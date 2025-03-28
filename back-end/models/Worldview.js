// models/Word.js
import mongoose from '../db/mongoose.js';

const worldviewSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    english: { type: String, required: true, index: true },
    context: { type: String },
    annotation: { type: String },
    wordType: { type: String },
    bookId: { type: String, index: true },
    collect: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

worldviewSchema.index({ bookId: 1 });

const Worldview = mongoose.model('Worldview', worldviewSchema);

export default Worldview;
