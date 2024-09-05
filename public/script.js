
document.getElementById("navbar-toggle").addEventListener("click", function () {
  document.querySelector(".navbar-list").classList.toggle("active");
});

document
  .querySelector(".navbar-list .close-btn")
  .addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.remove("active");
  });


document.getElementById("linija-search-id").addEventListener("click", function(){
  this.classList.toggle("clicked")
})

document.getElementById("linija-search-id").addEventListener("click", function(){
  const routesDiv = document.getElementById("routes-main");
  routesDiv.classList.toggle("routes-visible");
  routesDiv.classList.toggle("routes");
})

function hrShow() {
  let m = document.getElementById("bottom_hr");

  if (m.style.display === "block") {
    m.style.display = "none";
  } else {
    m.style.display = "block";
  }
}
/*
function routeShow(){
  let n = document.getElementById("routes-main");
  if (n.style.display === "block") {
    n.style.display = "none";
  } else {
    n.style.display = "block";
  } 
}*/

function hrShow2() {
    let n = document.getElementById("linija_C");
  
    if (n.style.display === "block") {
      n.style.display = "block";
    } else if(document.getElementById("linija_C"). style.display === 'none'){
      n.style.display = "block";
    }
    else n.style.display === "block"
  }

function scrollToDiv() {
  let scroll = document.getElementById("scroll_id");
  scroll.scrollIntoView({ block: "center", behavior: "smooth" });
}

function scrollToDiv2() {
    let scroll = document.getElementById("directionSelect");
    scroll.scrollIntoView({ block: "center", behavior: "smooth" });
  }

function linijaButton() {
  let n = document.getElementById("card_id");

  if (n.classList.contains("show")) {
    n.classList.remove("show");
    setTimeout(() => {
      n.style.display = "none";
    }, 500);
  } else {
    n.style.display = "block";
    setTimeout(() => {
      n.classList.add("show");
    }, 15);
  }

  setTimeout(() => {
    scrollToDiv();
  }, 150);
}


// Uzimanje podataka start end stanice
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

// Prikaz podataka start i end stanice
async function prikazStartEnd(route_id) {
  const data = await startEndStation(route_id);

  if (!data) {
    console.error("No station data found");
    return;
  }
  const startStation = data.prvaStanica;
  const endStation = data.zadnjaStanica;
  const startS = data.prvaStanica;

  if (startStation) {
    document.getElementById("start_stanica").textContent = startStation.station_name;
    document.getElementById("station_name").textContent = startStation.station_name;
  } else {
    document.getElementById("start_stanica").textContent = "Start station not found";
  }

  if (endStation) {
    document.getElementById("end_stanica").textContent = endStation.station_name;
  } else {
    document.getElementById("end_stanica").textContent = "End station not found";
  }
}


// Globalna promenljiva za cuvanje ID-a rute
let globalRouteId;

// Opšti handler funkcija za rute
async function handleRouteClick(routeId) {
    globalRouteId = routeId;

    // Odredjivanje dana u sedmici
    let day_of_week = document.getElementById("daySelect").value;
    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }

    // Odabir smjera
    const selectedDirection = document.getElementById("directionSelect").value;


    // Određivanje ID-a rute na osnovu smjera
    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;

    // Ako imamo validan ID rute, pozivamo prikaz funkcije
    if (route_id) {
        await prikazStartEnd(route_id);
        await prikazDepartureTime(route_id, day_of_week);
        await getVrijeme();

    } else {
        console.log("Greška prilikom fetch-a");
    }
}

// Dodavanje event listenera za sve dugmadi odjednom
const routeButtons = [1, 3, 5, 7, 9];
routeButtons.forEach(routeId => {
    document.getElementById(routeId.toString()).addEventListener("click", function() {
        handleRouteClick(routeId);
    });
});


// Uzimanje podataka za odabir vremena polaska
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

// Funkcija za prikaz vremena polaska
async function prikazDepartureTime(route_id, day_of_week) {
    try {
        const response = await fetch(
            `http://localhost:3000/schedules/${route_id}/${day_of_week}`
        );
        const data = await response.json();

        if (!data || data.length === 0) {
            console.error("No departure time found");
            return;
        }

        const paraSelect = document.getElementById("start_time");
        const timeSelect = document.getElementById("timeSelect");
        timeSelect.innerHTML = "";


        data.forEach((time, index) => {
            const option = document.createElement("option");
            option.value = time.departure_time; 
            option.textContent = time.departure_time;
            if (index === 0) {
                option.selected = true;
            }

            timeSelect.appendChild(option);
        });
        paraSelect.innerHTML = "";
        paraSelect.textContent = data[0].departure_time;

        
    } catch (error) {
        console.error("Error fetching departure times:", error);
    }
}


// Event listener za odabir pravca (Outbound/Inbound)
document.getElementById("directionSelect").addEventListener("change", async function() {
    const selectedDirection = this.value; // 1 za Outbound, 2 za Inbound
    let x = document.getElementById('timeSelect').value;

    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
    let day_of_week = document.getElementById("daySelect").value;
    
    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }
    await prikazStartEnd(route_id);
    await prikazDepartureTime(route_id, day_of_week);
    
    
});

// Event listener za odabir dana (Radni dan, Subota, Nedelja)
document.getElementById("daySelect").addEventListener("change", async function() {
    const selectedDirection = document.getElementById("directionSelect").value;
    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
    let day_of_week = this.value;
    let x = document.getElementById('timeSelect').value;

    if (day_of_week == 1) {
        day_of_week = "Monday";
    } else if (day_of_week == 6) {
        day_of_week = "Saturday";
    } else {
        day_of_week = "Sunday";
    }
    
    await prikazStartEnd(route_id);
    await prikazDepartureTime(route_id, day_of_week);
    
});

// Event listener za promenu vremena polaska
document.getElementById("timeSelect").addEventListener("change", async function() {
    const selectedDirection = document.getElementById("directionSelect").value;
    let route_id = selectedDirection == 1 ? globalRouteId : globalRouteId + 1;
    let n = document.getElementById('start_time');
    let x = document.getElementById("timeSelect").value;
    n.innerHTML = x;
    
});


// Funkcija za prikaz vremena polaska

async function prikaz(route_id) {
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

function getVrijeme(){
    let vrijeme = document.getElementById('timeSelect').value;
    return vrijeme;
}

async function prikazData(route_id) {
    try {
        const data = await prikaz(route_id);

        if (!data || data.length === 0) {
            console.error("No departure time found");
            return;
        }
        let initialTime = document.getElementById('timeSelect').value;
        String(initialTime); 

        // Function to add seconds to a date
        const addSecondsToDate = (date, seconds) => {
            const d = new Date(date);
            d.setSeconds(d.getSeconds() + seconds);
            return d;
        };

        // Function to round seconds and format time as HH:MM:SS
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
    
        const stationsContainer = document.getElementById("stationsContainer");
        stationsContainer.innerHTML = "";
        data.forEach((station, index ) => {
            const stationDiv = document.createElement("div");
            stationDiv.className = "bus";
            stationDiv.id = `adding_div_${index + 1}`;

            currentTime = adjustTime(currentTime, station.travelTime);

            const startTime = formatTime(currentTime);
            stationDiv.innerHTML = `
                <div class="img_div" id="img_id${index + 2}"><img class="bus_icon" alt="bus_icon" src="transport_15845536.png"></div>
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
