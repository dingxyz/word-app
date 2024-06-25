// server.mjs
import express from 'express';
import { Low, JSONFile } from 'lowdb';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3001;
const successResponse = {
  code: '000000',
}

// 设置数据库
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

async function initDatabase() {
  await db.read();
  db.data ||= { words: [] }; // 初始化数据库
  await db.write(); // 确保初始化的数据写入数据库
}

app.use(cors());
app.use(bodyParser.json());

const sendSuccess = (res, data = {}) => {
  res.send({
    code: '000000',
    data,
  });
}

const sendError = (res, message) => {
  res.send({
    code: '999999',
    message,
  });
}

// 获取所有单词
app.get('/words', async (req, res) => {
  await db.read();
  res.send(db.data.words);
});

// 添加单词
app.post('/words', async (req, res) => {
  const { body } = req;
  const newId = body.english.trim().toLowerCase()
  const existingWord = db.data.words?.find(w => w.id === newId)
  if (existingWord) {
    sendError(res, "Word already exists");
    return;
  }
  body.id = newId;
  await db.read();
  db.data.words.push(req.body);
  await db.write();
  res.send(successResponse);
});

// 更新单词
// return http.put(`/words/${data.id}`, data);
app.put('/words/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req;
  const existingWord = db.data.words?.find(w => w.id === id)
  if (!existingWord) {
    res.send({message: "Word not found"});
    return;
  }
  await db.read();
  const index = db.data.words.findIndex(w => w.id === id);
  db.data.words[index] = body;
  await db.write();
  res.send(successResponse);
});

// 删除名字
app.delete('/words/:id', async (req, res) => {
  const { id } = req.params;
  await db.read();
  db.data.words = db.data.words.filter(n => n.id !== id);
  await db.write();
  res.send(successResponse);
});

initDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error("Failed to initialize database", err);
});
