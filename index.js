//Dependencies
const express = require("express");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");
const md = require("marked");

//Inits
const app = express();
mongoose.connect(
  "mongodb://<db:pass>@ds259806.mlab.com:59806/notes-node-pug",
  { useNewUrlParser: true, useCreateIndex: true }
);

//Shemas
const Note = require("./models/Note");
const User = require("./models/User");

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

const requireUser = (req, res, next) => {
  if (!res.locals.user) {
    return res.redirect("/login");
  }

  next();
};

app.use(async (req, res, next) => { // User auth
  const userId = req.session.userId;

  if (userId) {
    const user = await User.findById(userId);
    if (user) {
      res.locals.user = user;
    } else {
      delete req.session.userId;
    }
  }

  next();
});

//Routes

/** GET => Note list */
app.get("/", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  res.render("index", { notes });
});

/** GET => Form to create New Note */
app.get("/notes/new", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  res.render("new", { notes });
});

/** POST  => Create a New Note*/
app.post("/notes", requireUser, async (req, res, next) => {
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
app.get("/notes/:id", requireUser, async (req, res) => {
  const notes = await Note.find({ user: res.locals.user });
  const note = await Note.findById(req.params.id);

  res.render("show", { notes, currentNote: note, md: md });
});

/** PATCH (id) => Update a Note */
app.patch("/notes/:id", requireUser, async (req, res, next) => {
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
app.delete("/notes/:id", requireUser, async (req, res, next) => {
  try {
    await Note.deleteOne({ _id: req.params.id });
    res.status(204).send({});
  } catch (err) {
    return next(err);
  }
});

/** GET (id) => Form to edit a note */
app.get("/notes/:id/edit", requireUser, async (req, res) => {
  const notes = await Note.find();
  const note = await Note.findById(req.params.id);

  res.render("edit", { notes, currentNote: note });
});

/** */
app.get("/register", (req, res) => {
  res.render("register");
});

/** */
app.post("/register", async (req, res, next) => {
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

/** */
app.get("/login", (req, res) => {
  res.render("login");
});

/** */
app.post("/login", async (req, res, next) => {
  try {
    const user = await User.authenticate(req.body.email, req.body.password);
    if (user) {
      req.session.userId = user._id;
      console.log("Success");
      return res.redirect("/");
    } else {
      console.log("Email o contraseña no coinciden");
      res.render("login", { error: "Email o contraseña no coinciden" })
    }
  } catch (err) {
    return next(err);
  }
});

/** */
app.get("/logout", requireUser, (req, res) => {
  res.session = null;
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/login");
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
