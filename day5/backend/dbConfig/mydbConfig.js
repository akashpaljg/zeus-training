// import mysql from "mysql"
const mysql = require("mysql");

var pool = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    password : 'password',
    database : 'student'
  });


module.exports = pool
