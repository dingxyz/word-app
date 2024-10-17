// 帮我写个用来设置词频统计的接口吧
import WordStatistics from '../models/wordStatistics.js';

// 写个方法，返回所有的统计数据
export const getAllWordStatistics = async (req, res) => {
    try {
        const wordStatistics = await WordStatistics.find();
        res.sendSuccess(wordStatistics);
    } catch (error) {
        res.sendError('statistics error');
    }
};

// 模仿wordTypeController.mjs的写法
// 写个方法，这个方法用来处理前端传来的一个日期和一个字符串，然后把日期和字符串存到数据库中
export const setWordStatistics = async (req, res) => {
    try {
        const {date, english} = req.body;

        if (!date || !english) {
            res.sendError('statistics error');
            return;
        }

        // 先根据date从数据库中查询是否有该日期的词频统计数据
        const wordStatistics = await WordStatistics.findOne({date});

        // 计算english的字节数
        const count = Buffer.byteLength(english, 'utf8');

        // 如果有，则更新该词频统计数据
        if (wordStatistics) {
            wordStatistics.count += count;
            await wordStatistics.save();
            res.sendSuccess();
        } else {
            // 如果没有，则新建一个词频统计数据
            const newWordStatistics = new WordStatistics({
                date,
                count
            });
            await newWordStatistics.save();
            res.sendSuccess();
        }
    } catch (error) {
        res.sendError('statistics error');
    }
};
