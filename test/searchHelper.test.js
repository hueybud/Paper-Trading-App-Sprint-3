const searchHelper = require('../helpers/searchHelpers');

//Testing for the search for stock function with a stochk ticker that we know it exists
test('searching for the AAPL stock', async function(){
    var result = await searchHelper.searchForStock('AAPL');
    expect(typeof result).toBe("object");
    expect(result.length).not.toBe(0);

})

//Testing for the search for stock function with some stock that we know it does not exist
test('searching for the AAPL stock', async function(){
    var result = await searchHelper.searchForStock('DINASOR');
    expect(typeof result).toBe("object");
    expect(result.length).toBe(0);

})
