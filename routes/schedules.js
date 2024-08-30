const express = require('express');
const router = express.Router();
const schedulesModel = require('../models/schedules');

router.get('/schedules', (req, res) => {
  schedulesModel.getAllSchedules((err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results);
  });
});

router.get('/schedules/:id', (req, res) => {
  const schedulesId = req.params.id;
  schedulesModel.getSchedulesById(schedulesId, (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.json(results[0]);
  });
});

module.exports = router;
