function getNotifications(idToken, callback)
{
    console.log("notifications.js - getNotifications");
	var data = JSON.stringify({ 
		token: idToken
	});
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			if(xhr.status == 200)
			{
                var res = xhr.response;
                console.log("returned 200 from notification endpoint" + res);
                callback(JSON.parse(res));
			}
			else
			{
                console.log("Error Occurred while getting notifications");
                callback(["error fetching notifications"]);
			}
		}
	}
	xhr.open("POST", "/getNotifications", true);
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.send(data);
}