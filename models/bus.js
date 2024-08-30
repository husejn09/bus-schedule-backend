const db = require('../config/db');

const getAllBuses = (callback) => {
  db.query('SELECT * FROM buses', callback);
};

const getBusById = (id, callback) => {
  db.query('SELECT * FROM buses WHERE id = ?', [id], callback);
};

module.exports = { getAllBuses, getBusById };
