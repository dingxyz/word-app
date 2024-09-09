import WordType from '../models/WordType.js';
import {generateUniqueId} from "../utils/commonUtil.mjs";

// 获取词汇类型
export const getWordTypes = async (req, res) => {
    const { searchKey } = req.query;
    try {
        let query = {};
        if (searchKey) {
            query = { name: { $regex: searchKey, $options: 'i' } };
        }
        const wordTypes = await WordType.find(query).sort({ order: 1 });
        res.sendSuccess(wordTypes ?? []);
    } catch (error) {
        res.sendError(error.message);
    }
};

// 添加词汇类型
export const addWordType = async (req, res) => {
    const { body } = req;
    const { name } = body;

    try {
        const existingWordType = await WordType.findOne({ name: name.trim() });
        if (existingWordType) {
            res.sendError("Word type already exists");
            return;
        }

        body.id = generateUniqueId();
        const newWordType = new WordType(body);
        await newWordType.save();
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};

// 更新词汇类型
export const updateWordType = async (req, res) => {
    const { id } = req.params;
    const { body } = req;
    const { name, order, parentId } = body;

    try {
        const wordType = await WordType.findOneAndUpdate(
            { id: id },
            { name, order, parentId },
            { new: true }
        );
        if (!wordType) {
            res.sendError("Word type not found");
            return;
        }
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};

// 删除词汇类型
export const deleteWordType = async (req, res) => {
    const { id } = req.params;

    try {
        const wordType = await WordType.findOneAndDelete({ id });
        if (!wordType) {
            res.sendError("Word type not found");
            return;
        }
        res.sendSuccess();
    } catch (error) {
        res.sendError(error.message);
    }
};
