(function app() {
	// Initialize Firebase
	var config = getConfig();
	
	firebase.initializeApp(config);

	function login()
	{
		var provider = new firebase.auth.GoogleAuthProvider();
		provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
		firebase.auth().useDeviceLanguage();
		firebase.auth().signInWithRedirect(provider);
		firebase.auth().getRedirectResult().then(function(result) 
		{
			if (result.credential) 
			{
				// This gives you a Google Access Token. You can use it to access the Google API.
				var token = result.credential.accessToken;
				// ...
			}
			// The signed-in user info.
			var user = result.user;
			console.log("Log in successful");
			mainApp(user);
		}).catch(function(error) 
		{
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
	
	firebase.auth().onAuthStateChanged(mainApp);

	function logOut()
	{
		firebase.auth().signOut().then(function() {
			console.log("Log out successful");
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
	
	function mainApp(user)
	{
		if(!user)
		{
			console.log("Empty User");
			document.getElementById("clientName").innerHTML = "";
			return;
		}
		console.log("User.");
		document.getElementById("clientName").innerHTML = user.displayName;
		console.log("user.uid: " +user.uid);
		console.log("user.email: " +user.email);
		console.log("user.photoURL: " +user.photoURL);
		console.log(user);
	}

	var loginButton = document.getElementById("LogIn");
	loginButton.onclick = function(){ login()};
	
	var signUpButton = document.getElementById("SignUp");
	signUpButton.onclick = function(){ login()};

	var logOutButton = document.getElementById("LogOut");
	logOutButton.onclick = function(){ logOut()};

}());