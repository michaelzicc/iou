var express = require("express");
var app = express();

app.get('/', (req, res) => {
res.sendFile(__dirname + "/index.html");
});

app.get('/app.js', (req, res) => {
res.sendFile(__dirname + "/app.js");
});

app.get('/config.js', (req, res) => {
res.sendFile(__dirname + "/config.js");
});

app.listen(8000, () => {
console.log("server started on port 8000")
});