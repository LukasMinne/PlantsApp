"use strict";

var counter = 0;
var grid = ["a", "b"];

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
    $("#logout").on("click", logoutUser);

    registerServiceWorker();
});

var reloadPage = function() {
    window.location.reload();
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
                html += "<a href='#popupPlant" + plant["id"] + "' data-rel='popup' data-position-to='window' class='ui-btn ui-corner-all ui-shadow' data-transition='pop'>" + plant["name"] + "</br>" + plant["latinName"] + "</a>" +
                    "<div data-role='popup' id='popupPlant" + plant["id"] + "' data-theme='a' class='ui-corner-all'>" +
                    "<form>" +
                    "<div style='padding:10px 20px;'>" +
                    "<h3>" + plant["name"] + "</h3>" +
                    "<h3>" + plant["latinName"] + "</h3>" +
                    "<h3>" + plant["age"] + "</h3>" +
                    "<h3>" + plant["size"] + "</h3>" +
                    "<button type='submit' class='ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check'>Bestel</button>" +
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
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/register_user",
        data: JSON.stringify(jsonForm)
    }).success(function(data) {
        $("#popupRegister").popup("close");
        var username = $("#usernameRegister").val();
        $("#placeholderUsername").html("Welkom " + username);
        $("#login").toggle();
        $("#logout").show();
    })
};

function loginUser(e) {
    e.preventDefault();
    var jsonForm = $("#popupLogin input").serializeArray().reduce(function(accumulator, currentValue) {
        accumulator[currentValue.name] = currentValue.value;
        return accumulator;
    }, {});
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/login_user",
        data: JSON.stringify(jsonForm)
    }).success(function(data) {
        $("#popupLogin").popup("close");
        var username = data.username;
        $("#placeholderUsername").html("Welkom " + username);
        $("#login").toggle();
        $("#logout").show();
        console.log(data);
    })
};

function logoutUser(e) {
    e.preventDefault();
    $("#placeholderUsername").html("");
    $("#login").toggle();
    $("#logout").toggle();

}

// function validateEmail(email) {
//     var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(email);
// }

// service worker
var registerServiceWorker = function() {
    //     if ('serviceWorker' in navigator && 'PushManager' in window) {
    //         navigator.serviceWorker.register('sw.js')
    //             .then(function(sw) {
    //                 console.log("Service worker registered", sw);
    //             })
    //             .catch(function(error) {
    //                 console.error('Service worker error', error);
    //             });
    //     } else {
    //         console.warn('Push messaging is not supported');
    //     }
};