angular.module('mean.yourhome').controller('StocksController', ['$scope', '$http', 'Global', 'Yourhome', '$interval',
	function($scope, $http, Global, Yourhome, $interval) {
		$scope.global = Global;
		$scope.wanted = {};
        
		$scope.getStock=function(stockArray)
		{
			console.log("entered getStock");
			$http.post('/api/yourhome/getStock', JSON.stringify(
                {
                    symbols: stockArray
                })
            )
			.success(function(data){
			    console.dir(data);
			    for(var i = 0; i < data.length; i++)
                {
                    if (data[i].lastTradePriceOnly === null)
                    {
                        $('#stockInput').popover
                        ({
                            trigger: 'manual'
                        });
                        $('#stockInput').attr('data-content', data[i].symbol+' is not listed on a supported stock exchange');
                        $('#stockInput').popover('show');
                        setTimeout( function()
                        {
                            $('#stockInput').popover('hide');
                        }, 5000);
                        data.splice(i ,1);
                    }
                }
                $scope.stocks = data;
			}).error(function(data){
				console.error("An error occured on the server when adding stock "+$scope.wantedStock+". Server returned: ");
				console.dir(data);
			});
		};
		$scope.updateStock = $interval(function()
		{
            var symbols = [];
            for (var i = 0; i < ($scope.stocks.length); i++)
            {
                symbols.push($scope.stocks[i].symbol);
            }
            $scope.getStock(symbols);
            console.log("updating:");
            console.dir(symbols);
			
		}, 30000);//Updates stocks every 30 seconds
		
		$scope.setStockClass = function (input) {
			input = input - 0;
			if (input < 0) 
			{
				return  "redStockText";
			}
			else if (input > 0)
			{
				return "greenStockText";
			}
		};
        	
        $scope.removeStock = function (stock)
        {
            $scope.stocks.splice($scope.stocks.indexOf(stock),1);
        };
        
        $scope.validateStock = function()
        {
            console.log("check stock");
            
            for (var i = 0; i < $scope.stocks.length; i++)
			{
				console.log($scope);
				if( $scope.stocks[i].symbol.toUpperCase() === $scope.wanted.stock.toUpperCase())
				{
					$('#stockInput').popover({
                        trigger: 'manual'
                    });
                    $('#stockInput').attr('data-content', $scope.wantedStock+' is already listed');
                    $('#stockInput').popover('show');
                    setTimeout( function()
                    {
                        $('#stockInput').popover('hide');
                    }, 5000);
					return;
				}
			}
            
            var valid = true;
            valid = valid && $scope.wanted.stock.length > 1;
            valid = valid && $scope.wanted.stock.length < 7;
            valid = valid && /^[a-z]+$/i.test($scope.wanted.stock);//only allows letters
            
            if (valid === true)
            {
                var symbols = [];
                for (var j = 0; j < ($scope.stocks.length); j++)
                {
                    symbols.push($scope.stocks[j].symbol);
                }
                symbols.push($scope.wanted.stock);
                console.dir(symbols);
                $scope.getStock(symbols);
                $scope.wanted.stock = "";
            }
            else
            {
                //$('#stockInput').popover('hide');
                $('#stockInput').popover({
                    trigger: 'manual'
                });
                $('#stockInput').attr('data-content','Stocks must be between 1 and 6 characters in length'+
                 ' and contain only ISO basic latin letters');
                $('#stockInput').popover('show');
                setTimeout( function()
                {
                    $('#stockInput').popover('hide');
                }, 5000);
            }
        }  
		
		$scope.initialiseStocks=function()
        {
            $scope.getStock(null);
        };
	}]
);