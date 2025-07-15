function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("User is logged in:", req.session.user);
  next();
}

module.exports = requireLogin;
