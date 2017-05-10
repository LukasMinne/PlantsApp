var bodyParser = require('body-parser');
var http = require('http');
var express = require('express');
var app = express();
var mysql = require("mysql");


//mysql
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'plantuser',
    password: 'plants',
    database: 'plantsDB'
});

connection.connect();

// set up BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.get('/', function(req, response) {
    response.render("index.html", "");
});

app.get('/assortiment', function(req, response) {
    response.render('assortiment.html', {});
});

app.get('/', function(req, response) {
    response.render('index.html', {});
});

app.get('/route', function(req, response) {
    response.render('route.html', {});
});

app.post('/load_plants', function(req, res) {
    console.log(req.body);
    var plants = getPlants(req.body.start, req.body.end);
    plants.then(function(results) {
        // connection.end();
        res.json({
            plants: results
        })
    })
});

app.post('/register_user', function(req, res) {
    console.log(req.body);
    var user = registerUser(req.body.user, req.body.pass, req.body.email);
    user.then(function(results) {
        // res.json({
        //     plants: results
        // })
        console.log("");
    })
});


//sql functions

//registratie
//1. user input checken.
//2. nieuwe user opslaan

registerUser = (user, pass, email) => {
    return new Promise(function(resolve) {
        var statement = 'insert into user(name, password, email) values (?,?,?)';
        // var user;
        connection.query(statement, [user, pass, email], function(error, results, fields) {
            if (error) throw error;
            resolve({
                username: user,
                password: pass
            });
        });
    });
};

//3. doorsturen naar ingelogd.


//inloggen

// checkLogin = (username, password) => {

//     var statement = 'select * from user where username=?';
//     connection.query(statement, [username], function(error, results, fields) {
//         if (error) throw error;
//         console.log(results[0].password == password);
//     });

//     connection.end();
// };

getPlants = (start, end) => {
    return new Promise(function(resolve) {
        var statement = 'select * from plants limit ?,?';
        connection.query(statement, [start, end], function(error, results, fields) {
            if (error) throw error;
            // console.log(results);
            resolve(results);
        });
        // connection.end();       
    });


};


var server = http.createServer(app);
server.listen(8080, function() {
    console.log("listening on 8080");
});