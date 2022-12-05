const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//dichiarazione della variabili globali
let tutors = [];

//homepage del sito
app.get("/home", (req, res) => {
  res.sendFile("/app/views/home.html");
});

//pagina del login
app.get("/home/addTutor", (req, res) => {
  res.sendFile("/app/views/addTutor.html");
});

app.post("/home/addTutor", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);

  //salvataggio del tutor del database
  let esito = validazioneInput(req.body.email, tutors);
  if (esito == false) {
    console.log("ERRORE! L'email non è valida.");
    res.redirect("/badRequest");
  } else {
    //aggiungo il tutor all'array dei tutor
    tutors.push(req.body);
    console.log(tutors);

    //effettuo il writeback nel file
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);
  }
  res.json({ message: "Tutor have been saved", status: 200 });
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

//api che filtra i tutor in base all'università e il corso
app.get("/home/cercaUniversitaCorso", (req, res) => {
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");

  if (data != null) {
    const tutors = JSON.parse(data);
    //prima filtra tutti i tutor appartenenti all'università cercata
    let tutorRicercatiUni = tutors.filter(
      ricercaUniversità,
      req.query.universita
    );
    //successivamente filtriamo l'array rusultante dall'operazione precedente
    //per cercare i tutor di quella università che seguino il corso ricercato
    let tutorRicercati = tutorRicercatiUni.filter(
      ricercaCorso,
      req.query.corso
    );
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

//api che filtra i tutor in base all'università, nome e cognome
app.get("/home/cercaUniversitaNomeCognome", (req, res) => {
  const uni = req.query.universita.toString();
  let data = fs.readFileSync("tutors.json");

  if (data != null) {
    tutors = JSON.parse(data);

    //prima filtra tutti i tutor appartenenti all'università cercata
    let tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);

    //poi filtra l'array risultante dall'operazione precedente in base al nome
    let tutorsByNome = tutorsByUni.filter(ricercaNome, req.query.nome);

    //infine filtra la''array risultante in base al cognome
    let tutorRicercati = tutorsByNome.filter(ricercaCognome, req.query.cognome);
    console.log(tutorRicercati);

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
  let tutorRicercati = [];

  if(data != null) {
    tutors = JSON.parse(data);
    
    switch(parseInt(filtriRicerca)){
      case 1:
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorRicercati = tutors.filter(ricercaUniversità, req.query.universita);
        console.log(tutorRicercati);
      break;
      case 2:
        console.log(req.query.universita);
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);
        //successivamente filtriamo l'array rusultante dall'operazione precedente
        //per cercare i tutor di quella università che seguino il corso ricercato
        tutorRicercati = tutorsByUni.filter(ricercaCorso,req.query.corso);
        console.log(tutorRicercati);
      break;
      case 3:
        //prima filtra tutti i tutor appartenenti all'università cercata
        tutorsByUni = tutors.filter(ricercaUniversità, req.query.universita);
        //poi filtra l'array risultante dall'operazione precedente in base al nome
        tutorsByName = tutorsByUni.filter(ricercaNome, req.query.nome);
        //infine filtra la''array risultante in base al cognome
        tutorRicercati = tutorsByName.filter(ricercaCognome, req.query.cognome); 
        console.log(tutorRicercati);
      break;
      default:
        res.redirect("/badRequest");
      return;
    }
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

//pagina per la modifica dal database
app.get("/home/deleteTutor", (req, res) => {
  res.sendFile("/app/views/deleteTutor.html");
});

//api per eliminare un utente dal database ricercandolo in base all'id
app.delete("/home/deleteTutor", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  if (data != null) {
    //effettuo il parsing
    tutors = JSON.parse(data);

    //ricerca nell'array l'elemento con l'id richiesto
    let idTutor = tutors.findIndex((element) => element.id == req.body.id);

    //se esiste lo elimino
    if (idTutor != -1) {
      let deletedTutor = tutors.splice(idTutor, 1);
      //effettua il write back degli elementi aggiornati
      data = JSON.stringfy(tutors, null, 2);
      fs.writeFileSync("tutors.json", data);
      console.log("File written successfully");
      console.log(tutors);
      //invia la risposta la client
      res.status(200).json({
        message: "L'utente è stato rimosso!",
        utenteRimosso: deletedTutor,
      });
    } else {
      res.status(404).json({
        message:
          "ERRORE! Non esiste nel database un utente con id " + req.body.id,
        status: 404,
      });
    }
  }
});

//api di aggiornamento delle email dei tutor
app.put("/home/updates", (req, res) => {
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);
  let azione = req.body.azione;
  //ricerca nell'array l'elemento con l'id richiesto
  let idTutor = tutors.findIndex((element) => element.id == req.body.id);

  //controllo se l'id corrisponde ad un tutor nel database
  if (idTutor != -1) {
    let tutorRicercato = tutors[idTutor];
    //in base al tipo di modifica eseguo
    switch (azione) {
      case "esame":
        tutorRicercato.esami.push(req.body.esame);
        break;
      case "email":
        tutorRicercato.email = req.body.email;
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
        "ERRORE! Non esiste nel database un utente con id " + req.body.id,
      status: 404,
    });
  }
});

app.get("/home/research", (req, res) => {
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);

  res.json(tutors);
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
  console.log(tutorsByEmail);
  if (tutorsByEmail.lenght == 0 || email.toString().indexOf("@") == -1) {
    //se l'email è già presente oppure se l'email inserita non contiene il carettere @ l'email non è valida
    esito = false;
  }
  //se non entra nell'if allora l'email è valida
  return esito;
}

//funzione che filtra i tutor in base alla email
function ricercaEmail(elemento) {
  if (elemento.email.toString().toLowerCase() === this.toLowerCase()) {
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
