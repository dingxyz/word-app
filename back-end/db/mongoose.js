// db/mongoose.js
import mongoose from 'mongoose';

const uri = "mongodb+srv://admin:Hue65cZ9rw6eCtR@cluster0.hkvaxqb.mongodb.net/?appName=Cluster0";

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
});


// const connectDB = async () => {
//     try {
//         await mongoose.connect(uri, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000, // 等待5秒钟，如果连接失败
//         });
//         console.log('MongoDB connected');
//     } catch (error) {
//         console.error('MongoDB connection error:', error);
//         process.exit(1);
//     }
// };
//
// connectDB();

export default mongoose;
