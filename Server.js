const express = require("express");
const mongoose = require("mongoose");

const Users = require('./routes/api/users.js');
const Posts = require('./routes/api/posts');
const Profile = require('./routes/api/profile');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


// DB Config
const db = require("./Config/Keys").mongoURI;

// Connects to MongoDB
mongoose
        .connect(db)
        .then(() => {console.log("Successfully Connected")})
        .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello worlds");
});

// Use Routes
debugger
app.use('/api/users',Users);

app.use('/api/posts',Posts);

app.use('/api/profile',Profile);



const port = process.env.port || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
