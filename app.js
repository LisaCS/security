//jshint esversion:6
//don't need a constant and just call config on it to be up and running
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption")

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

// establish connection with db

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true });

//create a user schema
//need to use mongoose schema object as to use encyrption
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//define secret in env file

//add mongoose encrypt as a plugin to our schema, plugin before using to create model
// this will encrypt the entire database, even the email address, but we need only password
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

//create a user model using the user schema

const User = new mongoose.model("User", userSchema);
// Requests


//create get & post requests

app.get("/", function(req,res){
  res.render("home");
});

app.get("/login", function(req,res){
  res.render("login");
});

app.post("/login",function(req,res){
  //check if we have a user with such credential
const username = req.body.username;
const password = req.body.password;

  User.findOne(
    {email: username},

    function(err,foundUser){
      if(err){
        console.log(err);
      }else{
        if(foundUser){
          //if such user exists does the password match
          if(foundUser.password === password){
            res.render("secrets");
          }else{
            console.log("No user found");
          }
        }
      }
    }
)
});

app.get("/register", function(req,res){
  res.render("register");
});
//create post route which will create users when register page is used
app.post("/register",function(req,res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });
  // save the new user

  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }else{
      console.log(err);
    }
  })
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});
