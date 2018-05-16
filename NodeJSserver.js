// This server script is mostly derived using the code provided in the tutorials of CEGEG077 Web and Mobile Week5 and 6

//create the necessary variables
// express is the server that forms part of the nodejs program (from httpServer.js tutorial 5 Web&Mobile)
var express = require('express');
var path = require("path");
var app = express();
var fs = require('fs');
var pg = require('pg');
var deviceID = require('uuid');


// add an http server to serve files to the Edge browser and others which may have issues with security certificates.
// In the case of Edge this is due to the fact that it rejects the https files if they are not
//directly called in a typed URL (from httpServer.js tutorial 5 Web&Mobile)
var http = require('http');
var httpServer = http.createServer(app); 
httpServer.listen(4480);


// adding functionality to allow cross-domain queries when PhoneGap is running a server (from httpServer.js tutorial 5 Web&Mobile)
app.use(function(req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	next();
});

// make a body-parser to acces the GeoJSON (from tutorial 6 Web&Mobile)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
	
// add functionality to log the requests (from httpServer.js tutorial 5 Web&Mobile)
app.use(function (req, res, next) {
	var filename = path.basename(req.url);
	var extension = path.extname(filename);
	console.log("The file " + filename + " was requested.");
	next();
});
//message to be displayed when accessing the server from a browser
app.get('/',function (req,res) {
	res.send("Hello world from the HTTP server for LocAsk");
});


// read in the file and force it to be a string by adding "" at the beginning (from httpServer.js tutorial 5 Web&Mobile)
var configtext = ""+fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
// now convert the configuration file into the correct format -i.e. a name/value pair array (from httpServer.js tutorial 5 Web&Mobile)
var configarray = configtext.split(",");
var config = {};

for (var i = 0; i < configarray.length; i++) {
var split = configarray[i].split(':');
config[split[0].trim()] = split[1].trim();
}

	// code adapted from  tutorial 6 Web&Mobile. The function extracts the data as GeoJSON
	app.get('/getGeoJSON/:tablename/:geomcolumn', function (req,res) {
		pool.connect(function(err,client,done) {
			if(err){
				console.log("not able to get connection "+ err);
				res.status(400).send(err);
			}
			var colnames = "";
			// first get a list of the columns that are in the table
			// use string_agg to generate a comma separated list that can then be pasted into the next query
			var querystring = "select string_agg(colname,',') from ( select column_name as colname ";
				querystring = querystring + " FROM information_schema.columns as colname ";
				querystring = querystring + " where table_name = '"+ req.params.tablename +"'";
				querystring = querystring + " and column_name<>'"+req.params.geomcolumn+"') as cols ";
			console.log(querystring);
			// now execute the query
			client.query(querystring,function(err,result){
				//call `done()` to release the client back to the pool
				console.log("trying");
				done();
				if(err){
					console.log(err);
					res.status(400).send(err);
				}
				// for (var i =0; i< result.rows.length ;i++) {
				// console.log(result.rows[i].string_agg);
				// }
				thecolnames = result.rows[0].string_agg;
				colnames = thecolnames;
				console.log("the colnames "+thecolnames);
				// now use the inbuilt geoJSON functionality
				// and create the required geoJSON format using a query adapted from here:
				// http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 10th May 2018
				// The query needs to be a single string with no line breaks so built it up bit by bit
				var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
				querystring = querystring + "(SELECT 'Feature' As type , ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, ";
				querystring = querystring + "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l )) As properties";
				querystring = querystring + " FROM "+req.params.tablename+" As lg limit 100 ) As f ";
				console.log(querystring);
				// run the second query
				client.query(querystring,function(err,result){
					//call `done()` to release the client back to the pool
					done();
					if(err){
						console.log(err);
						res.status(400).send(err);
					}
					res.status(200).send(result.rows);
				});
			});
		});
	});
	

// connect to PostreSQL using the credentials of the postgistest file found in the certs directory (from httpServer.js tutorial 5 Web&Mobile)
var pool = new pg.Pool(config);
//pool.connect();
app.get('/postgistest', function (req,res) {
	pool.connect(function(err,client,done) {
		if(err){
			console.log("not able to get connection "+ err);
			res.status(400).send(err);
		}
		//now select the column question from the table
		client.query('SELECT question FROM appdata',function(err,result) {
		done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
	});
});

// upload the file from the question form to the database (adapted form tutorial 6 Web&Mobile)
app.post('/uploadData',function(req,res){
       // note that we are using POST here as we are uploading data
       // so the parameters form part of the BODY of the request rather than the restful API
      console.dir(req.body);
      res.send(req.body);
    
       const client = new pg.Client(config);
	
		client.connect((err)=>{
            if(!err){
		  
			var querystring = "INSERT into appdata (question, answ1, answ2, answ3, answ4, correct_answer, geom) values ('" + req.body.question +"','" + req.body.answ1 +"','" + req.body.answ2 +"','" + req.body.answ3+"','" + req.body.answ4 +"','" + req.body.correct_answer +"'," +"st_geomfromtext('POINT("+req.body.lng+" "+req.body.lat+")', 4326))";
			console.log(querystring);

			client.query(querystring, (err,result)=>{
				console.log('inside query');
				if(err){
					console.log(err);
					res.status(400).send(err);
				}else{
					console.log('results have been sent');
				}
			});	
		}})
	});
	
// upload file from the quiz to the database (adapted form tutorial 6 Web&Mobile)
app.post('/checkAnswer',function(req,res){
       // note that we are using POST here as we are uploading data
       // so the parameters form part of the BODY of the request rather than the restful API
      console.dir(req.body);
      res.send(req.body);
    
       const client = new pg.Client(config);
	
		client.connect((err)=>{
            if(!err){
		  
			var querystring = "INSERT into answers (uuid, userAnswer, correct) values ('" + req.body.deviceID +"','" + req.body.userAnswer +"','" + req.body.correct +"')";
			console.log(querystring);

			client.query(querystring, (err,result)=>{
				console.log('inside query');
				if(err){
					console.log(err);
					res.status(400).send(err);
				}else{
					console.log('Results sent');
				}
			});	
		}})
	});

// code from httpServer.js tutorial 5 Web&Mobile
// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1', function (req, res) {
// run some server-side code
// the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1);

// the res is the response that the server sends back to the browser - you will see this text in your browser window
res.sendFile(__dirname + '/'+req.params.name1);
});


// code from httpServer.js tutorial 5 Web&Mobile
// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
app.get('/:name1/:name2', function (req, res) {
// run some server-side code
// the console is the command line of your server - you will see the console.log values in the terminal window
console.log('request '+req.params.name1+"/"+req.params.name2);

// the res is the response that the server sends back to the browser - you will see this text in your browser window
res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});


// code from httpServer.js tutorial 5 Web&Mobile
// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3', function (req, res) {
	// run some server-side code
	// the console is the command line of your server - you will see the console.log values in the terminal window
	console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
	// send the response
		res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
});

// code from httpServer.js tutorial 5 Web&Mobile
// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
app.get('/:name1/:name2/:name3/:name4', function (req, res) {
	// run some server-side code
	// the console is the command line of your server - you will see the console.log values in the terminal windowconsole.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
	// send the response
	res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});