## Progetto di Piattaforme Digitali per la Gestione del Territorio

#### Nome: Maria Sole Moretti 
#### Matricola: 305531

## Introduzione
Il progetto P2P Tutoring rappresenta una Restful API con l'obiettivo di fornire e modificare informazioni sui vari tutor universitari d'Italia. 
Per verificarne la funzionalità i dati relativi ai tutor sono puramente inventati. Il progetto è stato sviluppato su Glitch.

Link Live Site: https://p2p-tutoring.glitch.me/home

## Descrizione
P2P Tutoring è un'applicazione Web in JavaScript realizzata con il framework NodeJS. Le funzionalità del progetto sono:
  - Poter ricercare all'interno del database specificando la chiave di ricerca;
  - Poter inserire un nuovo tutor;
  - Eliminare un tutor dal database;
  - Aggiornare alcuni dati di un tutto specifico;

Inoltre è stata realizzata un interfaccia grafica utilizzando i linguaggi html e css.

I file tutors.json, funge da database per l'applicazione web, è costituita da elementi json che contengono informazioni sui tutor. 
In particola per ogni tutor vengono specificati:
- ID, l'id univoco viene generato nel momento della registrazione del tutor nel database attraverso la funzione Date.now().toString();
- Nome, il nome ddel tutor;
- Cognome, il cognome del tutor;
- Email, contatto del tutor;
- Università, università ddel tutor;
- Corso, corso di laura del tutor;

## Endpoint di Operazioni CRUD

#### Richiesta GET di stampa del file tutors.json
- app.get("/home", (req,res) =>{});

#### Richiesta GET per la ricerca di uno o piu' tutor
I parametri della request sono passati attraverso query string.
- app.get("/home/searchTutors/:filtro/:valore", (req, res) => {});  

#### Richiesta POST per aggiungere un nuovo tutor
I parametri della request sono passati attraverso il body.
- app.post("/home/addTutor", (req, res) => {});

#### Richiesta DELETE per eliminare un tutor
I parametri della request sono passati attraverso query string.
- app.delete("/home/deleteTutor/:id", (req, res) => {});

#### Richiesta UPDATE per aggiornare email oppure lista degli esami di un tutor
I parametri della request sono passati attraverso query string.
- app.put("/home/updateTutor/:id/:azione/:modifica", (req, res) => {});

## Dipendenze
- Express.js: framework open-source Node.js per la programmazione di applicazioni web e mobile, consente di creare potenti API di routing e di impostare middleware per rispondere alle richieste HTTP.
- fs: modulo nativo che consete di eseguire diversi tipi di operazioni su file e directory

## HTML e CSS

