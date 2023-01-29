const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.registerUser = async (req, res, next) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).send("All fields are required.");
  }
  try {
    const user = new User({ name, username, email, password });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ token, user });
  } catch (error) {
    next(error);
  }
};

module.exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("All fields are required.");
  }
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Invalid credentials.");
    const isMatch = await user.comparePasswords(password);
    if (!isMatch) return res.status(401).send("Invalid credentials.");
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ token, user });
  } catch (error) {
    next(error);
  }
};

module.exports.searchUserWithEmail = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("Email is required.");
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found.");
    res.status(200).send({ user });
  } catch (error) {
    next(error);
  }
};
