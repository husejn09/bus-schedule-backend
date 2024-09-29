
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

document.getElementById("buy-ticket").addEventListener("click", function (){
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
})

