;(function() {
	"use strict";
	var AlphaVantage = function AlphaVantage() {
		var getJSON = function(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'json';
			xhr.onload = function() {
				var status = xhr.status;
				if (status === 200) {
					callback(xhr.response);
				} else {
					callback(xhr.response);
				}
			};
			xhr.send();
		};
		function debug(text){
			if(alphaVantage.debug){
				console.log(text);
			}
		}
		async function queryData(type, obj) {
			var that = alphaVantage;
			return new Promise(async function(callback) {
				obj = obj || {}
				obj.function = type.toUpperCase();
				obj.apikey = that.key;
				if (obj.market) {
					obj.symbol = obj.market + ":" + obj.symbol;
				}
				var str = "";
				for (var i in obj) {
					if (obj.hasOwnProperty(i)) {
						if (str !== "") {
							str += "&"
						} else {
							str += "?"
						}
						str += i + "=" + obj[i];
					}
				}
				getJSON("https://www.alphavantage.co/query" + str, async function(result) {
					if (result.Note && result.Note.indexOf("premium") > -1) {
						await timeout(that.delay);
						debug("Waiting 60sec");
						getJSON("https://www.alphavantage.co/query" + str, function(result) {
							if (result.Note && result.Note.indexOf("premium") > -1) {
								if(that.onlimit){this.onlimit.call(this)}
								throw new Error(result.Note);
							}
							callback(result);
						});
					}
					else if(result["Error Message"]){
						throw new Error(result["Error Message"]);
					}
					else {
						callback(result);
					}
				});
			});
		}

		function correctName(name) {
			return name.replace(/^[0-9]+\.\s+/, "").replace(/^([A-Z])/, function(full, a) {
				return a.toLowerCase();
			}).replace(/\s+([a-zA-Z])/g, function(full, a) {
				return a.toUpperCase();
			});
		}

		function correctValue(value) {
			if (/^\-?(?:[0-9]+|[0-9]+\.[0-9]+)$/.test(value)) {
				return Number(value);
			} else if (/^\-?(?:[0-9]+|[0-9]+\.[0-9]+)\%$/.test(value)) {
				return Number(value.replace("%",""))/100;
			} else if (/[0-9]+[-\/][0-9]+[-\/][0-9]+(?:\s+[0-9\:]+|)/.test(value)) {
				return new Date(value.replace(/\-/g, "/"));
			}
			return value;
		}

		function AlphaVantageData(obj) {
			this.data = obj;
			var meta, other;
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					if (i === "Meta Data") {
						meta = obj[i];
					} else {
						other = obj[i];
					}
				}
			}
			if (meta) {
				var metaObj = {};
				for (var i in meta) {
					if (meta.hasOwnProperty(i)) {
						metaObj[correctName(i)] = correctValue(meta[i]);
					}
				}
				this.meta = metaObj;
			}
			if (other) {
				var type = 0;
				// 0 = default, 1 = day series, 2 = time series, 3 = Array of results
				if (Array.isArray(other)) {
					type = 3;
				}
				for (var i in other) {
					if (other.hasOwnProperty(i)) {
						if (/^[0-9]+\-[0-9]+\-[0-9]+$/.test(i)) {
							type = 1;
						} else if (/^[0-9]+\-[0-9]+\-[0-9]+\s+[0-9]/.test(i)) {
							type = 2;
						}
						break;
					}
				}
				var otherObj = [];
				if (type === 0) {
					for (var i in other) {
						if (other.hasOwnProperty(i)) {
							this[correctName(i)] = correctValue(other[i]);
						}
					}
				} else if (type === 1) {
					for (var i in other) {
						if (other.hasOwnProperty(i)) {
							var day = other[i],
								objDay = {}
							for (var j in day) {
								if (day.hasOwnProperty(j)) {
									objDay[correctName(j)] = correctValue(day[j]);
								}
							}
							objDay.date = new Date(i.replace(/\-/g, "/"));
							otherObj.push(objDay);
						}
					}
					otherObj.sort(function(a, b) {
						a = a.date;
						b = b.date;
						return a > b ? -1 : a < b ? 1 : 0;
					});
					this.timeSeries = otherObj;
				} else if (type === 2) {
					var days = {};
					for (var i in other) {
						if (other.hasOwnProperty(i)) {
							var time = other[i],
								objTime = {};
							for (var j in time) {
								if (time.hasOwnProperty(j)) {
									objTime[correctName(j)] = correctValue(time[j]);
								}
							}
							objTime.date = new Date(i.replace(/\-/g, "/"));
							objTime.time = i.replace(/^[0-9]+\-[0-9]+\-[0-9]+\s+/, "");
							var day = i.split(/\s+/)[0];
							if (!days[day]) {
								days[day] = {
									date: new Date(day.replace(/\-/g, "/")),
									times: []
								}
							}
							days[day].times.push(objTime);
						}
					}
					var timeSeries = [];
					for (var i in days) {
						if (days.hasOwnProperty(i)) {
							days[i].times.sort(function(a, b) {
								a = a.date;
								b = b.date;
								return a > b ? -1 : a < b ? 1 : 0;
							});
							timeSeries.push(days[i]);
						}
					}
					days[i].times.sort(function(a, b) {
						a = a.date;
						b = b.date;
						return a > b ? -1 : a < b ? 1 : 0;
					});
					this.timeSeries = timeSeries;
				} else if (type === 3) {
					var results = [];
					for (var i = 0; i < other.length; i++) {
						var arr = other[i],
							newobj = {}
						for (var j in arr) {
							if (arr.hasOwnProperty(j)) {
								newobj[correctName(j)] = correctValue(arr[j]);
							}
						}
						results.push(newobj);
					}
					this.results = results;
				}
				this.type = type;
			}
		}

		function timeout(ms) {
			return new Promise(resolve => setTimeout(resolve, ms));
		}
		this.delay = 61000;
		this.key = "demo";
		this.onlimit = null;
		this.debug = false;
		this.query = function(type, obj) {
			return queryData(type, obj);
		}
		this.get = async function(type, symbol, obj) {
			obj = obj || {};
			obj.symbol = symbol;
			obj.keywords = symbol;
			return new Promise(async function(callback) {
				var data = await queryData(type, obj);
				callback(new AlphaVantageData(data));
			});
		}
		this.search = function(keywords) {
			return this.get("SYMBOL_SEARCH", keywords);
		}
		this.quote = function(symbol, market) {
			if (market) {
				symbol = market + ":" + symbol
			}
			return this.get("GLOBAL_QUOTE", symbol);
		}
		this.getRate = async function(type, from, to, obj) {
			obj = obj || {};
			obj["from_currency"] = from;
			obj["from_symbol"] = from;
			obj["to_currency"] = to;
			obj["to_symbol"] = to;
			return new Promise(async function(callback) {
				var data = await queryData(type, obj);
				callback(new AlphaVantageData(data));
			});
		}
		this.rate = function(from, to) {
			return this.getRate("CURRENCY_EXCHANGE_RATE", from, to);
		}
		this.rateIntra = function(from, to, interval, full) {
			var obj = {
				interval: interval || "5min"
			}
			if (full && full != "compact") {
				obj.outputsize = "full";
			}
			return this.getRate("FX_INTRADAY", from, to, obj);
		}

	};
	window.alphaVantage = new AlphaVantage();
})();