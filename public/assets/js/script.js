"use strict";

var counter = 0;
var grid = ["a", "b"];
var bestelling = {};

$(document).ready(function() {
    //check jsfile
    console.log("js connected");

    //reload page 
    $("#reloadPageBtn").on('click', reloadPage);

    //load plants
    requestPlants(0);

    //load more plants button
    $("#morePlants").on("click", function() {
        var length = $("#plants > div").length;
        requestPlants(length);
    });

    //login and register
    $("#popupRegister button").on("click", registerUser);
    $("#popupLogin button").on("click", loginUser);

    //hide logout button
    $("#logout").hide();
    $("#logoutButton").on("click", logoutUser);

    registerServiceWorker();

    //order button voor plant
    // $('#plants').on('click', '.bestelPlant', function() {
    //     console.log("clicked");
    //     bestel();
    // });

});

//
function bestel(e) {
    console.log("bestel");
    // e.preventDefault();
    //waarde ophalen
    // id -> propertie van bestelling
    var id = $("#plants data-id").val();
    console.log(id);
    // naam
    var naam = $("#formBestelPlant > h3").val();
    console.log(naam);
    // hoeveelheid
    var hoeveelheid = $("#formBestelPlant .ui-slider title").val();
    console.log(hoeveelheid);
    //toevoegen
    bestelling[id]

    //in winkelwagen steken

    //(doorsturen naar sessie)

}

var reloadPage = function() {
    window.location.reload();
};

// function fillInPlants() {
//     console.log("clicked");
//     if ($("article").empty());
// };

function requestPlants(start) {
    var end = start + 6;
    console.log(document.cookie.split("="));
    var cookie = document.cookie.split("=");
    console.log(cookie[1]);
    fetch("/load_plants", {
            method: "post",
            headers: new Headers({
                "Content-Type": "application/json",
                "Authorization": cookie[1]
            }),
            body: JSON.stringify({
                start,
                end
            })
        }).then(function(response) {
            return response.json();
        })
        .then(function(data) {
            //iterate over plants
            data.plants.forEach(function(plant) {
                var html = "";
                if (counter == 0) {
                    html += "<div class='ui-block-a'>";
                    counter++;
                } else {
                    html += "<div class='ui-block-b'>";
                    counter--;
                }
                html += "<a href='#popupPlant" + plant["id"] + "' data-id='" + plant["id"] + "' data-rel='popup' data-position-to='window' class='ui-btn ui-corner-all ui-shadow popupPlants' data-transition='pop'>" + plant["name"] + "</br>" + plant["latinName"] + "</a>" +
                    "<div data-role='popup' id='popupPlant" + plant["id"] + "' data-theme='a' class='ui-corner-all'>" +
                    "<form id='formBestelPlant'>" +
                    "<div style='padding:10px 20px;'>" +
                    "<h3>" + plant["name"] + "</h3>" +
                    "<h3>" + plant["latinName"] + "</h3>" +
                    "<h3>" + plant["age"] + "</h3>" +
                    "<h3>" + plant["size"] + "</h3>" +
                    "<label for='slider-mini'>Hoeveelheid:</label>" +
                    "<input type='range' name='slider-mini' id='slider-plants' value='500' min='0' max='10000' data-highlight='true' />" +
                    "<a href='/assortiment' onclick='bestel()' data-role='button' class='bestelPlant ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check'>Bestel</a>" +
                    "</div>" +
                    "</form>" +
                    "</div>";
                $("#plants").append(html).enhanceWithin();
            });
        });
};

// function saveOrder(e) {
//     e.preventDefault();
//     var jsonForm = $("#formBestelPlant").serializeArray().reduce(function(accumulator, currentValue) {
//         accumulator[currentValue.name] = currentValue.value;
//         return accumulator;
//     }, {});
//     console.log(jsonForm);
//     fetch("/save_order", {
//         method: "post",
//         headers: new Headers({ "Content-Type": "application/json" }),
//         body: JSON.stringify(jsonForm)
//     }).then(function(response) {
//         return response.json();
//     }).then(function(data) {
//         console.log(data);
//     })
// }

function registerUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupRegister input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        // if (validateEmail(accumulator.email)) {
        return accumulator;
        // }
        // alert("vul een username, passwoord en email in");
    }, {});
    fetch("/register_user", {
        method: "post",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(jsonForm)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        // console.log(data);
        $("#popupRegister").popup("close");
        $("#placeholderUsername").show();
        $("#placeholderUsername").append("<a href='/html/shoppingCart.html' id='shoppingCart' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-shop ui-btn-icon-right ui-btn-a'></a>Welkom " + data.username);
        $("#login").toggle();
        $("#logout").show();
    });
};

function loginUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupLogin input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        if (validateEmail(accumulator.user)) {
            return accumulator;
        }
        alert("vul een email of passwoord in");
    }, {});
    fetch("/login_user", {
        method: "post",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(jsonForm)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        $("#popupLogin").popup("close");
        $("#placeholderUsername").show();
        $("#placeholderUsername").append("<a href='/html/shoppingCart.html' id='shoppingCart' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-shop ui-btn-icon-right ui-btn-a'></a>Welkom " + data.username);
        $("#login").toggle();
        $("#logout").show();
    })
};

function logoutUser(e) {
    e.preventDefault();
    fetch("/logout", {
            method: "post",
            headers: new Headers({ "Content-Type": "application/json" }),
        })
        // .then(function(response) {
        //     return response.json();
        // })
        .then(function(data) {
            $("#placeholderUsername").html("");
            $("#login").toggle();
            $("#logout").toggle();
        });
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(email)) {
        return true;
    } else { return false };
}

// service worker
var registerServiceWorker = function() {
    // if ('serviceWorker' in navigator && 'PushManager' in window) {
    //     navigator.serviceWorker.register('sw.js')
    //         .then(function(sw) {
    //             console.log("Service worker registered", sw);
    //         })
    //         .catch(function(error) {
    //             console.error('Service worker error', error);
    //         });
    // } else {
    //     console.warn('Push messaging is not supported');
    // }
};