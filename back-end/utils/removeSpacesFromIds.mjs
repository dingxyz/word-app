import Word from '../models/Word.js';
import Worldview from "../models/Worldview.js";

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


// 方法：去除单词中所有 Word annotation 中的特殊字符
export const removeAnnotationStr = async () => {
    try {
        // 获取所有 Word 记录
        const words = await Worldview.find();

        console.log('length:',words.length)

        for (let word of words) {
            if (word.annotation?.includes('例句')) {
                const updatedAnnotation = word.annotation.replace(/\*\*例句:\*\*|\*\*例句 1:\*\*|\*\*例句 2:\*\*/g, '');
                // 如果发生变化，则更新数据库
                if ( updatedAnnotation !== word.annotation) {
                    await Worldview.updateOne({ _id: word._id }, { annotation: updatedAnnotation });
                }
            }

        }

        console.log('所有 Word annotation 已更新');
    } catch (error) {
        console.error('更新 Word annotation 时出错:', error);
    }
};
// removeAnnotationStr()