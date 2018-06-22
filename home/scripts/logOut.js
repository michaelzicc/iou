

function mainApp(user)
{
	firebase.auth().signOut().then(function() {
		console.log("Log out successful");
		location.replace("/");
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
