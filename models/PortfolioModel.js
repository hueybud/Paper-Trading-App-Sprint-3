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
            var tickerList = [];
            console.log(result[0]);
            for (elem in result[0].stocks) {
                tickerList.push(result[0].stocks[elem].ticker);
            }
            resolve(tickerList);
        })
    })
}

function addPortfolio(portfolioID) {
    return new Promise(function(resolve, reject){
        var newPortfolio = new Portfolio({portfolioID: portfolioID})
        newPortfolio.save(function(err, portfolioAdded){
            resolve("portfolio added");
        })
    }) 
}

module.exports.getPortfolio = getPortfolio;
module.exports.getPortfolioTickers = getPortfolioTickers;
module.exports.addPortfolio = addPortfolio;


