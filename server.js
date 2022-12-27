const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//dichiarazione della variabili globali
let tutors = [];
let tutorRicercati = [];

app.get("/home", (req,res) =>{
  res.sendFile("/app/views/home.html");
})

app.post("/home/addTutor", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);

  //salvataggio del tutor del database
  let esito = validazioneInput(req.body.email, tutors);
  console.log(esito);
  if (esito == false) {
    console.log("ERRORE! L'email non è valida.");
    res.redirect("/badRequest");
  } else {
    //aggiungo il tutor all'array dei tutor
    tutors.push(req.body);

    //effettuo il writeback nel file
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);
    res.json({ message: "Tutor have been saved", status: 200 });
  }
});

//api che filtra i tutor in base all'università
app.get("/home/cercaUniversita", (req, res) => {
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");

  if (data != null) {
    const tutors = JSON.parse(data);
    //filtra i tutor in base all'università ricercata
    let tutorRicercati = tutors.filter(ricercaUniversità, req.query.universita);
    //controllo se la ricerca ha prodotto dei risultati
    if (tutorRicercati.length != 0) {
      res.status(200).json(tutorRicercati);
    } else {
      res.redirect("/notFound");
    }
  } else {
    res.redirect("/notFound");
  }
});

//api di ricerca dei tutor del database
app.get("/home/researchTutors", (req, res) => {
  let filtriRicerca = req.query.filtri;
  let data = fs.readFileSync("tutors.json");
  let tutorsByUni = [];
  let tutorsByName = [];

  if(data != null) {
    tutors = JSON.parse(data);
    
    switch(parseInt(filtriRicerca)){
      case 1:
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorRicercati = tutors.filter(ricercaUniversità, req.query.universita);
        res.redirect("/printAll");
      break;
      case 2:
        console.log(req.query.universita);
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);
        //successivamente filtriamo l'array rusultante dall'operazione precedente
        //per cercare i tutor di quella università che seguino il corso ricercato
        tutorRicercati = tutorsByUni.filter(ricercaCorso,req.query.corso);
        res.redirect("/printAll");
      break;
      case 3:
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);
        //poi filtra l'array risultante dall'operazione precedente in base al nome
        tutorsByName = tutorsByUni.filter(ricercaNome, req.query.nome);
        //infine filtra la''array risultante in base al cognome
        tutorRicercati = tutorsByName.filter(ricercaCognome, req.query.cognome);
        res.redirect("/printAll");
      break;
      default:
        tutorRicercati = tutors;
        res.redirect("/printAll");
      return;
    }
  } else {
    res.redirect("/notFound");
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
      console.log("File modified successfully!");
      console.log(deletedTutor);
      //invia la risposta la client
      res.status(200).json({
        message: "L'utente è stato rimosso!",
        utenteRimosso: deletedTutor,
      });
    } else {
      res.status(404).json({
        message:
          "ERRORE! Non esiste nel database un utente con id " + req.params.id,
        status: 404,
      });
    }
  }
});

//api di aggiornamento delle email dei tutor
app.put("/home/updateTutor/:id/:azione/:esame/:email", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);
  let azione = req.body.azione;
  //ricerca nell'array l'elemento con l'id richiesto
  let idTutor = tutors.findIndex((element) => element.id == req.params.id);

  //controllo se l'id corrisponde ad un tutor nel database
  if (idTutor != -1) {
    let tutorRicercato = tutors[idTutor];
    //in base al tipo di modifica eseguo
    switch (azione) {
      case "newExam":
        tutorRicercato.esami.push(req.params.esame);
        break;
      case "newEmail":
        tutorRicercato.email = req.params.email;
        break;
    }
    //effettuo il writeback
    tutors.fill(tutorRicercato, idTutor, 0);
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);
    console.log("File written successfully");
    //invia la risposta la client
    res.status(200).json({
      message: "L'utente è stato aggiornato!",
    });
  } else {
    //se non è presente mando in risposta un messaggio di errore
    res.status(404).json({
      message:
        "ERRORE! Non esiste nel database un utente con id " + req.params.id,
      status: 404,
    });
  }
});

app.get("/printAll", (req, res) => {
  res.status(200).json({
    message: "I tutor sono i seguenti",
    tutors: tutorRicercati
  });
});

//api per settare lo status
app.get("/badRequest", (req, res) => {
  res.sendStatus(400);
});

app.get("/notFound", (req, res) => {
  res
    .status(404)
    .json({ message: "La ricerca non è andata a buon fine!", status: 404 });
});

//funzione di validazione dehli input, in particolare controlla se l'email è valida,
//cioè se cointiene il carattere @, e se non è presente nel database
function validazioneInput(email, t) {
  let esito = true;
  let tutorsByEmail = t.filter(ricercaEmail, email);
  
  if (tutorsByEmail.length!= 0 || email.toString().indexOf("@") == -1) {
    //se l'email è già presente oppure se l'email inserita non contiene il carettere @ l'email non è valida
    esito = false;
  }
  //se non entra nell'if allora l'email è valida
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
  if (elemento.universita.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al corso
function ricercaCorso(elemento) {
  if (elemento.corso.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al nome
function ricercaNome(elemento) {
  console.log(elemento);
  if (elemento.name.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al cognome
function ricercaCognome(elemento) { 
  if (elemento.surname.toString().toLowerCase() === this.toString().toLowerCase()) {
    return true;
  }
}
