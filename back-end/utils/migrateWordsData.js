// db/migrateWordsData.js
import {JSONFile, Low} from 'lowdb';
import mongoose from '../db/mongoose.js';
import Word from '../models/Word.js';

const adapter = new JSONFile('db/db.json');
const db = new Low(adapter);

const migrateData = async () => {
    await db.read();
    const allWords = [];

    // 将所有的wordType数据平展到一个数组中
    Object.values(db.data).forEach(words => {
        allWords.push(...words);
    });

    try {
        await Word.insertMany(allWords);
        console.log('Data migration completed');
    } catch (error) {
        console.error('Data migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
};

// 慎重！！！，会覆盖数据库中的数据！！！
// migrateData();
// export default migrateData;
