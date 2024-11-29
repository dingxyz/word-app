import express from 'express';
import {getWords, addWord, updateWord, deleteWord, moveWord, searchWord} from '../controllers/wordsController.mjs';

const router = express.Router();

// Get
router.get('/', getWords);
// Add
router.post('/', addWord);
// move
router.post('/move', moveWord);
// search
router.post('/search', searchWord);
// Update
router.put('/:id', updateWord);
// Delete
router.delete('/:id', deleteWord);

export default router;
