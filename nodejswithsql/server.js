const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var session = require('express-session')
var MySQLStore = require('express-mysql-session')(session);
var passport = require('passport');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

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

//express mysql session
const options = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "dbmysql",
  socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
};

var sessionStore = new MySQLStore(options);

app.use(session({
  secret: 'jibirish',
  store: sessionStore,
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

app.get('/login',(req,res)=>{

  res.redirect('/login.html');

});

//Local - for local database strategy
app.post('/login', passport.authenticate('local', {

successRedirect: '/do',
failureRedirect: '/login'

}));

app.get('/do', authenticationMiddleware (), (req,res)=>{
	

//  deserializeUser ... if so - creates a session and returns a session key
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

//verify if the user exists and the password is correct
passport.use(new LocalStrategy(
  function(username, password, done) {
  
    console.log(username);
    console.log(password);

    db.query('SELECT id, password FROM user WHERE name = ?',[username], (err,result)=>{
      if(err)throw err;

          console.log(result[0]);

      //if nothing is returned
      if(result.length===0){
        console.log("Empty");
        done(null,false);
      }

      const hash = result[0].password.toString();
      var res = bcrypt.compareSync(password, hash);

            if(res===true){

              return done(null, {user_id:result[0].id});

            }else{

              done(null,false);
            }

    });


      return done(null, false);
   
  }
));


//writing user data in the session
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

//retrieving user datafrom the session
passport.deserializeUser(function(user_id, done) {

  done(null, user_id);
});

function authenticationMiddleware () {  
  return (req, res, next) => {
    console.log(`req.session.passport.user: ${JSON.stringify(req.session.passport)}`);

      if (req.isAuthenticated()) return next();
      res.redirect('/login')
  }
}




