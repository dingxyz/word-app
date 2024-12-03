import express from 'express';
import {
  getWords,
  addWord,
  updateWord,
  deleteWord,
  searchWord,
  toggleCollect
} from '../controllers/wordsController.mjs';

const router = express.Router();

// Get
router.get('/', getWords);
// Add
router.post('/', addWord);
// search
router.post('/search', searchWord);
// Update
router.put('/:id', updateWord);
// Delete
router.delete('/:id', deleteWord);
// Toggle Collect
router.put('/collect/:id', toggleCollect);

export default router;
