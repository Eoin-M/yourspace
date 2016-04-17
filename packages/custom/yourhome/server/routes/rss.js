var mongoose = require('mongoose'),
		User = mongoose.model('User');
  
	
module.exports = function(Yourhome, app, auth, database) {  
  
	var bodyParser = require('body-parser');
	var FeedParser = require('feedparser')
	  , request = require('request');

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	//app.set('views', __dirname + '/public/views');
	//app.set('view engine', 'jade');

	app.post('/api/yourhome/rssFeed', function(req, res){
		
		if (req.body.feedUrl == "blank"){
			if(req.session && req.session.user) req.body.feedUrl = req.session.user.rss.defaultURL;
			else req.body.feedUrl = 'http://feeds.bbci.co.uk/news/rss.xml';
		}
		
		else if (req.session && req.session.user && req.body.feedUrl != req.session.user.rss.defaultURL){
			req.session.user.rss.defaultURL = req.body.feedUrl;
			
			User.findOneAndUpdate({"_id": req.session.user._id}, {$set:{"rss.defaultURL": req.body.feedUrl}}, {upsert:false}, function(err, doc){
				if (err) console.log(err);
				return;
			});
		}
		
		var rssUrl = request(req.body.feedUrl)
		  , feedparser = new FeedParser();

		var rssFeed = [];

		rssUrl.on('error', function (error) {
			console.log(error);
		});
		
		rssUrl.on('response', function (result) {
			var stream = this;

			if (result.statusCode != 200) return this.emit('error', new Error('Bad status code'));
			stream.pipe(feedparser);
		});
			
		feedparser.on('error', function(error) {
			console.log(error);
			res.sendStatus(400);
		});
		
		feedparser.on('readable', function () {
			// This is where the action is!
			var stream = this
			, meta = this.meta// **NOTE** the "meta" is always available in the context of the feedparser instance
			, item;
			
			//console.log(stream);
			
			while (item = stream.read()) {
				rssFeed[rssFeed.length] = item;
			}
			//console.log(rssFeed);
		});	

		feedparser.on('end', function() {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify({rssFeed: rssFeed}));
		});
	});
};