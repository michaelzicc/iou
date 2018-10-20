function getNotifications(idToken)
{
    return new Promise(function(resolve){
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
                    console.log("returned 200 from notification endpoint: " + res);
                    return resolve(JSON.parse(res));
                }
                else
                {
                    console.log("Error Occurred while getting notifications");
                    return resolve(["error fetching notifications"]);
                }
            }
        }
        xhr.open("POST", "/getNotifications", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    });
}

function confirmConnection(element, username)
{
    return new Promise(function(resolve){
        var idToken = document.getElementById("token").value;
        console.log("notifications.js - confirmConnection");
        var data = JSON.stringify({ 
            username: username,
            token: idToken
        });
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if(xhr.status == 200)
                {
                    var res = xhr.responseText;
                    console.log("returned 200 from confirmation endpoint: " + res);
                    element.parentElement.innerHTML = res;
                    return resolve(res);
                }
                else
                {
                    console.log("Error Occurred while confirming connection");
                    element.parentElement.innerHTML = "An error occurred while confirming the connection";
                    return resolve("error confirming connection");
                }
            }
        }
        xhr.open("POST", "/confirmConnection", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    });
}

function rejectConnection(element, username)
{
    return new Promise(function(resolve){
        var idToken = document.getElementById("token").value;
        console.log("notifications.js - rejectConnection");
        var data = JSON.stringify({ 
            username: username,
            token: idToken
        });
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if(xhr.status == 200)
                {
                    var res = xhr.responseText;
                    console.log("returned 200 from rejection endpoint: " + res);
                    element.parentElement.innerHTML = res;
                    return resolve(res);
                }
                else
                {
                    console.log("Error Occurred while rejecting connection");
                    element.parentElement.innerHTML = "An error occurred while rejecting the connection";
                    return resolve("error rejecting connection");
                }
            }
        }
        xhr.open("POST", "/rejectConnection", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    });
}

function blockConnection(element, username)
{
    return new Promise(function(resolve){
        var idToken = document.getElementById("token").value;
        console.log("notifications.js - blockConnection");
        var data = JSON.stringify({ 
            username: username,
            token: idToken
        });
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if(xhr.status == 200)
                {
                    var res = xhr.responseText;
                    console.log("returned 200 from blocking endpoint: " + res);
                    element.parentElement.innerHTML = res;
                    return resolve(res);
                }
                else
                {
                    console.log("Error Occurred while blocking connection");
                    element.parentElement.innerHTML = "An error occurred while blocking the user";
                    return resolve("error blocking connection");
                }
            }
        }
        xhr.open("POST", "/blockConnection", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    });
}