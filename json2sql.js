const fs = require('fs');
const mysql = require('mysql');
const config = require('./config'); 

const jsonData = fs.readFileSync('list.json', 'utf8');
const data = JSON.parse(jsonData);

const connection = mysql.createConnection(config); 

connection.connect();

data.forEach(item => {
  const { id, filename, path, size } = item;
  const insertQuery = `INSERT INTO your_table_name (id, filename, path, size) VALUES (?, ?, ?, ?)`;
  connection.query(insertQuery, [id, filename, path, size], (error, results, fields) => {
    if (error) throw error;
    console.log('Inserted a row into MySQL with id: ', results.insertId);
  });
});

connection.end();
