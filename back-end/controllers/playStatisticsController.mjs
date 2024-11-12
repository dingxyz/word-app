import PlayStatistics from '../models/PlayStatistics.js';

export const getAllPlayStatistics = async (req, res) => {
    try {
        const wordStatistics = await PlayStatistics.find();
        res.sendSuccess(wordStatistics);
    } catch (error) {
        res.sendError('statistics error');
    }
};

export const setPlayStatistics = async (req, res) => {
    try {
        const {date, english} = req.body;

        if (!date || !english) {
            res.sendError('statistics error');
            return;
        }

        // 先根据date从数据库中查询是否有该日期的词频统计数据
        const wordStatistics = await PlayStatistics.findOne({date});

        // 计算english的字节数
        const count = Buffer.byteLength(english, 'utf8');

        // 如果有，则更新该词频统计数据
        if (wordStatistics) {
            wordStatistics.count += count;
            await wordStatistics.save();
            res.sendSuccess();
        } else {
            // 如果没有，则新建一个词频统计数据
            const newWordStatistics = new PlayStatistics({
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
