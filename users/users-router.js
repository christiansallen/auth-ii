const router = require("express").Router();

const Users = require("./users-model");
const authorized = require("../auth/authorized-middleware");

router.get("/", authorized, (req, res) => {
  Users.find()
    .then(user => {
      res.status(200).json(user);
    })
    .catch(() => {
      res.status(500).json({ message: "Server error" });
    });
});

module.exports = router;
