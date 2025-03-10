
document.getElementById("navbar-toggle").addEventListener("click", function () {
  document.querySelector(".navbar-list").classList.toggle("active");
});

document
  .querySelector(".navbar-list .close-btn")
  .addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.remove("active");
  });

/* Event listener for button to stay clicked */
document.getElementById("linija-search-id").addEventListener("click", function(){
  this.classList.toggle("clicked");


  const routesDiv = document.getElementById("routes-main");
  routesDiv.classList.toggle("routes-visible");
  routesDiv.classList.toggle("routes");
})


// Function for showing hr on button click - called in HTML  
function hrShow() {
  let m = document.getElementById("bottom_hr");

  if (m.style.display === "block") {
    m.style.display = "none";
  } else {
    m.style.display = "block";
  }
}


function showInfo(){
  let n = document.getElementById("choose-div-id");
  let x = document.getElementById("main-card-id");


  if (n.style.display === "none" ) {
    n.style.display = "flex";
  } else {
    n.style.display = "flex";
  }

  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "flex";
  }
}


// Global routeId
let globalRouteId;

// Handler for routes
async function handleRouteClick(routeId) {
    globalRouteId = routeId;

    // Day of the week
    let day_of_week = document.getElementById("daySelect").value;
    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }

    const selectedDirection = document.getElementById("directionSelect").value;
    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
 
    if (route_id) {
        await handleDepartureTimes(route_id, day_of_week);
    } else {
        console.log("Greška prilikom fetch-a");
    }
}

// Eventlistener for all the buttons - routes
const routeButtons = [1, 3, 5, 7, 9];
routeButtons.forEach((routeId) => {
  document.getElementById(routeId.toString()).addEventListener("click", function () {
    showInfo();
    handleRouteClick(routeId);
    /*setTimeout(() => {
      window.scrollTo({
        top: 400,
        behavior: 'smooth'
      });
    }, 600);*/
  });
});


// Getting data from api for departure time 
async function departureTime(route_id, day_of_week) {
  try {
    const response = await fetch(
      `http://localhost:3000/schedules/${route_id}/${day_of_week}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching departure time:", error);
  }
}


// Eventlistener for direction (Outbound/Inbound)
document.getElementById("directionSelect").addEventListener("change", async function() {
    const selectedDirection = this.value; // 1 za Outbound, 2 za Inbound

    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
    let day_of_week = document.getElementById("daySelect").value;
    
    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }
    await handleDepartureTimes(route_id, day_of_week);
    
});

// Event listener for day choosing (Radni dan, Subota, Nedelja)
document.getElementById("daySelect").addEventListener("change", async function() {
    const selectedDirection = document.getElementById("directionSelect").value;
    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
    let day_of_week = this.value;

    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }
  
    await handleDepartureTimes(route_id, day_of_week);
});


// Function for getting start and end station from api
async function startEndStation(route_id) {
  try {
      const response = await fetch(
      `http://localhost:3000/route_stations/${route_id}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
  } catch (error) {
      console.error("Error fetching start and end station names:", error);
  }
}

// Main function for handling all departure times, for exact route and day of the week, 
// dinamically adding div with all information from other functions
async function handleDepartureTimes(route_id, day_of_week) {
  try {
      const departureTimes = await departureTime(route_id, day_of_week); 

      if (!departureTimes || departureTimes.length === 0) {
          console.error("No departure times found");
          return;
      }
      
      const stationContainer = document.getElementById("main-card-id");
      stationContainer.innerHTML = ""; 

      for (const time of departureTimes) {
          const cardDiv = document.createElement("div");
          cardDiv.className = "card-info";
          cardDiv.id = "card-info-id";

          const endTime = await calculateTotalTravelTime(route_id, time.departure_time); 
          const stationShow = await startEndStation(route_id);

          const startTime = time.departure_time.slice(0,5);
          const uniqueTimeId = time.departure_time.replace(/[:]/g, "");
          cardDiv.innerHTML = `
          <div class="card-info-first-part">
              <div class="time-info">
                  <p id="start-time">${startTime}</p>
                  <p id="end-time">${endTime}</p>
              </div>

              <div class="dots" id="dots-id">
                  <span class="dot" id="dot1"></span>
                  <hr class="info-hr">
                  <span class="dot" id="dot2"></span>
              </div>

              <div class="stanica-info">
                  <p id="start-station">${stationShow.prvaStanica.station_name}</p>
                  <p id="end-station">${stationShow.zadnjaStanica.station_name}</p>
              </div>

              <div class="r-button-class">
                  <button class="r-buttons-card" id="buttons-card-id-${uniqueTimeId}">BAM 03.00</button>
              </div>
              <div class="img-class">
                  <img src="assets/down-arrow.png" alt="arrow-logo" class="arrow-logo" id="arrow-id-${uniqueTimeId}">
              </div>
            </div>
              <div id="stationsContainer-${uniqueTimeId}" class="slide-in"></div>
          `;

          stationContainer.appendChild(cardDiv);      
          window.scrollTo({
            top: 300,
            behavior: 'smooth'
          });

          // Event listener for arrows to show detail info about exact deprature time of a route
          const arrowElement = document.getElementById(`arrow-id-${uniqueTimeId}`);
          arrowElement.addEventListener("click", async function () {
            arrowElement.classList.toggle("arrow-logo-up");
            arrowElement.classList.toggle("arrow-logo");
            await showTravelTime(route_id, time.departure_time); 
            const showDetails = document.getElementById(`stationsContainer-${uniqueTimeId}`);
            if(showDetails.style.display === "block")
              showDetails.style.display = "none"
            else
              showDetails.style.display = "block"
            let slide = showDetails.classList.contains("slide-in");
            showDetails.setAttribute("class", slide ? "slide-out" : "slide-in");
          });

          // Event listener to take the div where the info about the route is,
          // then store it inside the localStorage and display in the cart page
          

        const button = document.getElementById(`buttons-card-id-${uniqueTimeId}`);
        button.addEventListener('click', (event) => {
          // Get the parent div of the clicked button
          const parentDiv = event.target.closest('#card-info-id');
    
          if (parentDiv) {
            const divContent = parentDiv.outerHTML; // Store the outerHTML of the parent div
            localStorage.setItem('cartDiv', divContent); // Save the content in localStorage
        
            // Go to the cart page
            window.location.href = 'cart.html';
          }
        });

      }
  } catch (error) {
      console.error("Error fetching and displaying departure times:", error);
  }
}

// Getting data about travel time from api
async function getTravelInfo(route_id) {
  try {
      const response = await fetch(
        `http://localhost:3000/route-stations-show/next/${route_id}`
      );
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching departure time:", error);
    }
}

// Calculating total time needed for a bus to go from A to B and displaying in HH:MM format
async function calculateTotalTravelTime(route_id, departure_time) {
  try {
      const stationData = await getTravelInfo(route_id); 

      if (!stationData || stationData.length === 0) {
          console.error("No station data found");
          return "N/A";
      }

      // Initialize start time
      let currentTime = new Date();
      const initialTimeParts = departure_time.split(':').map(Number);
      currentTime.setHours(initialTimeParts[0], initialTimeParts[1], initialTimeParts[2]);

      
      stationData.forEach(station => {
          currentTime.setSeconds(currentTime.getSeconds() + station.travelTime);
      });

      // Format the calculated time into HH:MM:SS format 
      const hours = String(currentTime.getHours()).padStart(2, '0');
      let minutes = String(currentTime.getMinutes());
      const seconds = String(currentTime.getSeconds());

      if (seconds >= 15){
        minutes = String(currentTime.getMinutes()+1);
      }
      minutes = String(minutes).padStart(2, '0');

      return `${hours}:${minutes}`; // This will be displayed as the end time
  } catch (error) {
      console.error("Error calculating total travel time:", error);
      return "N/A";
  }
}


// Function for getting travel times between every station in a single route
async function getTravelTime(route_id) {
    try {
        const response = await fetch(
          `http://localhost:3000/route-stations/next/${route_id}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error("Error fetching departure time:", error);
      }
}

// Function for showing details about travel time between stations inside a route,
// dinamically appending that info inside a div 
async function showTravelTime(route_id, departure_time) {
    try {
        const data = await getTravelTime(route_id);

        if (!data || data.length === 0) {
            console.error("No departure time found");
            return;
        }
        let initialTime = departure_time; 

        // Function to add seconds to a date
        const addSecondsToDate = (date, seconds) => {
            const d = new Date(date);
            d.setSeconds(d.getSeconds() + seconds);
            return d;
        };

        const adjustTime = (date, secondsToAdd) => {
            const roundedSeconds = secondsToAdd >= 20 ? 60 : 0;
            const newDate = addSecondsToDate(date, roundedSeconds);
            return addSecondsToDate(newDate, secondsToAdd - roundedSeconds);
        };

        // Function to format date into HH:MM:SS
        const formatTime = (date) => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        };

        let currentTime = new Date();
        const initialTimeParts = initialTime.split(':').map(Number);
        currentTime.setHours(initialTimeParts[0], initialTimeParts[1], initialTimeParts[2]);
        const uniqueTimeId = departure_time.replace(/[:]/g, "");
       
        const stationsContainer = document.getElementById(`stationsContainer-${uniqueTimeId}`);
        stationsContainer.innerHTML = "";
        data.forEach((station, index ) => {
            const stationDiv = document.createElement("div");
            stationDiv.className = "bus";
            stationDiv.id = `adding_div_${index + 1}`;

            currentTime = adjustTime(currentTime, station.travelTime);

            const startTime = formatTime(currentTime);
            stationDiv.innerHTML = `
                <div class="img_div" id="img_id${index + 2}"><img class="bus_icon" alt="bus_icon" src="assets/bus-icon-black.png"></div>
                <div class="time_div" id="time_id${index + 2}"><p id="start_time${index + 2}">${startTime}</p></div>
                <div class="arrow_div" id="arrow_id${index + 2}">&rarr;</div>
                <div class="arrv_station" id="arrv_station_id${index + 2}"><p id="station_name${index + 2}">${station.to}</p></div>
            `;

    stationsContainer.appendChild(stationDiv);
    
});
        
    } catch (error) {
        console.error("Error fetching departure times:", error);
    }
} 

document.getElementById("cart-img").addEventListener("click", () => {
  window.location.href ="cart.html";
})

