const fs = require('fs');
const path = require("path");
function searchForStock(inputString) {
    return new Promise(function(resolve, reject){
        var exchangeJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../assets/stockDatabase/exchanges.json"), "utf-8"));
        var input = inputString.toUpperCase();
        var expression = `^${input}`
        var regex = new RegExp(expression, 'gm')
        var result = exchangeJSON.filter(itm => itm.ticker.match(regex) || itm.name.toUpperCase().match(regex));
        result = result.splice(0,10);
        console.log(result);
        console.log(result.length);
        resolve(result);
    })
}

// async function test() {
//     searchForStock('apple');
// }

// test();


module.exports.searchForStock = searchForStock;