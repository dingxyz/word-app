// db/mongoose.js
import mongoose from 'mongoose';

const uri = "mongodb+srv://admin:Hue65cZ9rw6eCtR@cluster0.hkvaxqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri, {
    connectTimeoutMS: 30000,          // 连接超时设置为 30 秒
    retryWrites: true,                // 启用重试写
    serverSelectionTimeoutMS: 30 * 1000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});

export default mongoose;
