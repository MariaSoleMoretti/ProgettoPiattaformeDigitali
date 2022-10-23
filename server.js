const express = require("express");
const app = express();
const fs = require("fs");
var comparator = require('comparator');

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//permette di separare il codice javescript da quello html
app.set("view-engine", "ejs");

// using app.use to serve up static CSS files in public/assets/ folder when /public link is called in ejs files
// app.use("/route", express.static("foldername"));
app.use('/public', express.static('public'));

//dichiarazione della variabili globali
let users = [];

//homepage del sito
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//pagina del login
app.get("/addTutor", (req, res) => {
  res.render("addTutor.ejs");
});

app.post("/addTutor", (req,res) =>{
  
  try {
    //facciamo la read del file per modificarlo
    let data = fs.readFileSync("tutors.json");
    users = JSON.parse(data);
    
    users.push({
      id:        Date.now().toString(),
      name:      req.body.name,
      email:     req.body.email,
      università:req.body.università,
      corso:     req.body.corso
    });
    
    console.log(req.body.name);
    console.log(req.body.email);
    console.log(req.body.università);
    console.log(req.body.corso);

    addUtente(users);
    //se tutto va bene rimandiamo alla pagina di login
  } catch {
    //se ci sono problemi viene reindirizzato su register
    console.log("ERRORE");
    console.log("Utente non salvato");
    res.redirect("/addTutor");
  }
})

function addUtente(user) {
  //controliamo che l'utente non sia gia registrato

  //salviamo l'utente nel file
  let data = JSON.stringify(user, null, 2);
  try{
    fs.writeFileSync("tutors.json", data);
    console.log("File written successfully");
    console.log(user);
  }catch(err){
    console.log(err);
  }
}

app.get("/home/cercaUniversitaId", (req,res) =>{
  let data = fs.readFileSync("tutors.json");
  
  if(data != null){
    const tutors = JSON.parse(data);
    console.log(req.query.università);
    let utentiRicercati = linearSearch(tutors,req.query.università);
    console.log(utentiRicercati);
    res.send(utentiRicercati);
  }
  else{
    console.log('Error');
  }
})

function linearSearch(tutors, key) {
  const foundIndices = [];

  tutors.forEach((element, index) => {
    if (comparator.equal(element.università, key)) {
      foundIndices.push(index);
    }
  });
  return foundIndices;
}
  
//pagina per la modifica dal database
app.get("/deleteTutor",(req, res) => {
  res.render("deleteTutor.ejs");
});