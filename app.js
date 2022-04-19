/*** * ITE5315 – project * 
 * I declare that this assignment is my own work in accordance with Humber Academic Policy.
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. * 
 * * Name: __Maryann Meilika______          Student ID: __No1420778___ Date: _____11-4-2022____
 * * Name: __Khushbu Ramprasad Somani______ Student ID: __N01416508     ___ Date: _____11-4-2022____
 *  * ********************************************************************************/

var express = require('express');
var mongoose = require('mongoose');
var app = express();

var bodyParser = require('body-parser');  
       // pull information from HTML POST (express4)
var jwt = require('jsonwebtoken');
app.use(express.json());

var path = require('path');//include path module using require method
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

var port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json


const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

app.engine('.hbs', expressHandlebars.engine({
    handlebars: allowInsecurePrototypeAccess(Handlebars), extname: '.hbs'
}));
app.set('view engine', '.hbs');

const dotenv = require("dotenv");
dotenv.config();
var Restaurant = require('./models/restaurant');
var un = process.env.db_username;
var pass = process.env.db_password;
//var url = "mongodb+srv://"+un+":"+pass+"@cluster0.utirj.mongodb.net/sample_restaurants";
var url = "mongodb+srv://"+un+":"+pass+"@cluster0.a0o8t.mongodb.net/sample_restaurants";
const restaurantDb = new Restaurant(url);
//console.log(db);

restaurantDb.initialize().then(()=>{
    app.listen(port, ()=>{
    console.log(`server listening on: ${port}`);
    });
    }).catch((err)=>{
    console.log(err);
});

// Add security feature to the app(cookie)
const cookieParser = require('cookie-parser')
app.use(cookieParser());

//const RestaurantDB = require('./models/restaurant');
app.get('/', function (req, res) {
    // use mongoose to get all todos in the database
    res.json('hello');
});

//get all restaurant data from db
app.get('/api/restaurants', function (req, res) {
    // use mongoose to get all todos in the database
    restaurantDb.getAllRestaurantData().then(function (err, restaurants) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.json(err);
        else
            res.json(restaurants); // return all restaurants in JSON format
    });
});

// get a restaurant with ID
app.get('/api/restaurants/:_id', function (req, res) {
    let id = req.params._id;
    
    restaurantDb.getRestaurantById(id)
    .then(function (err, restaurant) {
        //console.log(restaurant);
        if (err){
            res.json(err)
        }
        else{
            res.json(restaurant);
        }
        
    });
  });

// create book and send back all book after creation
app.post('/api/restaurants', function (req, res) {

    var data = {
        _id:req.body._id,
        restaurant_id: req.body.restaurant_id,
        name: req.body.name,
        cuisine: req.body.cuisine,
        borough: req.body.borough
    }
    // create mongose method to create a new record into collection
    console.log(req.body);
    restaurantDb.addNewRestaurant(data)
    .then(function (err, restaurant) {
		if (err)
			res.send(err);
        else{

		// get and return all the books after newly created book record
		restaurantDb.getAllRestaurantData().then(function (err, restaurants) {
			if (err)
				res.send(err)
            else
			    res.json(restaurants);
		});
    }
    });
});



app.put('/api/restaurants/:_id', function (req, res) {
    // create mongose method to update an existing record into collection
    console.log(req.body);
    let id = req.params._id;
    const data = {
        restaurant_id: req.body.restaurant_id,
        name: req.body.name,
        cuisine: req.body.cuisine,
        borough: req.body.borough
    }

    // save the user
    restaurantDb.updateRestaurantById(data, id).then(function (err,data) {
        if(err)
            res.send(err);
        else
            res.send('Successfully! Restaurant updated - ' + id);
    });
});

app.delete('/api/restaurants/:_id', function (req, res) {
    console.log(req.params._id);
    let id = req.params._id;
    restaurantDb.deleteRestaurantById(id).then(function (err) {
        if (err)
            res.send(err);
        else
            res.send('Successfully! Restaurant has been Deleted.');
    });
});



//add new book
app.get('/api/search', (req, res, next) => {
    res.render('search', { layout: false });
});

app.post('/api/search/display', (req, res, next) => {
    const borough = req.body.borough;
    const page = req.body.page;
    const perPage = req.body.perPage;
    restaurantDb.getAllRestaurants(page,perPage,borough).then(function (err, data) {
        // if there is an error retrieving, send the error otherwise send data
        if (err)
            res.send(err)
        res.json(data); // return all restaurants in JSON format
        res.render('display', { data:data, layout: false }); // return all books in JSON format
    });
});

let database = {
      username: "admin",
      password: "root"
};

// Login route
app.get("/login", (req, res) => {
 
    // Get the name to the json body data
    const username = req.body.username;
   
    // Get the password to the json body data
    const password = req.body.password;
   
      // If data name are matched so check
      // the password are correct or not
      if (database.username === username && database.password === password) {
        // const token = jwt.sign(database, "secret");
        const token = process.env.ACCESS_TOKEN;
        const decode = jwt.verify(token, "secret");
        restaurantDb.getAllRestaurantData().then(function (err, restaurants) {
            // if there is an error retrieving, send the error otherwise send data
            if (err)
                res.status(400).json(err);
            // res.status(201).json(restaurants); // return all restaurants in JSON format
            res.json(restaurants); // return all restaurants in JSON format
        });
    }
    else {   
        // Return response with error
        res.json({
          login: false,
          data: "please check username and password",
        });
    }
});