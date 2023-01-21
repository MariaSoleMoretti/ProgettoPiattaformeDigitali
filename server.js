const express = require("express");
const app = express();
const fs = require("fs");

//file statico per il caricamento del file css
app.use(express.static('public'))
//parsing delle richieste in formato json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//dichiarazione della porta del server
app.listen(3000);

//dichiarazione della variabili globali
let tutors = [];
let tutorRicercati = [];

//caricamento della pagina html
app.get("/home", (req,res) =>{
  res.sendFile("/app/views/home.html");
})

//api per l'aggiunta di un nuovo tutor
app.post("/home/addTutor", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);

  //salvataggio del tutor del database
  let esito = validazioneEmail(req.body.email, tutors);
  if (esito == false) {
    //error bad request
    res.status(400).json({
        message:
          "ERRORE! L'email inserita è già associata ad un altro tutor.",
        status: 400,
      });
  } else {
    //aggiungo il nuovo tutor all'array dei tutor
    tutors.push(req.body);

    //effettuo il writeback nel file
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);
    
    //invia la risposta la client
    res.status(200).json(tutors);
  }
});

//api di ricerca dei tutor del database
app.get("/home/searchTutors/:filtro/:valore", (req, res) => {
  //definisco il filtro e il valore della ricerca
  let filtriRicerca = req.params.filtro;
  let valoreRicerca = req.params.valore;
  
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  
  if(data != null) {
    //effettuo il parsing
    tutors = JSON.parse(data);
    
    switch(parseInt(filtriRicerca)){
      case 1:
        //filtra tutti i tutor che hanno lo stesso nome
        tutorRicercati = tutors.filter(ricercaNome, valoreRicerca);
        break
      case 2:
        //filtra tutti i tutor appartenenti all'università cercata
        tutorRicercati = tutors.filter(ricercaUniversità, valoreRicerca);
      break;
      case 3:
        //filtra tutti i tutor che seguono il corso ricercato
        tutorRicercati = tutors.filter(ricercaCorso,valoreRicerca);
      break;
      case 4:
        //filtra tutti i tutor che hanno lo stesso cognome
        tutorRicercati = tutors.filter(ricercaCognome, valoreRicerca);
      break;
      default:
        tutorRicercati = tutors;
        res.status(400).json({
        message:
          "ERRORE! Inserire filtro di ricerca. ",
        status: 400,
      });
      return;
    }
  }
  //invio la risposta al client
  if(tutorRicercati.length != 0){
    res.status(200).json(tutorRicercati);
  }
  else{
    //error not found
    res.status(404).json({
        message:
          "ERRORE! La ricerca non ha prodotto risultati. ",
        status: 404,
      });
  }
  
});

//api per eliminare un utente dal database ricercandolo in base all'id
app.delete("/home/deleteTutor/:id", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  if (data != null) {
    //effettuo il parsing
    tutors = JSON.parse(data);

    //ricerca nell'array l'elemento con l'id richiesto
    let idTutor = tutors.findIndex((element) => element.id == req.params.id);

    //se esiste lo elimino
    if (idTutor != -1) {
      let deletedTutor = tutors.splice(idTutor, 1);
      
      //effettua il write back degli elementi aggiornati
      data = JSON.stringify(tutors, null, 2);
      fs.writeFileSync("tutors.json", data);
      
      //invia la risposta la client
      res.status(200).json(tutors);
    } else {
      //error not found
      res.status(404).json({
        message:
          "ERRORE! Non esiste nel database un utente con id " + req.params.id,
        status: 404,
      });
    }
  }
});

//api di aggiornamento delle email dei tutor
app.put("/home/updateTutor/:id/:azione/:modifica", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);
  //definisco la modifica da effettuare
  let azione = req.params.azione;
  //ricerca nell'array l'elemento con l'id richiesto
  let idTutor = tutors.findIndex((element) => element.id == req.params.id); 
  
  //controllo se l'id corrisponde ad un tutor nel database
  if (idTutor != -1 && azione != -1 && req.params.modifica != null) {
    let tutorRicercato = tutors[idTutor];
    //in base al tipo di modifica eseguo una dei seguenti case
    switch (azione) {
      case "newExam":
        //controllo se l'esame è gia' presente tra quelli dell'utente
        let esito_valEsame = validazioneNuovoEsame(req.params.modifica, tutorRicercato.esami);
        if(esito_valEsame == true){
          //se è valido effettua la modifica
          tutorRicercato.esami.push(req.params.modifica);
        }
        else{
          //se non è valido invio in risposta un messaggio d'errore
          res.status(404).json({
            message:
              "ERRORE! L'esame è gia' presente tra i dati dell'utente.",
            status: 404
          });
        }
        break;
      case "newEmail":
        //controllo se l'email è associata ad un altro tutor
        let esito_valEmail = validazioneEmail(req.params.modifica, tutors)
        if(esito_valEmail == true){
          //se è valida effettua la modifica
          tutorRicercato.email = req.params.modifica;
        }
        else{
          //se non è valida invio in risposta un messaggio d'errore
          //error not found
          res.status(404).json({
            message:
              "ERROR! L'email inserita è gia' associata ad un tutor.",
            status: 404
          });
        }
        break;
    }
    //effettuo il writeback
    tutors.fill(tutorRicercato, idTutor, 0);
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);
    
    //invia la risposta la client
    res.status(200).json(tutors);
  } else {
    //se l'id tutor non è esiste mando in risposta un messaggio di errore
    res.status(404).json({
      message:
        "ERRORE! I valori inseriti non sono validi. ",
      status: 404,
    });
  }
});

//api per acquisire tutti i tutor salvati nel file tutors.json
app.get("/printAll", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);
  //invia la risposta la client
  res.status(200).json(tutors);
});

//funzione di validazione dehli input, in particolare controlla se l'email è valida,
//cioè se cointiene il carattere @, e se non è presente nel database
function validazioneEmail(email, t) {
  let esito = true;
  let tutorsByEmail = t.filter(ricercaEmail, email);
  
  if (tutorsByEmail.length!= 0 || email.toString().indexOf("@") == -1) {
    //se l'email è già presente oppure se l'email inserita non contiene il carettere @ l'email non è valida
    esito = false;
  }
  //se non entra nell'if allora l'email è valida
  return esito;
}

function validazioneNuovoEsame(nuovoEsame, e) {
  let esito = true;
  let esami = e.filter(ricercaEsame, nuovoEsame);
  //se dall'operazione di filter risulta che il nuovo esame da inserire è
  //gia' presente, l'esito della validazione sara' false
  if (esami.length!= 0 ) {
    esito = false;
  }
  //se non entra nell'if allora il nuovo esame è valido
  return esito;
}

//funzione che filtra i tutor in base alla email
function ricercaEmail(elemento) {
  if (elemento.email.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base all'università
function ricercaUniversità(elemento) {
  if (elemento.universita.toString().toLowerCase().includes(this.toString().toLowerCase())) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al corso
function ricercaCorso(elemento) {
  if (elemento.corso.toString().toLowerCase().includes(this.toString().toLowerCase())) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al nome
function ricercaNome(elemento) {
  if (elemento.nome.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al cognome
function ricercaCognome(elemento) { 
  if (elemento.cognome.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per di ricerca tra gli esami di un tutor
function ricercaEsame(elemento) { 
  if (elemento.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}
