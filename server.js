var getJSON =require('get-json');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var get_ip = require('ipware')().get_ip;
var FeedParser = require('feedparser')
  , request = require('request');
var PORT = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname);
app.set('view engine', 'jade');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/database';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    //HURRAY!! We are connected. :)
    console.log('Connection established to', url);
	db.close();
  }
});

app.get('/', function(req, res){
	var ip_info = get_ip(req);
    console.log(ip_info);
	res.render('index');
});

app.post('/addUser', function(req, res) {
	var id = req.body.id;
	var name = req.body.name;
	var age = req.body.age;
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {
			//HURRAY!! We are connected. :)
			console.log('Connection established to', url);

			// Get the documents collection
			var collection = db.collection('users');

			//Create some users
			var user = {id: id, name: name, age: age};

			// Insert some users
			collection.insert([user], function (err, result) {
				if (err) {
					console.log(err);
				} else {
					console.log('Inserted %d documents into the "users" collection. The documents inserted with "_id" are:', result.length, result);	
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({result: "success"}));
				}
			//Close connection
			db.close();
			});
		}
	});	
});

app.post('/delUser', function(req, res) {
	var id = req.body.id;
	MongoClient.connect(url, function (err, db) {
		if (err) {
			console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {

			// Get the documents collection
			var collection = db.collection('users');

			// Remove some user
			collection.remove({id: id}, function (err, result) {
				if (err) {
					console.log(err);
				} else {
					console.log('Deleted %d documents from the "users" collection.', result.length);
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({result: "success"}));
				}
			//Close connection
			db.close();
			});
		}
	});	
});

app.post('/findUser', function(req, res) {
	var id = req.body.id;
	MongoClient.connect(url, function (err, db) {
		if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {

		// Get the documents collection
			var collection = db.collection('users');

			collection.find({id: id}).toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
					name = String(result[0].name);	
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({name: name}));
					console.log("Name: " + name);
				} else {
					console.log('No document(s) found with defined "find" criteria!');
					name = "No Result Found!";
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({name: name}));
				}
				//Close connection
				db.close();
			});
		}
	});
	console.log(id);
	//name = "Sean";
});

app.post('/listUsers', function(req, res) {
	MongoClient.connect(url, function (err, db) {
		if (err) {
		console.log('Unable to connect to the mongoDB server. Error:', err);
		} else {

		// Get the documents collection
			var collection = db.collection('users');

			collection.find().toArray(function (err, result) {
				if (err) {
					console.log(err);
				} else if (result.length) {
				console.log('Found:', result);			
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify({result: result}));
				} else {
					console.log('No document(s) found with defined "find" criteria!');
				}
				//Close connection
				db.close();
			});
		}
	});
});

/*rssUrl.on('error', function (err) {
	console.log(err);
});*/



//feedparser.on('error', function(err) {
//	console.log(err);
//});

app.post('/rssFeed', function(req, res){
	console.log("Hit!");
	console.log(req.body.feedUrl);
	
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
	});
	
	feedparser.on('readable', function () {
		// This is where the action is!
		var stream = this
		, meta = this.meta// **NOTE** the "meta" is always available in the context of the feedparser instance
		, item;
		
		//console.log(stream);
		
		while (item = stream.read()) {
			console.log("Title: " + item.title);
			console.log("----------");
			rssFeed[rssFeed.length] = item;
		}
		//console.log(rssFeed);
	});	

	feedparser.on('end', function() {
		res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({rssFeed: rssFeed}));
	});
});

app.post('/weather', function(req, res) {
	getJSON('http://www.myweather2.com/developer/forecast.ashx?uac=3IS/qEHwnA&output=json&query=53.27,-9.08&temp_unit=c', function(err, response){
		if(err)
		{
			console.log(err);
		}
		else
		{
			//res.setHeader('Content-Type', '');
			//res.send(JSON.stringify({json: res.result}));
			//res.setHeader('content-type', 'application/json');
			res.send(JSON.stringify({json: response}));
		}
	});
});

app.listen(PORT);
console.log('Server running at 127.0.0.1:' + PORT);