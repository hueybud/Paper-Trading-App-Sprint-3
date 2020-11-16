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
var loginHelpers = require('./helpers/loginHelpers');
var portfolioHelpers = require('./helpers/portfolioHelpers');

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
  console.log(req.query.range);
  let indexResult = await stockAPIs.getIndexes(req.query.range);
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
  if (!req.session.theUser) {
    res.redirect('signin');
  } else {
    let portfolioObj = await portfolioModel.getPortfolio(req.session.theUser.portfolioID);
    let portfolioTickers = await portfolioModel.getPortfolioTickers(req.session.theUser.portfolioID);
    let apiQuotes = await stockAPIs.getPortfolioQuotes(portfolioTickers);
    console.log(apiQuotes);
    console.log(portfolioObj);
    var dashboardComponents = await portfolioHelpers.calculatePortfolio(portfolioObj, apiQuotes);
    console.log('render');
    res.render('dashboard', {userFirstName: req.session.theUser.userFirstName, portfolioObj: dashboardComponents.portfolioObj, apiQuotes: dashboardComponents.apiQuotes, netValue: dashboardComponents.netValue, allDayGain: dashboardComponents.allDayGain, cash: dashboardComponents.portfolioObj.cash});
  }
})

app.get('/reporting', function (req, res) {
  res.render('reporting', { searchResult: [], noResultsParam: '', queryParams: req.query, paginationString: '' });
})

// SIGN IN AND REGISTER PATHS


async function signIn(req) {
  return new Promise(async function(resolve, reject){
    var signInResult = await loginHelpers.checkSignin(req);
    if (signInResult[0] == "logged in") {
      req.session.theUser = signInResult[1];
      resolve(signInResult[0])
    } else {
      resolve("Incorrect Password");
    }
  })
}

function register(req) {
  return new Promise(async function(resolve, reject){
    var registerResult = await loginHelpers.checkRegister(req);
    resolve(registerResult);
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


