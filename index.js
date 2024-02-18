// 引入所需的模块
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const config = require('./config');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
// 导入 child_process 模块，用于执行外部命令
const { exec } = require('child_process');

// 定义要执行的脚本文件
const refreshscriptPath = 'refreshId.js';

// 定义每天的毫秒数
const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

function executerefresh() {
  exec(`node ${refreshscriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`执行脚本时出错: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`脚本输出错误: ${stderr}`);
      return;
    }
    console.log(`refreshId.js: ${stdout}`);
  });
}

// 创建Express应用
const app = express();

// 静态资源文件目录
app.use(express.static(path.join(__dirname, 'webui')));


// 创建数据库连接
const connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: config.charset
});

// 连接到数据库
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }
    console.log('Connected to database as ID ' + connection.threadId);
});

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'webui', 'index.html'));
});

app.get('/api/getPublicId', (req, res) => {
  // 读取PublicId.txt文件
  fs.readFile('PublicId.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    // 将读取的数据作为纯文本发送回客户端
    res.send(data);
  });
});

app.get('/api/getPersonalId', (req, res) => {
  const ip = req.ip; // 获取访问 API 的 IP
  const currentDate = new Date().toISOString().slice(0, 10); // 获取当前日期
  const seed = ip + currentDate; // 以 IP 和日期作为种子
  const uniqueId = generateUniqueId(seed); // 生成唯一 ID
  res.json({ ip, currentDate, uniqueId });
});

// 生成唯一 ID 的函数
function generateUniqueId(seed) {
  const hash = crypto.createHash('sha256'); // 使用 SHA-256 哈希函数
  hash.update(seed);
  const hashedSeed = hash.digest('hex');
  const id = parseInt(hashedSeed.substring(0, 8), 16) % 70001; // 将哈希值转换为 0 到 70000 之间的数字
  return id;
}

// 创建API端点
app.get('/api/:id', async (req, res) => {
    const id = req.params.id;
    const query = 'SELECT id, uuid, filename, path, size FROM edohm WHERE id = ?';
  
    // 查询数据库
    connection.query(query, [id], async (error, results, fields) => {
      if (error) {
        res.status(500).json({ error: 'Database query error' });
      } else {
        if (results.length > 0) {
          const record = results[0];
  
          // 输出查询的记录到控制台
          console.log('\n');
          console.log('API ASKED.')
          console.log('ID:', record.id);
          console.log('UUID:', record.uuid);
          console.log('Filename:', record.filename);
          console.log('Path:', record.path);
          console.log('Size:', record.size);
  
          // 将查询到的记录保存为JSON文件
          const fileName = record.uuid + '.json';
          const filePath = 'tmp/' + fileName;
          fs.writeFile(filePath, JSON.stringify(record), (err) => {
            if (err) {
              console.error('Error saving record to file: ' + err);
            } else {
              console.log('Record saved to file: ' + fileName);
            }
          });
  
          // 拼接链接
          const fileLink = `${config.link}${record.path}/${record.filename}`; // 使用模板字符串拼接链接
  
          // 输出拼接完成的下载链接到控制台
          console.log('Download link:', fileLink);
  
          // 返回记录给前端
          res.json(record);
  
          // 延迟下载文件
          setTimeout(async () => {
            try {
              // 下载文件
              const fileExtension = path.extname(record.filename);
              const fileDownloadPath = `tmp/${record.uuid}${fileExtension}`;
  
              const response = await axios.get(fileLink, {
                responseType: 'stream',
                timeout: 30000 // 设置超时时间
              });
  
              const writer = fs.createWriteStream(fileDownloadPath);
              response.data.pipe(writer);
  
              writer.on('finish', () => {
                console.log('File downloaded successfully');
              });
  
              writer.on('error', (err) => {
                console.error('Error writing file: ' + err);
              });
            } catch (err) {
              console.error('Error downloading file: ' + err);
            }
          }, 100); // 延迟下载文件
        } else {
          res.status(404).json({ error: 'Resource not found' });
        }
      }
    });
  });
  
// 监听端口
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// 定义一个函数用于定时刷新
function scheduleScriptExecution() {
  // 执行脚本
  executerefresh();
  // 设置定时器，在指定时间后再次执行脚本
  setTimeout(scheduleScriptExecution, oneDayInMilliseconds);
}

// 启动定时执行
scheduleScriptExecution();