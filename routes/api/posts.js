const express = require("express");

const router = express.Router();

const mongoose = require("mongoose");

const passport = require("passport");

const Post = require("../../models/Post");

const Profile = require("../../models/Profile");

const validatePostInput = require("../../validation/post");

// @route  POST api/posts
// @Desc   Create Post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      res.status(404).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route  GET api/posts
// @Desc   Get Posts
// @access Public

router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json("No posts found"));
});

// @route  GET api/posts/:id
// @Desc   Get post by id
// @access Public

router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => {
      res.json(posts);
    })
    .catch(err => res.status(404).json("No Post found with this id"));
});

// @route  Delete api/posts/:id
// @Desc   Delete post by id
// @access Private

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(Profile => {
      Post.findById(req.params.id)
        .then(post => {
          //Check for post owner
          if (post.user.toString() != req.user.id) {
            return res
              .status(401)
              .json({ noauthorized: "User is not authorized" });
          }

          //Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(s404).json({ postnofound: "No post found" }));
    });
  }
);

// @route  POST api/posts/like/:id
// @Desc   Like post
// @access Private

router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(Profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          post.likes.unshift({ user: req.user.id });
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnofound: "No post found" }));
    });
  }
);

// @route  POST api/posts/unlike/:id
// @Desc   Like post
// @access Private

router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(Profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ noliked: "You have not liked this post" });
          }

          //Get remove index

          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);
          post.likes.splice(removeIndex, 1);
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnofound: "No post found" }));
    });
  }
);

// @route  POST api/posts/comment/:id
// @Desc   Post  a comment
// @access Private

router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      res.status(404).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          user: req.user.id
        };
        post.comments.unshift(newComment);
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnofound: "No post found" }));
  }
);

// @route  Delete api/posts/comment/:id/:comment_id
// @Desc   Remove comment from post
// @access Private

router.delete(
  "/comment/:id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
     Post.findById(req.params.id).then(post => {
       if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0)
       {
         res.status(404).json({commentnotexists : "Comment dost not exist"})
       }

       const removeindex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);
       post.comments.splice(removeindex,1);
       post.save().then(post => res.json(post));
     })
     .catch(err => res.status(404).json({ postnofound: "No post found" }));
  }
);

module.exports = router;
