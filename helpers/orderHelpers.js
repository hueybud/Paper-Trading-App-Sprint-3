var portfolioModel = require('../models/PortfolioModel');

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
            portfolioModel.Portfolio.update({"portfolioID": portfolioID, "stocks.ticker": ticker}, {$set: {"stocks.$.purchasePrice": updatedPurchasePrice, "stocks.$.purchaseQuantity": updatedPurchaseQuantity, "stocks.$.purchaseValue": updatedPurchaseValue}})
            .then(result => {
                console.log(result);
                var cash = parseFloat(portfolioObj.cash - totalCost);
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": cash}})
                .then(result1 => {
                    console.log("updated stock in the portfolio");
                    resolve(["valid", "Purchased " + shares + " shares of " + ticker + " at $" + latestPrice + " for a total cost of $" + totalCost]);
                })
            })
            .catch(err => {
                console.log(err);
                console.log("error adding non new stock the portfolio");
                resolve(["invalid", "Error purchasing stock"])
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
                    console.log("added stock to the portfolio");
                    resolve(["valid", "Purchased " + shares + " shares of " + ticker + " at $" + latestPrice + " for a total cost of $" + totalCost]);
                })
            })
            .catch(err => {
                console.log(err);
                console.log("error adding new stock to the portfolio")
                resolve(["invalid", "Error purchasing stock"]);
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
                        console.log("sold some stock")
                        resolve(["valid", "Sold " + shares + " shares of " + ticker + " at $" + latestPrice + " for a total sale of $" + revOnStock + " and total gain of $" + gainOnStock.toFixed(2)]);
                    })
                    .catch(err =>{
                        console.log(err);
                        console.log("error updating portfolio after selling some stock")
                        resolve(["invalid", "Error selling stock"]);
                    })
                })
                .catch(err => {
                    console.log(err);
                    console.log("error selling some of the stock");
                    resolve(["invalid", "Error selling stock"]);
                }) 
            } else {
                // we just sold all of our remaining shares of this stock
                portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID, "stocks.ticker": ticker}, {$pull: {"stocks": {"ticker": ticker}}})
                .then(result => {
                    portfolioModel.Portfolio.updateOne({"portfolioID": portfolioID}, {$set: {"cash": updatedCash, "gain": totalGain}})
                    .then(result1 =>{
                        console.log("sold all stock")
                        resolve(["valid", "Sold " + shares + " shares of " + ticker + " at $" + latestPrice + " for a total sale of $" + revOnStock + " and total gain of $" + gainOnStock.toFixed(2)]);
                    })
                    .catch(err =>{
                        console.log(err);
                        console.log("error updating portfolio after selling allstock");
                        resolve(["invalid", "Error selling stock"]);
                    })
                })
                .catch(err => {
                    console.log(err);
                    console.log("error selling all of the stock");
                    resolve(["invalid", "Error selling stock"]);
                }) 
            }
        } else {
            resolve(["invalid", "Inputted stock is not in the portfolio"]);
        }
    })
}

module.exports.buyStock = buyStock;
module.exports.sellStock = sellStock;