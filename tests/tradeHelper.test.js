var tradeHelper = require('../helpers/tradeHelper');

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
    var result = await tradeHelper.validator(req);
    expect(result[0]).toBe("valid");
    expect(typeof result[1]).toBe("object");
})

