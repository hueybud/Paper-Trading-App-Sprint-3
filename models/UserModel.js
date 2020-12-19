var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/papertrading', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var userModelSchema = new mongoose.Schema({
    userID: Number,
    userName: String,
    password: String,
    userFirstName: String,
    userLastName: String,
    portfolioID: Number,
    createdOn: String
});

var User = new mongoose.model('userConnection', userModelSchema, 'users');

function user(input) {
    var userObj = {userID: input.userID, userName: input.userName, password: input.password, userFirstName: input.userFirstName, userLastName: input.userLastName, portfolioID: input.portfolioID, createdOn: new Date().toLocaleDateString()};
    return userObj;
}

function getUserByUsername(userName) {
    return new Promise(function(resolve, reject){
        User.find({userName: userName}, function(err, result){
            resolve(result[0]);
        })
    })
}

function getNewUserID() {
    return new Promise(function(resolve, reject){
        User.find({}).sort({userID: -1}).exec(function(err, docs){
            if (docs.length == 0) {
                resolve(1)
            } else {
                resolve(docs[0].userID + 1);
            }
        })
    })
}

function addUser(user) {
    return new Promise(async function(resolve, reject){
        var doesUserExist = await getUserByUsername(user.userName);
        if (doesUserExist == undefined) {
            var newUser = new User(user);
            newUser.save(function(err, addedUser){
                resolve("user added");
            })
        } else {
            resolve("user already exists");
        }
    })
}

function removeUserByUsername(username) {
    return new Promise(function(resolve, reject){
        User.deleteOne({userName: username}, function(err, removed){
            resolve(removed);
        })
    })
}

async function test() {
    let result = await getUserByUsername("Bhuitt1");
    console.log(result);
    console.log(result == undefined)
}

//test();

module.exports.user = user;
module.exports.getUserByUsername = getUserByUsername;
module.exports.getNewUserID = getNewUserID;
module.exports.addUser = addUser;
module.exports.removeUserByUsername = removeUserByUsername;