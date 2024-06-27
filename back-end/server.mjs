import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { initDatabase } from './db/initDatabase.mjs';
import wordsRouter from './routes/words.mjs';
import usersRouter from './routes/users.mjs';
import { responseHandler } from './middlewares/responseHandler.mjs';

const app = express();
const port = 3030;

app.use(cors());
app.use(bodyParser.json());
app.use(responseHandler); // 添加响应处理中间件

app.use('/words', wordsRouter);
app.use('/users', usersRouter);

initDatabase().then(() => {
  app.listen(port, '0.0.0.0',() => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Failed to initialize database", err);
});
