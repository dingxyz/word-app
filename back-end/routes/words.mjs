import express from 'express';
import {getWords, addWord, updateWord, deleteWord, moveWord} from '../controllers/wordsController.mjs';

const router = express.Router();

// Get
router.get('/', getWords);
// Add
router.post('/', addWord);
// move
router.post('/move', moveWord);
// Update
router.put('/:id', updateWord);
// Delete
router.delete('/:id', deleteWord);

export default router;
