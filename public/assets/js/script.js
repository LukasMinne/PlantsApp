"use strict";

var counter = 0;
var grid = ["a", "b"];
var email;
var pass;
var username;

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
    // $("#placeholderUsername").hide();
    $("#logoutButton").on("click", logoutUser);

    registerServiceWorker();

    // $("#bestelPlant").on("click", fillInPlants);

});



var reloadPage = function() {
    window.location.reload();
};

function fillInPlants() {
    console.log("clicked");
    if ($("article").empty());
};

function requestPlants(start) {
    var end = start + 6;
    fetch("/load_plants", {
            method: "post",
            headers: new Headers({ "Content-Type": "application/json" }),
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
                    "<button id='bestelPlant' data-role='button' class='ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check'>Bestel</button>" +
                    "</div>" +
                    "</form>" +
                    "</div>";
                $("#plants").append(html).enhanceWithin();
            });
        });
};

function registerUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupRegister input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        return accumulator;
    }, {});
    fetch("/register_user", {
        method: "post",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify(jsonForm)
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        $("#popupRegister").popup("close");
        username = jsonForm.user;
        email = jsonForm.email;
        pass = jsonForm.pass;
        $("#placeholderUsername").show();
        $("#placeholderUsername").append("<a href='/html/shoppingCart.html' id='shoppingCart' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-shop ui-btn-icon-right ui-btn-a'></a>Welkom " + username);
        $("#login").toggle();
        $("#logout").show();
    });
};

function loginUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupLogin input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        return accumulator;
    }, {});
    fetch("/login_user", {
            method: "post",
            headers: new Headers({ "Content-Type": "application/json" }),
            body: JSON.stringify(jsonForm)
        }).then(function(response) {
            return response.json();
        }).then(function(data) {
            $("#popupLogin").popup("close");
            username = data.username;
            email = jsonForm.email;
            pass = jsonForm.pass;
            $("#placeholderUsername").show();
            $("#placeholderUsername").append("<a href='/html/shoppingCart.html' id='shoppingCart' class='ui-btn ui-corner-all ui-shadow ui-btn-inline ui-icon-shop ui-btn-icon-right ui-btn-a'></a>Welkom " + username);
            $("#login").toggle();
            $("#logout").show();
            console.log(data);
        })
        // .catch() {
        //     alert("verkeerd wachtwoord");
        // }
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

// function validateEmail(email) {
//     var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(email);
// }

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