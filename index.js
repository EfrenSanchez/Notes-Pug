//Dependencies
const express = require("express");
const cookieSession = require("cookie-session");
const mongoose = require("mongoose");

//Vars
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const cookieSecret = process.env.COOKIE_SECRET;

//Inits
const app = express();
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useCreateIndex: true });

//Shemas
const User = require("./models/User");

//Pug engine
app.set("view engine", "pug");
app.set("views", "views");

//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    secret: cookieSecret,
    maxAge: 24 * 60 * 60 * 1000
  })
);

app.use("/assets", express.static("assets")); //Statics files

app.use(async (req, res, next) => {
  // User auth
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
app.use("/", require("./routes"));

//Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", { err });
});

//Listening
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
