const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());

//permette di separare il codice javescript da quello html
app.set("view-engine", "ejs");

//homepage del sito
app.get("/", (req, res) => {
  res.render("home.ejs");
});