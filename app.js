var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var session = require('express-session');
app.use(session({ secret: 'ilovemet'}));
const bcrypt = require('bcrypt');
const saltRounds = 10;


var portfolioModel = require('./models/PortfolioModel');
var userModel = require('./models/UserModel');
var stockAPIs = require('./stockAPIs/api');

app.set('view engine', 'ejs');
app.use('/assets', express.static(__dirname + '/assets'));

// USERS AND PORTFOLIOS SHARE THE SAME ID
var dbConnectionFailure = false;

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

app.listen('3000', function() {
  console.log('listening on port 3000 :)');
}).on('error', function(err){
  console.log(err);
})

app.get('/', function (req, res) {
  if (req.session.theUser) {
    res.render('index', { userFirstName: req.session.theUser.userFirstName});
  } else {
    res.render('index');
  }
})

app.get('/index', function (req, res) {
  if (req.session.theUser) {
    res.render('index', { userFirstName: req.session.theUser.userFirstName});
  } else {
    res.render('index');
  }
});

app.get('/getIndexes', async function(req, res){
  let indexResult = await stockAPIs.getIndexes();
  res.json(indexResult);
})

app.get('/dbConnectionError', function (req, res) {
  if (req.session.theUser) {
    res.render('dbConnectionError', { userFirstName: req.session.theUser.userFirstName});
  } else {
    res.render('dbConnectionError');
  }
})

app.get('/dashboard', async function(req, res){
  let portfolioObj = await portfolioModel.getPortfolio(req.session.theUser.portfolioID);
  let portfolioTickers = await portfolioModel.getPortfolioTickers(req.session.theUser.portfolioID);
  let apiQuotes = await stockAPIs.getPortfolioQuotes(portfolioTickers);
  console.log(portfolioObj);
/*   let netValue = +portfolioObj.principal + +portfolioObj.gain;
  let allDayGain = 0;
  for (var i = 0; i < portfolioObj.stocks.length; i++) {
    // go through each stock and get it's day gain and add that to the net value
    var dayGain = (portfolioObj.stocks[i].purchaseValue*apiQuotes[Object.keys(apiQuotes)[i]].quote.changePercent).toFixed(2);
    portfolioObj.stocks[i]['dayGain'] = dayGain;
    allDayGain += parseFloat(dayGain);
  }
  netValue += parseFloat(allDayGain); */
  var dashboardComponents = calculatePortfolio(portfolioObj, apiQuotes);
  console.log('render');
  //console.log(netValue.toFixed(2));
  res.render('dashboard', {userFirstName: req.session.theUser.userFirstName, portfolioObj: dashboardComponents.portfolioObj, apiQuotes: dashboardComponents.apiQuotes, netValue: dashboardComponents.netValue, allDayGain: dashboardComponents.allDayGain, cash: dashboardComponents.portfolioObj.cash});
})

function calculatePortfolio(portfolioObj, apiQuotes) {
  let netValue = +portfolioObj.principal + +portfolioObj.gain;
  let allDayGain = 0;
  for (var i = 0; i < portfolioObj.stocks.length; i++) {
    // go through each stock and get it's day gain and add that to the net value
    var dayGain = (portfolioObj.stocks[i].purchaseValue*apiQuotes[Object.keys(apiQuotes)[i]].quote.changePercent).toFixed(2);
    portfolioObj.stocks[i]['dayGain'] = dayGain;
    allDayGain += parseFloat(dayGain);
  }
  netValue += parseFloat(allDayGain);
  return {portfolioObj: portfolioObj, apiQuotes: apiQuotes, netValue: netValue, allDayGain: allDayGain};
}

// SIGN IN AND REGISTER PATHS


async function signIn(req) {
  return new Promise(async function(resolve, reject){
    var errors = [];
    if (!req.body.userName.trim().match(/^(?=.*[0-9])(?=.*[A-Z])([a-zA-Z0-9]+)$/)) {
      errors.push("Username does not contain 1 uppercase letter and 1 number");
    }
    if (req.body.password.trim().length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (errors.length != 0) {
      resolve(errors[0]);
    } else {
      let userAccount = await userModel.getUserByUsername(req.body.userName);
      if (userAccount == undefined) {
        resolve("User does not exist");
      } else {
        var compareResult = false;
        console.log("on file password");
        console.log(userAccount.password);
        compareResult = bcrypt.compareSync("12345678", userAccount.password);
        if (compareResult) {
          req.session.theUser = userAccount;
          console.log("user did exist. was assigned the session name:" + req.session.theUser.userName);
          resolve("logged in");
        } else {
          console.log("user existed but password didn't match");
          resolve("Incorrect Password");
        }
      }
    }
  })
}

function createUser(req) {
  var insertObj = { "firstName": req.body.firstName, "lastName": req.body.lastName, "email": req.body.email, "createdOn": new Date().toLocaleDateString(), "admin": (req.body.admin == "true") || false, "role": req.body.role || "R", "videoProgress": [], "quizProgress": [] };
  return insertObj;
}

function register(req) {
  return new Promise(async function(resolve, reject){
    var errors = [];
    if(!req.body.userFirstName.trim().match(/^[A-Z]+$/i)) {
      errors.push("First name is not valid");
    }
    if(!req.body.userLastName.trim().match(/^[A-Z]+$/i)) {
      errors.push("Last name is not valid");
    }
    if(await userModel.getUserByUsername(req.body.userName) != undefined) {
      errors.push("User already exists")
    }
    if (!req.body.userName.trim().match(/^(?=.*[0-9])(?=.*[A-Z])([a-zA-Z0-9]+)$/)) {
      errors.push("Username does not contain 1 uppercase letter and 1 number");
    }
    if (req.body.password.trim().length < 8 || req.body.confirmPassword.trim().length < 8) {
      errors.push("Passwords must be at least 8 characters long");
    }
    if (req.body.password != req.body.confirmPassword) {
      errors.push("Passwords must match");
    }
    console.log(errors);
    if (errors.length != 0) {
      resolve(errors[0]);
    } else {
      console.dir(req.body);
      var createUserObj = userModel.user(req.body);
      createUserObj.userID = await userModel.getNewUserID();
      createUserObj.portfolioID = createUserObj.userID;
      createUserObj.password = bcrypt.hashSync(createUserObj.password, saltRounds)
      console.log("created user");
      console.log(createUserObj);
      await userModel.addUser(createUserObj);
      await portfolioModel.addPortfolio(createUserObj.userID);
      req.session.theUser = await userModel.getUserByUsername(req.body.userName);
      resolve("user added");
    }
  })
}

app.get('/signin', function (req, res) {
  if (req.session.theUser) {
    res.redirect('index');
  } else {
    res.render('signin', { errorMessage: [] });
  }
})

app.get('/register', function (req, res) {
  if (!req.session.theUser) {
    res.render('register', { errorMessage: [] });
  } else {
    res.redirect('index');
  }
})

app.post('/signin', async function (req, res) {
  console.dir(req.body.email);
  let signInResult = await signIn(req);
  if (signInResult == "logged in") {
    res.redirect('dashboard');
  } else {
    res.render('signin', { errorMessage: signInResult });
  }
})

app.get('/signout', function (req, res) {
  req.session.destroy();
  res.redirect('index');
})

app.post('/register', async function (req, res) {
  console.dir(req.body.email);
  let registerResult = await register(req);
  if (registerResult != "user added") {
    res.render('register', { errorMessage: registerResult});
  } else {
    res.redirect('dashboard');
  }
})


