-- 创建名为edohm的数据表
CREATE TABLE IF NOT EXISTS 0edohm (
    id INT AUTO_INCREMENT UNIQUE,
    uuid TEXT,
    filename TEXT,
    path TEXT,
    size TEXT,
    PRIMARY KEY (id)
);