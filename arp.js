const express = require('express');
const app = express();

const {exec} = require('child_process')
var dataGet = ""
var online = ""
exec('nmap -sP 192.168.1.1/24', (err,stdout,stderr) =>{
  if(err){
    //mean they have error
    return
  }

dataGet = `${stdout}`

var indexOfuser = dataGet.lastIndexOf("(")
var onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)

console.log(onlineUser)
online = onlineUser
})



// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function(request, response) {
  response.send(online);
});

// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
