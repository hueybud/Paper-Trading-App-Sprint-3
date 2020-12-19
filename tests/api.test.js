const api = require('../stockAPIs/api');

/*
    Testing the getStockQuote() function
*/

test('getting the stock quote for a stock that is known to exist (AAPL) from the IEX API', async function(){
    var result = await api.getStockQuote('AAPL');
    expect(result).not.toBe("stock quote could not be created");
    expect(typeof result).toBe("object");
})

test('getting the stock quote for a stock that is known to not exist (DINASOUR) from the IEX API', async function(){
    var result = await api.getStockQuote('DINASOUR');
    expect(result).toBe("stock quote could not be created");
})

/*
    Testing the getYahooStockQuote() function
*/

test('getting the stock quote for a stock that is known to exist (AAPL) from the Yahoo API', async function(){
    var result = await api.getYahooStockQuote('AAPL');
    expect(result).not.toBe(undefined);
})

test('getting the stock quote for a stock that is known to not exist (DINASOUR) from the Yahoo API', async function(){
    var result = await api.getYahooStockQuote('DINASOUR');
    expect(result).toBe(undefined);
})

/*
    Testing the getEarningsDate() function

    THE API ENDPOINT THAT THIS CALLS WAS DEPRECATED IN EARLY DECEMBER SO I HAVE COMMENTED OUT ONE OF THE TESTS
*/

/*

I have commented this out as it would fail with how the endpoint now works. It used to work before the endpoint deprecation.

test('getting the earnings date for a stock that is known to exist (AAPL) from the IEX API', async function(){
    var result = await api.getEarningsDate('AAPL');
    expect(typeof result).toBe("object");
    expect(typeof result.reportDate).toBe("string")
})

*/

test('getting the earnings date for a stock that is known to exist (AAXJ) but does not have a reported earnings date from the IEX API', async function(){
    var result = await api.getEarningsDate('AAXJ');
    expect(result).toBe("no earnings date found");
})

test('getting the earnings date for a stock that is known to not exist (DINASOUR) from the IEX API', async function(){
    var result = await api.getEarningsDate('DINASOUR');
    expect(result).toBe("no earnings date found");
})

/*
    Testing the getStockChart() function
*/

test('getting the stock chart for 1 day for a stock that is known to exist (AAPL) from the IEX API', async function(){
    var result = await api.getStockChart('AAPL', '1d');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).not.toBe(0)
})

test('getting the stock chart for 3 months for a stock that is known to exist (AAPL) from the IEX API', async function(){
    var result = await api.getStockChart('AAPL', '3m');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).not.toBe(0)
})

test('getting the stock chart for 1 day for a stock that is known to exist (AABA) but may not have reported data from the IEX API', async function(){
    var result = await api.getStockChart('AABA', '1d');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).toBe(0)
})

/*
This test worked during its sprint but the API endpoint has changed and therefore we are commenting out this test since it would fail

test('getting the stock chart for 3 months for a stock that is known to exist (AABA) from the IEX API', async function(){
    var result = await api.getStockChart('AABA', '3m');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).not.toBe(0)
})

*/

/*
    Testing the getIndexes() function
*/

test('getting the chart information for 1 day for the indexes (DOW Jones, S&P 500, and NASDAQ) from the IEX API', async function(){
    var result = await api.getIndexes('1d');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).not.toBe(0)
})

/*
This test worked during its sprint but the API endpoint has changed and therefore we are commenting out this test since it would fail

test('getting the chart information for an invalid amount of days (6 days) for the indexes (DOW Jones, S&P 500, and NASDAQ) from the IEX API', async function(){
    var result = await api.getIndexes('6d');
    expect(typeof result).toBe("object");
    expect(result[Object.keys(result)[0]]['chart'].length).toBe(0)
})

*/

/*
    Testing the getPortfolioQuotes() function
*/

test('get the stock information of a portfolio that has FB, MSFT, and AMD in the portfolio from the IEX API', async function(){
    var result = await api.getPortfolioQuotes(['FB', 'MSFT', 'AMD']);
    expect(typeof result).toBe("object");
    expect(Object.keys(result).length).toBe(3)
    expect(result[Object.keys(result)[0]]['quote']).not.toBe(0)
})

test('get the stock information of a portfolio that has no stocks in it from the IEX API', async function(){
    var result = await api.getPortfolioQuotes([]);
    expect(result).toBe("empty portfolio");
})

test('get the stock information of a portfolio that has a fake stock in it called DINASOUR in the portfolio from the IEX API', async function(){
    var result = await api.getPortfolioQuotes(['DINASOUR']);
    expect(result).toBe("error");
})



