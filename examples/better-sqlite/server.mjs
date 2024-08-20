import NeutralinoApp from "node-neutralino";
import Database from 'better-sqlite3';

const app = new NeutralinoApp({
  url: "/",
  windowOptions: {
    enableInspector: false,
    minHeight: 600,
  }
})

app.init()

let db = null;

app.events.on("clientConnect", () => {
  db = new Database('notes.db');
  try {
    const createTableSQL = db.prepare('CREATE TABLE NOTES (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT);');
    createTableSQL.run()
  } catch (error) {
    if (error.message.includes("table NOTES already exists")) {
      // ignore
    }
    else {
      throw new Error(error)
    }
  }
})

app.events.on("backend:getNotes", () => {
  const getNotesSQL = db.prepare('SELECT * FROM NOTES');
  const notes = getNotesSQL.all();
  app.events.broadcast("frontend:getNotes", notes);
})

app.events.on("backend:createNote", (data) => {
  const createNoteSQL = db.prepare('INSERT INTO NOTES (content) VALUES (?)');
  createNoteSQL.run(data);
  app.events.broadcast("frontend:noteCreated");

  // refresh notes
  app.events.broadcast("backend:getNotes");
})