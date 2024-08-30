const express = require('express');
const router = express.Router();
const routeStationsModel = require('../models/route_stations');

router.get('/routeStations', (req, res) => {
  routeStationsModel.getAllSchedules((err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results);
  });
});

router.get('/routeStations/:id', (req, res) => {
  const routeStationsId = req.params.id;
  routeStationsModel.getSchedulesById(routeStationsId, (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results[0]);
  });
});

module.exports = router;
