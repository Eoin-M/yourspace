$(document).ready(function() {
	
	$("#rte").click(function() {
		getRss("http://www.rte.ie/news/rss/news-headlines.xml");
	});
	
	$("#bbc").click(function() {
		getRss("http://feeds.bbci.co.uk/news/rss.xml");
	});
	
	$("#cnn").click(function() {
		getRss("http://rss.cnn.com/rss/edition.rss");
	});
	
	var timeout;
	
	function getRss(feedUrl) {
		$.ajax({
			url: '/rssFeed',
			type: 'post',
			dataType: 'json',
			data: JSON.stringify({feedUrl: feedUrl}),
			contentType: 'application/json',
			success: function(data){
				var rssTitle = document.getElementById("rssTitle");
				if (rssTitle != null) rssTitle.parentNode.removeChild(rssTitle);
				for(var i = 0;; i++){
				   var a = document.getElementById("article" + i);
				   if (a == null) break;
				   a.parentNode.removeChild(a);
			   }
				console.dir(data.rssFeed);
				var a = document.createElement('a');
				a.id = "rssTitle";
				a.href = data.rssFeed[0].meta.link;
				a.innerHTML = data.rssFeed[0].meta.title;
				a.target = "_blank";
				a.className = "rssTitle";
				$("#title").append(a);
				for(i = 0; i < data.rssFeed.length && i < 20; i++){
					var a = document.createElement('a');
					a.id = "article" + i;
					a.href = data.rssFeed[i].link;
					a.target = "_blank";
					$("#rssFeed").append(a);
					var div = document.createElement('div');
					div.id = "head" + i;
					div.className = "head";
					div.innerHTML = data.rssFeed[i].title;
					$("#article" + i).append(div);
					var br = document.createElement("br");
					$("#head" + i).append(br);
					if (data.rssFeed[i].enclosures[0] != null){
						var img = document.createElement("img");
						img.src = data.rssFeed[i].enclosures[0].url;
						$("#head" + i).append(img);
					}
					else if (data.rssFeed[i].image.url != null){
						var img = document.createElement("img");
						img.src = data.rssFeed[i].image.url;
						$("#head" + i).append(img);
					}
					var p = document.createElement("p");
					p.id = "p" + i;
					var summary = data.rssFeed[i].summary.split("<br");
					p.innerHTML = summary[0];
					$("#head" + i).append(p);
					p = document.createElement("p");
					var date = JSON.stringify(data.rssFeed[i]['rss:pubdate']).split("\"");
					p.innerHTML = date[date.length-2];
					p.className = "date";
					$("#head" + i).append(p);
					//alert(JSON.stringify(data.rssFeed[0]['rss:pubdate']));
				}
			},
			error: function(data){
				alert("FAILED!");
			}
		});
		var delay = 15 * 60 * 1000;
		if (timeout != null) clearTimeout(timeout);
		timeout = setTimeout(function(){ getRss(feedUrl); }, delay);
	}
});