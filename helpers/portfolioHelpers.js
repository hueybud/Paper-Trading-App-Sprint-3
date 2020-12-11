function calculatePortfolio(portfolioObj, apiQuotes) {
    return new Promise(function(resolve, reject){
        let netValue = +portfolioObj.principal + +portfolioObj.gain;
        let allDayGain = 0;
        var totalGainOnAllPositions = 0;
        var totalGainArray = [];

        for (var i = 0; i < portfolioObj.stocks.length; i++) {
          // go through each stock and get it's day gain and add that to the net value
          var dayGain = (portfolioObj.stocks[i].purchaseValue*apiQuotes[Object.keys(apiQuotes)[i]].quote.changePercent).toFixed(2);
          portfolioObj.stocks[i]['dayGain'] = dayGain;
          allDayGain += parseFloat(dayGain);
          var totalGainForIndivStock = parseFloat(((+apiQuotes[Object.keys(apiQuotes)[i]].quote.latestPrice - +portfolioObj.stocks[i].purchasePrice)*portfolioObj.stocks[i].purchaseQuantity).toFixed(2));
          totalGainArray.push(totalGainForIndivStock);
          totalGainOnAllPositions += totalGainForIndivStock;
          console.log("total gain for this stock: " + totalGainForIndivStock);
          console.log("total gain so far:" + totalGainOnAllPositions);
        }
        netValue += parseFloat(totalGainOnAllPositions);
        resolve({portfolioObj: portfolioObj, apiQuotes: apiQuotes, netValue: netValue.toFixed(2), allDayGain: allDayGain.toFixed(2), totalGainArray: totalGainArray,totalGainOnAllPositions:totalGainOnAllPositions});
    })
}

module.exports.calculatePortfolio = calculatePortfolio;