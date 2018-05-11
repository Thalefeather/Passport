const express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')

var session = require('express-session')

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

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

app.get('/getUser',(req,res)=>{
	let sql = 'SELECT * FROM games';
	db.query(sql,(err,result)=>{
		if(err)throw err;
		console.log(result);
		res.send(result);

	});
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
    console.log(result);
    res.send(result);

  });
});

});

