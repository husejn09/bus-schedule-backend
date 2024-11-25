
document.getElementById("navbar-toggle").addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.toggle("active");
});

document
    .querySelector(".navbar-list .close-btn")
    .addEventListener("click", function () {
    document.querySelector(".navbar-list").classList.remove("active");
});


document.getElementById("count").addEventListener("change", function (){
    let price = 3;
    let multiplier = document.getElementById("count").value;

    if(multiplier <= 10 && multiplier >=1 ){
        let newPrice = price * multiplier;
        document.getElementById("price-id").textContent = `${newPrice},00 BAM`
    } else {
        alert("Maximalan broj karata je 10")
    }
})


function generateRandomNumbers(length) {
    let numbers = '';
    for (let i = 0; i < length; i++) {
        numbers += Math.floor(Math.random() * 10); 
    }
    return numbers;
    
}



document.getElementById('buy-ticket').addEventListener('click', () => {
    const token = localStorage.getItem('token');  
    console.log('Token in cart.js:', token);
    if (token) {
        // Fetch user info and display the ticket
      fetch('http://localhost:3000/api/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid token');
        return res.json();
      })
      .then((user) => {
        displayTicket(user); // Show ticket with user info
      })
      .catch(() => {
        alert('Session expired. Please log in again.');
        window.location.href = 'login-register.html';  // Redirect to login if token is invalid
      });
    } else {
        alert('You must be logged in to buy a ticket. Redirecting to login...');
        window.location.href = 'login-register.html?redirect=cart.html'; // Redirect to login page
    }
  });
  
  function displayTicket(user) {
    const userID = document.getElementById('username-id');
    const emailID = document.getElementById('user-email-id');
    
    userID.innerHTML = user.username;  // Display the username
    emailID.innerHTML = user.email;    // Display the email
  
    // Show the ticket and generate barcode
    document.getElementById("buy-ticket").addEventListener("click", function () {
      let ticketDiv = document.getElementById("ticket-info-id");
      ticketDiv.classList.toggle("show-ticket");
      ticketDiv.classList.toggle("ticket-info");
  
      const randomNumbers = generateRandomNumbers(15);
      document.getElementById("random-numbers").textContent = randomNumbers;
  
      // Generate the barcode using JsBarcode
      JsBarcode("#barcode", randomNumbers, {
        format: "CODE39", 
        background: "#E1E6EA",
        displayValue: false 
      });
    });
  }
  
  
  window.addEventListener('DOMContentLoaded', () => {
    // Retrieve the stored div content
    const cartDiv = localStorage.getItem('cartDiv'); 
    
    if (cartDiv) {
        const container = document.querySelector('.exact-route'); // Target container
        const ticketContainer = document.querySelector('.main-card');
        container.innerHTML = cartDiv; // Insert the stored content into the container
        ticketContainer.innerHTML = cartDiv;

        const d = document.querySelector('.outer-div');
        d.style.display === "flex";
        document.getElementById("empty-cart").style.display === "none";

    }
});


document.getElementById('download-ticket').addEventListener('click', () => {
    const ticketDiv = document.getElementById('ticket-info-id'); // The div you want to capture

    html2canvas(ticketDiv, {
        scale: 2, 
        dpi: 1000, 
        letterRendering: true, 
        onrendered: function(canvas) {
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'ticket.png'; 
            link.click(); 
        }
    });
});



