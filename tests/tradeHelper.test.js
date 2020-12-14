var tradeHelper = require('../helpers/tradeHelper');
var portfolioModel = require('../models/PortfolioModel');
var orderHelpers = require('../helpers/orderHelpers');
var stockAPIs = require('../stockAPIs/api');

beforeEach(() => {
    jest.resetModules();
  });

afterEach(() => {
    jest.clearAllMocks()
})
/*
    Testing the validator() function
*/
test('validating input where the latest price can not be found', async function(){
    var req = {
        body: {
            ticker: 'DINASOUR',
            shares: 0,
            tradeOption: "Junk"
        }
    }
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve("stock quote could not be created");
        })
    })
    var result = await tradeHelper.validator(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("Cannot find the price for the given stock");
})

test('validating input where the amount of shares is less than 1', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 0,
            tradeOption: "Junk"
        }
    }
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 115});
        })
    })
    var result = await tradeHelper.validator(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("Cannot trade less than 1 share of stock");
})

test('validating input where the trade option is neither buy or sell', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 10,
            tradeOption: "Junk"
        }
    }
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 115});
        })
    })
    var result = await tradeHelper.validator(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("Trade must be either a Buy or a Sell");
})

test('validating input where the criteria is valid', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 10,
            tradeOption: "Buying"
        }
    }
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 115});
        })
    })
    var result = await tradeHelper.validator(req);
    expect(result[0]).toBe("valid");
    expect(typeof result[1]).toBe("object");
})

/*
    Testing the tradeStock() function
*/

test('testing trying to buy an amount of stock that is more than amount of cash the user has in their portfolio', async function(){
    var req = {
        body: {
            ticker: 'FB',
            shares: 10,
            tradeOption: "Buying"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    jest.spyOn(portfolioModel, 'getPortfolio').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            var portfolio = {
                "cash": 0
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("Total cost of purchased stock must not exceed cash balance");
})

test('testing trying to buy an amount of stock that is less than the amount of cash the user has in their portfolio', async function(){
    var req = {
        body: {
            ticker: 'FB',
            shares: 10,
            tradeOption: "Buying"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    const spyOn1 = jest.spyOn(portfolioModel, 'getPortfolio');
    spyOn1.mockImplementation(() => {
        return new Promise(function(resolve, reject){
            console.log("mocking 50000 cash");
            var portfolio = {
                "cash": 50000
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(orderHelpers, 'buyStock').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve("mock return for the buy stock function");
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result).toBe("mock return for the buy stock function");
})

test('testing trying to buy an amount of stock that is the exact amount of cash the user has in their portfolio', async function(){
    var req = {
        body: {
            ticker: 'FB',
            shares: 10,
            tradeOption: "Buying"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    const spyOn1 = jest.spyOn(portfolioModel, 'getPortfolio');
    spyOn1.mockImplementation(() => {
        return new Promise(function(resolve, reject){
            console.log("mocking 50000 cash");
            var portfolio = {
                "cash": 2800
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(orderHelpers, 'buyStock').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve("mock return for the buy stock function");
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result).toBe("mock return for the buy stock function");
})

test('testing trying to sell a stock that is not in the users portfolio', async function(){
    var req = {
        body: {
            ticker: 'FB',
            shares: 10,
            tradeOption: "Selling"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    jest.spyOn(portfolioModel, 'getPortfolio').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            var portfolio = {
                "stocks": [
                    {
                    "ticker": "AAPL",
                    "purchasePrice": 114.2,
                    "purchaseQuantity": 50,
                    "purchaseValue": 5710,
                    "purchaseDate": "10/05/2020"
                    }
                ],
                "cash": 0
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("There are no shares of the inputted stock in your portfolio to sell");
})

test('testing trying to sell more shares of a stock than is in the users portfolio', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 100,
            tradeOption: "Selling"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    jest.spyOn(portfolioModel, 'getPortfolio').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            var portfolio = {
                "stocks": [
                    {
                    "ticker": "AAPL",
                    "purchasePrice": 114.2,
                    "purchaseQuantity": 50,
                    "purchaseValue": 5710,
                    "purchaseDate": "10/05/2020"
                    }
                ],
                "cash": 0
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result[0]).toBe("invalid");
    expect(result[1]).toBe("You cannot sell more shares than you own");
})

test('testing trying to sell less shares of a stock than is in the users portfolio', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 1,
            tradeOption: "Selling"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    jest.spyOn(portfolioModel, 'getPortfolio').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            var portfolio = {
                "stocks": [
                    {
                    "ticker": "AAPL",
                    "purchasePrice": 114.2,
                    "purchaseQuantity": 10,
                    "purchaseValue": 5710,
                    "purchaseDate": "10/05/2020"
                    }
                ],
                "cash": 0
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(orderHelpers, 'sellStock').mockImplementation(() =>{
        return new Promise(function(resolve, reject){
            resolve("mock return to call sell stock");
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result).toBe("mock return to call sell stock");
})

test('testing trying to sell the exact amount of shares of a stock than is in the users portfolio', async function(){
    var req = {
        body: {
            ticker: 'AAPL',
            shares: 5,
            tradeOption: "Selling"
        },
        session: {
            theUser: {
                portfolioID: 1
            }
        }
    }
    console.log(req.session.theUser.portfolioID);
    jest.spyOn(portfolioModel, 'getPortfolio').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            var portfolio = {
                "stocks": [
                    {
                    "ticker": "AAPL",
                    "purchasePrice": 114.2,
                    "purchaseQuantity": 5,
                    "purchaseValue": 5710,
                    "purchaseDate": "10/05/2020"
                    }
                ],
                "cash": 0
            }
            resolve(portfolio);
        })
    })
    jest.spyOn(orderHelpers, 'sellStock').mockImplementation(() =>{
        return new Promise(function(resolve, reject){
            resolve("mock return to call sell stock");
        })
    })
    jest.spyOn(stockAPIs, 'getStockQuoteNoEarnings').mockImplementation(() => {
        return new Promise(function(resolve, reject){
            resolve({latestPrice: 280});
        })
    })
    var result = await tradeHelper.tradeStock(req);
    expect(result).toBe("mock return to call sell stock");
})


