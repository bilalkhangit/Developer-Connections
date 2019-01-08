const express = require("express");

const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

//Load Validation

const validateProfileInput = require("../../validation/profile");

const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load Profile Model

const Profile = require("../../models/Profile");

//Load User Model

const User = require("../../models/User");


// @route  GET api/profile/test
// @Desc   Tests users route
// @access public
router.get("/test", (req, res) => {
  res.json({
    msg: "Profile Works"
  });
});

// @route  GET api/profile
// @Desc   GET get user profile
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          res.status(404).json(errors);
        } else {
          res.json(profile);
        }
      })
      .catch(err => res.status(404).json(errors));
  }
);



// @route  GET api/profile/user/:user_id
// @Desc   Get profile by user id
// @access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile
    .findOne({ user: req.params.user_id })
    .populate("user", ["name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});


// @route  GET api/profile/handle/:handle
// @Desc   Get profile by handle
// @access Public

router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

// @route  GET api/profile/all
// @Desc   Get all profiles
// @access Public


router.get("/all" , (req , res) => {
  const errors = {}
    Profile.find().populate("user", ["name"])
    .then(profiles => {
      if(!profiles){
        errors.noprofile = "There is no profiles"
        res.status(404).json(errors);
      }
      else
      {
        res.json(profiles);
      }
    })
    .catch(err =>res.status(404).json(err));
});

// @route  POST api/profile/experience
// @Desc   Add experience to profile
// @access Private


router.post("/experience" ,passport.authenticate("jwt",{session : false}), (req , res) => {
  const { errors, isValid } = validateExperienceInput(req.body);

  //check validation
  if (!isValid) {
    //Return any errors with 400 statuss
    return res.status(400).json(errors);
  }
    Profile.findOne({user : req.user.id})
    .then(profile => {
        const newExp = {
          title:req.body.title,
          company : req.body.company,
          location:req.body.location,
          from:req.body.from,
          to:req.body.to,
          current:req.body.current,
          description:req.body.description
        }
        profile.experience.unshift(newExp);
        new Profile(profile).save().then(profile => res.json(profile));
    })
    .catch(err =>res.status(404).json(err));
});



// @route  POST api/profile/education
// @Desc   Add education to profile
// @access Private


router.post("/education" ,passport.authenticate("jwt",{session : false}), (req , res) => {
  const { errors, isValid } = validateEducationInput(req.body);

  //check validation
  if (!isValid) {
    //Return any errors with 400 statuss
    return res.status(400).json(errors);
  }
    Profile.findOne({user : req.user.id})
    .then(profile => {
        const newEdu = {
          school:req.body.school,
          degree : req.body.degree,
          fieldOfstudy:req.body.fieldOfstudy,
          from:req.body.from,
          to:req.body.to,
          current:req.body.current,
          description:req.body.description
        }
        profile.education.unshift(newEdu);
        new Profile(profile).save().then(profile => res.json(profile));
    })
    .catch(err =>res.status(404).json(err));
});

// @route  DELETE api/profile/experience/:exp_id
// @Desc   Delete experience from profile
// @access Private


router.delete("/experience/:exp_id" ,passport.authenticate("jwt",{session : false}), (req , res) => {
 
    Profile.findOne({user : req.user.id})
    .then(profile => {
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);

        new Profile(profile).save().then(profile => res.json(profile));
    })
    .catch(err =>res.status(404).json(err));
});


// @route  DELETE api/profile/education/:edu_id
// @Desc   Delete experience from profile
// @access Private


router.delete("/education/:edu_id" ,passport.authenticate("jwt",{session : false}), (req , res) => {
 
  Profile.findOne({user : req.user.id})
  .then(profile => {
      const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

      profile.education.splice(removeIndex,1);

      new Profile(profile).save().then(profile => res.json(profile));
  })
  .catch(err =>res.status(404).json(err));
});


// @route  DELETE api/profile
// @Desc   Delete user and profile
// @access Private


router.delete("/" ,passport.authenticate("jwt",{session : false}), (req , res) => {
 
  Profile.findOneAndRemove({user : req.user.id})
  .then(() => {
       User.findOneAndRemove({_id : req.user.id}).then(() => {
         res.json({success : true});
       })
  })
  .catch(err =>res.status(404).json(err));
});

// @route  POST api/profile
// @Desc   Create or Edit user profile
// @access Private

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //check validation
    if (!isValid) {
      //Return any errors with 400 statuss
      return res.status(400).json(errors);
    }

    // Get fields
    // let errors = {};
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;

    //skills split into an array

    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //Social

    profileFields.Social = {};
    if (req.body.youtube) profileFields.Social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.Social.twitter = req.body.twitter;
    if (req.body.linkedin) profileFields.Social.linkedin = req.body.linkedin;
    if (req.body.facebook) profileFields.Social.facebook = req.body.facebook;
    if (req.body.instagram) profileFields.Social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = "Handle already exists";
            res.status(404).json(errors);
          }

          //Save Profile

          new Profile(profileFields)
            .save()
            .then(profile => {
              res.json(profile);
            })
            .catch(err => res.json(err));
        });
      }
    });
  }
);

module.exports = router;
