const db = require('../config/db');

const getAllRoutes = (callback) => {
  db.query('SELECT * FROM routes', callback);
};

const getRouteById = (id, callback) => {
  db.query('SELECT * FROM routes WHERE id = ?', [id], callback);
};

module.exports = { getAllRoutes, getRouteById };
