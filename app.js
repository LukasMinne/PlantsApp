const bodyParser = require('body-parser');
const http = require('http');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const saltRounds = 10;
// var loggedInUsers = [];

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

app.use(cookieParser());
app.use(session({
    secret: 'my uber safe secret %#*$^&$#',
    cookie: {
        maxAge: 3600000,
        path: '/'
    },
    resave: false,
    saveUninitialized: true
}));

// app.use(function(req, res, next) {
//     if (req.session && req.session.login) {
//         req.user = true;
//         next();
//     } else {
//         next();
//     }
// })

// function requireLogin(req, res, next) {
//     if (!req.user) {
//         res.redirect('assortiment.html');
//     } else {
//         next();
//     }
// };

app.get('/assortiment', function(req, res) {
    console.log("assortiment")
    console.log(req.session);
    if (req.session.user) {
        console.log("logged in with session");
        res.render("assortiment.html", {
            userName: req.session.user,
            loggedIn: true
        });
    }
    res.render("assortiment.html", {
        userName: req.session.user,
        loggedIn: false
    });
});


app.get('/', function(req, response) {
    response.render('index.html', {});
});

app.get('/route', function(req, response) {
    response.render('route.html', {});
});


// app.post('/doBestelling', function(req, res) {
//     console.log("bestelled");
//     console.log(req.body);
// });

app.post('/load_plants', function(req, res) {
    var plants = getPlants(req.body.start, req.body.end);
    plants.then(function(results) {
        res.json({
            plants: results,
            cart: req.session.cart || []
        })
    })
});

app.get('/api/flowers/:id', function(req, res) {
    var plant = getPlantById(req.body.id);
    plant.then(function(result) {
        res.json({
            plants: result,
        })
    });
    // database
    //     .getFlowerById(req.params.id)
    //     .then(flower => {
    //         res.json(flower);
    //     })
    //     .catch(err => {
    //         res.status(500).json({ error: err });
    //     });
});

app.get('/api/add-to-cart/:id', function(req, res) {
    var plant = getPlantById(req.body.id);
    plant.then(function(result) {
        if (req.session.cart) {
            req.session.cart.push(result);
        } else {
            req.session.cart = [result];
        }
        res.json(req.session.cart);
    });
    //   database
    //     .getFlowerById(req.params.id)
    //     .then(flower => {
    //       if(req.session.cart){
    //         req.session.cart.push(flower);
    //       } else {
    //         req.session.cart = [flower];
    //       }
    //       res.json(req.session.cart);
    //     })
    //     .catch(err => {
    //       res.status(500).json({ error: err });
    //     });
});

app.get('/api/remove-from-cart/:idx', function(req, res) {
    if (req.session.cart) {
        req.session.cart.splice(req.params.idx, 1);
    }
    res.json(req.session.cart);
});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    console.log(re.test(email));
    if (re.test(email)) {
        return true;
    } else { return false };
}


app.post('/register_user', function(req, res) {
    if (validateEmail(req.body.email)) {
        var user = registerUser(req.body.user, req.body.pass, req.body.email);
        user.then(function(results) {
            req.session.login = true;
            req.session.user = req.body.user;
            res.json({ username: req.body.user });
        })
    }
});


app.post('/login_user', function(req, res) {
    if (validateEmail(req.body.user)) {
        var user = loginUser(req.body.user, req.body.pass);
        user.then(function(results) {
            // if (results != null) { //todo fix
            bcrypt.compare(req.body.pass, results[0].password).then(function(result) {
                    // compare hash from database
                    if (result == true) {
                        //login correct
                        // console.log("juist");
                        // loggedInUsers.push(results[0].name);
                        req.session.login = true;
                        req.session.user = results[0].name;
                        // req.session.save();
                        console.log("login")
                        console.log(req.session);
                        res.json({
                            username: results[0].name
                                // email: results[0].email
                        })
                    } else {
                        //passwoord fout
                        // req.session.login = false;
                        // console.log("fout");
                    }
                })
                // }
        });
    }
});

app.post('/logout', function(req, res) {
    console.log("logout");
    req.session.reset();
    // req.session.login = false;
    res.redirect('/assortiment');
});


//sql functions

//registratie
//1. user input checken.
//2. nieuwe user opslaan

registerUser = (user, pass, email) => {
    checkFreeEmail(email);
    if (freeEmail) {
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
    }
};

checkFreeEmail = (email) => {
    return new Promise(function(resolve) {
        var statement = 'select email from user where email LIKE ?'
        connection.query(statement, [user, hash, email], function(error, results, fields) {
            if (error) throw error;
            resolve({ freeEmail: true });
        })
    });
};

//3. doorsturen naar ingelogd.


//inloggen

loginUser = (email, pass) => {
    return new Promise(function(resolve) {
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

getPlantById = (id) => {
    return new Promise(function(resolve) {
        var statement = 'select * from plants where id = ?';
        connection.query(statement, [id], function(error, results, fields) {
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