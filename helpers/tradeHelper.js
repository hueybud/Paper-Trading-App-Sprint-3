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
            var portfolioObj = await portfolioModel.getPortfolio(req.session.theUser.portfolioID);
            var latestPrice = validatorResult[1]['latestPrice'];
            var shares = req.body.shares;
            var totalCost = (latestPrice * shares).toFixed(2);
            if (req.body.tradeOption == "Buying") {
                if (portfolioObj.cash < totalCost) {
                    // invalid
                } else {
                    // call buy stock with needed parameters
                    var buyResult = await buyStock(req.session.theUser.portfolioID, req.body.ticker.toUpperCase(), latestPrice, shares, totalCost);
                    resolve(buyResult);
                }
            }
            if (req.body.tradeOption == "Selling") {
                var stockInPortfolio = portfolioObj.stocks.find(itm => itm.ticker == req.body.ticker.toUpperCase());
                if (stockInPortfolio != undefined) {
                    // we have the stock in our portfolio
                    if (shares > stockInPortfolio.purchaseQuantity) {
                        // invalid
                    } else {
                        // call sell stock with needed parameters
                        // resolve result
                        var sellResult = await sellStock(req.session.theUser.portfolioID, req.body.ticker.toUpperCase(), latestPrice, shares, totalCost);
                        resolve(sellResult);
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
        var portfolioObj = await portfolioModel.getPortfolio(portfolioID);
        var stockInPortfolio = portfolioObj.stocks.findIndex(itm => itm.ticker == ticker);
        if (stockInPortfolio != -1) {
            // we have the stock in our portfolio and need to adjust cost basis
            var stockObj = portfolioObj.stocks[stockInPortfolio];
            var updatedPurchaseQuantity = parseFloat(+stockObj.purchaseQuantity + +shares);
            var updatedPurchaseValue = parseFloat((+stockObj.purchaseValue + +totalCost));
            var updatedPurchasePrice = parseFloat((updatedPurchaseValue / updatedPurchaseQuantity));
            var updatedPurchaseDate = new Date().toLocaleDateString();
            var updatedStockObj = {
                ticker: ticker,
                purchasePrice: updatedPurchasePrice,
                purchaseQuantity: updatedPurchaseQuantity,
                purchaseValue: updatedPurchaseValue,
                purchaseDate: updatedPurchaseDate
            }
            console.log("latest price of the stock: " + latestPrice);
            console.log(updatedStockObj);
            portfolioModel.Portfolio.update({"portfolioID": portfolioID, "stocks.ticker": ticker}, {$set: {"stocks.$.purchasePrice": updatedPurchasePrice, "stocks.$.purchaseQuantity": updatedPurchaseQuantity, "stocks.$.purchaseValue": updatedPurchaseValue, "stocks.$.purchaseDate": updatedPurchaseDate}})
            .then(result => {
                console.log(result);
                var cash = parseFloat(portfolioObj.cash - totalCost);
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": cash}})
                .then(result1 => {
                    resolve("updated stock in the portfolio");
                })
            })
            .catch(err => {
                console.log(err);
                resolve("error adding non new stock the portfolio");
            })
        } else {
            // we need to add this new stock to our portfolio
            var addStockObj = {
                ticker: ticker,
                purchasePrice: parseFloat(latestPrice),
                purchaseQuantity: parseFloat(shares),
                purchaseValue: parseFloat(totalCost),
                purchaseDate: new Date().toLocaleDateString()
            }
            portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$push: {stocks: addStockObj}})
            .then(result => {
                var cash = parseFloat((portfolioObj.cash - totalCost));
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": cash}})
                .then(result1 => {
                    resolve("updated stock in the portfolio");
                })
            })
            .catch(err => {
                console.log(err);
                resolve("error adding new stock to the portfolio");
            })
        }
    });
}

function sellStock(portfolioID, ticker, latestPrice, shares, totalCost) {
    return new Promise(async function(resolve, reject){
        var portfolioObj = await portfolioModel.getPortfolio(portfolioID);
        var stockInPortfolio = portfolioObj.stocks.findIndex(itm => itm.ticker == ticker);
        if (stockInPortfolio != -1) {
            // it will never equal -1 if called by trade() i'm just doing this to appease the unit testing gods
            // (latest price - cost basis) * shares = gain
            console.log("latest price of the stock: " + latestPrice);
            var stockObj = portfolioObj.stocks[stockInPortfolio];
            var gainOnStock = parseFloat(((+latestPrice - +stockObj.purchasePrice) * shares));
            console.log("gain on stock " + gainOnStock);
            var totalGain = parseFloat((+portfolioObj.gain + +gainOnStock));
            console.log("total gain " + totalGain);
            var revOnStock = parseFloat(totalCost);
            var updatedCash = parseFloat((+portfolioObj.cash + +revOnStock));
            // remaining purchase value = purchase value - (shares * cost basis)
            var updatedPurchaseValue = parseFloat(+stockObj.purchaseValue - (shares * stockObj.purchasePrice));
            // remaining shares = purchaseQuantity - shares;
            var updatedPurchaseQuantity = parseFloat(+stockObj.purchaseQuantity - +shares);
            if (updatedPurchaseQuantity > 0) {
                // we still have some of this stock
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID, "stocks.ticker": ticker}, {$set: {"stocks.$.purchaseQuantity": updatedPurchaseQuantity, "stocks.$.purchaseValue": updatedPurchaseValue}})
                .then(result => {
                    portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": updatedCash, "gain": totalGain}})
                    .then(result1 =>{
                        resolve("sold some stock");
                    })
                    .catch(err =>{
                        console.log(err);
                        resolve("error updating portfolio after selling some stock")
                    })
                })
                .catch(err => {
                    console.log(err);
                    resolve("error selling some of the stock");
                }) 
            } else {
                // we just sold all of our remaining shares of this stock
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID, "stocks.ticker": ticker}, {$pull: {"stocks": {"ticker": ticker}}})
                .then(result => {
                    portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": updatedCash, "gain": totalGain}})
                    .then(result1 =>{
                        resolve("sold all stock");
                    })
                    .catch(err =>{
                        console.log(err);
                        resolve("error updating portfolio after selling allstock")
                    })
                })
                .catch(err => {
                    console.log(err);
                    resolve("error selling all of the stock");
                }) 
            }
        } else {
            resolve("stock is not in the portfolio");
        }
    })
}

module.exports.tradeStock = tradeStock;