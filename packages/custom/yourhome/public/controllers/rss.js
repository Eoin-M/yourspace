'use strict';

/* jshint -W098 */
angular.module('mean.yourhome').controller('RssController', ['$scope', '$http', 'Global', 'Yourhome',
  function($scope, $http, Global, Yourhome) {
    $scope.global = Global;
	
	$scope.newsTitle = "News Titles";
	$scope.newsSection = "News Sections";
	$scope.bbc = function(){
		var sectionTitles = [
					"Top Stories",
					"World",
					"UK",
					"Business",
					"Politics",
					"Health",
					"Education & Family",
					"Science & Environment",
					"Technology",
					"Entertainment & Arts"
				];
		var sectionLinks = [
					"http://feeds.bbci.co.uk/news/rss.xml",
					"http://feeds.bbci.co.uk/news/world/rss.xml",
					"http://feeds.bbci.co.uk/news/uk/rss.xml",
					"http://feeds.bbci.co.uk/news/business/rss.xml",
					"http://feeds.bbci.co.uk/news/politics/rss.xml",
					"http://feeds.bbci.co.uk/news/health/rss.xml",
					"http://feeds.bbci.co.uk/news/education/rss.xml",
					"http://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
					"http://feeds.bbci.co.uk/news/technology/rss.xml",
					"http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"
				];
		chooseSection("BBC", sectionTitles, sectionLinks);
	}
	
	$scope.cnn = function() {
		var sectionTitles = [
			"Top Stories",
			"Most Recent",
			"World",
			"Africa",
			"Americas",
			"Asia",
			"Europe",
			"Middle East",
			"U.S.",
			"Finance",
			"Technology",
			"Science & Space",
			"Entertainment",
			"World Sport",
			"Football",
			"Golf",
			"Motorsport",
			"Tennis",
			"Travel",
		];
		var sectionLinks = [
			"http://rss.cnn.com/rss/edition.rss",
			"http://rss.cnn.com/rss/cnn_latest.rss",
			"http://rss.cnn.com/rss/edition_world.rss",
			"http://rss.cnn.com/rss/edition_africa.rss",
			"http://rss.cnn.com/rss/edition_americas.rss",
			"http://rss.cnn.com/rss/edition_asia.rss",
			"http://rss.cnn.com/rss/edition_europe.rss",
			"http://rss.cnn.com/rss/edition_meast.rss",
			"http://rss.cnn.com/rss/edition_us.rss",
			"http://rss.cnn.com/rss/money_news_international.rss",
			"http://rss.cnn.com/rss/edition_technology.rss",
			"http://rss.cnn.com/rss/edition_space.rss",
			"http://rss.cnn.com/rss/edition_entertainment.rss",
			"http://rss.cnn.com/rss/edition_sport.rss",
			"http://rss.cnn.com/rss/edition_football.rss",
			"http://rss.cnn.com/rss/edition_golf.rss",
			"http://rss.cnn.com/rss/edition_motorsport.rss",
			"http://rss.cnn.com/rss/edition_tennis.rss",
			"http://rss.cnn.com/rss/edition_travel.rss",
		];
		chooseSection("CNN", sectionTitles, sectionLinks);
	}
	
	$scope.rte = function()
	{
		var sectionTitles = [
			"News Headlines",
			"Nuacht",
			"Sports Headlines",
			"Soccer headlines",
			"GAA headlines",
			"Rugby headlines",
			"Racing headlines",
			"Business headlines",
			"Entertainment headlines"
		];
		var sectionLinks = [
			"http://www.rte.ie/news/rss/news-headlines.xml",
			"http://www.rte.ie/news/rss/nuacht.xml",
			"http://www.rte.ie/rss/sport.xml",
			"http://www.rte.ie/rss/soccer.xml",
			"http://www.rte.ie/rss/gaa.xml",
			"http://www.rte.ie/rss/rugby.xml",
			"http://www.rte.ie/rss/racing.xml",
			"http://www.rte.ie/news/rss/business-headlines.xml",
			"http://www.rte.ie/news/rss/entertainment.xml"
		];
		chooseSection("RTE", sectionTitles, sectionLinks);
	}
	
	$scope.sky = function()
	{
		var sectionTitles = [
			"Home",
			"UK",
			"World",
			"US",
			"Business",
			"Politics",
			"Technology",
			"Entertainment",
			"Strange News"
		];
		var sectionLinks = [
			"http://feeds.skynews.com/feeds/rss/home.xml",
			"http://feeds.skynews.com/feeds/rss/uk.xml",
			"http://feeds.skynews.com/feeds/rss/world.xml",
			"http://feeds.skynews.com/feeds/rss/us.xml",
			"http://feeds.skynews.com/feeds/rss/business.xml",
			"http://feeds.skynews.com/feeds/rss/politics.xml",
			"http://feeds.skynews.com/feeds/rss/technology.xml",
			"http://feeds.skynews.com/feeds/rss/entertainment.xml",
			"http://feeds.skynews.com/feeds/rss/strange.xml",			
		];
		chooseSection("Sky", sectionTitles, sectionLinks);
	}
	
	function chooseSection(rssTitle, sectionTitles, sectionLinks){
		if (sectionTitles.length != sectionLinks.length) alert("Titles and links are different lengths!");
		$scope.newsTitle = rssTitle;
		//$("#newsTitlesText").text(rssTitle);
		$scope.newsSection = "News Sections";
		$("#newsSectionsBtn").removeClass("disabled");
		$("#newsSectionsList").empty();
		for(var i = 0; i < sectionTitles.length; i++)
		{
			var li = document.createElement("li");
			li.id = "listItem" + i;
			$("#newsSectionsList").append(li);
			jQuery('<a/>', {
				id: i + rssTitle,
				html: sectionTitles[i],
				maxLength: 20,
				click: function(){ 
					getRss(sectionLinks[parseInt(this.id)]);
					$scope.newsSection = sectionTitles[parseInt(this.id)];
				}
			}).appendTo("#listItem" + i);
		}
	}
	
	function getRss(feedUrl){
		if ($('#rssMenu').hasClass('CustomMenuSlide')) loadMenu(['rssMenu','rssFeed']);
		$("#rssFeed").fadeTo(100,0.5);
		$("#rssLoading").removeClass("hidden");
		$http.post('/api/yourhome/rssFeed', JSON.stringify({feedUrl: feedUrl}))
		.success(function(data){
			$scope.rssTitle = data.rssFeed[0].meta.title;
			$scope.rssLink = data.rssFeed[0].meta.link;
			for (var i = 0; i < data.rssFeed.length; i++){
				var date = JSON.stringify(data.rssFeed[i]['rss:pubdate']).split("\"");
				date = date[date.length-2];
				data.rssFeed[i].date = date;
				var summary = data.rssFeed[i].summary.split("<br")[0];
				data.rssFeed[i].summary = summary;
				var img;
				if (data.rssFeed[i].enclosures[0] != null){
					img = data.rssFeed[i].enclosures[0].url;
				}
				else if (data.rssFeed[i].image.url != null){
					img = data.rssFeed[i].image.url;
				}
				data.rssFeed[i].img = img;
			}
			$scope.articles = data.rssFeed;
			$("#rssLoading").addClass("hidden");
			$("#rssFeed").fadeTo(100,1);
		}).error(function(data){
			$("#rssFeed").empty();
			$("#rssLoading").addClass("hidden");
			jQuery('<div/>', {
				"class": "fa fa-exclamation-triangle fa-2x",
				html: " Can't connect to RSS Feed at this moment!"
			}).appendTo("#rssFeed");
		});
	}
	
	var init = function () {
		$scope.newsSection = "News Sections";
		getRss("blank");
		setTimeout(function(){init();}, (60000 * 15)); //15 minutes
	};
	init();
  }
]);

function loadMenu(MenuID) {
	var idMenu = '#' + MenuID[0];
	var idBody = '#' + MenuID[1];
	if ($(idMenu).hasClass('CustomMenuSlide')) {
		$(idMenu).removeClass('CustomMenuSlide');
		$(idBody).fadeTo(300,1);
	}
	else {
		$(idMenu).addClass('CustomMenuSlide');
		$(idBody).fadeTo(300,0.5);
	}
}