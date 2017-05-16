var bodyParser = require('body-parser');
var http = require('http');
var express = require('express');
var session = require('express-session');
var app = express();
var mysql = require("mysql");
var bcrypt = require('bcrypt');
const saltRounds = 10;
var sess;

//mysql
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'plantuser',
    password: 'plants',
    database: 'plantsDB'
});

connection.connect();

// var app = express.createServer(),
//     socket = io.listen(app),
// var store = new express.session.MemoryStore;

// set up BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// app.use(cookieParser());
app.use(session({ secret: "a13jlsdf93240sfdsf9024sf90s", resave: false, saveUninitialized: true }));
// app.use(express.static(path.join(__dirname, 'public')));

//initialize session
// app.use(express.cookieParser());
// app.use(session({ secret: 'ssshhhhh' }));

// routes 
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.get('/', function(req, response) {
    response.render("index.html", "");
});

app.get('/assortiment', function(req, response) {
    // console.log(req.session);
    // if (req.session.email != null) {
    //     loginUser(req.session.email, req.session.pass);
    // }
    response.render('assortiment.html', {});
});


app.get('/', function(req, response) {
    response.render('index.html', {});
});

app.get('/route', function(req, response) {
    response.render('route.html', {});
});

//todo fix
app.get('/winkelwagen', function(req, response) {
    // if (!req.session.user) {
    //     return res.status(401).send();
    // }
    // return res.status(200).send("Welkom");
    response.render('shoppingCart.html', {});
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
    var user = registerUser(req.body.user, req.body.pass, req.body.email);
    user.then(function(results) {
        res.json("register OK");
    })
});


app.post('/login_user', function(req, res) {
    var user = loginUser(req.body.user, req.body.pass);
    user.then(function(results) {
        // if (results != null) { //todo fix
        bcrypt.compare(req.body.pass, results[0].password).then(function(result) {
                // compare hash from database
                if (result == true) {
                    //login correct
                    console.log("juist");
                    req.session.email = req.body.user;
                    req.session.pass = req.body.pass;
                    console.log(req.session);
                    res.json({
                        username: results[0].name
                            // email: results[0].email
                    })
                } else {
                    //passwoord fout
                    console.log("fout");
                }
            })
            // }
    });
});

app.post('/logout', function(req, res) {
    console.log("logout");
    res.redirect('/assortiment');
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
    console.log("email login : " + email);
    console.log("pass login : " + pass);
    return new Promise(function(resolve) {
        // console.log(email, pass);
        var statement = 'select * from user where email = ?';
        connection.query(statement, [email], function(error, results, fields) {
            if (error) throw error;
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