var userModel = require('../models/UserModel');
var portfolioModel = require('../models/PortfolioModel');
var stockAPIs = require('../stockAPIs/api');

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
        if (req.body.tradeOption == "Buying") {
            // get the real total price
            // get the user's cash
            // compare
        }
        if (req.body.tradeOption == "Selling") {

        }
    })
}

function tradeStock(req) {
    return new Promise(async function(resolve, reject){
        var validatorResult = await validator(req);
        if (validatorResult[0] == "invalid") {
            // invalid
        } else {
            var portfolioObj = portfolioModel.getPortfolio(req.session.theUser.portfolioID);
            var latestPrice = validatorResult[1]['latestPrice'];
            var shares = req.body.shares;
            var totalCost = (latestPrice * shares).toFixed(2);
            if (req.body.tradeOption == "Buying") {
                if (portfolioObj.cash < totalCost) {
                    // invalid
                } else {
                    // call buy stock with needed parameters
                    var buyResult = await buyStock(req.session.theUser.portfolioID, req.body.ticker, latestPrice, shares, totalCost);
                    resolve(buyResult);
                }
            }
            if (req.body.tradeOption == "Selling") {
                var stockInPortfolio = portfolioObj.stocks.find(itm => itm.ticker == req.body.ticker);
                if (stockInPortfolio != undefined) {
                    // we have the stock in our portfolio
                    if (shares > stockInPortfolio.purhcaseQuantity) {
                        // invalid
                    } else {
                        // call sell stock with needed parameters
                        // resolve result
                    }
                } else {
                    // invalid
                }
            }
        }
    })
}

function buyStock(portfolioID, ticker, latestPrice, shares, totalCost) {
    return new Promise(async function(resolve, reject){

    });
}