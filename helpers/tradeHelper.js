var userModel = require('../models/UserModel');
var portfolioModel = require('../models/PortfolioModel');
var stockAPIs = require('../stockAPIs/api');
var orderHelpers = require('./orderHelpers');

function validator(req) {
    return new Promise(async function(resolve, reject){
        var errors = [];
        var stockResult = await stockAPIs.getStockQuoteNoEarnings(req.body.ticker);
        if (stockResult == "stock quote could not be created" || typeof stockResult['latestPrice'] == "undefined") {
            errors.push("Cannot find the price for the given stock");
        }
        if (req.body.shares < 1) {
            errors.push("Cannot trade less than 1 share of stock");
        }
        if (req.body.tradeOption != "Buying" && req.body.tradeOption != "Selling") {
            errors.push("Trade must be either a Buy or a Sell");
        }
        if (errors.length != 0) {
            resolve(["invalid", errors[0]]);
        } else {
            resolve(["valid", stockResult]);
        }
    })
}

function tradeStock(req) {
    return new Promise(async function(resolve, reject){
        var validatorResult = await validator(req);
        if (validatorResult[0] == "invalid") {
            // invalid
            resolve(validatorResult);
        } else {
            var portfolioObj = await portfolioModel.getPortfolio(req.session.theUser.portfolioID);
            console.log(portfolioObj);
            var latestPrice = validatorResult[1]['latestPrice'];
            var shares = req.body.shares;
            var totalCost = (latestPrice * shares).toFixed(2);
            if (req.body.tradeOption == "Buying") {
                if (portfolioObj.cash < totalCost) {
                    // invalid
                    resolve(["invalid", "Total cost of purchased stock must not exceed cash balance"]);
                } else {
                    // call buy stock with needed parameters
                    var buyResult = await orderHelpers.buyStock(req.session.theUser.portfolioID, req.body.ticker.toUpperCase(), latestPrice, shares, totalCost);
                    console.log(buyResult);
                    resolve(buyResult);
                    // resolve("you got here and shouldn't have if you mocked correctly");
                }
            }
            if (req.body.tradeOption == "Selling") {
                var stockInPortfolio = portfolioObj.stocks.find(itm => itm.ticker == req.body.ticker.toUpperCase());
                if (stockInPortfolio != undefined) {
                    // we have the stock in our portfolio
                    if (shares > stockInPortfolio.purchaseQuantity) {
                        // invalid
                        resolve(["invalid", "You cannot sell more shares than you own"]);
                    } else {
                        // call sell stock with needed parameters
                        // resolve result
                        var sellResult = await orderHelpers.sellStock(req.session.theUser.portfolioID, req.body.ticker.toUpperCase(), latestPrice, shares, totalCost);
                        console.log(sellResult);
                        resolve(sellResult);
                    }
                } else {
                    resolve(["invalid", "There are no shares of the inputted stock in your portfolio to sell"]);
                    // invalid
                }
            }
        }
    })
}

module.exports.tradeStock = tradeStock;
module.exports.validator = validator;