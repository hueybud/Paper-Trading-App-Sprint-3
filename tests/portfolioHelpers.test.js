var portfolioHelpers = require('../helpers/portfolioHelpers');

/*
    Testing the calculatePortfolio() function
*/

test('test a non empty portfolio', async function(){
    var portfolioObj = {
        "stocks": [
            {
              "ticker": "AAPL",
              "purchasePrice": 114.2,
              "purchaseQuantity": 50,
              "purchaseValue": 5710,
              "purchaseDate": "10/05/2020"
            },
            {
              "ticker": "TSLA",
              "purchasePrice": 424.55,
              "purchaseQuantity": 10,
              "purchaseValue": 4245.5,
              "purchaseDate": "10/02/2020"
            }
          ],
          "principal": 100000,
          "gain": 0,
          "cash": 90044.5
    }
    var apiQuotes = {
        AAPL: {
          quote: {
            symbol: 'AAPL',
            latestPrice: 122,
            changePercent: -0.1
          }
        },
        TSLA: {
          quote: {
            symbol: 'TSLA',
            latestPrice: 510,
            changePercent: -0.2
          }
        }
      }
    var result = await portfolioHelpers.calculatePortfolio(portfolioObj, apiQuotes);
    expect(result.portfolioObj.stocks[0].dayGain).toBe("-571.00");
    expect(result.portfolioObj.stocks[1].dayGain).toBe("-849.10");
    expect(result.allDayGain).toBe("-1420.10");
    expect(result.netValue).toBe("101244.50");
})

test('test an empty portfolio', async function(){
    var portfolioObj = {
        "stocks": [],
          "principal": 100000,
          "gain": 0,
          "cash": 100000
    }
    var apiQuotes = {}
    var result = await portfolioHelpers.calculatePortfolio(portfolioObj, apiQuotes);
    expect(result.allDayGain).toBe("0.00");
    expect(result.netValue).toBe("100000.00");
})