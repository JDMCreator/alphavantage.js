# alphaVantage.js

**alphaVantage.js** is an unofficial JavaScript wrapper for [Alpha Vantage](https://www.alphavantage.co). It uses Promises and handles the limit of 5 requests per minute.

## Setup

Load the alphavantage.js file in your webpage, set your key and that's it ! Your key will be exposed, so make sure to keep your project private.

```html
<script type="text/javascript" src="alphavantage.js"></script>
<script type="text/javascript">
    alphaVantage.key = "EXAMPLEOFKEY"
</script>
```

## Limit of 5 requests per minute

If a request is denied because of the limit, the wrapper will wait `alphaVantage.delay` milliseconds (by default `61000`ms or 61 seconds) and will try again. If it is denied again, the wrapper will understand that you reached the 500 requests per day limit, will call the `alphaVantage.onlimit` event and will throw an error.

## Documentation

**alphaVantage.get**
Request data from Alpha Vantage.
`Promise alphaVantage.get(String functionName, String SymbolOrKeyword, Optional Object Options)`
Examples
```js
alphaVantage.get("CRYPTO_RATING","BTC").then(function(result){
        alert(result.fcasRating);
}).catch(console.error);
```
```js
alphaVantage.get("TIME_SERIES_WEEKLY","IBM",{outputsize:"full"}).then(function(result){
        alert("Last week volume : " + result.timeSeries[0].volume);
}).catch(console.error);
```
```js
alphaVantage.get("TRIMA","IBM",{
    "interval":"weekly",
    "time_period":10,
    "series_type":"open"
}).then(...).catch(...);
```
**alphaVantage.getRate**
Request data about rates from Alpha Vantage
`Promise alphaVantage.getRate(String functionName, String SymbolOrCurrencyFrom, String SymbolOrCurrencyTo, Optional Object Options)`
Examples
```js
alphaVantage.getRate("FX_WEEKLY","EUR","USD").then(function(result){
        alert("Last week close : " + result.timeSeries[0].close);
}).catch(console.error);
```

**alphaVantage.quote**
Request data about a quote from Alpha Vantage
`Promise alphaVantage.quote(String Symbol, Optional String Market)`
Examples
```js
alphaVantage.quote("IBM").then(console.dir).catch(console.error);
```
```js
alphaVantage.quote("SHOP","TSX").then(console.dir).catch(console.error);
```
**alphaVantage.rate**
Shortcut for `CURRENCY_EXCHANGE_RATE`.
`Promise alphaVantage.rate(String from, String to)`
Examples
```js
alphaVantage.rate("USD","EUR").then(...).catch(...)
```
**alphaVantage.rateIntra**
Shortcut for `FX_INTRADAY`.
`Promise alphaVantage.rateIntra(String from, String to, Optional String interval, Optional Boolean outputfull)`
The default interval value is `15min`. Examples :
```js
alphaVantage.rateIntra("USD","EUR").then(...).catch(...)
alphaVantage.rateIntra("USD","EUR","1min",true).then(...).catch(...)
```
**alphaVantage.search**
Search from keywords with Alpha Vantage
`Promise alphaVantage.search(String keywords)`
Examples
```js
alphaVantage.search("BA").then(function(result){
        alert("First result is : " + result.results[0].name);
}).catch(console.error);
```

## Response
The result you will get will have been transformed by the wrapper to make it more usable. Properties name will be corrected to use camel case and time series will be transformed in an Array sorted from the most recent.

For example :

```js
alphaVantage.rateIntra("USD","CAD","15min").then(function(result){
    var latestDay = result.timeSeries[0];
    latestDay.times[0] // Latest data
    latestDay.times[latestDay.times.length-1] // First data of the latest day
    var previousDay = result.timeSeries[1];
    previousDay.times[0] // Latest data of the previous day
    previousDay.times[previousDay.times.length-1] // First data of the previous day
}).catch(console.error)
```