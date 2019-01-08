const express = require("express");
const mongoose = require("mongoose");

const Users = require('./routes/api/users.js');
const Posts = require('./routes/api/posts');
const Profile = require('./routes/api/profile');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


// DB Config
const db = require("./Config/Keys").mongoURI;

// Connects to MongoDB
mongoose
        .connect(db)
        .then(() => {console.log("MongoDB Successfully Connected")})
        .catch(err => console.log(err));



// Passport  config
require('./Config/passport')(passport);




// Use Routes

app.use('/api/users',Users);

app.use('/api/posts',Posts);

app.use('/api/profile',Profile);



const port = process.env.port || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
 