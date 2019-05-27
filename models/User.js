//Dependencies
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Schema
const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "🤷‍♀ Y tu nombre?"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "🤷‍♀ EH! Olvidaste la contraseña"]
  },
  email: {
    type: String,
    required: [true, "🤷‍♀ Cuál es tu correo?"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "👀 Eso no parece un email..."
    ],
    validate: {
      validator(v) {
        return mongoose
          .model("User")
          .findOne({ email: v })
          .then(u => !u);
      },
      message: "😪 Ups! ése email esta ya registrado"
    }
  }
});

// Hashing passwords. Before "save"
schema.pre("save", function(next) {
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

// Comparing crypt passwords
schema.statics.authenticate = async (email, password) => {
  const user = await mongoose.model("User").findOne({ email });
  if (user) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) reject(err);
        resolve(result === true ? user : null);
      });
    });
    return user;
  }

  return null;
};

module.exports = mongoose.model("User", schema);
