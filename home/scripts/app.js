(function app() {
	// Initialize Firebase
	var config = getConfig();
	
	firebase.initializeApp(config);

	firebase.auth().onAuthStateChanged(afterLogin);
		
}());

function signUp()
{
	login();
}

function login()
{
	console.log('app.js - login()');
	var provider = new firebase.auth.GoogleAuthProvider();
	provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
	firebase.auth().useDeviceLanguage();
	firebase.auth().signInWithRedirect(provider);
}

function afterLogin(user)
{
	console.log("authstate changed");
	//updateUser();
	mainApp(user);
	// firebase.auth().getRedirectResult().then(function(result) 
	// {
		// if (result.credential) 
		// {
			// // This gives you a Google Access Token. You can use it to access the Google API.
			// var token = result.credential.accessToken;
			// // ...
		// }
		// // The signed-in user info.
		// var user = result.user;
		// console.log("Log in successful");
		// console.log(result.user);
		// updateUser(user);
	// }).catch(function(error) 
	// {
		// // Handle Errors here.
		// var errorCode = error.code;
		// var errorMessage = error.message;
		// // The email of the user's account used.
		// var email = error.email;
		// // The firebase.auth.AuthCredential type that was used.
		// var credential = error.credential;
		// // ...
	// });	
	// console.log("outside then");
}

function logOut()
{
	firebase.auth().signOut().then(function() {
		console.log("Log out successful");
		location.reload();
	// Sign-out successful.
	}).catch(function(error) {
				// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// The email of the user's account used.
		var email = error.email;
		// The firebase.auth.AuthCredential type that was used.
		var credential = error.credential;
		// ...
	});
}

function updateUser()
{
	var cu = JSON.stringify(firebase.auth().currentUser);
	if(cu !== "null")
	{
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/updateUser", true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(cu);
	}
}