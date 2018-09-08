var express = require("express");
var app = express();
var PORT = 8080;
var cookieSession = require('cookie-session')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['lighthouse'],
}))


var urlDatabase = {
  "b2xVn2": {
    userID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
 "bsdk43": {
    userID: "userRandomID",
    longURL: "http://www.google.ca"
  },
  "9sm5xK": {
    userID: "user2RandomID",
    longURL: "http://www.google.com"
  }
}

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

function urlsForUser(id){
  var newDatabase = {};
    for (let key in urlDatabase){
      if ( id === urlDatabase[key].userID){
        newDatabase[key] = urlDatabase[key];
        newDatabase[key].userID = urlDatabase[key].userID;
        newDatabase[key].longURL = urlDatabase[key].longURL;
      }
    }
  return newDatabase;
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.get("/", (req, res) => {
  let templateVars = {
    username: users[req.session.user_id]};
  res.render("welcome", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls");
  } else {
    let templateVars = {
    username: req.session.user_id};
    res.render("login", templateVars);
  }
})

app.get("/urls", (req, res) => {
let loggedIn = urlsForUser(req.session.user_id);
  if (req.session.user_id){
    let templateVars = {
      urls: loggedIn,
      username: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else{
    res.redirect("/");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id){
    let templateVars = {username: users[req.session.user_id]};
    res.render("urls_new", templateVars);
  } else{
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID){
    let templateVars = {
      shortURL: req.params.id,
      username: users[req.session.user_id]};
    res.render("urls_show", templateVars);
  } else{
  res.status(403).send("Please log in / register first.")
}
});

app.get("/u/:id", (req, res) => {
  for(let key in urlDatabase){
    if (req.params['id'] === key){
      let longURL = urlDatabase[key].longURL;
      res.redirect(longURL);
    }
  }
});

app.post("/urls", (req, res) => {
  if(req.session.user_id){
    let randomId = generateRandomString();
      urlDatabase[randomId] = [randomId]
      urlDatabase[randomId].userID = req.session.user_id;
      urlDatabase[randomId].longURL = req.body.longURL;
    res.redirect("/urls");
  } else{
  res.status(403).send("Please log in / register first.");
}
});

app.post("/urls/:id/delete", (req,res) => {
if (req.session.user_id === urlDatabase[req.params.id].userID){
  delete urlDatabase[req.params.id];
}
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID){
  urlDatabase[req.params.id].longURL = req.body.longURL;
}
  res.redirect("/urls");

})

app.post("/login", (req, res) => {
 let {email, password } = req.body;
  if (!email || !password ){
    res.status(403).send("Something is missing! ")
  }
  else {
      let flat = false;
      let userKey;
      for (let key in users){
        if (users[key].email === email){
          flag = true;
          userKey = key;
        }
      }
      if(flag){
        if (bcrypt.compareSync(password, users[userKey].password)){
          req.session.user_id = users[userKey].id;
          res.redirect("/urls");
        } else {
          res.status(403).send("The password is invalid.")
        }
      } else {
        res.status(403).send("The username is invalid.")
      }
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  res.render("reg");
})

app.post("/register", (req, res) => {
  let {email, password } = req.body;
  if (email === "" || password === ""){
      res.status(400).send("Something is missing! ");
  }
  else {
      let flag = false;
      for (let key in users){
        if (users[key].email === email ) {
          flag = true;
        }
      }
      if(flag){
        res.status(403).send("Sorry! This email has been already taken");
      } else {
        const hashedpassword = bcrypt.hashSync(password, 10);
        let userRandomID = generateRandomString();
        users[userRandomID] = {
          id: userRandomID,
          email: email,
          password: hashedpassword
        };
        req.session.user_id = users[userRandomID].id;
        res.redirect("/urls");

      }
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


