const express = require("express");
const router = new express.Router();
const User = require("../model/user");
const auth = require("../middleware/auth");

//Creating users
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).json({
      success: false,
      error: e,
    });
  }
});

//Login users
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
    await User.save();
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

//Get all users
router.get("/users", auth, async (req, res) => {
  try {
    const user = await User.find();
    if (!user) {
      throw new Error("User not Found!");
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(404).send(e);
  }
});

//Logout Users
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//Deleting User
router.delete("/users/:id", auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id });
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
