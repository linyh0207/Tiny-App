var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
var cookieParser = require('cookie-parser')
app.use(cookieParser())


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
   username: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    username: req.cookies["user_id"], };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomId = generateRandomString()
  urlDatabase[randomId] = req.body.longURL;
  res.redirect("urls");
});

app.get("/u/:shortURL", (req, res) => {
  let shortUrlKey = req.params['shortURL'];
  let longURL = urlDatabase[shortUrlKey];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
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




function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
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
