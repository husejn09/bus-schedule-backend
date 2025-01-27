# Bus Schedule Backend

## Project Overview

The Bus Schedule Backend is a backend system designed to simulate and manage bus schedules. It uses publicly available data to calculate route times, manage user authentication, and "simulate" ticket purchases. The project demonstrates backend development, including database design, API integration, and user management.

## Features

* Database Management: Well-structured database containing bus stations, coordinates, and route details
* Travel Time Calculation: Utilized Google Directions API to calculate travel times between stations and simulate total route durations
* User Authentication: Secure login and registration system integrated with the database
* Simulated Ticket Purchase: Users can "buy" tickets, with the system generating a downloadable PNG file to simulate usability

## Installation
To set up this project to run locally you will need

* Node.js
* JavaScript
* MYSQL

### Backend
1. Clone the repository
```
git clone https://github.com/husejn09/bus-schedule-backend.git
```
2. Navigate to the project root
```
cd bus-schedule-backend
```
3. Install dependencies
```
npm install
```
4.Set Up Google API Key:
* Obtain a Google Maps API key from the Google Cloud Console.
* Replace the placeholder API key in the project configuration file (e.g., config.js or env file) with your own. Example:
```
const googleApiKey = "YOUR_API_KEY_HERE";
```

5. Start the backend service
```
node index.js
```

### Frontend
1. Open your files in VS code
2. Right click on index.html and select "Open with Live server" (check if this extension is installed)
3. Open your local host website

### Database
1. Install MySQL
2. Create database
3. Import the sql schema
4. Populate with data
5. Replace the data inside the DB configuration file with your own (e.g., host name, password, etc.) 

## Demo video
[![Project Overview](https://img.youtube.com/vi/5tx5BstJKHc/0.jpg)](https://www.youtube.com/watch?v=5tx5BstJKHc)

## License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
