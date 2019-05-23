//Dependencies
const express = require("express");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const md = require("marked");

//Inits
const app = express();
mongoose.connect(
  "mongodb://Notes:notes123@ds259806.mlab.com:59806/notes-node-pug",
  { useNewUrlParser: true }
);

//Shemas
const Note = require("./models/Note");

//Pug
app.set("view engine", "pug");
app.set("views", "views");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    secret: "secret",
    maxAge: 24 * 60 * 60 * 1000
  })
);
app.use("/assets", express.static("assets"));

//Routes

/** GET => Note list */
app.get("/", async (req, res) => {
  const notes = await Note.find({});
  res.render("index", { notes });
});

/** GET => Form to create New Note */
app.get("/notes/new", async (req, res) => {
  const notes = await Note.find({});
  res.render("new", { notes });
});

/** POST  => Create a New Note*/
app.post("/notes", async (req, res, next) => {
  const data = {
    title: req.body.title,
    body: req.body.body
  };

  try {
    const note = new Note(data);
    await note.save();
  } catch (err) {
    return next(err);
  }

  res.redirect("/");
});

/** GET (id) => Show a Note */
app.get("/notes/:id", async (req, res) => {
  const notes = await Note.find({});
  const note = await Note.findById(req.params.id);

  res.render("show", { notes, currentNote: note, md: md });
});

/** PATCH (id) => Update a Note */
app.patch("/notes/:id", async (req, res, next) => {
  const note = await Note.findById(req.params.id);

  note.title = req.body.title;
  note.body = req.body.body;

  try {
    await note.save();
  } catch (err) {
    return next(err);
  }
  res.status(204).send({});
});

/** DELETE (id) => Delete a Note */
app.delete("/notes/:id", async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id });
    res.status(204).send({});
  } catch (err) {
    return next(err);
  }
});

/** GET (id) => Form to edit a note */
app.get("/notes/:id/edit", async (req, res) => {
  const notes = await Note.find();
  const note = await Note.findById(req.params.id);

  res.render("edit", { notes, currentNote: note });
});

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { err });
});

//Listening
app.listen(4000, () =>
  console.log("🚀 Server running on http://localhost:4000")
);
