const express = require('express');
const router = express.Router();
const routeModel = require('../models/routes');

router.get('/routes', (req, res) => {
  routeModel.getAllRoutes((err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results);
  });
});

router.get('/routes/:id', (req, res) => {
  const routeId = req.params.id;
  routeModel.getRouteById(routeId, (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results[0]);
  });
});

module.exports = router;
