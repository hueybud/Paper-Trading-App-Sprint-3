function calculatePortfolio(portfolioObj, apiQuotes) {
    return new Promise(function(resolve, reject){
        let netValue = +portfolioObj.principal + +portfolioObj.gain;
        let allDayGain = 0;
        for (var i = 0; i < portfolioObj.stocks.length; i++) {
          // go through each stock and get it's day gain and add that to the net value
          var dayGain = (portfolioObj.stocks[i].purchaseValue*apiQuotes[Object.keys(apiQuotes)[i]].quote.changePercent).toFixed(2);
          portfolioObj.stocks[i]['dayGain'] = dayGain;
          allDayGain += parseFloat(dayGain);
        }
        netValue += parseFloat(allDayGain);
        resolve({portfolioObj: portfolioObj, apiQuotes: apiQuotes, netValue: netValue, allDayGain: allDayGain});
    })
}

module.exports.calculatePortfolio = calculatePortfolio;