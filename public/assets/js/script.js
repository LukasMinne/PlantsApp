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
            if (counter == 0) {
                html += "<div class='ui-block-a'>";
                counter++;
            } else {
                html += "<div class='ui-block-b'>";
                counter--;
            }
            html += "<a href='#' class='ui-btn ui-corner-all ui-shadow'>" + plant.name + "</a></div>";

            $("#plants").append(html);
        });
    })
}