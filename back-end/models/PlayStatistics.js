// models/Word.js
import mongoose from '../db/mongoose.js';

const playSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    count: {
        type: Number,
        required: true
    }
});

const PlayStatistics = mongoose.model('PlayStatistics', playSchema);

export default PlayStatistics;


// Database Migration
const migrate = async () => {
    try {
        const db = mongoose.connection.db;

        // 检查集合是否存在
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        if (collectionNames.includes('wordstatistics')) {
            if (collectionNames.includes('playstatistics')) {
                console.log('playstatistics collection already exists. Merging data...');
                const wordStats = await db.collection('wordstatistics').find().toArray();
                await db.collection('playstatistics').insertMany(wordStats);
                console.log('Data merged into playstatistics.');
            } else {
                console.log('Renaming wordstatistics to playstatistics...');
                await db.renameCollection('wordstatistics', 'playstatistics');
                console.log('Collection renamed successfully!');
            }
        } else {
            console.log('Collection wordstatistics does not exist.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
    }
};

// setTimeout(migrate, 5000);