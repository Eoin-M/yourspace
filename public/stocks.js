function getStockData(symbol)
{
	var url = "http://query.yahooapis.com/v1/public/yql";
	//var symbol = $("#symbol").val();
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
	
	$.getJSON(url, 'q=' + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env").done(function (data) 
	{
		console.log(data.query.results.quote);
		$("#stockName").text("Name: " + data.query.results.quote.Symbol);
		//$("#date").text("Bid Price: " + data.query.results.quote.Date);
		//$("#time").text("Bid Price: " + data.query.results.quote.LastTradeTime);
		$("#stockResult").text("Price: " + data.query.results.quote.LastTradePriceOnly);
		if( !(data.query.results.quote.PercentChange === null))
		{
			$("#stockChange").text("Change: " + data.query.results.quote.PercentChange);
		}
		else
		{
			$("#stockChange").text("Change: 0.00%");
		}
		//$("#bid").text("Bid Price: " + data.query.results.quote.LastTradePriceOnly);
		//$("#ask").text("Bid Price: " + data.query.results.quote.Ask);
		//("#volume").text("Bid Price: " + data.query.results.quote.Volume);
		//$("#high").text("Bid Price: " + data.query.results.quote.HighLimit);
		//$("#low").text("Bid Price: " + data.query.results.quote.LowLimit);
		
		var change = parseInt(data.query.results.quote.PercentChange,10);//10 here means base 10
		if(change > 0)
		{
			document.getElementById("stockChange").className = "greenText";
		}
		else if (change < 0)
		{
			document.getElementById("stockChange").className = "redText";
		}

	}).fail(function (jqxhr, textStatus, error) 
	{
		var err = textStatus + ", " + error;
		console.log("Error with getting stocks: "+ textStatus+" , "+err);
	});
}

//function checkEnter(e) --Might need to be brought back, CORS doesn't like if we call the api from a form...

function searchStock()
{
	getStockData(document.getElementById("queryStockName").value);
}
