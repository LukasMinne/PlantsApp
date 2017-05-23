"use strict";

var counter = 0;
var grid = ["a", "b"];

var connection;
var bestellingen = [];

var $error = $('#error');
var $allFlowers = $('#plants');
var $selectedFlower = $('#selected-flower');
var $myCart = $('#my-cart');
var $loadingThing = $('#loading-thing');
var selectedFlowerId = -1;

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
    checkConnection();

    // $('#plants').on('click', 'input', bestel);
    //order button voor plant
    // $('#plants').on('click', '.bestelPlant', function() {
    //     console.log("clicked");
    //     bestel();
    // });

    fillInPlants();

    //shoppingCart
    bindEventHandlers();

});

//
function bestel(e) {
    console.log("bestel");
    // e.preventDefault();

    //waarde ophalen
    // id -> propertie van bestelling
    var id = $("#plants a").data("id");
    console.log(id);

    // naam
    var idSelector = "#popupPlant-" + id;
    var naam = $("#formBestelPlant").find("#popupPlant-" + idSelector)[0].dataset.name;
    console.log(naam);

    // hoeveelheid
    var hoeveelheid = $("#formBestelPlant").find(".sliderPlants").val();
    console.log(hoeveelheid);

    //toevoegen
    var bestelling = { id: id, naam: naam, hoeveelheid: hoeveelheid };
    bestellingen.push(bestelling);

    //in winkelwagen steken

}

var reloadPage = function() {
    window.location.reload();
};

function fillInPlants() {
    console.log("clicked");
    if (bestellingen == null) {
        $("article").html("<h2>Geen planten in winkelwagen</h2>");
    }
    if (bestellingen != null) {
        var html = $("article").html("<ul>");
        bestellingen.forEach(function(bestelling) {
            html += "<li>" + bestelling.naam + "-- aantal:" + bestelling.hoeveelheid + "</li>";
        })
    }
    html += "</ul>";
};

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
                html += "<a href='#popupPlant-" + plant["id"] + "' data-id='" + plant["id"] + "' data-rel='popup' data-position-to='window' class='ui-btn ui-corner-all ui-shadow popupPlants' data-transition='pop'>" + plant["name"] + "</br>" + plant["latinName"] + "</a>" +
                    "<div data-role='popup' id='popupPlant-" + plant["id"] + "' data-theme='a' class='ui-corner-all'>" +
                    "<form id='formBestelPlant' method='post' action='/assortiment' onsubmit='bestel()'>" +
                    "<div style='padding:10px 20px;'>" +
                    "<h3 data-name='" + plant["name"] + "' class='plantName'>" + plant["name"] + "</h3>" +
                    "<h3>" + plant["latinName"] + "</h3>" +
                    "<h3>" + plant["age"] + "</h3>" +
                    "<h3>" + plant["size"] + "</h3>" +
                    "<label for='slider-mini'>Hoeveelheid:</label>" +
                    "<input type='range' name='sliderPlants' class='sliderPlants' value='500' min='0' max='10000' data-highlight='true' />" +
                    "<input type='submit' value='Bestel' data-role='button' class='bestelPlant ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check'></>" +
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
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('sw.js')
            .then(function(sw) {
                console.log("Service worker registered", sw);
            })
            .catch(function(error) {
                console.error('Service worker error', error);
            });
    } else {
        console.warn('Push messaging is not supported');
    }
};

function checkConnection() {
    setInterval(checkIfOnline, 3000);
}

var checkIfOnline = function() {
    if (navigator.onLine)
        isOnline();
    else
        isOffline();
};


var isOnline = function() {
    console.log("je bent online");
    // $("#alert").empty();
    connection = true;


};
var isOffline = function() {
    if (connection) {
        console.log("je bent offline");
        $("#map").html("<a href='#' class='ui-btn ui-shadow ui-corner-all ui-icon-delete ui-btn-icon-notext'>Geen verbinding</a><br/><p>Geen internet</p>")
        connection = false;
    }
};

function initMap() {
    var uluru = {
        lat: 51.067749,
        lng: 3.346367
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 17,
        center: uluru,
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map,
        animation: google.maps.Animation.BOUNCE
    });
}

function bindEventHandlers() {
    $allFlowers.on('click', '.bestelPlantr', selectFlower);
    $selectedFlower.on('click', '.add-to-cart', function() {
        addToCart(selectedFlowerId);
    });
    $myCart.on('click', '.remove-from-cart', function() {
        var idx = $(this).closest('.cart-item-container').data('idx');
        removeFromCart(idx);
    });
}

// function loadAllFlowers() {
//     toggleLoading(true);
//     $.ajax('/api/flowers')
//         .done(function(data) {
//             toggleError(false);
//             $allFlowers.empty();
//             printCart(data.cart);
//             data.flowers.forEach(function(flower) {
//                 $allFlowers.append(
//                     '<li class="flower-container" data-id="' + flower.id + '">' +
//                     flower.name + ' - ' + flower.color + ' (&euro; ' + flower.price + ') ' +
//                     '<button class="select-flower">Select this flower!</button>' +
//                     '</li>'
//                 );
//             });
//         })
//         .fail(function(err) {
//             toggleError(true, err.responseText);
//         })
//         .always(function() {
//             toggleLoading(false);
//         });
// }

function addToCart(id) {
    toggleLoading(true);
    $.ajax('/api/add-to-cart/' + id)
        .done(function(cart) {
            toggleError(false);
            printCart(cart);
        })
        .fail(function(err) {
            toggleError(true, err.responseText);
        })
        .always(function() {
            toggleLoading(false);
            unSelectFlower();
        })
}

function removeFromCart(id) {
    toggleLoading(true);
    $.ajax('/api/remove-from-cart/' + id)
        .done(function(cart) {
            toggleError(false);
            printCart(cart);
        })
        .fail(function(err) {
            toggleError(true, err.responseText);
        })
        .always(function() {
            toggleLoading(false);
        })
}

function getFlowerById(id, callback) {
    toggleLoading(true);
    $.ajax('/api/flowers/' + id)
        .done(function(flower) {
            toggleError(false);
            if (callback) {
                callback(flower);
            }
        })
        .fail(function(err) {
            toggleError(true, err.responseText);
        })
        .always(function() {
            toggleLoading(false);
        })
}

function printCart(cart) {
    var total = 0;
    $myCart.empty();
    cart.forEach(function(item, idx) {
        total += parseInt(item.price, 10);
        $myCart.append('<li class="cart-item-container" data-idx="' + idx + '">' + item.name + ' (&euro; ' + item.price + ') <button class="remove-from-cart">Remove from cart</button></li>')
    });
    $myCart.append('<hr /><li><p><strong>TOTAL: &euro; ' + total + '</strong></p></li>')
}

function selectFlower(event) {
    var id = $(this).closest('.flower-container').data('id');
    selectedFlowerId = id;
    getFlowerById(id, setSelectedFlower);
}

function unSelectFlower() {
    $selectedFlower.empty();
    selectedFlowerId = -1;
}

function setSelectedFlower(flower) {
    if (!flower) return;
    $selectedFlower.html(
        'Selected: ' + flower.name + ' <button class="add-to-cart">Add to cart!</button>'
    );
}

function toggleError(isVisible, txt) {
    $error.text(txt || '');
    $error.css('display', isVisible ? 'block' : 'none');
}

function toggleLoading(isVisible) {
    $loadingThing.css('display', isVisible ? 'block' : 'none');
}