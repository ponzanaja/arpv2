const express = require('express');
const app = express();
/* root / root1234 */
const {exec} = require('child_process')
var dataGet = ""
var online = ""
var ipNow = ""

setInterval(() => {
 console.log("We're Here now @ setInterval")
 showResult()
}, 10000)

 function showResult(){
  getIP().then(getOnline).catch((error) => {console.error(error.message)} )

}


 function getIP(){
   return new Promise((resolve, reject) =>{
     exec('/sbin/ifconfig eth0 | grep \'inet addr:\' | cut -d: -f2 | awk \'{ print $1}\'', (err,stdout,stderr) =>{
             if(err) reject(err)
             else resole( ipNow = `${stdout}`)
      })
    })
}

 function getOnline(ip){
   console.log("This Is IP Parameter " +ip)
   return new Promise((resolve, reject) => {
    exec("nmap -sP "+ ip +"/24", (err,stdout,stderr) =>{
     if(err) return reject(err)
     else{
       resolve(
         dataGet = `${stdout}`
         let indexOfuser = dataGet.lastIndexOf("(")
         let onlineUser = dataGet.slice(indexOfuser+1,indexOfuser+2)
          online = onlineUser
        )}
      })
    })
}




// Define port number as 3000
const port = 3000;

// Routes HTTP GET requests to the specified path "/" with the specified callback function
app.get('/', function(request, response) {
  response.send(ipNow + "ออนไลน์ user" + online);


});

// Make the app listen on port 3000
app.listen(port, function() {
  console.log('Server listening on http://localhost:' + port);
});
