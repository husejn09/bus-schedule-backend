const db = require('../config/db');

const getAllSchedules = (callback) => {
  db.query('SELECT * FROM schedules', callback);
};

const getSchedulesById = (id, callback) => {
  db.query('SELECT * FROM schedules WHERE id = ?', [id], callback);
};

module.exports = { getAllSchedules, getSchedulesById };