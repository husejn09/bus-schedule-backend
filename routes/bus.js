const express = require('express');
const router = express.Router();
const busModel = require('../models/bus');

router.get('/buses', (req, res) => {
  busModel.getAllBuses((err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results);
  });
});

router.get('/buses/:id', (req, res) => {
  const busId = req.params.id;
  busModel.getBusById(busId, (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results[0]);
  });
});

module.exports = router;
