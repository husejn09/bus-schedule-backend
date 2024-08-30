const express = require('express');
const router = express.Router();
const stationModel = require('../models/stations');

router.get('/stations', (req, res) => {
  stationModel.getAllStations((err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results);
  });
});

router.get('/stations/:id', (req, res) => {
  const stationId = req.params.id;
  stationModel.getStationById(stationId, (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results[0]);
  });
});

module.exports = router;
