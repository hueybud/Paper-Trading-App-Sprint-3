var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/papertrading', { useNewUrlParser: true });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
var portfolioModelSchema = new mongoose.Schema({
    portfolioID: Number,
    stocks: Array,
    principal: {type: Number, default: 100000},
    gain: {type: Number, default: 0},
    cash: {type: Number, default: 100000}
});

var Portfolio = new mongoose.model('portfolioConnection', portfolioModelSchema, 'portfolios');

function getPortfolio(portfolioID) {
    return new Promise(function(resolve, reject){
        Portfolio.find({portfolioID: portfolioID}, function(err, result) {
            console.log(result[0]);
            resolve(result[0]);
        })
    })
}

function getPortfolioTickers(portfolioID) {
    return new Promise(function(resolve, reject){
        Portfolio.find({portfolioID: portfolioID}, function(err, result) {
            if (result[0] != undefined) {
                var tickerList = [];
                console.log(result[0]);
                for (var elem in result[0].stocks) {
                    tickerList.push(result[0].stocks[elem].ticker);
                }
                resolve(tickerList);
            } else {
                resolve(undefined);
            }
        })
    })
}

function addPortfolio(portfolioID) {
    return new Promise(async function(resolve, reject){
        var portfolioExist = await getPortfolio(portfolioID);
        if (portfolioExist == undefined) {
            var newPortfolio = new Portfolio({portfolioID: portfolioID})
            newPortfolio.save(function(err, portfolioAdded){
                resolve("portfolio added");
            })
        } else {
            resolve("portfolio already exists");
        }
    }) 
}

function removePortfolio(portfolioID) {
    return new Promise(function(resolve, reject){
        Portfolio.deleteOne({portfolioID: portfolioID}, function(err, removed){
            resolve(removed);
        })
    })
}

module.exports.getPortfolio = getPortfolio;
module.exports.getPortfolioTickers = getPortfolioTickers;
module.exports.addPortfolio = addPortfolio;
module.exports.removePortfolio = removePortfolio;


