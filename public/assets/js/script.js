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
});

var reloadPage = function() {
    window.location.reload();
};

function requestPlants(start) {
    var end = start + 6;
    console.log("ajaxRequestPlants");
    $.ajax({
        type: "post",
        contentType: "application/json",
        url: "/load_plants",
        // timeout: 3600 * 5,
        data: JSON.stringify({
            start,
            end
        })
    }).success(function(data) {
        console.log(data);
        data.plants.forEach(function(plant) {
            var html = "";

            $("#plants").append(html);
        });
    })
}