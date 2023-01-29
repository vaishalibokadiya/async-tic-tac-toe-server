const express = require("express");
const {
  registerUser,
  loginUser,
  searchUserWithEmail,
} = require("../controllers/user");
const protect = require("../middleware/protect");
const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/search", protect, searchUserWithEmail);

module.exports = router;
