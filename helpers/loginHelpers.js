const bcrypt = require('bcrypt');
const saltRounds = 10;
var userModel = require('../models/UserModel');
var portfolioModel = require('../models/PortfolioModel');

function checkSignin(req) {
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
              console.log("on file password");
              console.log(userAccount.password);
              var compareResult = bcrypt.compareSync(req.body.password, userAccount.password);
              if (compareResult) {
                req.session.theUser = userAccount;
                console.log("user did exist. was assigned the session name:" + req.session.theUser.userName);
                resolve(["logged in", userAccount]);
              } else {
                console.log("user existed but password didn't match");
                resolve("Incorrect Password");
              }
            }
          }
    })
}

function checkRegister(req) {
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

module.exports.checkSignin = checkSignin;
module.exports.checkRegister = checkRegister;