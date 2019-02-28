const router = require("express").Router();
const bcrypt = require("bcryptjs");

const tokenService = require("./token-service");
const Users = require("../users/users-model");

router.post("/register", (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password, 10);
  user.password = hash;

  if (!user.username || !user.password) {
    res.status(400).json({ message: "Please enter a username and password" });
  } else {
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(() => {
        res.status(500).json({ message: "Server error" });
      });
  }
});

router.post("/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = tokenService.generateToken(user);
        res.status(200).json({
          message: `Hey ${user.username}! Here's your token!`,
          token
        });
      } else {
        res.status(401).json({ message: "You shall not pass!" });
      }
    })
    .catch(() => res.status(500).json({ message: "Server error" }));
});

module.exports = router;
