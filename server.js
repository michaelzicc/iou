var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var firebaseAdmin = require('./firebaseAdmin');


var db = firebaseAdmin.admin.firestore();

app.get('/', (req, res) => {
	res.sendFile(__dirname + "/home/index.html");
});

app.get('/myious', (req, res) => {
	res.sendFile(__dirname + "/home/ious.html");
});

app.get('/app.js', (req, res) => {
	res.sendFile(__dirname + "/home/scripts/app.js");
});

app.get('/ious.js', (req, res) => {
	res.sendFile(__dirname + "/home/scripts/ious.js");
});

app.get('/config.js', (req, res) => {
	res.sendFile(__dirname + "/home/scripts/config.js");
});

app.get('/angular.js', (req, res) => {
	res.sendFile(__dirname + "/node_modules/angular/angular.js");
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

function decodeUid(token, callback) {
	return new Promise(function() {
		firebaseAdmin.admin.auth().verifyIdToken(token)
			.then(function(decodedToken) {
				callback(decodedToken.uid);
			}).catch(function(error) {
				console.log(error);
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

app.post('/getIOUs', function(req, res) {
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
	});
});

app.post('/newIOU', function(req, res) {
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
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
			res.redirect("/error");
			return;
		}
		
		if(uid == null)
		{
			res.redirect("/error");
			return;
		}
		
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
		
		res.redirect("/");
	}).catch(function(error) {
		console.log(error);
	});
});

//How do I validate this is legit?
app.post('/updateUser', function(req, res) {
	//console.log(req.body);
	//res.sendStatus(200);
	res.redirect("/");
	//res.sendFile(__dirname + "/index.html");
});


app.use(function (req, res) {
    //res.render('/home/error');
	res.status(404).sendFile(__dirname + "/home/error.html");
});

app.listen(8000, () => {
	console.log("server started on port 8000")
});
