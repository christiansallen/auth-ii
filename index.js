const express = require("express");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const server = express();

const Users = require("./users/users-model.js");
const secret = process.env.JWT_SECRET || "secret, secret, secret";

server.use(helmet());
server.use(express.json());

server.post("/api/register", (req, res) => {
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

function generateToken(user) {
  const payload = {
    subject: user.id, // sub in payload is what the token is about
    username: user.username,
    department: ["student"]
    // ...otherData
  };

  const options = {
    expiresIn: "1d"
  };

  return jwt.sign(payload, secret, options);
}

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);
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

const authorized = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secret, (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "You aren't authorized" });
      } else {
        req.decodedJwt = decodedToken; // What does this do?
        next();
      }
    });
  } else {
    res.status(401).json({ message: "You aren't authorized!" });
  }
};

server.get("/api/users", authorized, (req, res) => {
  Users.find()
    .then(user => {
      res.status(200).json({ user, decodedToken: req.decodedJwt });
    })
    .catch(() => {
      res.status(500).json({ message: "Server error" });
    });
});

const port = 5000;
server.listen(5000, () => {
  console.log(`You are live on port ${port}!`);
});
