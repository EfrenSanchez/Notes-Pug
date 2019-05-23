//Dependencies
const mongoose = require("mongoose");

//Schema
const NoteShema =  mongoose.Schema({
  title: {type: String, require: true},
  body: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
});

NoteShema.methods.truncateBody = function () {
  if (this.body && this.body.length > 75) {
    return this.body.substring(0, 70) + " ...";
  }
  return this.body;
};


module.exports = mongoose.model("Note", NoteShema);