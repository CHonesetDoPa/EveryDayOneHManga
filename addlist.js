const mysql = require('mysql');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const jsonData = fs.readFileSync('list.json');
const data = JSON.parse(jsonData);

const connection = mysql.createConnection(config);

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

data.files.forEach((file) => {
  const { id, filename, path, size } = file;
  const uuid = uuidv4(); // 生成随机UUID
  const query = `INSERT INTO ${config.tableName} (id, uuid, filename, path, size) VALUES (?, ?, ?, ?, ?)`;
  connection.query(query, [id, uuid, filename, path, size], (error, results, fields) => {
    if (error) throw error;
    console.log('Inserted a row into the database');
  });
});

connection.end((err) => {
  if (err) {
    console.error('Error closing database connection: ' + err.stack);
    return;
  }
  console.log('Disconnected from database');
});
