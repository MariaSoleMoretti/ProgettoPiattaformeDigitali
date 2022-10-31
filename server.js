const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());
app.use(express.urlencoded({extended:true}));


//permette di separare il codice javescript da quello html
app.set("view-engine", "ejs");


//dichiarazione della variabili globali
let users = [];
let tutor = [];

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
    
    tutor.push({
      id:        Date.now().toString(),
      nome:      req.body.nome,
      cognome:   req.body.cognome,
      email:     req.body.email,
      universita:req.body.universita,
      corso:     req.body.corso
    });
    
    //salvataggio del tutor del database
    addUtente(users,tutor);
    console.log(users);
    
  } catch {
    //se ci sono problemi viene reindirizzato su register
    console.log("ERRORE");
    console.log("Utente non salvato");
    res.redirect("/addTutor");
  }
})

function addUtente(users,tutor) {
  //controllo degli input
  let esito = validazioneInput();
  
  //salviamo l'utente nel file
  if(esito == true){
    //aggiungo il tutor all'array dei tutor
    users.push(tutor);
    //effettuo il writeback nel file
    let data = JSON.stringify(users, null, 2);
    
    try{
      fs.writeFileSync("tutors.json", data);
      console.log("File written successfully");
    }catch(err){
      console.log(err);
    }
  }
}

function validazioneInput(tutor){
  
}

//api che filtra i tutor in base all'università 
app.get("/home/cercaUniversita", (req,res) =>{
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");
  
  if(data != null){
    const tutors = JSON.parse(data);
    let utentiRicercati = tutors.filter(ricercaUniversità, req.query.universita);
    console.log(utentiRicercati);
    res.send(utentiRicercati);
  }
  else{
    console.log('Error');
  }
})

//api che filtra i tutor in base all'università e il corso
app.get("/home/cercaUniversitaCorso", (req,res) =>{
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");
  
  if(data != null){
    const tutors = JSON.parse(data);
    //prima filtra tutti i tutor appartenenti all'università cercata
    let utentiRicercatiUni = tutors.filter(ricercaUniversità, req.query.universita);
    //successivamente filtriamo l'array rusultante dall'operazione precedente
    //per cercare i tutor di quella università che seguino il corso ricercato
    let utentiRicercati = utentiRicercatiUni.filter(ricercaCorso, req.query.corso);
    res.send(utentiRicercati);
  }
  else{
    res.send('Error');
  }
})

//api che filtra i tutor in base all'università, nome e cognome
app.get("/home/cercaUniversitaNomeCognome", (req,res) =>{
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");
  
  if(data != null){
    const tutors = JSON.parse(data);
    //prima filtra tutti i tutor appartenenti all'università cercata
    let utentiRicercatiUni = tutors.filter(ricercaUniversità, req.query.universita);
    //poi filtra l'array risultante dall'operazione precedente in base al nome
    let utentiRicercatiNome = utentiRicercatiUni.filter(ricercaNome, req.query.nome);
    //infine l
    let utentiRicercati = utentiRicercatiNome.filter(ricercaCognome, req.query.cognome);
    console.log(utentiRicercati);
    res.send(utentiRicercati);
  }
  else{
    console.log('Error');
  }
})

function ricercaUniversità(elemento, tutors) {
  if (elemento.universita.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

function ricercaCorso(elemento, tutors) {
  if (elemento.corso.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

function ricercaNome(elemento, tutors) {
  if (elemento.nome.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

function ricercaCognome(elemento, tutors) {
  if (elemento.cognome.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}
  
//pagina per la modifica dal database
app.get("/deleteTutor",(req, res) => {
  res.render("deleteTutor.ejs");
});

app.post("deleteTutor", (req,res) =>{
  
})