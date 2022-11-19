const express = require("express");
const app = express();
const fs = require("fs");

//dichiarazione della porta del server
app.listen(3000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//dichiarazione della variabili globali
let users = [];
let tutors = [];

//homepage del sito
app.get("/home", (req, res) => {
  res.render("home.html");
});

//pagina del login
app.get("/home/addTutor", (req, res) => {
  res.render("addTutor.ejs");
});

app.post("/home/addTutor", (req, res) => {
  //salvataggio del tutor del database
  let esito = validazioneInput(req.body.email, users);
  if (esito == false) {
    console.log("ERRORE! L'email non è valida.");
    res.redirect("/badRequest");
  } else {
    //facciamo la read del file per modificarlo
    let data = fs.readFileSync("tutors.json");
    tutors = JSON.parse(data);

    //aggiungo il tutor all'array dei tutor
    tutors.push({
      id: Date.now().toString(),
      nome: req.body.nome,
      cognome: req.body.cognome,
      email: req.body.email,
      universita: req.body.universita,
      corso: req.body.corso,
      esami:[]  
    });
    //effettuo il writeback nel file
    data = JSON.stringify(tutors, null, 2);
    fs.writeFileSync("tutors.json", data);

    console.log("File written successfully");
    console.log(tutors);
    res.redirect("/ok").json("tutors.json");
  }
});

app.put("/home/addExam", (req,res) =>{
  //dalla richiesta predìndo l'id del tutor a cui effettuare la modifica
  let idTutor = req.body.id;
  //facciamo la read del file per modificarlo
  let data = fs.readFileSync("tutors.json");
  tutors = JSON.parse(data);
  //effettuo la ricerca del tutor corrispondente
  let tutorRicercato = tutors.filter(ricercaId, idTutor);
  console.log(tutorRicercato);
  if(tutorRicercato == 0){
    res.redirect("/notFound");
  }
  //se il tutor è stato trovato effettuo la modifica
  tutors.splice(idTutor, 1);
  tutorRicercato.esami.push(req.body.newExam);
  
  //effettuo il writeback
  tutors.push(tutorRicercato);
  data = JSON.stringify(tutors, null, 2);
  fs.writeFileSync("tutors.json", data);
  //mando risposta
  res.status(201).json({
    message: "Modifiche effettuate!",
    status: 201
  }) 
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
app.get("/home/deleteTutorById", (req, res) => {
  res.render("deleteTutor.ejs");
});

//api per eliminare un utente dal database ricercandolo in base all'id
app.delete("/home/deleteTutorById", (req, res) => {
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
      data = JSON.stringify(tutors, null, 2);
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

app.put("/home/updateTutor")

//api per settare lo status
app.get("/ok", (req, res) => {
  res
    .status(200)
    .json({ message: "L'operazione è andata a buon fine.", status: 200 });
});

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
  if (elemento.universita.toString().toLowerCase() === this.toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al corso
function ricercaCorso(elemento) {
  if (elemento.corso.toString().toLowerCase() === this.toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al nome
function ricercaNome(elemento) {
  if (elemento.nome.toString().toLowerCase() === this.toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al cognome
function ricercaCognome(elemento) {
  if (elemento.cognome.toString().toLowerCase() === this.toLowerCase()) {
    return true;
  }
}

//funzione per la ricerca dei tutor in base al cognome
function ricercaId(elemento) {
  if (elemento.id === this) {
    return true;
  }
}
