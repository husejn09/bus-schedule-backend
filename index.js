const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: 'Too many requests, please try again later.'
});

app.use('/register', limiter);
app.use('/login', limiter);

app.use(cors());
app.use(cors({
    origin: 'http://127.0.0.1:5500' 
  }));

app.use(express.static('public'));

// Middleware za parsiranje JSON-a
app.use(express.json());


// Test DB rutu

const pool = require('./config/db');
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
app.get('/stations/coordinates/:routeId', async (req, res) => {
    const routeId = req.params.routeId;
    const query = 'SELECT s.station_id, s.latitude, s.longitude FROM stations s JOIN route_stations rs ON s.station_id = rs.station_id WHERE rs.route_id = ?';
    try {
      const [results] = await pool.query(query, [routeId]);
      res.json(results);
    } catch (err) {
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
    }
  });
  


//Ruta za dohvatanje vremena polazka zbog popunjavanja odabira za korisnika 
app.get('/schedules/:routeId/:dayOfWeek', async (req, res) => {
    const routeId = req.params.routeId;
    const dayOfWeek = req.params.dayOfWeek;
    const query = 'SELECT departure_time FROM schedules WHERE route_id=? AND day_of_week=?';
    try {
      const [results] = await pool.query(query, [routeId, dayOfWeek]);
      res.json(results);
    } catch (err) {
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
    }
  });
  


// Dohvatanje prve i zadnje stanice
app.get('/route_stations/:routeId', async (req, res) => {
    const routeId = req.params.routeId;
    const query = 'SELECT s.station_name FROM route_stations rs INNER JOIN stations s ON rs.station_id = s.station_id WHERE rs.route_id = ?';
    try {
      const [results] = await pool.query(query, [routeId]);
      const prvaStanica = results[0];
      const zadnjaStanica = results[results.length - 1];
      res.json({ prvaStanica, zadnjaStanica });
    } catch (err) {
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
    }
  });
  

  app.get('/schedule-with-stations/:routeId/:dayOfWeek', async (req, res) => {
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
    try {
      const [results] = await pool.query(query, [routeId, dayOfWeek]);
      res.json(results);
    } catch (err) {
      console.error('Greška pri dohvaćanju podataka: ', err);
      res.status(500).send('Greška pri dohvaćanju podataka');
    }
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
    try {
      const [results] = await pool.query(query, [routeId]);
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
  
      const responses = await Promise.all(travelTimePromises);
  
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
    try {
      const [results] = await pool.query(query, [routeId]);
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
  
      const responses = await Promise.all(travelTimePromises);
  
      const travelTimes = responses.map((response) => ({
        travelTime: response.data.routes[0].legs[0].duration.value
      }));
  
      res.json(travelTimes);
    } catch (error) {
      console.error('Greška pri dohvatanju podataka sa Google Maps API:', error);
      res.status(500).send('Greška pri dohvatanju podataka sa Google Maps API');
    }
  });
  




app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const connection = await pool.getConnection();
      const [userCount] = await connection.query('SELECT COUNT(*) as count FROM Users');
      
      // Enforce a limit (50 users)
      if (userCount[0].count >= 50) {
        return res.status(400).send('User limit reached. Registration is closed.');
      }
  
      // Check if the user already exists
      const [result] = await connection.query('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email]);
      if (result.length > 0) {
        return res.status(400).json({ msg: 'Username or email already taken' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user
      await connection.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
  
      res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  

  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ msg: 'Please fill in all fields' });
    }
  
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT * FROM Users WHERE username = ?', [username]);
      if (result.length === 0) {
        return res.status(400).json({ msg: 'User not found' });
      }
  
      const user = result[0];
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid password' });
      }
  
      // Generate the JWT token
      const token = jwt.sign({ id: user.userid, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ msg: 'Login successful', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });


  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
  
    if (!token) return res.redirect('/login'); // If no token, redirect to login page
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403); 
      req.user = user; 
      next(); 
    });
  };
    
  /* in progress
  app.post('/buy-ticket', authenticateToken, (req, res) => {
    
    const ticketInfo = {
      username: req.user.username, 
      busRoute: 'Route 123',
      price: 'Free (simulation)'
    };
  
    
    res.send({
      message: 'Ticket purchased successfully!',
      ticket: ticketInfo,
      downloadLink: '/download-ticket'
    });
  });
  
*/
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  }); 
