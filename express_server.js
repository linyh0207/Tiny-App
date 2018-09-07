var express = require("express");
var app = express();
var PORT = 8080;
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set("view engine", "ejs");


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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function urlsForUser(id){
  var newDatabase = {};
    for (let key in urlDatabase){
      if ( id === urlDatabase[key].userID){
        newDatabase[key] = urlDatabase[key];
        newDatabase[key].longURL = urlDatabase[key].longURL;
      }
    }
  return newDatabase;
}

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}


app.get("/", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  res.redirect("urls")
});

app.get("/urls", (req, res) => {
let loggedIn = urlsForUser(req.cookies["user_id"]);
  if (req.cookies["user_id"]){
    let templateVars = {
      urls: loggedIn,
      username: users[req.cookies["user_id"]]
    };
    res.render("urls_index", templateVars);
  }
  return res.status(403).send("Please log in / register first.")
});





app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]){
    let templateVars = {username: users[req.cookies["user_id"]]};
    res.render("urls_new", templateVars);
    }
  return res.redirect("/login");
});

app.get("/urls/:id", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID){
  let templateVars = {
    shortURL: req.params.id,
    username: users[req.cookies["user_id"]]};
  res.render("urls_show", templateVars);
  }
});

app.post("/urls", (req, res) => {
  if(req.cookies["user_id"]){
    let randomId = generateRandomString();
      urlDatabase[randomId] = [randomId]
      urlDatabase[randomId].userID = req.cookies["user_id"];
      urlDatabase[randomId].longURL = req.body.longURL;
    res.redirect("urls");
  }
  res.status(403).send("Unauthorized access, please log in first!");
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrlKey = req.params['shortURL'];
  let longURL = urlDatabase[shortUrlKey].longURL;
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req,res) => {
if (req.cookies["user_id"] === urlDatabase[req.params.id].userID){
  delete urlDatabase[req.params.id];
}
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.id].userID){
  urlDatabase[req.params.id].longURL = req.body.longURL;
}
  res.redirect("/urls");

})

app.post("/login", (req, res) => {
  let {email, password } =req.body;

if (!email || !password ){
    return res.status(403).send("Something is missing! ")
    }

 for (let key in users) {
    if (users[key].email === email & users[key].password === password) {
          res.cookie("user_id", users[key].id);
          return res.redirect("/");
       }
    }
  return res.status(403).send("The username or password is incorrect.");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

app.get("/register", (req, res) => {
  res.render("reg");
})

app.post("/register", (req, res) => {
  let {email, password } =req.body

  if (email === "" || password === ""){
    res.status(400).send("Something is missing! ")
    }

  for (let key in users){
      if (users[key].email === email ) {
        return res.status(400).send("Sorry...username already taken")
      }
    }

    let userRandomID = generateRandomString();
        users[userRandomID] = {
        id: userRandomID,
        email: email,
        password: password
        }

      res.cookie("user_id", users[userRandomID]);
      res.redirect("/urls");
})


app.get("/login", (req, res) => {
  let templateVars = {
   username: req.cookies["user_id"]};
  res.render("login", templateVars);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
