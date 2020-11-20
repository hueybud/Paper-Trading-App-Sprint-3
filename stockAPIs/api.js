const fetch = require('node-fetch');
var yahooFinance = require('yahoo-finance');
var fs = require('fs');
var path = require('path');
var api_key = fs.readFileSync(path.resolve(__dirname, "./iexAPI.txt"), "utf-8");

function getPortfolioQuotes(portfolioTickers) {
    return new Promise(async function(resolve, reject){
        var apiResponse = await fetch('https://cloud.iexapis.com/v1/stock/market/batch?&types=quote&symbols=' + portfolioTickers.toString() + '&token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse);
    })
}

function getIndexes(dateRange) {
    return new Promise(async function(resolve ,reject){
        var apiResponse = await fetch('https://sandbox.iexapis.com/stable/stock/market/batch?symbols=dia,qqq,spy&types=chart,quote&range=' + dateRange + '&token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse);
    })
}

function getStockQuote(ticker) {
    return new Promise(async function(resolve, reject){
        var apiResponse = await fetch('https://sandbox.iexapis.com/stable/stock/' + ticker + '/quote?token=' + api_key);
        apiResponse = await apiResponse.json();
        var earningsDate = await getEarningsDate(ticker);
        apiResponse['earningsDate'] = earningsDate.reportDate;
        resolve(apiResponse);
    })
}

function getYahooStockQuote(ticker) {
    return new Promise(async function(resolve, reject){
        yahooFinance.quote({symbol: ticker, modules: ['summaryDetail']}, function(err, result){
            resolve(result);
        })
    })
}

function getEarningsDate(ticker) {
    return new Promise(async function(resolve, reject){
        var apiResponse = await fetch('https://sandbox.iexapis.com/stable/stock/' + ticker + '/upcoming-earnings?token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse[0]);
    })
}

function getStockChart(ticker, dateRange) {
    return new Promise(async function(resolve ,reject){
        var apiResponse = await fetch('https://sandbox.iexapis.com/stable/stock/market/batch?symbols=' + ticker + '&types=chart,quote&range=' + dateRange + '&token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse);
    })
}

module.exports.getPortfolioQuotes = getPortfolioQuotes;
module.exports.getIndexes = getIndexes;
module.exports.getStockQuote = getStockQuote;
module.exports.getYahooStockQuote = getYahooStockQuote;
module.exports.getStockChart = getStockChart;