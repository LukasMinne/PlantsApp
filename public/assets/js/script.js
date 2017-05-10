"use strict";

var counter = 0;
var grid = ["a", "b"];

$(document).ready(function() {
    //check jsfile
    console.log("js connected");

    //load header/footer
    // $("#header").load("/html/header.html");
    // $("#footer").load("/html/footer.html");

    //reload page 
    $("#reloadPageBtn").on('click', reloadPage);

    requestPlants(0);
    $("#morePlants").on("click", function() {
        var length = $("#plants > div").length;
        requestPlants(length);
    });

    $("#popupRegister button").on("click", registerUser);
});

var reloadPage = function() {
    window.location.reload();
};

function requestPlants(start) {
    var end = start + 6;
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/load_plants",
        data: JSON.stringify({
            start,
            end
        })
    }).success(function(data) {
        console.log(data);
        data.plants.forEach(function(plant) {
            var html = "";
            if (counter == 0) {
                html += "<div class='ui-block-a'>";
                counter++;
            } else {
                html += "<div class='ui-block-b'>";
                counter--;
            }
            html += "<a href='#popupPlant" + plant.id + "' data-rel='popup' data-position-to='window' class='ui-btn ui-corner-all ui-shadow' data-transition='pop'>" + plant.name + "</br>" + plant.latinName + "</a>" +
                "<div data-role='popup' id='popupPlant" + plant.id + "' data-theme='a' class='ui-corner-all'>" +
                "<form>" +
                "<div style='padding:10px 20px;'>" +
                "<h3>" + plant.name + "</h3>" +
                "<h3>" + plant.latinName + "</h3>" +
                "<h3>" + plant.age + "</h3>" +
                "<h3>" + plant.size + "</h3>" +
                "<button type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check'>Bestel</button>" +
                "</div>" +
                "</form>" +
                "</div>";
            $("#plants").append(html).enhanceWithin();
            // $.mobile.initializePage();
            // $.mobile.changePage();
        });
    })
};


function registerUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupRegister input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        return accumulator;
    }, {});
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/register_user",
        data: JSON.stringify(jsonForm)
    }).success(function(data) {

    })
};



// var marker;

// function initMap() {
//     var map = new google.maps.Map(document.getElementById('map'), {
//         zoom: 13,
//         center: { lat: 59.325, lng: 18.070 }
//     });

//     marker = new google.maps.Marker({
//         map: map,
//         draggable: true,
//         animation: google.maps.Animation.DROP,
//         position: { lat: 59.327, lng: 18.067 }
//     });
//     marker.addListener('click', toggleBounce);
// }

// function toggleBounce() {
//     if (marker.getAnimation() !== null) {
//         marker.setAnimation(null);
//     } else {
//         marker.setAnimation(google.maps.Animation.BOUNCE);
//     }
// }