(function() {
	// Initialize Firebase
	var config = getConfig();
	
	firebase.initializeApp(config);

	function login()
	{	  
		function loggedIn(user)
		{
			if(user)
			{
				mainApp(user);
			}
			else
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
					mainApp(user)
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
		}
		firebase.auth().onAuthStateChanged(loggedIn);
	}

	function mainApp(user)
	{
		document.getElementById("clientName").innerHTML = user.displayName;
		console.log("user.uid: " +user.uid);
		console.log("user.email: " +user.email);
		console.log("user.photoURL: " +user.photoURL);
	}

	login();

}());