//Dependencies
const { Router } = require("express");
const requireUser = require("../assets/tools");
const md = require("marked");
const alert = require("alert-node");

const router = new Router();

//Shemas
const Note = require("../models/Note");
const User = require("../models/User");

/** GET => Note list */
router.get("/", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  res.render("index", { notes });
});

// === NOTES ===
/** GET => Form to create New Note */
router.get("/notes/new", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  res.render("new", { notes });
});

/** POST  => Create a New Note*/
router.post("/notes", requireUser, async (req, res, next) => {
  const data = {
    title: req.body.title,
    body: req.body.body,
    user: res.locals.user
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
router.get("/notes/:id", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  const note = await Note.findById(req.params.id);

  res.render("show", { notes, currentNote: note, md: md });
});

/** PATCH (id) => Update a Note */
router.patch("/notes/:id", requireUser, async (req, res, next) => {
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
router.delete("/notes/:id", requireUser, async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id });
    res.status(204).send({});
  } catch (err) {
    return next(err);
  }
});

/** GET (id) => Form to edit a note */
router.get("/notes/:id/edit", requireUser, async (req, res) => {
  const notes = await Note.find();
  const note = await Note.findById(req.params.id);

  res.render("edit", { notes, currentNote: note });
});

// === LOGIN ===
/** GET */
router.get("/login", (req, res) => {
  res.render("login");
});

/** POST ==> User authentication */
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body.email, req.body.password);
    
    if (user) {
      req.session.userId = user._id;
      alert('howdy');

      return res.redirect("/");
    } else {
      alert('Email y/o contraseña no coinciden');
      
      res.render("login", { error: "Email y/o contraseña no coinciden" });
    }
  } catch (err) {
    return next(err);
  }
});

// === REGISTER ===
/** GET =>  Render new user's form */
router.get("/register", (req, res) => {
  res.render("register");
});

/** POST => New user's data */
router.post("/register", async (req, res, next) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name
  };

  try {
    const newUser = new User(data);
    await newUser.save();
  } catch (err) {
    return next(err);
  }

  res.redirect("/");
});

// === LOGout ===
/** GET ==> logout of web */
router.get("/logout", requireUser, (req, res) => {
  res.session = null;
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
});

module.exports = router;
