"use strict";
var basicUrl = "http://www.localhost:3000";

$(document).ready(function() {
    //check jsfile
    console.log("js connected");

    //load header/footer
    // $("#header").load("/html/header.html");
    // $("#footer").load("/html/footer.html");

    //reload page 
    $("#reloadPageBtn").on('click', reloadPage);
    ajaxCallToObject();
});

var reloadPage = function() {
    window.location.reload();
};


var fetchCall = function(addUrl) {
    fetch(basicUrl + addUrl)
        .then(
            function(response) {
                if (!response.ok) {
                    console.log("There is a problem with fetchCall. Error: " + response.status);
                    return;
                }
                response.json().then(function(data) {
                    console.log(data);
                });
            }
        )
        .catch(function(error) {
            console.log("Error fetch ", error);
        })
};

var checkData = function() {

};


function ajaxCallToObject(objectName) {
    $.ajax({
        url: basicUrl + objectName,
        success: function(result) {
            printObject(result, "#" + objectName);
            console.log(Object.values(result)[0]);
        }
    });
}