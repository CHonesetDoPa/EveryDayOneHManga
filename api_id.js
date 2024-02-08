// 引入所需的模块
const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const config = require('./config');
const axios = require('axios');
const path = require('path');

// 创建Express应用
const app = express();

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
