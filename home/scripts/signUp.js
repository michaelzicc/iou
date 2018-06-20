function mainApp(user)
{
	console.log("signup.js mainApp()");
	if(!user)
	{
		setActionHandlers();
		console.log("Empty User");
		return;
	}
	location.replace("/");
}

function setActionHandlers() {
	var loginButton = document.getElementById("LogIn");
	loginButton.onclick = function(){ login() };
}