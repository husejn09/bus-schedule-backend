const db = require('../config/db');

const getAllStations = (callback) => {
  db.query('SELECT * FROM stations', callback);
};

const getStationById = (id, callback) => {
  db.query('SELECT * FROM stations WHERE id = ?', [id], callback);
};

module.exports = { getAllStations, getStationById };
