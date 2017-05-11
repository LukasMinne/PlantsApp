var bodyParser = require('body-parser');
var http = require('http');
var express = require('express');
var app = express();
var mysql = require("mysql");
var bcrypt = require('bcrypt');
const saltRounds = 10;


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

// routes 
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
    var plants = getPlants(req.body.start, req.body.end);
    plants.then(function(results) {
        res.json({
            plants: results
        })
    })
});

app.post('/register_user', function(req, res) {
    console.log(req.body);
    var user = registerUser(req.body.user, req.body.pass, req.body.email);
    user.then(function(results) {
        res.json("register OK");
    })
});

app.post('/login_user', function(req, res) {
    var user = loginUser(req.body.user, req.body.pass);
    user.then(function(results) {
        bcrypt.compare(req.body.pass, results[0].password).then(function(result) {
            // compare hash from database
            if (result == true) {
                //login correct
                console.log("juist");
                res.json({
                    username: result.name,
                    password: result.password,
                    email: result.email
                })

            } else {
                //passwoord fout
                console.log("fout");

            }
        })
    });
});

//sql functions

//registratie
//1. user input checken.
//2. nieuwe user opslaan

registerUser = (user, pass, email) => {
    return new Promise(function(resolve) {
        bcrypt.hash(pass, saltRounds).then(function(hash) {
            // Store hash in your password DB. 
            var statement = 'insert into user(name, password, email) values (?,?,?)';
            connection.query(statement, [user, hash, email], function(error, results, fields) {
                if (error) throw error;
                resolve({
                    username: user,
                    password: pass
                });
            });
        });
    });
};

//3. doorsturen naar ingelogd.


//inloggen

loginUser = (email, pass) => {
    return new Promise(function(resolve) {
        // console.log(email, pass);
        var statement = 'select * from user where email = ?';
        connection.query(statement, [email], function(error, results, fields) {
            if (error) throw error;
            console.log("results from database " + results);
            resolve(results);
        });
    });
};

getPlants = (start, end) => {
    return new Promise(function(resolve) {
        var statement = 'select * from plants limit ?,?';
        connection.query(statement, [start, end], function(error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
};

// server
var server = http.createServer(app);
server.listen(8080, function() {
    console.log("listening on 8080");
});