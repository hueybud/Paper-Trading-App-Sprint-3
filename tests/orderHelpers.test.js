var portfolioModel = require('../models/PortfolioModel');
var orderHelpers = require('../helpers/orderHelpers');

/*
    Testing the buyStock() function
*/

test('testing buying a stock that is not already in the users portfolio', async function(){
    await portfolioModel.removePortfolio(300);
    await portfolioModel.addPortfolio(300);
    var result = await orderHelpers.buyStock(300, 'AAPL', 110, 10, 1100)
    expect(typeof result).toBe("object");
    expect(result.length).toBe(2);
    expect(result[0]).toBe("valid")
    expect(result[1]).toBe("Purchased " + 10 + " shares of " + 'AAPL' + " at $" + 110 + " for a total cost of $" + 1100)
    result = await portfolioModel.getPortfolio(300);
    expect(typeof result).toBe("object");
    expect(result.stocks[0].ticker).toBe('AAPL');
    expect(result.stocks[0].purchasePrice).toBe(110);
    expect(result.stocks[0].purchaseQuantity).toBe(10);
    expect(result.stocks[0].purchaseValue).toBe(1100);
    expect(result.cash).toBe(98900)
})

test('testing buying a stock that is already in the users portfolio', async function(){
    await portfolioModel.removePortfolio(300);
    await portfolioModel.addPortfolio(300);
    await orderHelpers.buyStock(300, 'AAPL', 110, 10, 1100)
    var result = await orderHelpers.buyStock(300, 'AAPL', 120, 10, 1200)
    expect(typeof result).toBe("object");
    expect(result.length).toBe(2);
    expect(result[0]).toBe("valid")
    expect(result[1]).toBe("Purchased " + 10 + " shares of " + 'AAPL' + " at $" + 120 + " for a total cost of $" + 1200);
    result = await portfolioModel.getPortfolio(300);
    expect(typeof result).toBe("object");
    expect(result.stocks[0].ticker).toBe('AAPL');
    expect(result.stocks[0].purchasePrice).toBe(115);
    expect(result.stocks[0].purchaseQuantity).toBe(20);
    expect(result.stocks[0].purchaseValue).toBe(2300);
    expect(result.cash).toBe(97700)
})

/*
    Testing the sellStock() function
*/

test('testing selling some but not all of a users stock', async function(){
    await portfolioModel.removePortfolio(300);
    await portfolioModel.addPortfolio(300);
    await orderHelpers.buyStock(300, 'AAPL', 110, 10, 1100);
    var result = await orderHelpers.sellStock(300, 'AAPL', 106, 7, 742)
    expect(typeof result).toBe("object");
    expect(result.length).toBe(2);
    expect(result[0]).toBe("valid")
    expect(result[1]).toBe("Sold " + 7 + " shares of " + 'AAPL' + " at $" + 106 + " for a total sale of $" + 742 + " and total gain of $" + "-28.00")
    result = await portfolioModel.getPortfolio(300);
    expect(result.stocks[0].ticker).toBe('AAPL');
    expect(result.stocks[0].purchasePrice).toBe(110);
    expect(result.stocks[0].purchaseQuantity).toBe(3);
    expect(result.stocks[0].purchaseValue).toBe(330);
    expect(result.cash).toBe(99642)
    expect(result.gain).toBe(-28)
})

test('testing selling all of a users stock', async function(){
    await portfolioModel.removePortfolio(300);
    await portfolioModel.addPortfolio(300);
    await orderHelpers.buyStock(300, 'AAPL', 110, 10, 1100);
    var result = await orderHelpers.sellStock(300, 'AAPL', 106, 10, 1060)
    expect(typeof result).toBe("object");
    expect(result.length).toBe(2);
    expect(result[0]).toBe("valid")
    expect(result[1]).toBe("Sold " + 10 + " shares of " + 'AAPL' + " at $" + 106 + " for a total sale of $" + 1060 + " and total gain of $" + "-40.00")
    result = await portfolioModel.getPortfolio(300);
    expect(typeof result.stocks[0]).toBe("undefined");
    expect(result.cash).toBe(99960)
    expect(result.gain).toBe(-40)
})