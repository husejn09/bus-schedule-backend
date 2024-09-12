const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.GOOGLE_MAPS_API_KEY;


app.use(cors());

app.use(express.static('public'));

// Middleware za parsiranje JSON-a
app.use(express.json());

// Osnovna ruta
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Test DB rutu
const db = require('./config/db');  
app.get('/test-db', (req, res) => {
  db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
      res.status(500).send('Greška u bazi');
      return;
    }
    res.send(`Rezultat: ${results[0].solution}`);
  });
});

// Učitaj rute
const busRoutes = require('./routes/bus');
const stationRoutes = require('./routes/stations');
const routeRoutes = require('./routes/routes');

app.use('/api', busRoutes);
app.use('/api', stationRoutes);
app.use('/api', routeRoutes);


//Ruta za prikaz koordinata stanica
app.get('/stations/coordinates/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  const query = 'SELECT s.station_id, s.latitude, s.longitude FROM stations s JOIN route_stations rs ON s.station_id = rs.station_id WHERE rs.route_id = 1';
  db.query(query, [routeId], (err, results) => {
    if(err){
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
      return;
    }
    res.json(results);
  })
});


//Ruta za dohvatanje vremena polazka zbog popunjavanja odabira za korisnika 
app.get('/schedules/:routeId/:dayOfWeek', (req, res) => {
  const routeId = req.params.routeId;
  const dayOfWeek = req.params.dayOfWeek;
  const query = 'SELECT departure_time FROM schedules WHERE route_id=? AND day_of_week=?';
  db.query(query, [routeId, dayOfWeek], (err, results) => {
    if(err){
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
      return;
    }
    res.json(results);
  })
});


// Dohvatanje prve i zadnje stanice
app.get('/route_stations/:routeId', (req, res) => {
  const routeId = req.params.routeId;
  const query = ' SELECT s.station_name FROM route_stations rs INNER JOIN stations s ON rs.station_id = s.station_id WHERE rs.route_id = ?';
  
  db.query(query, [routeId], (err, results) => {
      if (err) {
          console.error('Greška pri dohvaćanju podataka: ', err);
          res.status(500).send('Greška pri dohvaćanju podataka');
          return;
      }
      
      const prvaStanica = results[0];
      const zadnjaStanica = results[results.length-1];

      res.json({prvaStanica, zadnjaStanica});
  });
});


app.get('/schedule-with-stations/:routeId/:dayOfWeek', (req, res) => {
  const routeId = req.params.routeId;
  const dayOfWeek = req.params.dayOfWeek;
  
  const query = `
      SELECT 
          s.schedule_id, 
          s.departure_time, 
          rs.station_id,  
          st.station_name,
          st.latitude,
          st.longitude
      FROM 
          schedules s
      JOIN 
          route_stations rs ON s.route_id = rs.route_id
      JOIN 
          stations st ON rs.station_id = st.station_id
      WHERE 
          s.route_id = ? AND s.day_of_week = ? AND s.departure_time = ?
  `;

  db.query(query, [routeId, dayOfWeek], (err, results) => {
      if (err) {
          console.error('Greška pri dohvaćanju podataka: ', err);
          res.status(500).send('Greška pri dohvaćanju podataka');
          return;
      }
      res.json(results);
  });
});


app.get('/route-stations/next/:routeId', async (req, res) => {
  const routeId = req.params.routeId;

  const query = `
      SELECT 
          rs.station_id, 
          st.station_name, 
          st.latitude, 
          st.longitude 
      FROM 
          route_stations rs
      INNER JOIN 
          stations st ON rs.station_id = st.station_id
      WHERE 
          rs.route_id = ?
  `;

  db.query(query, [routeId], async (err, results) => {
      if (err) {
          console.error('Greška pri dohvaćanju podataka:', err);
          res.status(500).send('Greška pri dohvaćanju podataka');
          return;
      }

      try {
          const stations = results;

          if (stations.length < 2) {
              res.status(400).send('Nedovoljno stanica za izračunavanje vremena putovanja');
              return;
          }


          // Create an array of promises for concurrent requests
          const travelTimePromises = stations.slice(1).map((station, index) => {
              const origin = `${stations[index].latitude},${stations[index].longitude}`;
              const destination = `${station.latitude},${station.longitude}`;
              const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
              
              return axios.get(url);
          });

          // Resolve all promises concurrently
          const responses = await Promise.all(travelTimePromises);

          // Extract travel times from responses
          const travelTimes = responses.map((response, index) => ({
              from: stations[index].station_name,
              to: stations[index + 1].station_name,
              travelTime: response.data.routes[0].legs[0].duration.value
          }));

          res.json(travelTimes);
      } catch (error) {
          console.error('Greška pri dohvatanju podataka sa Google Maps API:', error);
          res.status(500).send('Greška pri dohvatanju podataka sa Google Maps API');
      }
  });
});



app.get('/route-stations-show/next/:routeId', async (req, res) => {
  const routeId = req.params.routeId;

  const query = `
      SELECT 
          rs.station_id, 
          st.station_name, 
          st.latitude, 
          st.longitude 
      FROM 
          route_stations rs
      INNER JOIN 
          stations st ON rs.station_id = st.station_id
      WHERE 
          rs.route_id = ?
  `;

  db.query(query, [routeId], async (err, results) => {
      if (err) {
          console.error('Greška pri dohvaćanju podataka:', err);
          res.status(500).send('Greška pri dohvaćanju podataka');
          return;
      }

      try {
          const stations = results;

          if (stations.length < 2) {
              res.status(400).send('Nedovoljno stanica za izračunavanje vremena putovanja');
              return;
          }


          const travelTimePromises = stations.slice(1).map((station, index) => {
              const origin = `${stations[index].latitude},${stations[index].longitude}`;
              const destination = `${station.latitude},${station.longitude}`;
              const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
              
              return axios.get(url);
          });

          // Resolve all promises concurrently
          const responses = await Promise.all(travelTimePromises);

          // Extract travel times from responses
          const travelTimes = responses.map((response, index) => ({
              travelTime: response.data.routes[0].legs[0].duration.value
          }));

          res.json(travelTimes);
      } catch (error) {
          console.error('Greška pri dohvatanju podataka sa Google Maps API:', error);
          res.status(500).send('Greška pri dohvatanju podataka sa Google Maps API');
      }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
