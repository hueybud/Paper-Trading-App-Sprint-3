const fetch = require('node-fetch');
var yahooFinance = require('yahoo-finance');
var fs = require('fs');
var path = require('path');
var api_key = fs.readFileSync(path.resolve(__dirname, "./iexAPI.txt"), "utf-8");

function getPortfolioQuotes(portfolioTickers) {
    return new Promise(async function(resolve, reject){
        if (portfolioTickers.length != 0) {
<<<<<<< HEAD
            var apiResponse = await fetch('https://cloud.iexapis.com/v1/stock/market/batch?&types=quote&symbols=' + portfolioTickers.toString() + '&token=' + api_key);
=======
            var apiResponse = await fetch('https://sandbox.iexapis.com/v1/stock/market/batch?&types=quote&symbols=' + portfolioTickers.toString() + '&token=' + api_key);
>>>>>>> 7ce4fa9e8a60b0060e89e51da98aee8b6eb997c7
            apiResponse.json().then(result => {
                resolve(result);
            }).catch(err => {
                resolve("error")
            })
        } else {
            resolve("empty portfolio")
        }
    })
}

function getIndexes(dateRange) {
    return new Promise(async function(resolve ,reject){
        var apiResponse = await fetch('https://cloud.iexapis.com/stable/stock/market/batch?symbols=dia,qqq,spy&types=chart,quote&range=' + dateRange + '&token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse);
    })
}

function getStockQuote(ticker) {
    return new Promise(async function(resolve, reject){
        var apiResponse = await fetch('https://cloud.iexapis.com/stable/stock/' + ticker + '/quote?token=' + api_key);
        apiResponse.json().then(async (result) => {
            console.log("stock quote has tried to be found, now let's try to get the earnings date");
            var earningsDate = await getEarningsDate(ticker);
            console.log(earningsDate);
            // earningsDate can equal the object or it can equal "no earnings date found"
            if (earningsDate != "no earnings date found") {
                console.log("earnings date found");
                result['earningsDate'] = earningsDate.reportDate;
            }
            console.log("HI");
            resolve(result);
        }).catch(err => {
            console.log("there was an error converting apiResponse to json");
            resolve("stock quote could not be created")
        })
    })
}

function getYahooStockQuote(ticker) {
    return new Promise(async function(resolve, reject){
        yahooFinance.quote({symbol: ticker, modules: ['price', 'summaryDetail']}, function(err, result){
            resolve(result);
        })
    })
}

function getEarningsDate(ticker) {
    return new Promise(async function(resolve, reject){
        var apiResponse = await fetch('https://cloud.iexapis.com/stable/stock/' + ticker + '/upcoming-earnings?token=' + api_key);
        apiResponse.json().then(result => {
            console.log("type of result:");
            console.log(result);
            if (typeof result == "object" && result.length > 0) {
                apiResponse = result;
                resolve(apiResponse[0]);
                console.log("earnings FOUND in getEarnings")
            } else {
                console.log("earnings NOT FOUND in getEarnings")
                resolve("no earnings date found");
            }
        }).catch(err => {
            console.log("earnings not found inside get earnings");
            resolve("no earnings date found");
        })
    })
}

// async function test() {
//     var result = await getPortfolioQuotes(['aapl', 'tsla']);
//     console.log(result);
// }

// test();

function getStockChart(ticker, dateRange) {
    return new Promise(async function(resolve ,reject){
        var apiResponse = await fetch('https://cloud.iexapis.com/stable/stock/market/batch?symbols=' + ticker + '&types=chart,quote&range=' + dateRange + '&token=' + api_key);
        apiResponse = await apiResponse.json();
        resolve(apiResponse);
    })
}

module.exports.getPortfolioQuotes = getPortfolioQuotes;
module.exports.getIndexes = getIndexes;
module.exports.getStockQuote = getStockQuote;
module.exports.getYahooStockQuote = getYahooStockQuote;
module.exports.getEarningsDate = getEarningsDate;
module.exports.getStockChart = getStockChart;