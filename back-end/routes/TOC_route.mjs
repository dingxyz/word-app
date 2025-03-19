import express from 'express';
import {
  getAllTOCs,
  getTOCById,
  addTOC,
  updateTOC,
  deleteTOC,
  searchTOC
} from '../controllers/tocController.mjs';

const router = express.Router();

// 获取所有 TOC 记录
router.get('/', getAllTOCs);

// 获取单个 TOC 记录
router.get('/:order', getTOCById);

// 添加新的 TOC 记录
router.post('/', addTOC);

// 更新 TOC 记录
router.put('/:order', updateTOC);

// 删除 TOC 记录
router.delete('/:order', deleteTOC);

// 按书名搜索 TOC
router.post('/search', searchTOC);

export default router;
