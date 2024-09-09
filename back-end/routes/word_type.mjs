import express from 'express';
import {
    getWordTypes,
    addWordType,
    updateWordType,
    deleteWordType
} from '../controllers/WordTypeController.mjs';

const router = express.Router();

// 获取词汇类型
router.get('/', getWordTypes);

// 添加词汇类型
router.post('/', addWordType);

// 更新词汇类型
router.put('/:id', updateWordType);

// 删除词汇类型
router.delete('/:id', deleteWordType);

export default router;
