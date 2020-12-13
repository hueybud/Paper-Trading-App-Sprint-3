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