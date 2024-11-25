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

// Middleware for parsing JSON
app.use(express.json());


// Test DB route
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


//Route to display station coordinates
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
  


//Route to retrieve the departure time due to filling in the selection for the user
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
  


// API route for the first and last station
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
  
// API route for getting all the info about all stations for exact route, dayofWeek and exact departure time
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

// API route for getting all the data for exact route, without departure time,
// used this with google API to calculate how much time is needed from station to station inside a route
// using their latitude and longitude, the result is the calculated time in seconds, also retrieving 
// the stations info so it can be used to get the first and the last station
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
  

// API route for getting all the data for exact route, without departure time,
// used this with google API to calculate how much time is needed from start to the end
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
  



// API route for the register page, limited users to 50 for testing purposes,
// testing if the user is already in database then hashing the password that is provided
// using the bycrypt hash, and then if all conditions are met user is inserted into database
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
  
      // Inserting the new user
      await connection.query('INSERT INTO Users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword]);
  
      res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  
// API route for the login page, user must enter all the fields
// testing if the user info is matching with the one in the database, if it is  
// generate the JWT token which will be a session based and will expire in 1 hour
// if there is no token redirect the user to login again
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
      const token = jwt.sign({ id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
  
      res.status(200).json({ msg: 'Login successful', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });

  // API for getting user info from database. Uses authenticateToken() function, which takes the token and 
  //  extracts the user id from the JWT token provided so the user info will connect to the user on the client 
  app.get('/api/userinfo', authenticateToken, async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT username, email FROM users WHERE user_id = ?', [req.user.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(rows[0]); // Return the first (and only) row
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  
  
    if (!token) return res.status(401).send('Unauthorized');
  
    // Debugging
    console.log('Token received:', token);
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err);
        return res.status(403).send('Invalid token');
      }
      req.user = user;  // Attach the user object from token to request
      next();
    });
  }
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  }); 
