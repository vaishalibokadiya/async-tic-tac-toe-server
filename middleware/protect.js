const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  let token = req.headers.authorization;
  if (token) {
    try {
      token = token.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decodedToken._id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token." });
    }
  } else {
    res.status(401).json({ message: "No token provided." });
  }
};

module.exports = protect;
