const mysql = require('mysql2');
require('dotenv').config();
const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;



const connection = mysql.createConnection({
  host: host, 
  user: user,      
  password: password, 
  database: database, 
  port: 3306
});

connection.connect(err => {
  if (err) {
    console.error('Greška pri povezivanju s bazom:', err);
    return;
  }
  console.log('Uspješno povezano s bazom!');
});

module.exports = connection;
