const express = require("express");
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
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
    User.findOne({email : req.body.email})
        .then(user => {
          if(user){
             return res.status(400).json({email : 'Email Already Exists'});
          }
          else
          {
            // const newAvatar = gravatar({
            //    email : req.body.email,
            //    s : '200',
            //    r: 'pg',
            //    d:'mm'
            // });
            const newUser = new User({
                name : req.body.name,
                email : req.body.email,
                // avatar : newAvatar,
                //password : req.body.password
            });
            bcrypt.genSalt(10 , (err , salt) => {
                  bcrypt.hash(req.body.password , salt , (err , hash) => {
                    //  if(err)  throw err;
                       newUser.password = hash;
                       newUser.save()
                              .then(user => res.json(user))
                              .catch(err => console.log(err))
                     
                  });
            });
          }
        });
});


// @route  POST api/users/login
// @Desc   login user
// @access public

router.post('/login',(req , res) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email})
          .then(user => { 
            if(!user)
            {
              return res.status(404).json({email : "User not found"});
            }
    // Check password
    bcrypt.compare(password , user.password)
          .then(match => {
              if(match){
                res.json({msg : "Success"});
              }
              else
              {
                res.status(404).json({password : "password incorrect"});
              }
          })
          });
});

module.exports = router;
