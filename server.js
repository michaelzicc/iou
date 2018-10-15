var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var firebaseAdmin = require('./firebaseAdmin');


var db = firebaseAdmin.admin.firestore();



//Resources

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

app.get('/notifications.js', (req, res) => {
	console.log("GET: /notifications.js");
	res.sendFile(__dirname + "/home/scripts/notifications.js");
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




//Functions

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

//Checks if Username exists and then gets the associated UserId, otherwise, it returns false
function getUserIdFromUsername(username, callback)
{
	var userId = false;
	
	var docRef = db.collection('users');
	var query = docRef.where('Username', '==', username).get().then(
		snapshot => {
			snapshot.forEach(doc => {
				console.log("User Data: ");
				console.log(doc.data());
				userId = doc.data().Uid;
			});
			console.log("username exists: " + userId);
			callback(userId);
		})
		.catch(err => {
			console.log('Error getting documents', err);
			callback(false);
		});
}

//Checks if UID exists and then gets the associated username, otherwise, it returns false
function getUsernameFromUid(uid, callback)
{
	var username = false;
	
	var docRef = db.collection('users');
	docRef.where('Uid', '==', uid).get().then(
		snapshot => {
			snapshot.forEach(doc => {
				console.log("User Data: ");
				console.log(doc.data());
				username = doc.data().Username;
			});
			console.log("username exists: " + username);
			callback(username);
		})
		.catch(err => {
			console.log('Error getting documents', err);
			callback(false);
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

function connectUsers(requesterUid, newConnectionUid, callback)
{
	var oppositeConnectionExists = false;
	var newConnectionHasBeenBlocked = false;
	var response = "";
	if(requesterUid === newConnectionUid)
	{
		console.log("User trying to connect to themself");
		console.log("Requester UID: " + requesterUid);
		console.log("Connection UID: " + newConnectionUid);
		callback("Cannot connect to yourself");
		return;
	}
	var docRef = db.collection('connections');
	
	//Check if the newConnection user has blocked the requester
	console.log("Checking if requester has been blocked by the wanted connection");
	docRef.where('RequesterUid', '==', newConnectionUid)
		.where('ConnectionUid', '==', requesterUid)
		.where('Status', '==', 'Blocked').get().then(
		snapshot => {
			snapshot.forEach(doc => {
				console.log("The requester has been blocked by the wanted connection.")
				response = "Unable to connect with user";
				newConnectionHasBeenBlocked = true;
			});
		});

	if(newConnectionHasBeenBlocked)
	{
		callback(response);
		return;
	}

	//Check if opposite connection exists before sending a new request
	docRef.where('RequesterUid', '==', newConnectionUid)
		.where('ConnectionUid', '==', requesterUid).get().then(
			snapshot => {
				snapshot.forEach(doc => {
					if(doc.Status == "Rejected")
					{
						console.log("Opposite connection already exists, but is rejected");
						return;
					}
					else
					{
						console.log("Opposite connection already exists");
						confirmConnection(newConnectionUid, requesterUid, function(confirmationResult)
						{
							response = confirmationResult;
						})
						oppositeConnectionExists = true;
					}
				});
			});

	if(!oppositeConnectionExists)
	{
		docRef.where('RequesterUid', '==', requesterUid)
			.where('ConnectionUid', '==', newConnectionUid).get().then(
			snapshot => {
				snapshot.forEach(doc => {
					console.log("Connection already exists");
					console.log(doc.data());
					switch(doc.data().Status)
					{
						case "Pending":
							console.log("The previous connection request is pending");
							response = "The connection request is pending.";
							break;
						case "Confirmed":
							console.log("The connection has confirmed the requester's request");
							response = "You two are already connected.";
							break;
						case "Rejected":
							console.log("The connection has rejected the requester's request");
							var ninetyDaysAgo = new Date(doc.data().UpdatedDate);
							ninetyDaysAgo.setDate(ninetyDaysAgo.getDate()-90);
							if(doc.data().UpdatedDate > ninetyDaysAgo)
							{
								response = "The connection request is pending.";
							}
							else
							{
								docRef.doc(doc.id).update({
								//console.log(JSON.stringify({
									Status: "Pending",
									UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
								//}));
								});
								response = "Sent Connection Request!";
							}
							break;
						case "Blocked":
							console.log("The requester has blocked this connection");
							response = "You have to unblock this user before requesting to connect.";
							break;						
						default:
							response = "An unexpected error has occurred."
							console.log("An unexpected error has occurred while getting the status of this connection: " + doc.data());
							break;
					}
				});

				if(response === "")
				{
					console.log("Creating connection...");
					docRef.doc().set({
					//console.log(JSON.stringify({
						RequesterUid: requesterUid,
						ConnectionUid: newConnectionUid,
						Status: "Pending",
						CreatedDate: firebaseAdmin.FieldValue.serverTimestamp(),
						UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
					//}));
					});
					console.log("Connection created.");
					response = "Sent Connection Request!";
				}


				console.log("Connection Response: " + response);
				callback(response);
			})
			.catch(err => {
				console.log('Error getting connection', err);
			});
	}
}

function confirmConnection(requesterUid, confirmerUid, callback)
{
	if(requesterUid === confirmerUid)
	{
		console.log("User trying to connect to themself");
		console.log("Requester UID: " + requesterUid);
		console.log("Connection UID: " + confirmerUid);
		callback("Cannot connect to yourself");
		return;
	}
	var docRef = db.collection('connections');

	docRef.where('RequesterUid', '==', requesterUid)
		.where('ConnectionUid', '==', confirmerUid).get().then(
		snapshot => {
			var response = "";
			snapshot.forEach(doc => {
				console.log("Connection already exists, as it should");
				console.log(doc.data());
				switch(doc.data().Status)
				{
					case "Pending":
						console.log("Confirming connection...");
						docRef.doc(doc.id).update({
						//console.log(JSON.stringify({
							Status: "Confirmed",
							UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
						//}));
						});

						//Check if opposite connection exists before creating a new connection
						var oppositeConnectionExists = false;
						docRef.where('RequesterUid', '==', confirmerUid)
						.where('ConnectionUid', '==', requesterUid).get().then(
							snapshot => {
								snapshot.forEach(existingConnection => {
									oppositeConnectionExists = true;
									console.log("Existing opposite connection found with status: " + existingConnection.Status);
									console.log("Updating existing opposite connection to Confirmed");
									docRef.doc(doc.id).update({
									//console.log(JSON.stringify({
										Status: "Confirmed",
										UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
									//}));
									});
								});
							}
						);

						if(!oppositeConnectionExists)
						{
							console.log("Creating new opposite connection...");
							docRef.doc().set({
							//console.log(JSON.stringify({
								RequesterUid: confirmerUid,
								ConnectionUid: requesterUid,
								Status: "Confirmed",
								CreatedDate: firebaseAdmin.FieldValue.serverTimestamp(),
								UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
							//}));
							});
							console.log("Connection created.");
						}
						console.log("Connection confirmed.");
						response = "Connection Confirmed!";
						break;
					case "Confirmed":
						console.log("The connection has confirmed the requester's request");
						response = "You two are already connected.";
						break;
					case "Rejected":
						console.log("The connection request has already been rejected");
						response = "This connection has already been rejected and cannot be confirmed.  If you'd still like to connect with this user, please search their username.";
						break;
					case "Blocked":
						console.log("The requester has blocked this connection");
						response = "Cannot create connection.";
						break;						
					default:
						response = "An unexpected error has occurred."
						console.log("An unexpected error has occurred while getting the status of this connection: " + doc.data());
						break;
				}
			});

			if(response === "")
			{
				console.log("The connection request cannot be found to confirm it");
				response = "Cannot confirm the request - request was not found.";
			}

			console.log("Connection Response: " + response);
			callback(response);
		})
		.catch(err => {
			console.log('Error getting connection', err);
		});
}

function rejectConnection(requesterUid, rejecterUid, callback)
{
	if(requesterUid === rejecterUid)
	{
		console.log("User trying to reject themself");
		console.log("Requester UID: " + requesterUid);
		console.log("Connection UID: " + rejecterUid);
		callback("Cannot connect to yourself");
		return;
	}
	var docRef = db.collection('connections');

	docRef.where('RequesterUid', '==', requesterUid)
		.where('ConnectionUid', '==', rejecterUid).get().then(
		snapshot => {
			var response = "";
			snapshot.forEach(doc => {
				console.log("Connection already exists, as it should");
				console.log(doc.data());
				switch(doc.data().Status)
				{
					case "Pending":
						console.log("Rejecting connection...");
						docRef.doc(doc.id).update({
						//console.log(JSON.stringify({
							Status: "Rejected",
							UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
						//}));
						});
						console.log("Connection rejected.");
						response = "Connection Rejected!";
						break;
					case "Confirmed":
						console.log("The connection has confirmed the requester's request");
						response = "You two are already connected; this request can't be rejected.";
						break;
					case "Rejected":
						console.log("The connection request has already been rejected");
						response = "This connection has already been rejected.";
						break;
					case "Blocked":
						console.log("The requester has blocked this connection");
						response = "Connection is invalid.";
						break;						
					default:
						response = "An unexpected error has occurred."
						console.log("An unexpected error has occurred while getting the status of this connection: " + doc.data());
						break;
				}
			});

			if(response === "")
			{
				console.log("The connection request cannot be found to reject it");
				response = "Cannot reject the request - request was not found.";
			}

			console.log("Connection Response: " + response);
			callback(response);
		})
		.catch(err => {
			console.log('Error getting connection', err);
		});
}

function blockConnection(requesterUid, uidToBlock, callback)
{
	if(requesterUid === uidToBlock)
	{
		console.log("User trying to block themself");
		console.log("Requester UID: " + requesterUid);
		console.log("Connection UID: " + uidToBlock);
		callback("Cannot block yourself");
		return;
	}
	var docRef = db.collection('connections');

	docRef.where('RequesterUid', '==', requesterUid)
		.where('ConnectionUid', '==', uidToBlock).get().then(
		snapshot => {
			var response = "";
			snapshot.forEach(doc => {
				console.log("Connection already exists");
				console.log(doc.data());
				switch(doc.data().Status)
				{
					case "Pending":
						console.log("Blocking connection...");
						docRef.doc(doc.id).update({
						//console.log(JSON.stringify({
							Status: "Blocked",
							UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
						//}));
						});
						console.log("Connection blocked.");
						response = "User Blocked.";
						break;
					case "Confirmed":
						console.log("The connection has confirmed the requester's request");
						console.log("Blocking connection...");
						docRef.doc(doc.id).update({
						//console.log(JSON.stringify({
							Status: "Blocked",
							UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
						//}));
						});

						console.log("Deleting opposite connection...");
						docRef.where('RequesterUid', '==', uidToBlock)
							.where('ConnectionUid', '==', requesterUid).get().then(
							snapshot => {
								snapshot.forEach(doc => {
									docRef.doc(doc.id).delete().then(function() {
										console.log("Opposite connection deleted");
									}).catch(function(error) {
										console.error("Error removing document: ", error);
									});
								});
							});

						console.log("User blocked.");
						response = "User blocked.";
						break;
					case "Rejected":
						console.log("Blocking the rejected connection...");
						docRef.doc(doc.id).update({
						//console.log(JSON.stringify({
							Status: "Blocked",
							UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
						//}));
						});
						console.log("Connection blocked.");
						response = "User Blocked.";
						break;
					case "Blocked":
						console.log("The requester has blocked this connection");
						response = "User is already blocked.";
						break;						
					default:
						response = "An unexpected error has occurred."
						console.log("An unexpected error has occurred while getting the status of this connection: " + doc.data());
						break;
				}
			});

			console.log("Deleting opposite pending connections that may exist...");
			docRef.where('RequesterUid', '==', uidToBlock)
				.where('ConnectionUid', '==', requesterUid)
				.where('Status', '==', 'Pending').get().then(
				snapshot => {
					snapshot.forEach(doc => {
						docRef.doc(doc.id).delete().then(function() {
							console.log("Opposite pending connection deleted");
						}).catch(function(error) {
							console.error("Error removing document: ", error);
						});
					});
				});

			console.log("Deleting opposite rejected connections that may exist...");
			docRef.where('RequesterUid', '==', uidToBlock)
				.where('ConnectionUid', '==', requesterUid)
				.where('Status', '==', 'Rejected').get().then(
				snapshot => {
					snapshot.forEach(doc => {
						docRef.doc(doc.id).delete().then(function() {
							console.log("Opposite rejected connection deleted");
						}).catch(function(error) {
							console.error("Error removing document: ", error);
						});
					});
				});

			if(response === "")
			{
				console.log("Blocking connection...");
				docRef.doc().set({
				//console.log(JSON.stringify({
					RequesterUid: requesterUid,
					ConnectionUid: newConnectionUid,
					Status: "Blocked",
					CreatedDate: firebaseAdmin.FieldValue.serverTimestamp(),
					UpdatedDate: firebaseAdmin.FieldValue.serverTimestamp()
				//}));
				});
				console.log("Connection created and blocked.");
				response = "User blocked.";
			}

			console.log("Connection Response: " + response);
			callback(response);
		})
		.catch(err => {
			console.log('Error getting connection', err);
		});
}

function getConnectionDetails(uidType, uid, connectionStatus)
{
	return new Promise(function(resolve, reject){
		var docRef = db.collection('connections');

		docRef.where(uidType, '==', uid)
			.where('Status', '==', connectionStatus).get().then(
			snapshot => {
				var response = [];
				snapshot.forEach(doc => {
					console.log("Connections found");
					console.log(doc.data());
					response.push(doc.data());
				});

				console.log("Connection Details Response: " + response);
				resolve(response);
			})
			.catch(err => {
				console.log('Error getting connection details', err);
				resolve([]);
			});
	});
}

function getSystemWideNotifications(callback)
{
	console.log("getSystemWideNotifications()");
	var systemNotifications = [];
	systemNotifications.push("This is a test notification");
	systemNotifications.push("This is a second test notification");
	callback(systemNotifications);
}


//API Endpoints

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
		
		//email = FirebaseAuth
		
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

app.post('/search', function(req, res) {
	console.log("POST: /search");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}
	decodeUid(req.body.token, function(uid)
	{
		console.log("Searcher's UID: " + uid);
		username = req.body.username;
		
		doesUsernameExist(username, function(usernameExists)
		{
			if(usernameExists)
			{
				res.status(200);
				console.log("Sending Username Connection Option");
				res.send("Username Found!<br><button type=\"button\" id=\"connectButton\" onclick=\"connect()\">Connect with " + username + "</button>");
				return;
			}
			else
			{
				res.status(404);
				console.log("Username not Found");
				res.send("An account with that username was not found.");
			}
		});
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
	});
});

app.post('/connect', function(req, res) {
	console.log("POST: /connect");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}

	decodeUid(req.body.token, function(requestersUid)
	{
		console.log("Requester's UID: " + requestersUid);
		username = req.body.username;
	
		getUserIdFromUsername(username, function(newConnectionUid)
		{
			if(newConnectionUid)
			{
				res.status(200);
				console.log("Connecting Users");
				//TODO: Connect Users

				connectUsers(requestersUid, newConnectionUid, function(connectResponse)
				{
					res.send(connectResponse);
					return;
				});
			}
			else
			{
				res.status(404);
				console.log("Username not Found");
				res.send("An account with that username was not found.");
			}
		});
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
	});
});

app.post('/confirmConnection', function(req, res) {
	console.log("POST: /confirmConnection");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}

	decodeUid(req.body.token, function(confirmerUid)
	{
		console.log("Confirmer's UID: " + confirmerUid);
		username = req.body.username;
	
		getUserIdFromUsername(username, function(requesterUid)
		{
			if(requesterUid)
			{
				res.status(200);
				console.log("Confirming User Connection");
				//TODO: Connect Users

				confirmConnection(requesterUid, confirmerUid, function(confirmResponse)
				{
					res.send(confirmResponse);
					return;
				});
			}
			else
			{
				res.status(404);
				console.log("Username not Found");
				res.send("An account with that username was not found.");
			}
		});
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
	});
});

app.post('/rejectConnection', function(req, res) {
	console.log("POST: /rejectConnection");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}

	decodeUid(req.body.token, function(rejectersUid)
	{
		console.log("Requester's UID: " + rejectersUid);
		username = req.body.username;
	
		getUserIdFromUsername(username, function(requestersUid)
		{
			if(requestersUid)
			{
				res.status(200);
				console.log("Rejecting User Connection");
				//TODO: Connect Users

				rejectConnection(requestersUid, rejectersUid, function(rejectResponse)
				{
					res.send(rejectResponse);
					return;
				});
			}
			else
			{
				res.status(404);
				console.log("Username not Found");
				res.send("An account with that username was not found.");
			}
		});
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
	});
});

app.post('/blockConnection', function(req, res) {
	console.log("POST: /blockConnection");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}

	decodeUid(req.body.token, function(blockersUid)
	{
		console.log("Requester's UID: " + blockersUid);
		username = req.body.username;
	
		getUserIdFromUsername(username, function(uidToBlock)
		{
			if(uidToBlock)
			{
				res.status(200);
				console.log("Blocking User Connection");
				//TODO: Connect Users

				blockConnection(blockersUid, uidToBlock, function(confirmResponse)
				{
					res.send(confirmResponse);
					return;
				});
			}
			else
			{
				res.status(404);
				console.log("Username not Found");
				res.send("An account with that username was not found.");
			}
		});
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
	});
});

app.post('/getNotifications', function(req, res) {
	console.log("POST: /getNotifications");
	console.log(req.body);
	
	if(req.body.token === undefined)
	{
		console.log("Token is Undefined");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
		return;
	}

	decodeUid(req.body.token, function(userId)
	{
		var pendingConnectionNotificationsReady = false;
		var systemWideNotificationsReady = false;
		console.log("User's UID: " + userId);
		var notifications = [];
	
		getConnectionDetails("ConnectionUid", userId, "Pending",  function(pendingConnections)
		{			
			if(pendingConnections.length > 0)
			{
				pendingConnections.forEach(function(item, index, array)
				{
					console.log("Adding pending connection to notifications: " + item);
					getUsernameFromUid(item.RequesterUid, function(requesterUsername)
					{
						notifications.push(requesterUsername + " has requested to connected with you.<br><button type=\"button\" onclick=\"confirmConnection(" + requesterUsername + ")\">Confirm" + requesterUsername + "'s request</button><button type=\"button\" onclick=\"rejectConnection(" + requesterUsername + ")\">Reject " + requesterUsername + "'s request</button><button type=\"button\" onclick=\"blockConnection(" + requesterUsername + ")\">Block " + requesterUsername + "</button>");
					});
				});
			}
			console.log("set pending to true here");
			pendingConnectionNotificationsReady = true;
		});
		getSystemWideNotifications(function(systemNotifications)
		{
			console.log("Adding System Notifications");
			systemNotifications.forEach(notification =>{
				notifications.push(notification);
			});
			console.log("set system to true here");
			systemWideNotificationsReady = true;
		});


		var i = 0
		while(!(pendingConnectionNotificationsReady && systemWideNotificationsReady))
		{
			i++;
			function tick(i) {
				console.log(i);
			};
			setTimeout(tick(i), 500 * i);
		}

		res.status(200);
		console.log("sending notifications" + JSON.stringify(notifications));
		res.send(notifications);
	}).catch(function(error) {
		console.log(error);
		console.log("Token is bad");
		console.log("Redirect to Error Page");
		res.send("An error occurred while processing your request");
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

app.listen(4201, () => {
	console.log("server started on port 4201")
});
