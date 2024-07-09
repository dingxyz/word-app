import Word from '../models/Word.js';

// 方法：去除所有 Word 记录的 id 中的空格
export const removeSpacesFromIds = async () => {
    try {
        // 获取所有 Word 记录
        const words = await Word.find();

        // 更新每个 Word 记录的 id
        for (let word of words) {
            const updatedId = word.id.replace(/[\s?']/g, '');
            // 如果 id 发生变化，则更新数据库
            if (updatedId !== word.id) {
                await Word.updateOne({ _id: word._id }, { id: updatedId });
            }
        }

        console.log('所有 Word 记录的 id 已更新');
    } catch (error) {
        console.error('更新 Word 记录的 id 时出错:', error);
    }
};

// 调用方法更新 id
// removeSpacesFromIds();
