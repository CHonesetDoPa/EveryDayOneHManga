// 导入所需的模块
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const crypto = require('crypto');

// 创建数据库连接
const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

// 连接到数据库
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

// 生成随机 ID
function generateRandomId(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 下载文件函数
function downloadFile(fileUrl, filePath) {
  const https = require('https');
  const file = fs.createWriteStream(filePath);
  https.get(fileUrl, (response) => {
    response.pipe(file);
    console.log(`File downloaded to ${filePath}`);
  });
}

// 生成随机 ID
const randomId = generateRandomId(config.idRange.min, config.idRange.max);

// 查询数据库并下载文件
connection.query(`SELECT id, uuid, filename, path, size FROM ${config.tableName} WHERE id = ?`, [randomId], (error, results, fields) => {
  if (error) throw error;

  // 处理查询结果
  if (results.length > 0) {
    const result = results[0];
    const fileUrl = `${config.fileUrlPrefix}${result.path}`; // 使用配置文件中的地址前缀
    const filePath = path.join(__dirname, 'tmp', `${randomId}_${result.uuid}`, result.path);
    // 创建目录
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // 下载文件
    downloadFile(fileUrl, filePath);
  } else {
    console.log(`No file found for ID: ${randomId}`);
  }
});

// 关闭数据库连接
connection.end();
