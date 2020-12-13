var userModel = require('../models/UserModel');
var portfolioModel = require('../models/PortfolioModel');
const api = require('../stockAPIs/api');





//Testing for the search for stock function with a user that we know has some tickers  
test('getting the users already purchased tickers', async function(){
    var result = await userModel.getUserByUsername('Bhuitt1');
    var portfolioTickers = await portfolioModel.getPortfolioTickers(result.portfolioID);
    var apiQuotes = await api.getPortfolioQuotes(portfolioTickers);
    expect( typeof apiQuotes).toBe("object");
})


//Testing for the search for stock function with a stochk ticker that we know does not have any ticker
test('getting the user that does not have any ticker', async function(){
    var result = await userModel.getUserByUsername('Ssabeti1');
    var portfolioTickers = await portfolioModel.getPortfolioTickers(result.portfolioID);
    var apiQuotes = await api.getPortfolioQuotes(portfolioTickers);
    expect( typeof apiQuotes).toBe("string");
})

// //Testing the getYahooFunction
test('Testing getMultipleYahooQuotes for some tickers that we know exsist', async function() {
    let results = await api.getYahooMultipleQuotes("AAPL, TSLA");
    expect( typeof results).toBe("object");
    expect(results.length).not.toBe(0);

})

// //Testing the getYahooFunction
test('Testing getMultipleYahooQuotes for a stock that we know does not exist', async function() {
    let results = await api.getYahooMultipleQuotes("Dina");
    expect( results.length).toBe(0);

})