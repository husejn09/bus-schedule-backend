const db = require('../config/db');

const getAllRoute_stations = (callback) => {
  db.query('SELECT * FROM route_stations', callback);
};

const getRoute_stationsById = (id, callback) => {
  db.query('SELECT * FROM route_stations WHERE id = ?', [id], callback);
};

module.exports = { getAllRoute_stations, getRoute_stationsById };