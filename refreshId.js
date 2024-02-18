const fs = require('fs');

// 生成一个0到70000的随机数
const randomNumber = Math.floor(Math.random() * 70001);

// 将随机数写入PublicId.txt文件
fs.writeFile('PublicId.txt', randomNumber.toString(), (err) => {
  if (err) throw err;
  console.log('RefreshId '+ randomNumber);
});
