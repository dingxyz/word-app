// db/clearWordsData.js
import mongoose from './mongoose.js';
import Word from '../models/Word.js';

const clearData = async () => {
    try {
        await Word.deleteMany({});
        console.log('All Word data has been cleared.');
    } catch (error) {
        console.error('Error clearing Word data:', error);
    } finally {
        mongoose.connection.close();
    }
};
// 慎重！！！，会清空数据库！！！
// clearData();
