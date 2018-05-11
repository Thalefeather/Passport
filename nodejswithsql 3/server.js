const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var session = require('express-session')
var passport = require('passport');

var bcrypt = require('bcrypt');
const saltRounds = 10;

const mysql = require('mysql');

const app = express();


const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "dbmysql",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));


app.use(cookieParser());
app.use(express.static('web'));

app.use(session({
  secret: 'jibirish',
  resave: false,
  saveUninitialized: false,
  //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/do',(req,res)=>{
	
  console.log(req.user);
  console.log(req.isAuthenticated());
  res.redirect('/do.html');

	});


app.post('/postUser',(req,res)=>{

  var name = req.body.name;
  var pass = req.body.pass;
  var mail = req.body.mail;


  bcrypt.hash(pass, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  let sql = "INSERT INTO `user` (`id`, `Name`, `Mail`, `Password`) VALUES (NULL, '"+name+"', '"+mail+"', '"+hash+"');"

  db.query(sql,(err,result)=>{
    if(err)throw err;

    let sql = "SELECT LAST_INSERT_ID() as user_id";

    db.query(sql,(err,result)=>{
      if(err)throw err;

      var user_id = result[0];
      console.log(result[0]);

        //LOGIN USER-create a session
        req.login(user_id,function(err){

          res.redirect('/do');  

        });

      });
  });
});
});

//writing user data in the session
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

//retrieving user datafrom the session
passport.deserializeUser(function(user_id, done) {

  done(null, user_id);
});






