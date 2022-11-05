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
    
    //salvataggio del tutor del database
    let esito = validazioneInput(req.body.email, users);
    
    if(esito == false){
      res.send("Errore! L'email non è valida");
    }
    else{
      //aggiungo il tutor all'array dei tutor
      users.push({
        id:        Date.now().toString(),
        nome:      req.body.nome,
        cognome:   req.body.cognome,
        email:     req.body.email,
        universita:req.body.universita,
        corso:     req.body.corso
      });
      //effettuo il writeback nel file
      let data = JSON.stringify(users, null, 2);
      
      fs.writeFileSync("tutors.json", data);
      console.log("File written successfully");
      console.log(users);
    }   
  } catch (e){
    //se ci sono problemi viene reindirizzato su register
    console.log("ERRORE");
    console.log(e);
    res.redirect("/addTutor");
  }
})

//funzione di validazione dehli input, in particolare controlla se l'email è valida, cioè se cointiene
//il carattere @, e se è gia presente nel database
function validazioneInput(email,users){
  let tutors = users.filter(ricercaEmail, email);
  tutors.forEach((element)=>{
    if(element.email.toString().indexOf("@") != -1){
      //devo controllare che l'email non sia già presente
      return true;
    }
    else{
      return false;
    }
  })
}

//funzione che filtra i tutor in base alla email
function ricercaEmail(elemento, tutors){
  //console.log(this);
  if (elemento.email.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

//api che filtra i tutor in base all'università 
app.get("/home/cercaUniversita", (req,res) =>{
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");
  
  if(data != null){
    const tutors = JSON.parse(data);
    //filtra i tutor in base all'università ricercata
    let utentiRicercati = tutors.filter(ricercaUniversità, req.query.universita);
    res.send(utentiRicercati);
  }
  else{
    res.send('Error');
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
    //infine filtra la''array risultante in base al cognome
    let utentiRicercati = utentiRicercatiNome.filter(ricercaCognome, req.query.cognome);
    console.log(utentiRicercati);
    res.send(utentiRicercati);
  }
  else{
    res.send('Error');
  }
})

//funzione per la ricerca dei tutor in base all'università
function ricercaUniversità(elemento, tutors) {
  if (elemento.universita.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

//funzione per la ricerca dei tutor in base al corso
function ricercaCorso(elemento, tutors) {
  if (elemento.corso.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

//funzione per la ricerca dei tutor in base al nome
function ricercaNome(elemento, tutors) {
  if (elemento.nome.toString().toLowerCase() === this.toLowerCase()){
    return true;
  }
}

//funzione per la ricerca dei tutor in base al cognome
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