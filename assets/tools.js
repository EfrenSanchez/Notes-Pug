//Check users log
module.exports = requireUser = (req, res, next) => { 
if (!res.locals.user) {
    return res.redirect("/login");
  }

  next();
};