const mysql = require('mysql2')
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect((err) => {
    if (err) {
        console.error("Connected DB faild!");
    } else {
        console.log("Connection successfully");
    }
})

module.exports = db;