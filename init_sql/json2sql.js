const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 

const jsonData = require('../list.json'); 

if (!Array.isArray(jsonData)) {
  console.error('JSON数据不是一个数组');
  process.exit(1); 
}

const sqlStatements = jsonData.map(item => {
  const uuid = uuidv4(); 
  return `INSERT INTO edohm (id, uuid, filename, path, size) VALUES (${item.id}, '${uuid}', '${item.filename.replace(/'/g, "''")}', '${item.path.replace(/'/g, "''")}', ${item.size}) ON DUPLICATE KEY UPDATE uuid='${uuid}', filename='${item.filename.replace(/'/g, "''")}', path='${item.path.replace(/'/g, "''")}', size=${item.size};`;
}).join('\n');

const sqlFilePath = path.join(__dirname, 'list.sql');
fs.writeFileSync(sqlFilePath, sqlStatements);

console.log('SQL语句已写入到list.sql文件中');
