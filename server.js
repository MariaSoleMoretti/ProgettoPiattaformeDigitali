const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());

// using app.use to serve up static CSS files in public/assets/ folder when /public link is called in ejs files
// app.use("/route", express.static("foldername"));
app.use('/public', express.static('public'));

//permette di separare il codice javescript da quello html
app.set("view-engine", "ejs");


//homepage del sito
app.get("/", (req, res) => {
  res.render("home.ejs");
});