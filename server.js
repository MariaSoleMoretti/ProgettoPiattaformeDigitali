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
app.get("/home", (req, res) => {
  res.render("home.ejs");
});


//pagina del login
app.get("home/addTutor", (req, res) => {
  res.render("addTutor.ejs");
});

app.post("home/addTutor", (req,res) =>{
  
  //salvataggio del tutor del database
  let esito = validazioneInput(req.body.email, users);
  console.log(esito);
  if(esito == false){
      res.send("Errore! L'email non è valida");
  }
  else{
    try {
      //facciamo la read del file per modificarlo
      let data = fs.readFileSync("tutors.json");
      users = JSON.parse(data);
   
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
      data = JSON.stringify(users, null, 2);
      
      fs.writeFileSync("tutors.json", data);
      console.log("File written successfully");
      console.log(users);
    }catch (e){
      //se ci sono problemi viene reindirizzato su register
      console.log("ERRORE");
      console.log(e);
    }
  }
})

//funzione di validazione dehli input, in particolare controlla se l'email è valida, 
//cioè se cointiene il carattere @, e se non è presente nel database
function validazioneInput(email,users){
  let esito = true;
  let tutorsByEmail = users.filter(ricercaEmail, email);
  console.log(tutorsByEmail);
  if((tutorsByEmail.lenght == 0) || (email.toString().indexOf("@") == -1)){
    //se l'email è già presente oppure se l'email inserita non contiene il carettere @ l'email non è valida
    esito = false;
  }
  //se non entra nell'if allora l'email è valida
  return esito;
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
    let tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);
    //poi filtra l'array risultante dall'operazione precedente in base al nome
    let tutorsByNome = tutorsByUni.filter(ricercaNome, req.query.nome);
    //infine filtra la''array risultante in base al cognome
    let tutorRicercati = tutorsByNome.filter(ricercaCognome, req.query.cognome);
    console.log(tutorRicercati);
    res.send(tutorRicercati);
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
app.get("/home/deleteTutorById",(req, res) => {
  res.render("deleteTutor.ejs");
});

app.post("/home/deleteTutorById", (req,res) =>{
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  if(data != null){
    const tutors = JSON.parse(data);
    //ricerca nell'array l'elemento con l'id richiesto
    let idTutor = tutors.findIndex(req.body.id);
    //se esiste lo elimino
    if(idTutor != -1){
      tutors.splice(idTutor,1);
    }
    else{
      console.log("Non esiste nessun utente con id");
    }
  }
})