import express from 'express';
import cors from 'cors';
import wordsRouter from './routes/words.mjs';
import wordTypeRouter from './routes/word_type.mjs';
import wordStatistics   from "./routes/word_statistics.mjs";
import {responseHandler} from './middlewares/responseHandler.mjs';

const app = express();
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(responseHandler); // 添加响应处理中间件

app.use('/words', wordsRouter);
app.use('/types', wordTypeRouter);
app.use('/statistics', wordStatistics)

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
})