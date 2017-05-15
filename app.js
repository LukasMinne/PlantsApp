var bodyParser = require('body-parser');
var http = require('http');
var express = require('express');
var session = require('express-session');
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

//initialize session
app.use(session({ secret: 'sssssssshhhhhhhhhh' }));

// routes 
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/html');
app.engine('html', require('ejs').renderFile);
app.get('/', function(req, response) {
    response.render("index.html", "");
});

app.get('/assortiment', function(req, response) {
    // check if the user's credentials are saved in a cookie //
    // if (req.cookies.user == undefined || req.cookies.pass == undefined) {
    //     console.log("no cookies");
    //     response.render('assortiment.html', {});
    // } else {
    //     // attempt automatic login //
    //     AM.autoLogin(req.cookies.user, req.cookies.pass, function(o) {
    //         if (o != null) {
    //             req.session.user = o;
    //             console.log("logged in with cookie");
    //             res.redirect('assortiment.html');
    //         } else {
    console.log("cannot login with existing cookie");
    response.render('assortiment.html', {});
    //     }
    // });
    // }
});


app.get('/', function(req, response) {
    response.render('index.html', {});
});

app.get('/route', function(req, response) {
    response.render('route.html', {});
});

app.get('/shoppingCart', function(req, response) {
    if (req.session.user == null) {
        res.redirect('/assortiment');
    } else {
        response.render('shoppingCart.html', {});
    }
});

app.post('/load_plants', function(req, res) {
    var plants = getPlants(req.body.start, req.body.end);
    plants.then(function(results) {
        res.json({
            plants: results
        })
    })
});

app.get('/get_plant', function(req, res) {
    var plant = getPlantById(req.body.id);
});

app.post('/register_user', function(req, res) {
    sess = req.session;
    console.log(req.body);
    var user = registerUser(req.body.user, req.body.pass, req.body.email);
    user.then(function(results) {
        sess.username = req.body.user;
        sess.email = req.body.email;
        res.json("register OK");

    })
});

var ses;
app.post('/login_user', function(req, res) {
    sess = req.session;
    var user = loginUser(req.body.user, req.body.pass);
    user.then(function(results) {
        // if (results != null) { //todo fix
        bcrypt.compare(req.body.pass, results[0].password).then(function(result) {
                // compare hash from database
                if (result == true) {
                    //login correct
                    console.log("juist");
                    sess.username = results[0].name;
                    sess.email = req.body.user;
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
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/assortiment');
        }
    });
    // res.clearCookie('user');
    // res.clearCookie('pass');
    // req.session.destroy(function(e) { res.status(200).send('ok'); });
    // response.render('index.html', {});
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
    // if (pass.lenght < 7 || pass.lenght > 40) { //todo fix
    // UserSchema.path('email').validate(function(email) {
    //     var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    //     console.log(emailRegex.test(email.text));
    //     return emailRegex.test(email.text); // Assuming email has a text attribute
    // }, 'The e-mail field cannot be empty.');
    return new Promise(function(resolve) {
        // console.log(email, pass);
        var statement = 'select * from user where email = ?';
        connection.query(statement, [email], function(error, results, fields) {
            if (error) throw error;
            resolve(results);
        });
    });
    // } else {
    //     //resolve();
    // }
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
    return new Promist(function(resolve) {
        var statement = 'select * from plants where id = ?';
        connection.query(statement, [id], function(error, results, fields) {
            if (error) throw error;
            resolve(results);
        })
    })
};

// server
var server = http.createServer(app);
server.listen(8080, function() {
    console.log("listening on 8080");
});