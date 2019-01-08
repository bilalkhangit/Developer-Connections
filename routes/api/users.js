const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const key = require("../../Config/Keys");
const jwt = require("jsonwebtoken");
const passport = require("passport");
//Load Input Validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");
// Load user model

const User = require("../../models/User");

// @route  GET api/users/test
// @Desc   Tests users route
// @access public
router.get("/test", (req, res) => {
  res.json({
    msg: "User Works"
  });
});

// @route  POST api/users/register
// @Desc   Register user
// @access public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  //Check Validation
  if (!isValid) {
    res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      errors.email = "Email Already Exists";
      return res.status(400).json(errors);
    } else {
      // const newAvatar = gravatar({
      //    email : req.body.email,
      //    s : '200',
      //    r: 'pg',
      //    d:'mm'
      // });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email
        // avatar : newAvatar,
        //password : req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, (err, hash) => {
          //  if(err)  throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route  POST api/users/login
// @Desc   login user
// @access public

router.post("/login", (req, res) => {
  const { errors, isValid } = validateLoginInput(req.body);

  //Check Validation
  if (!isValid) {
    res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      return res.status(404).json({ errors });
    }
    // Check password
    bcrypt.compare(password, user.password).then(match => {
      if (match) {
        //  res.json({msg : "Success"});
        //User Matched
        const payload = { id: user.id, name: user.name };

        //Sign Token
        jwt.sign(
          payload,
          key.secretOrKey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          }
        );
      } else {
        errors.password = "password incorrect";
        res.status(404).json({ errors });
      }
    });
  });
});

// @route  GET api/users/current
// @Desc   Return current user
// @access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
