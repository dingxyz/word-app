import express from 'express';
import cors from 'cors';
import wordsRouter from './routes/words.mjs';
import wordTypeRouter from './routes/word_type.mjs';
import playStatistics from "./routes/play_statistics.mjs";
import tocRouter from './routes/TOC_route.mjs';
import {responseHandler} from './middlewares/responseHandler.mjs';

const app = express();
const port = 3030;

app.use(cors({
    origin: '*',
    maxAge: 86400,
}));
app.use(express.json());
app.use(responseHandler); // 添加响应处理中间件

app.use('/words', wordsRouter);
app.use('/types', wordTypeRouter);
app.use('/statistics', playStatistics);
app.use('/toc', tocRouter);

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${port}`);
})