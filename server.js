var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var firebaseAdmin = require('./firebaseAdmin');


var db = firebaseAdmin.admin.firestore();

app.get('/', (req, res) => {
	console.log("GET: /");
	res.sendFile(__dirname + "/home/index.html");
});

app.get('/myious', (req, res) => {
	console.log("GET: /myious");
	res.sendFile(__dirname + "/home/ious.html");
});

app.get('/login', (req, res) => {
	console.log("GET: /login");
	res.sendFile(__dirname + "/home/signIn.html");
});

app.get('/logOut', (req, res) => {
	console.log("GET: /logOut");
	res.sendFile(__dirname + "/home/logOut.html");
});

app.get('/signup', (req, res) => {
	console.log("GET: /signup");
	res.sendFile(__dirname + "/home/signUp.html");
});

app.get('/app.js', (req, res) => {
	console.log("GET: /app.js");
	res.sendFile(__dirname + "/home/scripts/app.js");
});

app.get('/index.js', (req, res) => {
	console.log("GET: /index.js");
	res.sendFile(__dirname + "/home/scripts/index.js");
});

app.get('/ious.js', (req, res) => {
	console.log("GET: /ious.js");
	res.sendFile(__dirname + "/home/scripts/ious.js");
});

app.get('/signUp.js', (req, res) => {
	console.log("GET: /signUp.js");
	res.sendFile(__dirname + "/home/scripts/signUp.js");
});

app.get('/signIn.js', (req, res) => {
	console.log("GET: /signIn.js");
	res.sendFile(__dirname + "/home/scripts/signIn.js");
});

app.get('/logOut.js', (req, res) => {
	console.log("GET: /logOut.js");
	res.sendFile(__dirname + "/home/scripts/logOut.js");
});

app.get('/search.js', (req, res) => {
	console.log("GET: /search.js");
	res.sendFile(__dirname + "/home/scripts/search.js");
});

app.get('/config.js', (req, res) => {
	console.log("GET: /config.js");
	res.sendFile(__dirname + "/home/scripts/config.js");
});

app.get('/angular.js', (req, res) => {
	console.log("GET: /angular.js");
	res.sendFile(__dirname + "/node_modules/angular/angular.js");
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

function decodeUid(token, callback) {
	return new Promise((resolve, reject) => {
		firebaseAdmin.admin.auth().verifyIdToken(token)
			.then(function(decodedToken) {
				resolve(callback(decodedToken.uid));
			}).catch(function(error) {
				console.log(error);
				reject(new Error("Could not decode Token."));
			});
	});
}

function iouQuery(coll, key1, key2, uid, callback) {
	return new Promise(function() {
	var ious = [];
	coll.where(key1, '==', uid).orderBy(key2).get()
		.then(snapshot => {
			snapshot.forEach(doc => {
				var iou = doc.data();
				iou.ref = doc.id;
				ious.push(iou);
			});
			console.log("Start " + key1 +"IOUs"); console.log(ious); console.log("End " + key1 +"IOUs");
			console.log("Done with " + key1 +" docs");
			callback(ious);
		})
		.catch(err => {
			console.log('Error getting documents', err);
		});
	});
}

function doesUsernameExist(username, callback)
{
	var exists = false;
	
	var docRef = db.collection('users');
	var query = docRef.where('Username', '==', username).get().then(
		snapshot => {
			snapshot.forEach(doc => {
				console.log("Username Already Exists");
				exists = true;
			});
			console.log("username exists: " + exists);
			callback(exists);
		})
		.catch(err => {
			console.log('Error getting documents', err);
			callback(true);
		});
}

function doesUsernameExistForUser(token, callback)
{	
	var exists = false;
	decodeUid(token, function(uid) {
		var docRef = db.collection('users');
		var query = docRef.where('Uid', '==', uid).get().then(
			snapshot => {
				snapshot.forEach(doc => {
					console.log("User already has Username");
					exists = true;
				});
				console.log("exists: " + exists);
				callback(exists);
			})
			.catch(err => {
				console.log('Error getting documents', err);
				callback(true);
			});
	}).catch(function(error) {
		console.log(error);
		callback(true);
	});
}

app.post('/getIOUs', function(req, res) {
	console.log("POST: /getIOUs");
	console.log("getIOUs()");
	console.log(req.body);
	console.log("6mz");
	
	var payeeIOUs = [];
	var payerIOUs = [];
	
	var ious = db.collection('ious');
	decodeUid(req.body.stsTokenManager.accessToken, function(uid) {
		console.log(uid);
		iouQuery(ious, 'Payee', 'Payer', uid, function(payeeQuery) {
			iouQuery(ious, 'Payer', 'Payee', uid, function(payerQuery) {
				res.json([payeeQuery, payerQuery]);
			});
		});
	}).catch(function(error) {
		console.log(error);
		console.log("getIOUs failed");
		console.log("Redirect to Error Page");
		res.redirect("/error");
		return;
	});
});

app.post('/newIOU', function(req, res) {
	console.log("POST: /newIOU");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.redirect("/error");
		return;
	}
	
	decodeUid(req.body.token, function(uid) {
		var payer = "";
		var payee = "";
		
		if(req.body.action == "iou")
		{
			payer = [uid];
			if(Array.isArray(req.body.contacts))
			{
				payee = req.body.contacts;
			}
			else
			{
				payee = [req.body.contacts];
			}
		}
		else if(req.body.action == "uoi")
		{
			if(Array.isArray(req.body.contacts))
			{
				payer = req.body.contacts;
			}
			else
			{
				payer = [req.body.contacts];
			}
			payee = [uid];
		}
		else
		{
			console.log("Invalid IOU Direction");
			console.log("Redirect to Error Page");
			res.redirect("/error");
			return;
		}
		
		if(uid == null)
		{
			console.log("uid is null");
			console.log("Redirect to Error Page");
			res.redirect("/error");
			return;
		}
		
		email = FirebaseAuth
		
		payer.forEach(function sendDocs(cPayer, cPayerIndex) {
			payee.forEach(function sendThem(cPayee, cPayeeIndex) {
				var docRef = db.collection('ious').doc();
				var setDoc = docRef.set({
				//console.log(JSON.stringify({
					Amount: req.body.amount,
					DateCreated: firebaseAdmin.FieldValue.serverTimestamp(),
					Payee: cPayee,
					PayeeResolved: false,
					PayeeResolvedDate: null,
					Payer: cPayer,
					PayerResolved: false,
					PayerResolvedDate: null,
					Reason: req.body.reason,
					Resolved: false
				//}));
				});
			});
		});
		
		console.log("Redirect to Home Page");
		res.redirect("/");
	}).catch(function(error) {
		console.log(error);
		console.log("Failed to Decode UID");
		console.log("Redirect to Error Page");
		res.redirect("/error");
		return;
	});
});

app.post('/checkUser', function(req, res) {
	console.log("POST: /checkUser");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is undefined");
		console.log("Redirect to Error Page");
		res.redirect("/error");
		return;
	}
	
	console.log("made it past token check");
	
	doesUsernameExistForUser(req.body.token, function(exists)
	{
		if(exists)
		{
			console.log("User has Username");
			res.send("true");
		}
		else
		{
			console.log("User Does Not have Username");
			res.send("false");
		}
	});
});

app.post('/newAccount', function(req, res) {
	console.log("POST: /newAccount");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.redirect("/error");
		return;
	}
	
	console.log("made it past token check");
	
	decodeUid(req.body.token, function(uid) {
		var userId = uid;
		var username = req.body.username;
		
		if(username === undefined || username === null || username == '')
		{
			res.status(400);
			console.log("A username was not submitted");
			res.send("Username is Empty");
			return;
		}
		if(username.length < 6 || username.length > 50)
		{
			res.status(400);
			console.log("Username \"" + username + "\" does not meet the length requirements.");
			res.send("Username does not meet the length requirements.<br>Usernames must be between 6 and 50 characters long.");
			return;
		}
		var isAlphaNumeric = /(^[A-Za-z0-9]+$)/.test(username);
		if(!isAlphaNumeric)
		{
			res.status(400);
			console.log("Username \"" + username + "\" does not meet the character requirements.");
			res.send("Username does not meet the Character Requirements.<br>Usernames must contain only letters and numbers.");
			return;
		}
		
		console.log("Username met requirements");
		
		doesUsernameExistForUser(req.body.token, function(userHasUsername)
		{
			if(userHasUsername)
			{
				res.status(300);
				console.log("Redirect to Home Page");
				res.redirect("/");
				return;
			}
			else 
			{
				doesUsernameExist(username, function(usernameExists)
				{
					if(usernameExists)
					{
						res.status(400);
						console.log("Sending 'Username Already Exists'");
						res.send("Username Already Exists");
						return;
					}
					else
					{
						_this = this;
						var email = "";
						firebaseAdmin.admin.auth().getUser(userId).then(function(userRecord){
							console.log("Successfully fetched user data:", userRecord.toJSON());
							_this.email = userRecord.email;
							var docRef = db.collection('users').doc();
							var setDoc = docRef.set({
							//console.log(JSON.stringify({
								Username: username,
								DateCreated: firebaseAdmin.FieldValue.serverTimestamp(),
								Uid: userId,
								Email: _this.email
							//}));
							});
						res.status(300);
						console.log("Redirect to Home Page");
						res.redirect("/");
						}).catch(function(error) {
							res.status(400);
							console.log("Error fetching user data: ", error)
							res.send("An error occurred. Please try again.");
						});
					}
				});
			}
		});
	}).catch(function(error) {
		console.log(error);
		res.status(400);
		res.send("An error occurred. Please try again.");
		return;
	});
});

//How do I validate this is legit?
app.post('/updateUser', function(req, res) {
	console.log("POST: /updateUser");
	//console.log(req.body);
	//res.sendStatus(200);
	res.redirect("/");
	//res.sendFile(__dirname + "/index.html");
});


app.use(function (req, res) {
	console.log("Request: Error Page");
    //res.render('/home/error');
	res.status(404).sendFile(__dirname + "/home/error.html");
});

app.listen(8000, () => {
	console.log("server started on port 8000")
});
