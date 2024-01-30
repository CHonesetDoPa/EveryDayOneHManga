const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const axios = require('axios');
const config = require('./config.js');
const link = 'https://nekoc.cc'

const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    charset: config.charset
});

function queryDatabaseById(id) {
    return new Promise((resolve, reject) => {
        pool.query('SELECT id, uuid, filename, path, size FROM ?? WHERE id = ?', [config.tableName, id], function (error, results, fields) {
            if (error) {
                return reject(error);
            }
            if (results.length > 0) {
                resolve(results[0]);
            } else {
                reject(new Error('No results found for the given id.'));
            }
        });
    });
}

// 使用示例
async function processDataById(id) {
    try {
        const result = await queryDatabaseById(id);

        if (result.path && result.filename) {
            // 写入数据到本地文件
            const jsonData = JSON.stringify(result, null, 2);
            const filePath = path.join(__dirname, 'tmp', `${result.uuid}.json`);

            fs.writeFile(filePath, jsonData, 'utf8', (err) => {
                if (err) {
                    console.error('写入文件时发生错误：', err);
                    process.exit(1); // 异常退出程序
                } else {
                    console.log(`数据已成功写入到 ${filePath} 文件。`);
                }
            });

            // 从远程服务器下载文件到本地
            const fullFileUrl = link + result.path +'/'+ result.filename;
            console.log(fullFileUrl);
            const destination = path.join(__dirname, 'tmp', result.uuid + result.filename);

            const response = await axios({
                url: fullFileUrl,
                method: 'GET',
                responseType: 'stream'
            });

            response.data.pipe(fs.createWriteStream(destination));

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    console.log('数据和文件下载成功');
                    resolve(); // 结束 Promise
                });

                response.data.on('error', (error) => {
                    console.error(`下载文件时发生错误: ${error.message}`);
                    reject(error); // 结束 Promise
                });
            });
        } else {
            console.error('未找到有效的文件路径或文件名');
            process.exit(1);
        }
    } catch (error) {
        console.error(`处理数据时发生错误: ${error.message}`);
        process.exit(1);
    }
}

processDataById(575);